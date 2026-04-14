/**
 * VaultAudit AI — Function Tests (Node.js)
 * 
 * Tests the pure-JS modules that don't require browser APIs:
 *   1. PII Masker  (sanitize, containsPII, Luhn)
 *   2. Amount Extractor
 *   3. Constants integrity
 * 
 * Run: node tests/test-functions.mjs
 */

// ── Inline the constants (avoid import path issues in Node) ─────

const PII_REDACTION_MARKER = '[REDACTED]';
const AMOUNT_REGEX = /\$\s?[\d,]+\.\d{2}/g;

// ── Inline the Luhn check ───────────────────────────────────────

function luhnCheck(digits) {
  let sum = 0;
  let alternate = false;
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

// ── Inline the PII patterns ────────────────────────────────────

const PII_PATTERNS = [
  {
    name: 'credit_card',
    pattern: /\b(?:\d[ -]*?){13,19}\b/g,
    validator: (match) => {
      const digits = match.replace(/\D/g, '');
      if (digits.length < 13 || digits.length > 19) return false;
      return luhnCheck(digits);
    },
  },
  {
    name: 'ssn',
    pattern: /\b(?!000|666|9\d\d)\d{3}-\d{2}-\d{4}\b/g,
  },
  {
    name: 'email',
    pattern: /\b[\w.+-]+@[\w-]+\.[\w.]+\b/g,
  },
  {
    name: 'phone',
    pattern: /(?<!\d)(?:\+?1[-.\s]?)?(?:\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}(?!\d)/g,
  },
  {
    name: 'ip_address',
    pattern: /\b(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g,
  },
  {
    name: 'date_of_birth',
    pattern: /\b\d{2}[/-]\d{2}[/-]\d{4}\b/g,
  },
];

// ── Inline sanitize ─────────────────────────────────────────────

function sanitize(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return { sanitizedText: '', redactedCount: 0, redactions: [] };
  }
  let text = rawText;
  let totalRedacted = 0;
  const redactions = [];
  for (const { name, pattern, validator } of PII_PATTERNS) {
    pattern.lastIndex = 0;
    text = text.replace(pattern, (match, offset) => {
      if (validator && !validator(match)) return match;
      totalRedacted++;
      redactions.push({ type: name, position: offset });
      return PII_REDACTION_MARKER;
    });
  }
  return { sanitizedText: text, redactedCount: totalRedacted, redactions };
}

function containsPII(text) {
  if (!text) return false;
  for (const { pattern, validator } of PII_PATTERNS) {
    pattern.lastIndex = 0;
    const matches = text.match(pattern);
    if (!matches) continue;
    if (validator) {
      if (matches.some(validator)) return true;
    } else {
      return true;
    }
  }
  return false;
}

// ── Inline extractAmounts ───────────────────────────────────────

function extractAmounts(text) {
  if (!text) return { amounts: [], bestGuess: null };
  AMOUNT_REGEX.lastIndex = 0;
  const matches = text.match(AMOUNT_REGEX);
  if (!matches || matches.length === 0) return { amounts: [], bestGuess: null };
  const amounts = matches
    .map((m) => parseFloat(m.replace(/[$,\s]/g, '')))
    .filter((n) => !isNaN(n) && n > 0)
    .sort((a, b) => b - a);
  return {
    amounts,
    bestGuess: amounts.length > 0 ? amounts[0] : null,
  };
}

// ═══════════════════════════════════════════════════════════════
//  TEST RUNNER
// ═══════════════════════════════════════════════════════════════

let passed = 0;
let failed = 0;

function assert(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.log(`  ❌ ${label}${detail ? ' — ' + detail : ''}`);
    failed++;
  }
}

// ── 1. LUHN ALGORITHM ──────────────────────────────────────────

console.log('\n═══ 1. Luhn Algorithm ═══');

assert('Valid Visa card', luhnCheck('4111111111111111') === true);
assert('Valid Mastercard', luhnCheck('5500000000000004') === true);
assert('Valid Amex', luhnCheck('378282246310005') === true);
assert('Valid Discover', luhnCheck('6011111111111117') === true);
assert('Invalid card (random)', luhnCheck('1234567890123456') === false);
assert('Invalid card (off by one)', luhnCheck('4111111111111112') === false);
assert('Short number (12 digits)', luhnCheck('411111111111') === false, 'Should be false for <13 digits — checked by validator');

// ── 2. PII MASKER — Credit Cards ───────────────────────────────

console.log('\n═══ 2. PII Masker — Credit Cards ═══');

