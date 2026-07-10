/**
 * VaultAudit AI — StocksWidget
 *
 * Area chart with time-range-dependent data:
 *   • 7D / 30D / 90D / 1Y each generate distinct price curves
 *   • Ticker chips with change badges
 *   • Smooth tooltip
 */

import { useState, useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils.js';

// ── Deterministic pseudo-random number from seed ─────────────
function seeded(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

// ── Generate realistic data per range ────────────────────────
function generateData(range) {
  const configs = {
    '7D':  { points: 7,   base: 45200, trend: 80,  volatility: 400,  seed: 42 },
    '30D': { points: 30,  base: 42000, trend: 180, volatility: 800,  seed: 77 },
    '90D': { points: 90,  base: 36000, trend: 120, volatility: 1200, seed: 99 },
    '1Y':  { points: 365, base: 28000, trend: 52,  volatility: 2000, seed: 13 },
  };
  const c = configs[range] || configs['30D'];
  const rng = seeded(c.seed);

  return Array.from({ length: c.points }, (_, i) => {
    const trendVal = c.trend * i;
    const noise = (rng() - 0.5) * c.volatility + Math.sin(i / (c.points / 6)) * (c.volatility * 0.6);
    return { day: i + 1, value: Math.round(c.base + trendVal + noise) };
  });
}

// ── Per-range stock changes ──────────────────────────────────
const STOCK_CHANGES = {
  '7D':  [{ t:'AAPL', chg:0.38, up:true }, { t:'TSLA', chg:-0.92, up:false }, { t:'NVDA', chg:1.14, up:true }, { t:'MSFT', chg:0.21, up:true }, { t:'AMZN', chg:-0.18, up:false }],
  '30D': [{ t:'AAPL', chg:1.42, up:true }, { t:'TSLA', chg:-2.18, up:false }, { t:'NVDA', chg:3.05, up:true }, { t:'MSFT', chg:0.62, up:true }, { t:'AMZN', chg:-0.44, up:false }],
  '90D': [{ t:'AAPL', chg:4.81, up:true }, { t:'TSLA', chg:7.32, up:true },  { t:'NVDA', chg:12.6, up:true }, { t:'MSFT', chg:2.14, up:true }, { t:'AMZN', chg:1.92, up:true }],
  '1Y':  [{ t:'AAPL', chg:18.4, up:true }, { t:'TSLA', chg:-8.7, up:false }, { t:'NVDA', chg:42.1, up:true }, { t:'MSFT', chg:11.2, up:true }, { t:'AMZN', chg:22.8, up:true }],
};

const ranges = ['7D', '30D', '90D', '1Y'];

export default function StocksWidget({ onRangeChange }) {
  const [activeRange, setActiveRange] = useState('30D');

  const handleRange = (r) => {
    setActiveRange(r);
    onRangeChange?.(r);
  };

  const data = useMemo(() => generateData(activeRange), [activeRange]);
  const stocks = STOCK_CHANGES[activeRange];

  const latest = data[data.length - 1].value;
  const first = data[0].value;
  const change = (((latest - first) / first) * 100).toFixed(2);
  const isUp = latest >= first;

  return (
    <div className="relative rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.01] backdrop-blur-2xl p-6 overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between mb-4 relative">
        <div>
          <div className="text-[11px] tracking-[0.18em] uppercase text-white/40">
            My Stocks · {activeRange}
          </div>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="text-white tracking-tight" style={{ fontSize: 26 }}>
              ${latest.toLocaleString()}
            </span>
            <span className={cn('text-[12px] inline-flex items-center gap-1', isUp ? 'text-emerald-300' : 'text-rose-300')}>
              {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isUp ? '+' : ''}{change}%
            </span>
          </div>
        </div>
        {/* Range selector */}
        <div className="flex gap-1 p-1 rounded-full bg-white/[0.03] border border-white/[0.06]">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => handleRange(r)}
              className={cn(
                'text-[11px] px-2.5 py-1 rounded-full transition',
                r === activeRange
                  ? 'bg-white/10 text-white border border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]'
                  : 'text-white/50 hover:text-white border border-transparent'
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-40 -mx-2 relative">
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="portGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isUp ? '#34d399' : '#fb7185'} stopOpacity={0.5} />
                <stop offset="60%" stopColor={isUp ? '#34d399' : '#fb7185'} stopOpacity={0.1} />
                <stop offset="100%" stopColor={isUp ? '#34d399' : '#fb7185'} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip
              cursor={{ stroke: 'rgba(255,255,255,0.15)', strokeDasharray: '3 3' }}
              contentStyle={{
                background: 'rgba(15,15,15,0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                backdropFilter: 'blur(12px)',
                fontSize: 11,
                color: '#fff',
              }}
              labelFormatter={(l) => `Day ${l}`}
              formatter={(v) => [`$${v.toLocaleString()}`, 'Portfolio']}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={isUp ? '#a7f3d0' : '#fda4af'}
              strokeWidth={2}
              fill="url(#portGrad)"
              dot={false}
              activeDot={{ r: 4, fill: isUp ? '#a7f3d0' : '#fda4af', stroke: '#050505', strokeWidth: 2 }}
              isAnimationActive={true}
              animationDuration={600}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Ticker chips */}
      <div className="mt-4 flex flex-wrap gap-2 relative">
        {stocks.map((s) => (
          <div
            key={s.t}
            className="group inline-flex items-center gap-2 pl-2.5 pr-2 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] hover:border-white/20 transition"
          >
            <span className="text-[11px] tracking-wide text-white/90">{s.t}</span>
            <span className={cn(
              'inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full border',
              s.up
                ? 'bg-emerald-500/10 border-emerald-400/20 text-emerald-300'
                : 'bg-rose-500/10 border-rose-400/20 text-rose-300'
            )}>
              {s.up ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
              {s.up ? '+' : ''}{s.chg}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
