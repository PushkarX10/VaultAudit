/**
 * VaultAudit AI — Agentic Audit Service (Ollama / Llama 3.2)
 *
 * Communicates with a LOCAL Ollama instance to classify transactions
 * and flag impulse buys or hidden subscriptions.
 *
 * SECURITY:
 *   • The ONLY network call is to localhost:11434 — never to the internet.
 *   • All text sent to Ollama has already been PII-stripped by piiMasker.
 *   • If Ollama is offline the service returns a safe fallback, never throws.
 *
 * Usage:
 *   const result = await auditTransaction(sanitizedText, 42.99);
 *   // result.category — 'groceries', 'dining', 'subscription', …
 *   // result.flag     — 'normal', 'impulse_buy', 'hidden_subscription', 'suspicious'
 *   // result.reason   — human-readable explanation from the LLM
 */

import {
  OLLAMA_BASE_URL,
  OLLAMA_GENERATE_URL,
  OLLAMA_MODEL,
  OLLAMA_TIMEOUT_MS,
  AUDIT_FLAGS,
} from '../utils/constants.js';

/**
 * Check if the local Ollama instance is reachable.
 * @returns {Promise<boolean>}
 */
export async function isOllamaOnline() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(OLLAMA_BASE_URL, { signal: controller.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

// ── System prompt ───────────────────────────────────────────────

const SYSTEM_PROMPT = `You are VaultAudit AI, a meticulous personal-finance auditor.
Your job is to analyse a single transaction's receipt text and classify it.

Rules:
1. Respond ONLY with valid JSON — no markdown, no explanation outside JSON.
2. Use this exact schema:
   {
     "category": "<one of: groceries, dining, transport, entertainment, subscription, utilities, health, clothing, electronics, education, gifts, travel, other>",
     "flag": "<one of: normal, impulse_buy, hidden_subscription, suspicious>",
     "reason": "<one concise sentence explaining your classification>"
   }
3. Flag "impulse_buy" if the purchase seems unplanned, emotional, or unnecessary.
4. Flag "hidden_subscription" if the text suggests a recurring charge the user may have forgotten about.
5. Flag "suspicious" if the amounts seem unusual or the vendor is unclear.
6. Otherwise flag "normal".
7. Keep your "reason" under 100 words.`;

// ── Public API ──────────────────────────────────────────────────

/**
 * Send sanitised transaction data to the local Ollama instance for
 * classification and audit flagging.
 *
 * @param {string}      sanitizedText — PII-stripped receipt text
 * @param {number|null} amount        — extracted or user-entered dollar amount
 * @returns {Promise<{ category: string, flag: string, reason: string }>}
 */
export async function auditTransaction(sanitizedText, amount) {
  const userPrompt = buildPrompt(sanitizedText, amount);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

    const response = await fetch(OLLAMA_GENERATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        system: SYSTEM_PROMPT,
        prompt: userPrompt,
        stream: false,
        format: 'json',
        options: {
          temperature: 0.3, // low temp → more deterministic classifications
          num_predict: 256, // cap output length
        },
      }),
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`[VaultAudit] Ollama returned HTTP ${response.status}`);
      return fallbackResult('AI service returned an error');
    }

    const data = await response.json();

    // Ollama wraps the model's text output in `data.response`
    return parseAuditResponse(data.response);
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn('[VaultAudit] Ollama request timed out');
      return fallbackResult('AI request timed out');
    }

    // Likely: Ollama not running, network error, etc.
    console.warn('[VaultAudit] Ollama unreachable:', err.message);
    return fallbackResult('AI service unavailable — is Ollama running?');
  }
}

// ── Internal helpers ────────────────────────────────────────────

/**
 * Build the user prompt sent to the LLM.
 */
function buildPrompt(text, amount) {
  const amountStr = amount != null ? `$${Number(amount).toFixed(2)}` : 'unknown';

  return `Analyse this transaction and classify it.

Amount: ${amountStr}

Receipt text:
"""
${text}
"""

Respond with JSON only.`;
}

/**
 * Parse and validate the JSON response from Ollama.
 * Falls back gracefully if the model returns malformed output.
 */
function parseAuditResponse(responseText) {
  try {
    const parsed = JSON.parse(responseText);

    return {
      category: typeof parsed.category === 'string' ? parsed.category.toLowerCase() : 'other',
      flag: typeof parsed.flag === 'string' ? parsed.flag.toLowerCase() : AUDIT_FLAGS.NORMAL,
      reason: typeof parsed.reason === 'string' ? parsed.reason : 'No explanation provided.',
    };
  } catch {
    console.warn('[VaultAudit] Failed to parse Ollama response:', responseText);
    return fallbackResult('AI returned malformed response');
  }
}

/**
 * Safe fallback when Ollama is offline or returns garbage.
 */
function fallbackResult(reason) {
  return {
    category: 'Manual Review',
    flag: AUDIT_FLAGS.UNCLASSIFIED,
    reason: 'AI engine offline. Manual review required.',
  };
}
