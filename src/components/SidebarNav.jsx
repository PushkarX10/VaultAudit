/**
 * VaultAudit AI — SidebarNav
 *
 * Collapsible left sidebar with:
 *   • VaultAudit shield logo
 *   • 7 navigation items with active glow indicator
 *   • Collapse/expand toggle at the bottom
 */

import {
  LayoutDashboard,
  Sparkles,
  ListChecks,
  PiggyBank,
  TrendingUp,
  Receipt,
  Settings,
  ChevronLeft,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils.js';

const items = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'auditor', icon: Sparkles, label: 'AI Auditor' },
  { id: 'transactions', icon: ListChecks, label: 'Transactions' },
  { id: 'savings', icon: PiggyBank, label: 'Savings' },
  { id: 'stocks', icon: TrendingUp, label: 'Stocks' },
  { id: 'orders', icon: Receipt, label: 'Orders' },
  { id: 'settings', icon: Settings, label: 'Vault Settings' },
];

export default function SidebarNav({ active, onSelect, collapsed, onToggle }) {
  return (
    <aside
      className={cn(
        'transition-all duration-300 shrink-0 h-screen',
        'border-r border-white/[0.06] bg-white/[0.02] backdrop-blur-xl',
        'flex flex-col sticky top-0',
        collapsed ? 'w-[72px]' : 'w-[236px]'
      )}
    >
      {/* ── Logo ──────────────────────────────────────── */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-white/[0.06]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/20 to-white/5 border border-white/10 flex items-center justify-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]">
          <ShieldCheck className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-tight">
            <span className="text-white tracking-tight font-medium">VaultAudit</span>
            <span className="text-[10px] text-white/40 tracking-[0.2em] uppercase">AI</span>
          </div>
        )}
      </div>

      {/* ── Navigation ────────────────────────────────── */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={cn(
                'group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
                isActive
                  ? 'bg-gradient-to-b from-white/[0.09] to-white/[0.03] border border-white/10 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]'
                  : 'text-white/50 hover:text-white hover:bg-white/[0.04] border border-transparent'
              )}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && (
                <span className="tracking-tight text-sm">{item.label}</span>
              )}
              {!collapsed && isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Collapse toggle ───────────────────────────── */}
      <div className="p-3 border-t border-white/[0.06]">
        <button
          onClick={onToggle}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.04] transition"
        >
          <ChevronLeft
            className={cn(
              'w-4 h-4 transition-transform',
              collapsed && 'rotate-180'
            )}
          />
          {!collapsed && (
            <span className="text-xs tracking-wide">Collapse</span>
          )}
        </button>
      </div>
    </aside>
  );
}
