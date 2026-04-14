/**
 * VaultAudit AI — Edge OCR Service (Tesseract.js v5)
 *
 * Runs optical-character-recognition entirely in the browser using
 * WebAssembly.  Zero data ever leaves the device.
 *
 * Usage:
 *   const result = await extractText(imageFile, onProgress);
 *   // result.text      — the extracted string
 *   // result.confidence — Tesseract's mean word confidence (0–100)
 *   // result.error      — non-null string if extraction failed
 */

import { createWorker } from 'tesseract.js';
import { OCR_LANGUAGE, OCR_SUPPORTED_TYPES } from '../utils/constants.js';

/**
 * Extract text from an image file using on-device OCR.
 *
 * @param {File}     imageFile  — image to process
 * @param {Function} [onProgress] — optional callback `(pct: number) => void`
 * @returns {Promise<{ text: string, confidence: number, error: string | null }>}
 */
export async function extractText(imageFile, onProgress) {
  // ── Validate input ────────────────────────────────────────────
  if (!imageFile) {
    return { text: '', confidence: 0, error: 'No file provided.' };
  }

  if (!OCR_SUPPORTED_TYPES.includes(imageFile.type)) {
    return {
      text: '',
      confidence: 0,
      error: `Unsupported image type "${imageFile.type}". Accepted: ${OCR_SUPPORTED_TYPES.join(', ')}`,
    };
  }

  let worker = null;

  try {
    // ── Initialise Tesseract worker ───────────────────────────────
    // v5 API: language is passed directly to createWorker
    worker = await createWorker(OCR_LANGUAGE, 1, {
      // Forward Tesseract progress events to the caller
      logger: (info) => {
        if (onProgress && info.status === 'recognizing text') {
          onProgress(Math.round(info.progress * 100));
        }
      },
    });

    // ── Run recognition ───────────────────────────────────────────
    const { data } = await worker.recognize(imageFile);

    return {
      text: data.text.trim(),
      confidence: data.confidence,
      error: null,
    };
  } catch (err) {
    console.error('[VaultAudit] OCR failed:', err);
    return {
      text: '',
      confidence: 0,
      error: `OCR processing failed: ${err.message || 'Unknown error'}`,
    };
  } finally {
    // ── Always release the worker to free memory ──────────────────
    if (worker) {
      try {
        await worker.terminate();
      } catch {
        // Swallow termination errors — worker may have already died
      }
    }
  }
}

/**
 * Process multiple image files in sequence.
 * Returns an array of results in the same order as the input files.
 *
 * @param {File[]}   files
 * @param {Function} [onFileProgress] — `(fileIndex: number, pct: number) => void`
 * @returns {Promise<Array<{ file: File, text: string, confidence: number, error: string | null }>>}
 */
export async function extractTextBatch(files, onFileProgress) {
  const results = [];

  for (let i = 0; i < files.length; i++) {
    const result = await extractText(files[i], (pct) => {
      if (onFileProgress) onFileProgress(i, pct);
    });

    results.push({ file: files[i], ...result });
  }

  return results;
}
