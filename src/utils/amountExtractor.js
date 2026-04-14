/**
 * VaultAudit AI — Amount Extraction Utility
 *
 * Auto-extracts dollar amounts from OCR text.
 * Supports manual override: the UI can pre-populate with the
 * extracted value and let the user correct it.
 */

import { AMOUNT_REGEX, DEFAULT_CURRENCY } from './constants.js';

/**
 * Extract all dollar amounts from a text string.
 * Returns them sorted largest-to-smallest (the "total" is usually
 * the largest amount on a receipt).
 *
 * @param {string} text — OCR-extracted text
 * @returns {{ amounts: number[], bestGuess: number | null, currencySymbol: string | null }}
 */
export function extractAmounts(text) {
  if (!text) return { amounts: [], bestGuess: null, currencySymbol: null };

  // Reset regex state
  AMOUNT_REGEX.lastIndex = 0;

  const matches = text.match(AMOUNT_REGEX);
  if (!matches || matches.length === 0) {
    return { amounts: [], bestGuess: null, currencySymbol: null };
  }

  const parsed = matches.map((m) => {
    // Clean letters, spaces, and currency symbols
    let clean = m.replace(/[a-zA-Z$£€₹\s]/g, '');
    // Remove leading non-digits (e.g. stray dots from Rs.)
    clean = clean.replace(/^[^\d]+/, '');
    // Strip formatting commas
    clean = clean.replace(/,/g, '');
    
    const val = parseFloat(clean);
    const symbolMatch = m.match(/[$£€₹]|rs\.?/i);
    const symbol = symbolMatch ? symbolMatch[0] : null;

    return { val, symbol };
  }).filter((p) => !isNaN(p.val) && p.val > 0)
    .sort((a, b) => b.val - a.val); // descending

  const best = parsed[0];

  return {
    amounts: parsed.map(p => p.val),
    bestGuess: best ? best.val : null,
    currencySymbol: best ? (best.symbol || DEFAULT_CURRENCY) : null,
  };
}
