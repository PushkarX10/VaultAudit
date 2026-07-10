/**
 * VaultAudit AI — DashboardPage
 *
 * Financial overview with:
 *   • 3 stat cards (Net Worth, Portfolio, Monthly Spend)
 *   • Savings donut widget
 *   • Stocks area chart widget
 *   • Recent orders widget
 */

import { Wallet, TrendingUp, Receipt, ShieldCheck } from 'lucide-react';
import { PageHeader, Panel } from '@/components/PageShell.jsx';
import SavingsWidget from '@/components/widgets/SavingsWidget.jsx';
import StocksWidget from '@/components/widgets/StocksWidget.jsx';
import OrdersWidget from '@/components/widgets/OrdersWidget.jsx';

function StatCard({ icon: Icon, label, value, sub, tone = 'text-white/60' }) {
  return (
    <Panel>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/15 to-white/5 border border-white/10 flex items-center justify-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]">
          <Icon className="w-4 h-4 text-white/80" />
        </div>
        <div className="text-[11px] tracking-[0.18em] uppercase text-white/40">
          {label}
        </div>
      </div>
      <div
        className="mt-4 text-white tracking-tight"
        style={{ fontSize: 22 }}
      >
        {value}
      </div>
      <div className={`mt-1 text-[11px] ${tone}`}>{sub}</div>
    </Panel>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow="Overview"
        title="Financial Overview"
        subtitle="Every insight below was computed on your device. Zero data left the vault."
        actions={
          <div className="inline-flex items-center gap-2 pl-2.5 pr-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span className="text-[11px] text-white/70 tracking-wide">
              Encrypted vault · last synced 2m ago
            </span>
          </div>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={Wallet}
          label="Net Worth"
          value="$128,940.22"
          sub="+2.4% this month"
          tone="text-emerald-300/80"
        />
        <StatCard
          icon={TrendingUp}
          label="Portfolio"
          value="$47,320.10"
          sub="+$1,842 · 30d"
          tone="text-emerald-300/80"
        />
        <StatCard
          icon={Receipt}
          label="Spend · July"
          value="$1,904.55"
          sub="14 receipts scanned"
          tone="text-white/50"
        />
      </div>

      {/* Widget grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SavingsWidget />
        <StocksWidget />
      </div>

      <OrdersWidget />
    </div>
  );
}
