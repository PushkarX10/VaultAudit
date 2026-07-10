import { useState } from "react";
import { PageHeader, Panel } from "../components/page-shell";
import { Upload, Check, ShoppingBag, Package, Zap, Shirt, BookOpen, ChevronRight } from "lucide-react";

type Order = {
  id: string;
  icon: any;
  retailer: "Amazon" | "Flipkart" | "Myntra" | "BestBuy" | "Kindle";
  item: string;
  date: string;
  amount: number;
  verified: boolean;
  confidence: number;
  tint: string;
  ic: string;
};

const initial: Order[] = [
  { id: "o1", icon: ShoppingBag, retailer: "Amazon", item: "Sony WH-1000XM5 Headphones", date: "Jul 3, 2026", amount: 348.0, verified: true, confidence: 0.98, tint: "from-orange-400/20 to-orange-500/5", ic: "text-orange-300" },
  { id: "o2", icon: Package, retailer: "Flipkart", item: "Kitchen Organizer Set (12pc)", date: "Jul 2, 2026", amount: 42.9, verified: false, confidence: 0.86, tint: "from-sky-400/20 to-sky-500/5", ic: "text-sky-300" },
  { id: "o3", icon: Shirt, retailer: "Myntra", item: "Levi's Slim-Fit Denim", date: "Jun 29, 2026", amount: 68.5, verified: true, confidence: 0.94, tint: "from-fuchsia-400/20 to-fuchsia-500/5", ic: "text-fuchsia-300" },
  { id: "o4", icon: Zap, retailer: "BestBuy", item: "Anker 65W GaN Charger", date: "Jun 27, 2026", amount: 39.99, verified: false, confidence: 0.79, tint: "from-yellow-400/20 to-yellow-500/5", ic: "text-yellow-300" },
  { id: "o5", icon: BookOpen, retailer: "Kindle", item: "Atomic Habits — Digital", date: "Jun 25, 2026", amount: 12.99, verified: true, confidence: 0.99, tint: "from-emerald-400/20 to-emerald-500/5", ic: "text-emerald-300" },
];

export function OrdersPage() {
  const [orders, setOrders] = useState(initial);

  const toggle = (id: string) =>
    setOrders((os) => os.map((o) => (o.id === id ? { ...o, verified: !o.verified } : o)));

  const total = orders.reduce((s, o) => s + o.amount, 0);
  const verifiedCount = orders.filter((o) => o.verified).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="E-commerce OCR"
        title="My Orders"
        subtitle="Amazon and Flipkart invoices parsed on-device. Verify each line to teach your local model."
        actions={
          <button className="inline-flex items-center gap-2 pl-3 pr-4 py-2 rounded-full bg-gradient-to-b from-white/[0.16] to-white/[0.04] border border-white/20 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]">
            <Upload className="w-3.5 h-3.5" />
            <span className="text-xs">Upload Invoice</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          ["Total captured", `$${total.toFixed(2)}`, "5 orders parsed"],
          ["Verified", `${verifiedCount} / ${orders.length}`, "click to confirm extractions"],
          ["Avg OCR confidence", "91%", "Tesseract-Vault v3.1"],
        ].map(([l, v, s]) => (
          <Panel key={l}>
            <div className="text-[11px] tracking-[0.18em] uppercase text-white/40">{l}</div>
            <div className="mt-2 text-white tracking-tight" style={{ fontSize: 22 }}>
              {v}
            </div>
            <div className="mt-1 text-[11px] text-white/50">{s}</div>
          </Panel>
        ))}
      </div>

      <Panel>
        <div className="text-[11px] tracking-[0.18em] uppercase text-white/40 mb-4">Parsed Invoices</div>
        <div className="divide-y divide-white/[0.05]">
          {orders.map((o) => {
            const Ic = o.icon;
            return (
              <div key={o.id} className="flex items-center gap-3 py-3 px-1 hover:bg-white/[0.02] rounded-lg transition">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${o.tint} border border-white/10 flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]`}>
                  <Ic className={`w-4 h-4 ${o.ic}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-white text-sm tracking-tight truncate">{o.item}</div>
                  <div className="text-[11px] text-white/40 mt-0.5">
                    {o.retailer} · {o.date} · confidence {Math.round(o.confidence * 100)}%
                  </div>
                </div>
                <div className="text-white tabular-nums tracking-tight shrink-0 w-20 text-right">
                  ${o.amount.toFixed(2)}
                </div>
                <button
                  onClick={() => toggle(o.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] border transition ${
                    o.verified
                      ? "bg-emerald-500/10 border-emerald-400/25 text-emerald-300 shadow-[0_0_12px_-2px_rgba(52,211,153,0.6)]"
                      : "bg-white/[0.04] border-white/[0.08] text-white/60 hover:text-white"
                  }`}
                >
                  <Check className={`w-3 h-3 ${o.verified ? "opacity-100" : "opacity-40"}`} />
                  {o.verified ? "Verified" : "Verify"}
                </button>
                <ChevronRight className="w-4 h-4 text-white/30" />
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
