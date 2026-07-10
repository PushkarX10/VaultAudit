/**
 * VaultAudit AI — Payment Source Detector
 *
 * Parses OCR text from UPI/payment screenshots to extract:
 *   • Payment platform (GooglePay, PhonePe, ApplePay, Paytm, etc.)
 *   • Amount (₹ or $)
 *   • Merchant/recipient name
 *   • UPI ID
 *   • Transaction date/time
 *   • Status (Success/Failed)
 */

// ── Payment source patterns ──────────────────────────────────
const SOURCE_PATTERNS = [
  {
    name: 'GooglePay',
    patterns: [/google\s*pay/i, /gpay/i, /paid\s+to\s+.+\s+via\s+google/i, /tez/i],
    color: '#34A853',
    icon: '💚',
  },
  {
    name: 'PhonePe',
    patterns: [/phone\s*pe/i, /paid\s+via\s+phonepe/i],
    color: '#5F259F',
    icon: '💜',
  },
  {
    name: 'ApplePay',
    patterns: [/apple\s*pay/i, /apple\s*cash/i, /wallet.*apple/i],
    color: '#FFFFFF',
    icon: '🍎',
  },
  {
    name: 'Paytm',
    patterns: [/paytm/i, /paid\s+via\s+paytm/i, /paytm\s+wallet/i],
    color: '#00BAF2',
    icon: '💙',
  },
  {
    name: 'UPI',
    patterns: [/upi/i, /upi\s*id\s*:/i, /@ybl\b/i, /@oksbi\b/i, /@paytm\b/i, /@axl\b/i, /@ibl\b/i],
    color: '#4CAF50',
    icon: '🏦',
  },
];

// ── Amount extraction patterns ───────────────────────────────
const AMOUNT_PATTERNS = [
  /(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d{1,2})?)/i,
  /(?:\$|usd)\s*([\d,]+(?:\.\d{1,2})?)/i,
  /(?:amount|paid|total|debited)\s*:?\s*(?:₹|rs\.?|\$)?\s*([\d,]+(?:\.\d{1,2})?)/i,
  /([\d,]+(?:\.\d{1,2})?)\s*(?:₹|rs\.?|inr)/i,
];

// ── UPI ID extraction ────────────────────────────────────────
const UPI_PATTERN = /([a-zA-Z0-9._-]+@[a-zA-Z0-9]+)/;

// ── Merchant/recipient extraction ────────────────────────────
const MERCHANT_PATTERNS = [
  /(?:paid\s+to|sent\s+to|transferred\s+to|merchant)\s*:?\s*(.+?)(?:\n|$|via|upi)/i,
  /(?:to)\s+([A-Z][a-zA-Z\s]+?)(?:\n|$|\s+on|\s+via)/,
];

// ── Date extraction ──────────────────────────────────────────
const DATE_PATTERNS = [
  /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
  /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{2,4})/i,
];

// ── Time extraction ──────────────────────────────────────────
const TIME_PATTERN = /(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?)/i;

// ── Status extraction ────────────────────────────────────────
const SUCCESS_PATTERNS = [/success/i, /completed/i, /paid/i, /sent/i, /debited/i];
const FAILED_PATTERNS = [/fail/i, /declined/i, /rejected/i, /cancelled/i];

/**
 * Detect payment source from OCR text.
 *
 * @param {string} ocrText — Raw OCR output
 * @returns {{
 *   source: string | null,
 *   amount: number | null,
 *   currency: string,
 *   merchant: string | null,
 *   upiId: string | null,
 *   date: string | null,
 *   time: string | null,
 *   status: 'success' | 'failed' | 'unknown',
 *   confidence: number,
 *   sourceColor: string,
 *   sourceIcon: string,
 * }}
 */
