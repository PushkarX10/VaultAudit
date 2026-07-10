import { Search, Bell, Lock } from "lucide-react";

export function TopHeader() {
  return (
    <header className="h-16 shrink-0 border-b border-white/[0.06] bg-white/[0.02] backdrop-blur-xl flex items-center px-8 gap-6">
      <div className="flex flex-col leading-tight">
        <span className="text-white tracking-tight">Dashboard</span>
        <span className="text-xs text-white/40">Sunday, July 5 · Good evening, Aarav</span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] w-72 hover:border-white/20 transition">
          <Search className="w-3.5 h-3.5 text-white/40" />
          <input
            placeholder="Search transactions, tickers…"
            className="bg-transparent outline-none text-xs text-white/80 placeholder:text-white/30 flex-1"
          />
          <kbd className="text-[10px] text-white/40 px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/10">⌘K</kbd>
        </div>

        <div
          className="group flex items-center gap-2.5 pl-3 pr-4 py-2 rounded-full
          bg-gradient-to-b from-emerald-400/[0.14] to-emerald-500/[0.04]
          border border-emerald-400/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_0_20px_-8px_rgba(52,211,153,0.6)]"
        >
          <span className="relative flex w-2 h-2">
            <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
            <span className="relative w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]" />
          </span>
          <Lock className="w-3 h-3 text-emerald-300" />
          <span className="text-[11px] tracking-wide text-emerald-100">Local-Only Processing</span>
        </div>

        <button className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.06] transition">
          <Bell className="w-4 h-4 text-white/60" />
        </button>

        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-white/20 to-white/5 border border-white/10 flex items-center justify-center text-xs text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]">
          AR
        </div>
      </div>
    </header>
  );
}
