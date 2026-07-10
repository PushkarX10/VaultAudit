import { useState } from "react";
import { PageHeader, Panel } from "../components/page-shell";
import { Upload, ScanLine, Filter, ArrowUpRight, ArrowDownLeft, Coffee, Car, ShoppingBag, Zap, Home, Utensils } from "lucide-react";

const categories = [
  { name: "All", count: 128 },
  { name: "Dining", count: 24 },
  { name: "Transport", count: 18 },
  { name: "Shopping", count: 31 },
  { name: "Utilities", count: 9 },
  { name: "Groceries", count: 22 },
  { name: "Housing", count: 4 },
];

const txns = [
  { icon: Coffee, name: "Blue Bottle Coffee", cat: "Dining", date: "Jul 5 · 09:14", amount: -6.75, tone: "text-amber-300", bg: "from-amber-400/20 to-amber-500/5" },
  { icon: ShoppingBag, name: "Amazon Marketplace", cat: "Shopping", date: "Jul 4 · 18:32", amount: -348.0, tone: "text-orange-300", bg: "from-orange-400/20 to-orange-500/5" },
  { icon: Car, name: "Uber", cat: "Transport", date: "Jul 4 · 21:07", amount: -14.4, tone: "text-sky-300", bg: "from-sky-400/20 to-sky-500/5" },
  { icon: ArrowDownLeft, name: "Payroll · Acme Corp", cat: "Income", date: "Jul 3 · 08:00", amount: 5240.0, tone: "text-emerald-300", bg: "from-emerald-400/20 to-emerald-500/5" },
  { icon: Zap, name: "PG&E Utilities", cat: "Utilities", date: "Jul 2 · 12:00", amount: -87.32, tone: "text-yellow-300", bg: "from-yellow-400/20 to-yellow-500/5" },
  { icon: Utensils, name: "Kimchi House", cat: "Dining", date: "Jul 1 · 20:45", amount: -42.1, tone: "text-rose-300", bg: "from-rose-400/20 to-rose-500/5" },
  { icon: Home, name: "Rent · July", cat: "Housing", date: "Jul 1 · 00:01", amount: -2200.0, tone: "text-fuchsia-300", bg: "from-fuchsia-400/20 to-fuchsia-500/5" },
  { icon: ShoppingBag, name: "Flipkart", cat: "Shopping", date: "Jun 30 · 14:22", amount: -42.9, tone: "text-orange-300", bg: "from-orange-400/20 to-orange-500/5" },
];

export function TransactionsPage() {
  const [active, setActive] = useState("All");
  const [scanning, setScanning] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Ledger"
        title="Transactions"
        subtitle="A unified, on-device ledger. Bank sync + receipt OCR merged into one auditable timeline."
      />

      <Panel>
        <div
          onClick={() => {
            setScanning(true);
            setTimeout(() => setScanning(false), 2200);
          }}
          className="relative rounded-2xl border border-dashed border-white/15 bg-white/[0.02] hover:bg-white/[0.04] transition cursor-pointer p-6 overflow-hidden"
        >
          {scanning && (
            <div className="absolute inset-x-0 top-0 h-full pointer-events-none">
              <div
                className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-300 to-transparent shadow-[0_0_12px_rgba(52,211,153,0.9)]"
                style={{ animation: "scanY 1.8s ease-in-out infinite" }}
              />
              <style>{`@keyframes scanY { 0%{ top:0 } 50%{ top:100% } 100%{ top:0 } }`}</style>
            </div>
          )}
          <div className="flex items-center gap-4 relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/15 to-white/5 border border-white/10 flex items-center justify-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]">
              <ScanLine className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-white tracking-tight">Drop a receipt, invoice, or PDF</div>
              <div className="text-xs text-white/40 mt-0.5">
                Tesseract-Vault runs locally · avg 340ms per page · no cloud round-trip
              </div>
            </div>
            <button className="inline-flex items-center gap-2 pl-3 pr-4 py-2 rounded-full bg-gradient-to-b from-white/[0.16] to-white/[0.04] border border-white/20 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_10px_30px_-12px_rgba(255,255,255,0.35)]">
              <Upload className="w-3.5 h-3.5" />
              <span className="text-[12px]">Upload / Scan</span>
            </button>
          </div>
        </div>
      </Panel>

      <Panel>
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <div className="inline-flex items-center gap-1.5 text-white/40 text-[11px] uppercase tracking-[0.18em] pr-2">
            <Filter className="w-3 h-3" /> Filter
          </div>
          {categories.map((c) => (
            <button
              key={c.name}
              onClick={() => setActive(c.name)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] border transition ${
                active === c.name
                  ? "bg-white/10 border-white/20 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]"
                  : "bg-white/[0.03] border-white/[0.08] text-white/60 hover:text-white"
              }`}
            >
              {c.name}
              <span className="text-white/30">{c.count}</span>
            </button>
          ))}
        </div>

        <div className="divide-y divide-white/[0.05]">
          {txns.map((t) => {
            const Ic = t.icon;
            const positive = t.amount > 0;
            return (
              <div key={t.name + t.date} className="flex items-center gap-3 py-3 hover:bg-white/[0.02] rounded-lg px-2 transition">
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${t.bg} border border-white/10 flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]`}>
                  <Ic className={`w-4 h-4 ${t.tone}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-white text-sm tracking-tight truncate">{t.name}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-white/40">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/60">
                      {t.cat}
                    </span>
                    <span>{t.date}</span>
                  </div>
                </div>
                <div className={`inline-flex items-center gap-1 tabular-nums tracking-tight ${positive ? "text-emerald-300" : "text-white"}`}>
                  {positive ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3 text-white/40" />}
                  {positive ? "+" : ""}${Math.abs(t.amount).toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
