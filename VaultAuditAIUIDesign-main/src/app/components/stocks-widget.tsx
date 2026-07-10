import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

const data = Array.from({ length: 30 }, (_, i) => {
  const base = 42000;
  const trend = i * 180;
  const noise = Math.sin(i / 2.4) * 800 + Math.cos(i / 3) * 500;
  return { day: i + 1, value: Math.round(base + trend + noise) };
});

const stocks = [
  { t: "AAPL", chg: 1.42, up: true },
  { t: "TSLA", chg: -2.18, up: false },
  { t: "NVDA", chg: 3.05, up: true },
  { t: "MSFT", chg: 0.62, up: true },
  { t: "AMZN", chg: -0.44, up: false },
];

export function StocksWidget() {
  const latest = data[data.length - 1].value;
  const first = data[0].value;
  const change = (((latest - first) / first) * 100).toFixed(2);

  return (
    <div className="relative rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.01] backdrop-blur-2xl p-6 overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

      <div className="flex items-start justify-between mb-4 relative">
        <div>
          <div className="text-[11px] tracking-[0.18em] uppercase text-white/40">My Stocks · 30D</div>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="text-white tracking-tight" style={{ fontSize: 26 }}>
              ${latest.toLocaleString()}
            </span>
            <span className="text-emerald-300 text-[12px] inline-flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +{change}%
            </span>
          </div>
        </div>
        <div className="flex gap-1 p-1 rounded-full bg-white/[0.03] border border-white/[0.06]">
          {["7D", "30D", "90D", "1Y"].map((r, i) => (
            <button
              key={r}
              className={`text-[11px] px-2.5 py-1 rounded-full transition ${
                i === 1
                  ? "bg-white/10 text-white border border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]"
                  : "text-white/50 hover:text-white"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="h-40 -mx-2 relative">
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="portGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.5} />
                <stop offset="60%" stopColor="#34d399" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip
              cursor={{ stroke: "rgba(255,255,255,0.15)", strokeDasharray: "3 3" }}
              contentStyle={{
                background: "rgba(15,15,15,0.9)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                backdropFilter: "blur(12px)",
                fontSize: 11,
                color: "#fff",
              }}
              labelFormatter={(l) => `Day ${l}`}
              formatter={(v: number) => [`$${v.toLocaleString()}`, "Portfolio"]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#a7f3d0"
              strokeWidth={2}
              fill="url(#portGrad)"
              dot={false}
              activeDot={{ r: 4, fill: "#a7f3d0", stroke: "#050505", strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 relative">
        {stocks.map((s) => (
          <div
            key={s.t}
            className="group inline-flex items-center gap-2 pl-2.5 pr-2 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] hover:border-white/20 transition"
          >
            <span className="text-[11px] tracking-wide text-white/90">{s.t}</span>
            <span
              className={`inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full border ${
                s.up
                  ? "bg-emerald-500/10 border-emerald-400/20 text-emerald-300"
                  : "bg-rose-500/10 border-rose-400/20 text-rose-300"
              }`}
            >
              {s.up ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
              {s.up ? "+" : ""}
              {s.chg}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
