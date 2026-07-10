import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ArrowUpRight, Target } from "lucide-react";

const saved = 24680;
const goal = 40000;
const pct = Math.round((saved / goal) * 100);
const data = [
  { name: "saved", value: pct },
  { name: "rest", value: 100 - pct },
];

export function SavingsWidget() {
  return (
    <div className="relative rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.01] backdrop-blur-2xl p-6 overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
      <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="flex items-start justify-between mb-4 relative">
        <div>
          <div className="text-[11px] tracking-[0.18em] uppercase text-white/40">Savings Tracker</div>
          <div className="mt-1 text-white tracking-tight">Emergency Fund</div>
        </div>
        <button className="text-[11px] px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-white/60 hover:text-white transition">
          Q3 2026
        </button>
      </div>

      <div className="flex items-center gap-6 relative">
        <div className="relative w-[180px] h-[180px] shrink-0">
          <ResponsiveContainer>
            <PieChart>
              <defs>
                <linearGradient id="savedGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#a7f3d0" />
                  <stop offset="60%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
              <Pie
                data={data}
                innerRadius={64}
                outerRadius={82}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                stroke="none"
                paddingAngle={0}
              >
                <Cell key="saved-cell" fill="url(#savedGrad)" />
                <Cell key="rest-cell" fill="rgba(255,255,255,0.05)" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-[10px] tracking-[0.18em] uppercase text-white/40">Saved</div>
            <div className="mt-1 text-white tracking-tight" style={{ fontSize: 28 }}>
              ${saved.toLocaleString()}
            </div>
            <div className="mt-1 text-[11px] text-emerald-300">{pct}% of goal</div>
          </div>
          <div className="absolute inset-3 rounded-full pointer-events-none shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]" />
        </div>

        <div className="flex-1 space-y-4">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-2 text-white/50 text-[11px] mb-1.5">
              <Target className="w-3 h-3" /> Goal Target
            </div>
            <div className="text-white tracking-tight">${goal.toLocaleString()}</div>
            <div className="mt-1 text-[11px] text-white/40">by Dec 31, 2026</div>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-2 text-white/50 text-[11px] mb-1.5">
              <ArrowUpRight className="w-3 h-3 text-emerald-300" /> This Month
            </div>
            <div className="text-white tracking-tight">+$1,240</div>
            <div className="mt-1 text-[11px] text-emerald-300/80">+12.4% vs June</div>
          </div>
        </div>
      </div>
    </div>
  );
}
