/**
 * VaultAudit AI — LiveTransactionToast
 *
 * Animated toast component for when a payment is auto-captured.
 * Shows payment source brand, amount, merchant, and source badge.
 */

import { Toaster, toast } from 'sonner';

// ── Source brand configs ─────────────────────────────────────
const SOURCE_BRANDS = {
  GooglePay: {
    icon: '💚',
    gradient: 'from-green-500/20 to-green-600/5',
    border: 'border-green-400/30',
    text: 'text-green-300',
    label: 'GooglePay',
  },
  PhonePe: {
    icon: '💜',
    gradient: 'from-purple-500/20 to-purple-600/5',
    border: 'border-purple-400/30',
    text: 'text-purple-300',
    label: 'PhonePe',
  },
  ApplePay: {
    icon: '🍎',
    gradient: 'from-white/10 to-white/5',
    border: 'border-white/20',
    text: 'text-white',
    label: 'Apple Pay',
  },
  Paytm: {
    icon: '💙',
    gradient: 'from-sky-500/20 to-sky-600/5',
    border: 'border-sky-400/30',
    text: 'text-sky-300',
    label: 'Paytm',
  },
  UPI: {
    icon: '🏦',
    gradient: 'from-emerald-500/20 to-emerald-600/5',
    border: 'border-emerald-400/30',
    text: 'text-emerald-300',
    label: 'UPI',
  },
};

const DEFAULT_BRAND = {
  icon: '💳',
  gradient: 'from-white/10 to-white/5',
  border: 'border-white/15',
  text: 'text-white/80',
  label: 'Payment',
};

/**
 * Show a live transaction toast.
 *
 * @param {{ amount: number, currency: string, merchant: string, source: string }} info
 */
export function showTransactionToast({ amount, currency, merchant, source }) {
  const brand = SOURCE_BRANDS[source] || DEFAULT_BRAND;
  const symbol = currency === 'INR' ? '₹' : '$';
  const displayAmount = amount ? `${symbol}${amount.toLocaleString()}` : 'Amount detected';

  toast.custom(
    (t) => (
      <div
        className={`
          flex items-center gap-3 px-4 py-3 rounded-2xl
          bg-gradient-to-r ${brand.gradient}
          border ${brand.border}
          backdrop-blur-xl
          shadow-[0_0_30px_-8px_rgba(52,211,153,0.4)]
          animate-slide-in-right
          max-w-sm
        `}
      >
        <span className="text-xl">{brand.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-white text-sm font-medium tracking-tight">
            {displayAmount}
            {merchant ? ` to ${merchant}` : ''}
          </div>
          <div className="text-white/50 text-[11px] mt-0.5">
            via {brand.label} · just now
          </div>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300`}>
          Added
        </span>
      </div>
    ),
    {
      duration: 5000,
      position: 'bottom-right',
    }
  );
}

/**
 * VaultAudit Toaster wrapper — place once in the root layout.
 */
export function VaultToaster() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
          padding: 0,
        },
      }}
    />
  );
}
