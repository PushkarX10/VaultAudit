/**
 * VaultAudit AI — PII Masking Protocol
 *
 * Regex-based sanitisation that PERMANENTLY redacts personally
 * identifiable information from raw text BEFORE it touches the
 * database.  This is intentionally destructive — there is no
 * way to recover the original data.
 *
 * Covered PII types:
 *   • Credit / debit card numbers  (13-19 digits, with Luhn check)
 *   • US Social Security Numbers   (XXX-XX-XXXX)
 *   • US / international phone numbers
 *   • Email addresses
 *   • IPv4 addresses
 *   • Dates of birth (common formats)
 *
 * Usage:
 *   const { sanitizedText, redactedCount } = sanitize(rawText);
 */

import { PII_REDACTION_MARKER } from '../utils/constants.js';

// ── Regex patterns ──────────────────────────────────────────────

/**
 * Each entry is { name, pattern, validator? }.
 * Patterns are evaluated in order — earlier patterns take priority for
 * overlapping matches.  `validator` is an optional function that receives
 * the raw match and returns `true` only if it is genuine PII (reduces
 * false positives).
 */
const PII_PATTERNS = [
  {
    name: 'credit_card',
    // 13-19 digit sequences, optionally separated by spaces or dashes
    pattern: /\b(?:\d[ -]*?){13,19}\b/g,
    validator: (match) => {
      // Strip non-digits and run Luhn check
      const digits = match.replace(/\D/g, '');
      if (digits.length < 13 || digits.length > 19) return false;
      return luhnCheck(digits);
    },
  },
  {
    name: 'ssn',
    // US SSN: 3-2-4 format — exclude invalid prefixes (000, 666, 9xx)
    pattern: /\b(?!000|666|9\d\d)\d{3}-\d{2}-\d{4}\b/g,
  },
  {
    name: 'email',
    pattern: /\b[\w.+-]+@[\w-]+\.[\w.]+\b/g,
  },
  {
    name: 'phone',
    // US / international phone — e.g. +1 (555) 123-4567
    // Note: leading \b won't match before '(' so we use a non-digit lookbehind instead
    pattern: /(?<!\d)(?:\+?1[-.\s]?)?(?:\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}(?!\d)/g,
  },
  {
    name: 'ip_address',
    // IPv4 — basic octet validation (0-255)
    pattern: /\b(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g,
  },
  {
    name: 'date_of_birth',
    // Common date formats: MM/DD/YYYY, DD-MM-YYYY, etc.
    pattern: /\b\d{2}[/-]\d{2}[/-]\d{4}\b/g,
  },
];

// ── Luhn algorithm ──────────────────────────────────────────────

/**
 * Validates a digit string using the Luhn / mod-10 algorithm.
 * Used to distinguish genuine card numbers from random digit sequences.
 *
 * @param {string} digits — string of digits only (no separators)
 * @returns {boolean}
 */
function luhnCheck(digits) {
  let sum = 0;
  let alternate = false;

  // Walk from right to left
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);

    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }

    sum += n;
    alternate = !alternate;
  }

  return sum % 10 === 0;
}

// ── Public API ──────────────────────────────────────────────────

/**
 * Sanitise raw text by permanently redacting all detected PII.
 *
 * @param {string} rawText — the unprocessed OCR or user-pasted text
 * @returns {{ sanitizedText: string, redactedCount: number, redactions: Array<{ type: string, position: number }> }}
 */
export function sanitize(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return { sanitizedText: '', redactedCount: 0, redactions: [] };
  }

  let text = rawText;
  let totalRedacted = 0;
  const redactions = [];

  for (const { name, pattern, validator } of PII_PATTERNS) {
    // Reset the regex state (global flag means it's stateful)
    pattern.lastIndex = 0;

    text = text.replace(pattern, (match, offset) => {
      // If a validator exists, only redact if it returns true
      if (validator && !validator(match)) {
        return match; // false positive — leave it
      }

      totalRedacted++;
      redactions.push({ type: name, position: offset });
      return PII_REDACTION_MARKER;
    });
  }

  return {
    sanitizedText: text,
    redactedCount: totalRedacted,
    redactions,
  };
}

/**
 * Quick check: does the text appear to contain any PII?
 * Useful for UI warnings before processing.
 *
 * @param {string} text
 * @returns {boolean}
 */
export function containsPII(text) {
  if (!text) return false;

  for (const { pattern, validator } of PII_PATTERNS) {
    pattern.lastIndex = 0;
    const matches = text.match(pattern);
    if (!matches) continue;

    // If there's a validator, check at least one match passes
    if (validator) {
      if (matches.some(validator)) return true;
    } else {
      return true;
    }
  }

  return false;
}