{
  const r = sanitize('My card is 4111 1111 1111 1111 thanks');
  assert('Redacts valid Visa', r.sanitizedText.includes('[REDACTED]'));
  assert('Does NOT contain original card', !r.sanitizedText.includes('4111'));
  assert('Redaction count is 1', r.redactedCount === 1, `got ${r.redactedCount}`);
  assert('Redaction type is credit_card', r.redactions[0]?.type === 'credit_card');
}

{
  const r = sanitize('Random digits: 1234567890123456');
  assert('Does NOT redact non-Luhn 16 digits', !r.sanitizedText.includes('[REDACTED]'), `got: "${r.sanitizedText}"`);
}

{
  const r = sanitize('Card: 5500-0000-0000-0004');
  assert('Redacts Mastercard with dashes', r.sanitizedText.includes('[REDACTED]'));
}

// ── 3. PII MASKER — SSN ────────────────────────────────────────

console.log('\n═══ 3. PII Masker — SSN ═══');

{
  const r = sanitize('SSN: 123-45-6789');
  assert('Redacts valid SSN', r.sanitizedText.includes('[REDACTED]'));
  assert('Does NOT contain original SSN', !r.sanitizedText.includes('123-45-6789'));
}

{
  const r = sanitize('Invalid SSN: 000-12-3456');
  assert('Does NOT redact SSN starting with 000', !r.sanitizedText.includes('[REDACTED]'), `got: "${r.sanitizedText}"`);
}

{
  const r = sanitize('Invalid SSN: 666-12-3456');
  assert('Does NOT redact SSN starting with 666', !r.sanitizedText.includes('[REDACTED]'), `got: "${r.sanitizedText}"`);
}

{
  const r = sanitize('Invalid SSN: 900-12-3456');
  assert('Does NOT redact SSN starting with 9xx', !r.sanitizedText.includes('[REDACTED]'), `got: "${r.sanitizedText}"`);
}

// ── 4. PII MASKER — Phone Numbers ──────────────────────────────

console.log('\n═══ 4. PII Masker — Phone Numbers ═══');

{
  const r = sanitize('Call me at (555) 123-4567');
  assert('Redacts (XXX) XXX-XXXX format', r.sanitizedText.includes('[REDACTED]'));
}

{
  const r = sanitize('Phone: 555-123-4567');
  assert('Redacts XXX-XXX-XXXX format', r.sanitizedText.includes('[REDACTED]'));
}

{
  const r = sanitize('Intl: +1 555-123-4567');
  assert('Redacts +1 XXX-XXX-XXXX format', r.sanitizedText.includes('[REDACTED]'));
}

// ── 5. PII MASKER — Email ──────────────────────────────────────

console.log('\n═══ 5. PII Masker — Email ═══');

{
  const r = sanitize('Send to user@example.com please');
  assert('Redacts email', r.sanitizedText.includes('[REDACTED]'));
  assert('Does NOT contain original email', !r.sanitizedText.includes('user@example.com'));
}

{
  const r = sanitize('Email: complex+tag@sub.domain.co.uk');
  assert('Redacts complex email', r.sanitizedText.includes('[REDACTED]'));
}

// ── 6. PII MASKER — IP Address ─────────────────────────────────

console.log('\n═══ 6. PII Masker — IP Address ═══');

{
  const r = sanitize('Server: 192.168.1.1');
  assert('Redacts private IP', r.sanitizedText.includes('[REDACTED]'));
}

{
  const r = sanitize('IP: 255.255.255.255');
  assert('Redacts broadcast IP', r.sanitizedText.includes('[REDACTED]'));
}

{
  const r = sanitize('Not an IP: 999.999.999.999');
  assert('Does NOT redact invalid octets (999)', !r.sanitizedText.includes('[REDACTED]'), `got: "${r.sanitizedText}"`);
}

// ── 7. PII MASKER — DOB ────────────────────────────────────────

console.log('\n═══ 7. PII Masker — Date of Birth ═══');

{
  const r = sanitize('Born: 01/15/1990');
  assert('Redacts MM/DD/YYYY', r.sanitizedText.includes('[REDACTED]'));
}

{
  const r = sanitize('DOB: 15-01-1990');
  assert('Redacts DD-MM-YYYY', r.sanitizedText.includes('[REDACTED]'));
}

// ── 8. PII MASKER — Multiple PII ────────────────────────────────

console.log('\n═══ 8. PII Masker — Multiple PII in One Text ═══');

