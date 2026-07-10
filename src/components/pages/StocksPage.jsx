/**
 * VaultAudit AI — StocksPage
 *
 * Portfolio view with:
 *   • Dynamic area chart with range-aware data (via StocksWidget)
 *   • Time-range-aware allocation breakdown
 *   • Holdings table with range-specific change values
 */

import { useState } from 'react';
import { PageHeader, Panel } from '@/components/PageShell.jsx';
import StocksWidget from '@/components/widgets/StocksWidget.jsx';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils.js';

// ── Holdings data per time range ─────────────────────────────
const HOLDINGS_BY_RANGE = {
  '7D': [
    { t: 'AAPL', n: 'Apple Inc.', shares: 32, price: 214.5, chg: 0.38, up: true },
    { t: 'NVDA', n: 'NVIDIA Corp.', shares: 12, price: 138.2, chg: 1.14, up: true },
    { t: 'TSLA', n: 'Tesla Inc.', shares: 18, price: 246.8, chg: -0.92, up: false },
    { t: 'MSFT', n: 'Microsoft Corp.', shares: 20, price: 421.7, chg: 0.21, up: true },
    { t: 'AMZN', n: 'Amazon.com', shares: 14, price: 189.4, chg: -0.18, up: false },
    { t: 'GOOGL', n: 'Alphabet Inc.', shares: 10, price: 176.9, chg: 0.42, up: true },
  ],
  '30D': [
    { t: 'AAPL', n: 'Apple Inc.', shares: 32, price: 214.5, chg: 1.42, up: true },
    { t: 'NVDA', n: 'NVIDIA Corp.', shares: 12, price: 138.2, chg: 3.05, up: true },
    { t: 'TSLA', n: 'Tesla Inc.', shares: 18, price: 246.8, chg: -2.18, up: false },
    { t: 'MSFT', n: 'Microsoft Corp.', shares: 20, price: 421.7, chg: 0.62, up: true },
    { t: 'AMZN', n: 'Amazon.com', shares: 14, price: 189.4, chg: -0.44, up: false },
    { t: 'GOOGL', n: 'Alphabet Inc.', shares: 10, price: 176.9, chg: 1.08, up: true },
  ],
  '90D': [
    { t: 'AAPL', n: 'Apple Inc.', shares: 32, price: 214.5, chg: 4.81, up: true },
    { t: 'NVDA', n: 'NVIDIA Corp.', shares: 12, price: 138.2, chg: 12.6, up: true },
    { t: 'TSLA', n: 'Tesla Inc.', shares: 18, price: 246.8, chg: 7.32, up: true },
    { t: 'MSFT', n: 'Microsoft Corp.', shares: 20, price: 421.7, chg: 2.14, up: true },
    { t: 'AMZN', n: 'Amazon.com', shares: 14, price: 189.4, chg: 1.92, up: true },
    { t: 'GOOGL', n: 'Alphabet Inc.', shares: 10, price: 176.9, chg: 5.41, up: true },
  ],
  '1Y': [
    { t: 'AAPL', n: 'Apple Inc.', shares: 32, price: 214.5, chg: 18.4, up: true },
    { t: 'NVDA', n: 'NVIDIA Corp.', shares: 12, price: 138.2, chg: 42.1, up: true },
    { t: 'TSLA', n: 'Tesla Inc.', shares: 18, price: 246.8, chg: -8.7, up: false },
    { t: 'MSFT', n: 'Microsoft Corp.', shares: 20, price: 421.7, chg: 11.2, up: true },
    { t: 'AMZN', n: 'Amazon.com', shares: 14, price: 189.4, chg: 22.8, up: true },
    { t: 'GOOGL', n: 'Alphabet Inc.', shares: 10, price: 176.9, chg: 14.6, up: true },
  ],
};

const ALLOCATION = {
  '7D':  [['Tech', 63, 'bg-emerald-400'], ['Consumer', 17, 'bg-sky-400'], ['Auto/EV', 12, 'bg-fuchsia-400'], ['Cash', 8, 'bg-white/60']],
  '30D': [['Tech', 62, 'bg-emerald-400'], ['Consumer', 18, 'bg-sky-400'], ['Auto/EV', 12, 'bg-fuchsia-400'], ['Cash', 8, 'bg-white/60']],
  '90D': [['Tech', 60, 'bg-emerald-400'], ['Consumer', 19, 'bg-sky-400'], ['Auto/EV', 14, 'bg-fuchsia-400'], ['Cash', 7, 'bg-white/60']],
  '1Y':  [['Tech', 58, 'bg-emerald-400'], ['Consumer', 20, 'bg-sky-400'], ['Auto/EV', 15, 'bg-fuchsia-400'], ['Cash', 7, 'bg-white/60']],
};

export default function StocksPage() {
  const [range, setRange] = useState('30D');
  const holdings = HOLDINGS_BY_RANGE[range];
  const allocation = ALLOCATION[range];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow="Portfolio"
        title="My Stocks"
        subtitle="Read-only market feed encrypted locally. Positions never leave your device."
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <StocksWidget onRangeChange={setRange} />
        </div>

        {/* Allocation */}
        <Panel>
          <div className="text-[11px] tracking-[0.18em] uppercase text-white/40">
            Allocation · {range}
          </div>
          <div className="mt-4 space-y-3">
            {allocation.map(([label, pct, cls]) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/70">{label}</span>
                  <span className="text-white/40 tabular-nums">{pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className={`h-full rounded-full ${cls} transition-all duration-500`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Holdings table */}
      <Panel>
        <div className="flex items-center justify-between mb-4">
          <div className="text-[11px] tracking-[0.18em] uppercase text-white/40">
            Holdings · {range}
          </div>
          <span className="text-[11px] text-white/40">{holdings.length} positions</span>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-[80px_1fr_100px_120px_100px] gap-3 px-2 pb-2 text-[10px] uppercase tracking-[0.15em] text-white/30">
          <div>Ticker</div>
          <div>Name</div>
          <div className="text-right">Shares</div>
          <div className="text-right">Price</div>
          <div className="text-right">Change</div>
        </div>

        {/* Table rows */}
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
                <span className={cn(
                  'inline-flex items-center gap-0.5 text-[11px] px-2 py-0.5 rounded-full border transition-all',
                  h.up
                    ? 'bg-emerald-500/10 border-emerald-400/20 text-emerald-300 shadow-[0_0_10px_-2px_rgba(52,211,153,0.5)]'
                    : 'bg-rose-500/10 border-rose-400/20 text-rose-300 shadow-[0_0_10px_-2px_rgba(244,114,128,0.5)]'
                )}>
                  {h.up ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                  {h.up ? '+' : ''}{h.chg}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
