/**
 * VaultAudit AI — OrdersWidget
 *
 * Recent purchases scanned via OCR with upload/scan zone.
 * Used on the Dashboard page.
 */

import {
  Upload,
  ScanLine,
  ShoppingBag,
  Package,
  Zap,
  Shirt,
  BookOpen,
} from 'lucide-react';

const orders = [
  {
    icon: ShoppingBag,
    retailer: 'Amazon',
    item: 'Sony WH-1000XM5 Headphones',
    date: 'Jul 3, 2026',
    amount: 348.0,
    tint: 'from-orange-400/20 to-orange-500/5',
    ic: 'text-orange-300',
  },
  {
    icon: Package,
    retailer: 'Flipkart',
    item: 'Kitchen Organizer Set (12pc)',
    date: 'Jul 2, 2026',
    amount: 42.9,
    tint: 'from-sky-400/20 to-sky-500/5',
    ic: 'text-sky-300',
  },
  {
    icon: Shirt,
    retailer: 'Myntra',
    item: "Levi's Slim-Fit Denim",
    date: 'Jun 29, 2026',
    amount: 68.5,
    tint: 'from-fuchsia-400/20 to-fuchsia-500/5',
    ic: 'text-fuchsia-300',
  },
  {
    icon: Zap,
    retailer: 'BestBuy',
    item: 'Anker 65W GaN Charger',
    date: 'Jun 27, 2026',
    amount: 39.99,
    tint: 'from-yellow-400/20 to-yellow-500/5',
    ic: 'text-yellow-300',
  },
  {
    icon: BookOpen,
    retailer: 'Kindle',
    item: 'Atomic Habits — Digital',
    date: 'Jun 25, 2026',
    amount: 12.99,
    tint: 'from-emerald-400/20 to-emerald-500/5',
    ic: 'text-emerald-300',
  },
];

export default function OrdersWidget() {
  return (
    <div className="relative rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.01] backdrop-blur-2xl p-6 overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
      {/* Ambient glow */}
      <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-fuchsia-500/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between mb-5 relative">
        <div>
          <div className="text-[11px] tracking-[0.18em] uppercase text-white/40">
            My Orders · Receipt OCR
          </div>
          <div className="mt-1 text-white tracking-tight">
            Recent Purchases
          </div>
        </div>
        <button className="group inline-flex items-center gap-2 pl-3 pr-4 py-2 rounded-full bg-gradient-to-b from-white/[0.16] to-white/[0.04] border border-white/20 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_10px_30px_-12px_rgba(255,255,255,0.35)] hover:from-white/25 hover:to-white/10 transition-all">
          <span className="w-6 h-6 rounded-full bg-black/30 flex items-center justify-center border border-white/10">
            <Upload className="w-3 h-3" />
          </span>
          <span className="text-[12px] tracking-tight">
            Upload / Scan Invoice
          </span>
        </button>
      </div>

      {/* Drop zone */}
      <div className="mb-4 relative flex items-center gap-3 p-3.5 rounded-xl border border-dashed border-white/15 bg-white/[0.02] hover:bg-white/[0.04] transition cursor-pointer">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-white/15 to-white/5 border border-white/10 flex items-center justify-center">
          <ScanLine className="w-4 h-4 text-white/80" />
        </div>
        <div className="flex-1">
          <div className="text-[12px] text-white">
            Drop a receipt image or PDF
          </div>
          <div className="text-[11px] text-white/40">
            OCR runs on-device · nothing leaves your machine
          </div>
        </div>
        <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 tracking-wide">
          LOCAL
        </span>
      </div>

      {/* Order list */}
      <div className="divide-y divide-white/[0.05] relative">
        {orders.map((o) => {
          const Ic = o.icon;
          return (
            <div
              key={o.item}
              className="group flex items-center gap-3 py-3 px-1 hover:bg-white/[0.02] rounded-lg transition"
            >
              <div
                className={`w-9 h-9 rounded-lg bg-gradient-to-br ${o.tint} border border-white/10 flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]`}
              >
                <Ic className={`w-4 h-4 ${o.ic}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-white text-[13px] tracking-tight truncate">
                    {o.item}
                  </span>
                </div>
                <div className="text-[11px] text-white/40 mt-0.5">
                  {o.retailer} · {o.date}
                </div>
              </div>
              <div className="text-white tracking-tight tabular-nums shrink-0">
                ${o.amount.toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
