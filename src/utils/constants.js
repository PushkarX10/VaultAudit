/**
 * VaultAudit AI — Application Constants
 *
 * Centralised configuration. Every magic string, URL, and default
 * lives here so the rest of the codebase stays DRY and auditable.
 *
 * SECURITY NOTE: The only network endpoint is the local Ollama
 * instance. No external/cloud URLs are permitted.
 */

// ── Ollama (local AI) ────────────────────────────────────────────
export const OLLAMA_BASE_URL = 'http://localhost:11434';
export const OLLAMA_GENERATE_URL = `${OLLAMA_BASE_URL}/api/generate`;
export const OLLAMA_MODEL = 'llama3.2';
export const OLLAMA_TIMEOUT_MS = 30_000; // 30 s generous timeout for local inference

// ── PGLite (in-browser Postgres) ─────────────────────────────────
export const PGLITE_DB_NAME = 'idb://vaultaudit';

// ── OCR ──────────────────────────────────────────────────────────
export const OCR_LANGUAGE = 'eng';
export const OCR_SUPPORTED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/bmp',
  'image/tiff',
];

// ── PII Masking ──────────────────────────────────────────────────
export const PII_REDACTION_MARKER = '[REDACTED]';

// ── Amount Extraction ────────────────────────────────────────────
// ── Amount Extraction ────────────────────────────────────────────
export const DEFAULT_CURRENCY = '₹';

// Matches dollar/euro/pound/rupee amounts like $12.99, £ 1,234.56, Rs. 150, ₹ 2000, or just 12.99
export const AMOUNT_REGEX = /(?:(?:[$£€₹]|rs\.?)\s*\d+(?:,\d+)*(?:\.\d{1,2})?)|\b\d+(?:,\d+)*\.\d{2}\b/gi;

// ── Audit Flags ──────────────────────────────────────────────────
export const AUDIT_FLAGS = {
  NORMAL: 'normal',
  IMPULSE_BUY: 'impulse_buy',
  HIDDEN_SUBSCRIPTION: 'hidden_subscription',
  SUSPICIOUS: 'suspicious',
  PENDING: 'pending',
  UNCLASSIFIED: 'unclassified',
};