export function detectPaymentSource(ocrText) {
  if (!ocrText || typeof ocrText !== 'string') {
    return createEmptyResult();
  }

  const text = ocrText.trim();
  let confidence = 0;

  // ── Detect source ─────────────────────────────────────────
  let source = null;
  let sourceColor = '#6B7280';
  let sourceIcon = '💳';

  for (const src of SOURCE_PATTERNS) {
    for (const pattern of src.patterns) {
      if (pattern.test(text)) {
        source = src.name;
        sourceColor = src.color;
        sourceIcon = src.icon;
        confidence += 0.3;
        break;
      }
    }
    if (source) break;
  }

  // ── Extract amount ────────────────────────────────────────
  let amount = null;
  let currency = 'INR';

  for (const pattern of AMOUNT_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      amount = parseFloat(match[1].replace(/,/g, ''));
      // Detect currency from the match context
      if (/\$|usd/i.test(match[0])) currency = 'USD';
      confidence += 0.25;
      break;
    }
  }

  // ── Extract UPI ID ────────────────────────────────────────
  const upiMatch = text.match(UPI_PATTERN);
  const upiId = upiMatch ? upiMatch[1] : null;
  if (upiId) confidence += 0.1;

  // ── Extract merchant ──────────────────────────────────────
  let merchant = null;
  for (const pattern of MERCHANT_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      merchant = match[1].trim().substring(0, 50);
      confidence += 0.15;
      break;
    }
  }

  // ── Extract date ──────────────────────────────────────────
  let date = null;
  for (const pattern of DATE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      date = match[1];
      confidence += 0.1;
      break;
    }
  }

  // ── Extract time ──────────────────────────────────────────
  const timeMatch = text.match(TIME_PATTERN);
  const time = timeMatch ? timeMatch[1] : null;
  if (time) confidence += 0.05;

  // ── Detect status ─────────────────────────────────────────
  let status = 'unknown';
  if (SUCCESS_PATTERNS.some((p) => p.test(text))) {
    status = 'success';
    confidence += 0.05;
  } else if (FAILED_PATTERNS.some((p) => p.test(text))) {
    status = 'failed';
    confidence += 0.05;
  }

  return {
    source,
    amount,
    currency,
    merchant,
    upiId,
    date,
    time,
    status,
    confidence: Math.min(confidence, 1),
    sourceColor,
    sourceIcon,
  };
}

function createEmptyResult() {
  return {
    source: null,
    amount: null,
    currency: 'INR',
    merchant: null,
    upiId: null,
    date: null,
    time: null,
    status: 'unknown',
    confidence: 0,
    sourceColor: '#6B7280',
    sourceIcon: '💳',
  };
}

/**
 * Auto-categorize a transaction based on merchant name keywords.
 */
export function autoCategorizeMerchant(merchantName) {
  if (!merchantName) return 'Uncategorized';

  const lower = merchantName.toLowerCase();

  const categories = {
    Dining: ['swiggy', 'zomato', 'uber eats', 'doordash', 'restaurant', 'cafe', 'coffee', 'food', 'pizza', 'burger', 'kitchen'],
    Transport: ['uber', 'ola', 'lyft', 'rapido', 'metro', 'fuel', 'petrol', 'gas station', 'parking'],
    Shopping: ['amazon', 'flipkart', 'myntra', 'ajio', 'meesho', 'walmart', 'target', 'best buy'],
    Groceries: ['bigbasket', 'blinkit', 'zepto', 'instamart', 'dunzo', 'grocery', 'supermarket', 'dmart'],
    Utilities: ['electricity', 'water', 'gas', 'internet', 'broadband', 'jio', 'airtel', 'vi ', 'recharge'],
    Entertainment: ['netflix', 'spotify', 'hotstar', 'prime video', 'disney', 'youtube', 'cinema', 'movie'],
    Health: ['pharmacy', 'hospital', 'doctor', 'apollo', 'medplus', 'netmeds', '1mg', 'practo'],
    Housing: ['rent', 'maintenance', 'society', 'housing'],
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return category;
    }
  }

  return 'Other';
}
