/**
 * VaultAudit AI — Receipt Uploader Component
 *
 * Drag-and-drop (or click-to-browse) file uploader that orchestrates
 * the full privacy pipeline:
 *
 *   Image → OCR (Tesseract.js) → PII Mask → Amount Extract → DB Insert → AI Audit
 *
 * Supports batch upload (multiple files at once).
 * Amount is auto-extracted with a manual override field.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { extractText } from '../services/ocrService.js';
import { sanitize } from '../services/piiMasker.js';
import { auditTransaction } from '../services/auditService.js';
import { extractAmounts } from '../utils/amountExtractor.js';
import { insertTransaction, updateTransactionAudit } from '../db/schema.js';
import { getDb } from '../db/client.js';
import { OCR_SUPPORTED_TYPES } from '../utils/constants.js';

/**
 * Processing state for a single file.
 * @typedef {'idle'|'ocr'|'masking'|'saving'|'auditing'|'done'|'error'} ProcessingStage
 */

export default function ReceiptUploader({ onTransactionAdded }) {
  const [files, setFiles] = useState([]);           // queued File objects
  const [processing, setProcessing] = useState([]); // per-file status
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.queuedFile) {
      processFiles([location.state.queuedFile]);
      
      // Clear the state so it doesn't process again on refresh
      navigate('.', { replace: true, state: {} });
    }
  }, [location.state]);

  // ── Drag-and-drop handlers ──────────────────────────────────

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter((f) =>
      OCR_SUPPORTED_TYPES.includes(f.type),
    );

    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  }, []);

  const handleFileSelect = useCallback((e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      processFiles(selectedFiles);
    }
    // Reset input so the same file can be re-selected
    e.target.value = '';
  }, []);

  // ── Core processing pipeline ────────────────────────────────

  async function processFiles(newFiles) {
    setFiles((prev) => [...prev, ...newFiles]);

    // Initialise processing state for each file
    const startIndex = processing.length;
    const newProcessing = newFiles.map((f) => ({
      name: f.name,
      stage: 'ocr',
      progress: 0,
      error: null,
      extractedAmount: null,
      manualAmount: '',
      ocrText: '',
      sanitizedText: '',
      redactedCount: 0,
      transactionId: null,
    }));

    setProcessing((prev) => [...prev, ...newProcessing]);

    // Process each file sequentially (Tesseract uses significant memory)
    for (let i = 0; i < newFiles.length; i++) {
      const idx = startIndex + i;
      await processOneFile(newFiles[i], idx);
    }
  }

  async function processOneFile(file, idx) {
    const update = (patch) => {
      setProcessing((prev) => {
        const next = [...prev];
        next[idx] = { ...next[idx], ...patch };
        return next;
      });
    };

    try {
      // ── Step 1: OCR ───────────────────────────────────────────
      update({ stage: 'ocr', progress: 0 });

      const ocrResult = await extractText(file, (pct) => {
        update({ progress: pct });
      });

      if (ocrResult.error) {
        update({ stage: 'error', error: ocrResult.error });
        return;
      }

      // ── Step 2: PII Masking ───────────────────────────────────
      update({ stage: 'masking', ocrText: ocrResult.text });

      const { sanitizedText, redactedCount } = sanitize(ocrResult.text);

      // ── Step 3: Amount Extraction (auto) ──────────────────────
      const { bestGuess, currencySymbol } = extractAmounts(sanitizedText);

      update({
        sanitizedText,
        redactedCount,
        extractedAmount: bestGuess,
        manualAmount: bestGuess != null ? bestGuess.toFixed(2) : '',
      });

      // ── Step 4: Save to PGLite ────────────────────────────────
      update({ stage: 'saving' });

      const db = await getDb();
      const txnId = await insertTransaction(db, {
        amount: bestGuess,
        currency: currencySymbol,
        rawText: sanitizedText,
        sourceFile: file.name,
      });

      update({ stage: 'auditing', transactionId: txnId });

      // ── Step 5: AI Audit (non-blocking) ───────────────────────
      const audit = await auditTransaction(sanitizedText, bestGuess);

      await updateTransactionAudit(db, txnId, audit);

      update({ stage: 'done' });

      // Notify parent to refresh the transaction list
      if (onTransactionAdded) onTransactionAdded();
    } catch (err) {
      console.error('[VaultAudit] Pipeline error:', err);
      update({ stage: 'error', error: err.message || 'Unknown error' });
    }
  }

  // ── Manual amount override ──────────────────────────────────

  async function handleAmountOverride(idx) {
    const entry = processing[idx];
    if (!entry || !entry.transactionId) return;

    const amount = parseFloat(entry.manualAmount);
    if (isNaN(amount)) return;

    try {
      const db = await getDb();
      await db.query('UPDATE transactions SET amount = $1 WHERE id = $2', [
        amount,
        entry.transactionId,
      ]);

      if (onTransactionAdded) onTransactionAdded();
    } catch (err) {
      console.error('[VaultAudit] Amount override failed:', err);
    }
  }

  // ── Render ──────────────────────────────────────────────────

  const stageLabels = {
    idle: 'Waiting',
    ocr: 'Scanning receipt…',
    masking: 'Redacting PII…',
    saving: 'Saving…',
    auditing: 'AI analysing…',
    done: 'Complete',
    error: 'Failed',
  };

  return (
    <div className="space-y-6">
      {/* ── Drop Zone ──────────────────────────────────────────── */}
      <div
        id="receipt-dropzone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative cursor-pointer rounded-xl border-2 border-dashed p-10
          transition-all duration-200 text-center
          ${isDragging
            ? 'border-emerald-400 bg-emerald-400/5 scale-[1.01]'
            : 'border-gray-700 bg-gray-900/50 hover:border-gray-500 hover:bg-gray-900'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={OCR_SUPPORTED_TYPES.join(',')}
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="receipt-file-input"
        />

        <div className="space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-300">
              Drop receipt images here or <span className="text-emerald-400 underline underline-offset-2">browse</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPEG, WebP, BMP, TIFF — processed entirely on your device
            </p>
          </div>
        </div>
      </div>

      {/* ── Processing Queue ───────────────────────────────────── */}
      {processing.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
            Processing Queue
          </h3>

          {processing.map((entry, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-gray-800 bg-gray-900/60 p-4 space-y-3"
            >
              {/* File header */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-200 truncate max-w-[60%]">
                  {entry.name}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  entry.stage === 'done'
                    ? 'bg-emerald-400/10 text-emerald-400'
                    : entry.stage === 'error'
                    ? 'bg-red-400/10 text-red-400'
                    : 'bg-blue-400/10 text-blue-400'
                }`}>
                  {stageLabels[entry.stage]}
                </span>
              </div>

              {/* Progress bar (OCR stage) */}
              {entry.stage === 'ocr' && (
                <div className="w-full bg-gray-800 rounded-full h-1.5">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${entry.progress}%` }}
                  />
                </div>
              )}

              {/* PII redaction count */}
              {entry.redactedCount > 0 && (
                <p className="text-xs text-amber-400">
                  🛡 {entry.redactedCount} PII item{entry.redactedCount !== 1 ? 's' : ''} redacted
                </p>
              )}

              {/* Amount override */}
              {(entry.stage === 'done' || entry.stage === 'auditing') && (
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-400">Amount $</label>
                  <input
                    type="number"
                    step="0.01"
                    value={entry.manualAmount}
                    onChange={(e) => {
                      const val = e.target.value;
                      setProcessing((prev) => {
                        const next = [...prev];
                        next[idx] = { ...next[idx], manualAmount: val };
                        return next;
                      });
                    }}
                    className="w-28 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-gray-200 focus:outline-none focus:border-emerald-500"
                    id={`amount-override-${idx}`}
                  />
                  <button
                    onClick={() => handleAmountOverride(idx)}
                    className="text-xs bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded hover:bg-emerald-500/30 transition-colors"
                  >
                    Update
                  </button>
                </div>
              )}

              {/* Error message */}
              {entry.error && (
                <p className="text-xs text-red-400">{entry.error}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