{
  const r = sanitize(
    'Name: John Doe, SSN: 123-45-6789, Email: john@test.com, Phone: 555-867-5309, DOB: 03/14/1985'
  );
  assert('Redacts multiple PII types', r.redactedCount >= 4, `got ${r.redactedCount}`);
  assert('No SSN remains', !r.sanitizedText.includes('123-45-6789'));
  assert('No email remains', !r.sanitizedText.includes('john@test.com'));
  assert('No DOB remains', !r.sanitizedText.includes('03/14/1985'));
}

// ── 9. PII MASKER — Edge Cases ──────────────────────────────────

console.log('\n═══ 9. PII Masker — Edge Cases ═══');

{
  const r = sanitize('');
  assert('Empty string → empty result', r.sanitizedText === '' && r.redactedCount === 0);
}

{
  const r = sanitize(null);
  assert('Null input → empty result', r.sanitizedText === '' && r.redactedCount === 0);
}

{
  const r = sanitize('Just a normal receipt for groceries. Total: $42.99');
  assert('Clean text → zero redactions', r.redactedCount === 0, `got ${r.redactedCount}`);
}

// ── 10. containsPII ──────────────────────────────────────────────

console.log('\n═══ 10. containsPII() ═══');

assert('Detects SSN', containsPII('SSN: 123-45-6789') === true);
assert('Detects email', containsPII('user@example.com') === true);
assert('No PII in clean text', containsPII('Hello world') === false);
assert('No PII in null', containsPII(null) === false);

// ── 11. AMOUNT EXTRACTOR ────────────────────────────────────────

console.log('\n═══ 11. Amount Extractor ═══');

{
  const r = extractAmounts('Total: $42.99');
  assert('Extracts $42.99', r.bestGuess === 42.99, `got ${r.bestGuess}`);
}

{
  const r = extractAmounts('Subtotal: $35.00  Tax: $2.80  Total: $37.80');
  assert('Best guess is largest ($37.80)', r.bestGuess === 37.80, `got ${r.bestGuess}`);
  assert('Finds all 3 amounts', r.amounts.length === 3, `got ${r.amounts.length}`);
}

{
  const r = extractAmounts('Grand total: $1,234.56');
  assert('Handles comma-separated thousands', r.bestGuess === 1234.56, `got ${r.bestGuess}`);
}

{
  const r = extractAmounts('No money mentioned here');
  assert('No amounts → null bestGuess', r.bestGuess === null);
  assert('No amounts → empty array', r.amounts.length === 0);
}

{
  const r = extractAmounts('');
  assert('Empty string → null bestGuess', r.bestGuess === null);
}

{
  const r = extractAmounts(null);
  assert('Null → null bestGuess', r.bestGuess === null);
}

{
  const r = extractAmounts('Item A: $5.99  Item B: $12.50  Item C: $3.25  Total: $21.74');
  assert('Best guess from receipt with items', r.bestGuess === 21.74, `got ${r.bestGuess}`);
  assert('Finds 4 amounts', r.amounts.length === 4, `got ${r.amounts.length}`);
}

// ── 12. COMBINED PIPELINE (PII mask → amount extract) ───────────

console.log('\n═══ 12. Combined Pipeline (Mask → Extract) ═══');

{
  const rawReceipt = `
    GROCERY STORE #1234
    Date: 03/14/2024
    Card: 4111 1111 1111 1111
    
    Milk          $3.99
    Bread         $2.49
    Eggs          $4.99
    
    Subtotal      $11.47
    Tax           $0.92
    Total         $12.39
    
    Customer: john@grocery.com
    Phone: 555-123-4567
  `;

  const { sanitizedText, redactedCount } = sanitize(rawReceipt);
  assert('Pipeline: PII redacted', redactedCount >= 3, `got ${redactedCount} redactions`);
  assert('Pipeline: No card number', !sanitizedText.includes('4111'));
  assert('Pipeline: No email', !sanitizedText.includes('john@grocery.com'));

  const { bestGuess, amounts } = extractAmounts(sanitizedText);
  assert('Pipeline: Amount extracted from sanitized text', bestGuess === 12.39, `got ${bestGuess}`);
  assert('Pipeline: Found all dollar amounts', amounts.length >= 4, `got ${amounts.length}`);
}

// ═══════════════════════════════════════════════════════════════
//  RESULTS
// ═══════════════════════════════════════════════════════════════

console.log('\n' + '═'.repeat(50));
console.log(`  TOTAL: ${passed + failed} tests — ${passed} passed, ${failed} failed`);
console.log('═'.repeat(50));

if (failed > 0) {
  process.exit(1);
} else {
  console.log('\n  🎉 All tests passed!\n');
}
