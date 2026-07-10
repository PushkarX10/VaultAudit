/**
 * VaultAudit AI — Live Transaction Service
 *
 * Orchestrates the full pipeline from shared payment screenshot → database entry:
 *   1. Read from IndexedDB share queue
 *   2. Run Tesseract OCR
 *   3. Detect payment source (GooglePay, PhonePe, etc.)
 *   4. Run PII masking
 *   5. Auto-categorize
 *   6. Insert into PGLite
 *   7. Emit event for UI update
 *
 * This is what makes "pay on GooglePay → see it in VaultAudit" work.
 */

import { extractText } from '@/services/ocrService.js';
import { sanitize } from '@/services/piiMasker.js';
import { detectPaymentSource, autoCategorizeMerchant } from '@/utils/paymentSourceDetector.js';
import { insertTransaction } from '@/db/schema.js';

// ── Event emitter for real-time UI updates ──────────────────
const listeners = new Set();

export function onNewTransaction(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function emitNewTransaction(transaction) {
  listeners.forEach((cb) => cb(transaction));
}

// ── IndexedDB Queue Reader ──────────────────────────────────
function openShareQueue() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('VaultAuditShareQueue', 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('receipts')) {
        db.createObjectStore('receipts', { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Get all pending items from the share queue.
 * @returns {Promise<Array<{ id: number, file: File|Blob, timestamp: number }>>}
 */
export async function getQueueItems() {
  const db = await openShareQueue();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('receipts', 'readonly');
    const store = tx.objectStore('receipts');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Remove a processed item from the queue.
 */
export async function removeQueueItem(id) {
  const db = await openShareQueue();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('receipts', 'readwrite');
    const store = tx.objectStore('receipts');
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Process a single shared image through the full pipeline.
 *
 * @param {File|Blob} imageFile
 * @param {import('@electric-sql/pglite').PGlite} db — PGLite instance
 * @param {Function} [onProgress] — OCR progress callback
 * @returns {Promise<{
 *   success: boolean,
 *   transaction: object | null,
 *   paymentInfo: object | null,
 *   error: string | null,
 * }>}
 */
export async function processSharedImage(imageFile, db, onProgress) {
  try {
    // Step 1: OCR
    const ocrResult = await extractText(imageFile, onProgress);

    if (ocrResult.error || !ocrResult.text) {
      return {
        success: false,
        transaction: null,
        paymentInfo: null,
        error: ocrResult.error || 'No text extracted from image.',
      };
    }

    // Step 2: Detect payment source
    const paymentInfo = detectPaymentSource(ocrResult.text);

    // Step 3: PII masking
    const { sanitizedText } = sanitize(ocrResult.text);

    // Step 4: Auto-categorize
    const category = autoCategorizeMerchant(paymentInfo.merchant);

    // Step 5: Determine audit flag
    let auditFlag = 'normal';
    if (paymentInfo.amount && paymentInfo.amount > 5000) auditFlag = 'high_value';
    if (paymentInfo.status === 'failed') auditFlag = 'failed_payment';

    // Step 6: Build transaction object
    const txn = {
      date: paymentInfo.date || new Date().toISOString().slice(0, 10),
      amount: paymentInfo.amount,
      currency: paymentInfo.currency || 'INR',
      rawText: sanitizedText || ocrResult.text,
      parsedCategory: category,
      aiAuditFlag: auditFlag,
      aiAuditNote: paymentInfo.source
        ? `Auto-captured from ${paymentInfo.source}${paymentInfo.merchant ? ` — ${paymentInfo.merchant}` : ''}. Confidence: ${Math.round(paymentInfo.confidence * 100)}%.`
        : `Receipt scanned. OCR confidence: ${ocrResult.confidence}%.`,
      sourceFile: imageFile.name || 'shared-receipt',
    };

    // Step 7: Insert into PGLite
    const id = await insertTransaction(db, txn);

    const fullTransaction = { id, ...txn, paymentSource: paymentInfo.source };

    // Step 8: Emit for UI
    emitNewTransaction(fullTransaction);

    return {
      success: true,
      transaction: fullTransaction,
      paymentInfo,
      error: null,
    };
  } catch (err) {
    console.error('[VaultAudit] Live transaction processing failed:', err);
    return {
      success: false,
      transaction: null,
      paymentInfo: null,
      error: err.message || 'Processing failed.',
    };
  }
}

/**
 * Auto-process all pending items in the share queue.
 *
 * @param {import('@electric-sql/pglite').PGlite} db
 * @param {Function} [onItemProcessed] — callback per item: (result, index, total) => void
 * @returns {Promise<Array>} — Array of processing results
 */
export async function processAllQueued(db, onItemProcessed) {
  const items = await getQueueItems();
  const results = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const result = await processSharedImage(item.file, db);
    results.push(result);

    // Remove from queue on success
    if (result.success) {
      await removeQueueItem(item.id);
    }

    if (onItemProcessed) {
      onItemProcessed(result, i, items.length);
    }
  }

  return results;
}
