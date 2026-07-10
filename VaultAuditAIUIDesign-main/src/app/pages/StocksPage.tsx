import { PageHeader, Panel } from "../components/page-shell";
import { StocksWidget } from "../components/stocks-widget";
import { TrendingUp, TrendingDown } from "lucide-react";

const holdings = [
  { t: "AAPL", n: "Apple Inc.", shares: 32, price: 214.5, chg: 1.42, up: true },
  { t: "NVDA", n: "NVIDIA Corp.", shares: 12, price: 138.2, chg: 3.05, up: true },
  { t: "TSLA", n: "Tesla Inc.", shares: 18, price: 246.8, chg: -2.18, up: false },
  { t: "MSFT", n: "Microsoft Corp.", shares: 20, price: 421.7, chg: 0.62, up: true },
  { t: "AMZN", n: "Amazon.com", shares: 14, price: 189.4, chg: -0.44, up: false },
  { t: "GOOGL", n: "Alphabet Inc.", shares: 10, price: 176.9, chg: 1.08, up: true },
];

export function StocksPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Portfolio"
        title="My Stocks"
        subtitle="Read-only market feed encrypted locally. Positions never leave your device."
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <StocksWidget />
        </div>
        <Panel>
          <div className="text-[11px] tracking-[0.18em] uppercase text-white/40">Allocation</div>
          <div className="mt-4 space-y-3">
            {[
              ["Tech", 62, "bg-emerald-400"],
              ["Consumer", 18, "bg-sky-400"],
              ["Auto/EV", 12, "bg-fuchsia-400"],
              ["Cash", 8, "bg-white/60"],
            ].map(([label, pct, cls]) => (
              <div key={label as string}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/70">{label}</span>
                  <span className="text-white/40 tabular-nums">{pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className={`h-full ${cls}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel>
        <div className="flex items-center justify-between mb-4">
          <div className="text-[11px] tracking-[0.18em] uppercase text-white/40">Holdings</div>
          <span className="text-[11px] text-white/40">6 positions</span>
        </div>
        <div className="grid grid-cols-[80px_1fr_100px_120px_100px] gap-3 px-2 pb-2 text-[10px] uppercase tracking-[0.15em] text-white/30">
          <div>Ticker</div>
          <div>Name</div>
          <div className="text-right">Shares</div>
          <div className="text-right">Price</div>
          <div className="text-right">Change</div>
        </div>
        <div className="divide-y divide-white/[0.05]">
          {holdings.map((h) => (
            <div key={h.t} className="grid grid-cols-[80px_1fr_100px_120px_100px] gap-3 items-center px-2 py-3">
              <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-white text-[11px] tracking-wide w-fit">
                {h.t}
              </div>
              <div className="text-white/80 text-sm truncate">{h.n}</div>
              <div className="text-right text-white/70 tabular-nums text-sm">{h.shares}</div>
              <div className="text-right text-white tabular-nums text-sm">${h.price.toFixed(2)}</div>
              <div className="text-right">
                <span
                  className={`inline-flex items-center gap-0.5 text-[11px] px-2 py-0.5 rounded-full border ${
                    h.up
                      ? "bg-emerald-500/10 border-emerald-400/20 text-emerald-300 shadow-[0_0_10px_-2px_rgba(52,211,153,0.5)]"
                      : "bg-rose-500/10 border-rose-400/20 text-rose-300 shadow-[0_0_10px_-2px_rgba(244,114,128,0.5)]"
                  }`}
                >
                  {h.up ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                  {h.up ? "+" : ""}
                  {h.chg}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
