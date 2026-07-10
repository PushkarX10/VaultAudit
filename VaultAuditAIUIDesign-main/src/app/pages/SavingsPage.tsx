import { PageHeader, Panel } from "../components/page-shell";
import { SavingsWidget } from "../components/savings-widget";
import { Plus, Plane, GraduationCap, Home, Car } from "lucide-react";

const goals = [
  { icon: Home, name: "Down Payment", saved: 24680, goal: 40000, tone: "from-emerald-400/25 to-emerald-500/5", accent: "bg-emerald-400" },
  { icon: Plane, name: "Tokyo Trip", saved: 1820, goal: 3500, tone: "from-sky-400/25 to-sky-500/5", accent: "bg-sky-400" },
  { icon: GraduationCap, name: "Course Fund", saved: 640, goal: 2000, tone: "from-fuchsia-400/25 to-fuchsia-500/5", accent: "bg-fuchsia-400" },
  { icon: Car, name: "New EV", saved: 8900, goal: 25000, tone: "from-amber-400/25 to-amber-500/5", accent: "bg-amber-400" },
];

export function SavingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Goals"
        title="Savings Tracker"
        subtitle="Every dollar allocated across your goals. Milestones update the moment a transaction posts."
        actions={
          <button className="inline-flex items-center gap-2 pl-3 pr-4 py-2 rounded-full bg-gradient-to-b from-white/[0.16] to-white/[0.04] border border-white/20 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]">
            <Plus className="w-3.5 h-3.5" /> <span className="text-xs">New Goal</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SavingsWidget />

        <Panel>
          <div className="text-[11px] tracking-[0.18em] uppercase text-white/40">Monthly Milestones</div>
          <div className="mt-4 space-y-4">
            {["Apr", "May", "Jun", "Jul"].map((m, i) => {
              const pct = [58, 72, 61, 88][i];
              return (
                <div key={m}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-white/70">{m} 2026</span>
                    <span className="text-white/50 tabular-nums">{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-emerald-500 shadow-[0_0_12px_rgba(52,211,153,0.5)]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {goals.map((g) => {
          const Ic = g.icon;
          const pct = Math.round((g.saved / g.goal) * 100);
          return (
            <Panel key={g.name}>
              <div className={`absolute -top-16 -right-16 w-40 h-40 rounded-full bg-gradient-to-br ${g.tone} blur-2xl pointer-events-none`} />
              <div className="relative">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/15 to-white/5 border border-white/10 flex items-center justify-center">
                    <Ic className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-white tracking-tight">{g.name}</div>
                </div>
                <div className="mt-4 tabular-nums text-white tracking-tight" style={{ fontSize: 22 }}>
                  ${g.saved.toLocaleString()}
                </div>
                <div className="text-[11px] text-white/40 mt-0.5">of ${g.goal.toLocaleString()}</div>
                <div className="mt-3 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className={`h-full rounded-full ${g.accent}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-2 text-[11px] text-white/50">{pct}% complete</div>
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
