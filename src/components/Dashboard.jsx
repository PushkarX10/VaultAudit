/**
 * VaultAudit AI — Dashboard Page
 *
 * High-fidelity dashboard matching the mockup design.
 * Uses Tremor Raw DonutChart and BarChart for professional
 * data visualizations with live PGLite data.
 *
 * Layout: Hero stats → Charts row (Donut + Bar) → Recent Insights
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  Shield,
  Zap,
  AlertTriangle,
  TrendingUp,
  Activity,
  FileText,
  Clock,
  ArrowUpRight,
} from 'lucide-react';

import { DonutChart } from './charts/DonutChart.jsx';
import { BarChart } from './charts/BarChart.jsx';
import { ErrorBoundary } from './ErrorBoundary.jsx';
import { isOllamaOnline } from '../services/auditService.js';
import {
  getTransactionStats,
  getCategoryBreakdown,
  getMonthlySpend,
  getRecentTransactions,
} from '../db/schema.js';

const currencyFormatter = (value) =>
  Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value));

// ── Skeleton Loader ──────────────────────────────────────────
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />
);

// ── Stat Card ────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sublabel, accent = false, loading }) => (
  <div
    className={`
      relative overflow-hidden rounded-xl border p-5 transition-all duration-200 hover:shadow-md
      ${accent
        ? 'border-slate-300 dark:border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 text-white'
        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200'
      }
    `}
  >
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <p className={`text-xs font-medium uppercase tracking-wider ${accent ? 'text-slate-300' : 'text-slate-500'}`}>
          {label}
        </p>
        {loading ? (
          <Skeleton className={`h-8 w-28 ${accent ? '!bg-slate-700' : ''}`} />
        ) : (
          <p className="text-2xl font-bold tabular-nums">{value}</p>
        )}
        {sublabel && (
          <p className={`text-xs ${accent ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>
            {sublabel}
          </p>
        )}
      </div>
      <div className={`rounded-lg p-2.5 ${accent ? 'bg-white/10' : 'bg-slate-100 dark:bg-slate-800'}`}>
        <Icon className={`h-5 w-5 ${accent ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`} />
      </div>
    </div>
  </div>
);

// ── AI Status Badge ──────────────────────────────────────────
const AiStatusBadge = ({ online, loading }) => (
  <div className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-1.5 text-xs font-medium shadow-sm">
    <span className={`h-2 w-2 rounded-full ${loading ? 'bg-slate-300 animate-pulse' : online ? 'bg-emerald-500' : 'bg-red-400'}`} />
    <span className="text-slate-600 dark:text-slate-300">
      AI Engine: {loading ? '...' : online ? 'Active' : 'Offline'}
    </span>
  </div>
);

// ── Recent Insight Card ──────────────────────────────────────
const flagColors = {
  normal: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-500/20' },
  impulse_buy: { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-500/20' },
  hidden_subscription: { bg: 'bg-violet-50 dark:bg-violet-500/10', text: 'text-violet-700 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-500/20' },
  suspicious: { bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-500/20' },
  pending: { bg: 'bg-slate-50 dark:bg-slate-500/10', text: 'text-slate-500 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-500/20' },
  unclassified: { bg: 'bg-slate-50 dark:bg-slate-500/10', text: 'text-slate-500 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-500/20' },
};

const flagLabel = {
  normal: 'Verified',
  impulse_buy: 'Impulse',
  hidden_subscription: 'Subscription',
  suspicious: 'Suspicious',
  pending: 'Pending',
  unclassified: 'Offline',
};

const InsightCard = ({ txn }) => {
  const flag = txn.ai_audit_flag || 'unclassified';
  const colors = flagColors[flag] || flagColors.unclassified;
  return (
    <div className="flex items-start gap-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 transition-colors hover:border-slate-300 dark:hover:border-slate-700">
      <div className="mt-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 p-2">
        <FileText className="h-4 w-4 text-slate-500 dark:text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
            {txn.source_file || txn.parsed_category || 'Transaction'}
          </p>
          <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${colors.bg} ${colors.text} ${colors.border}`}>
            {flagLabel[flag]}
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
          {txn.ai_audit_note || 'No audit notes available'}
        </p>
        <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
          {txn.amount && (
            <span className="font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
              {txn.currency ? (txn.currency.length > 1 && !txn.currency.endsWith('.') ? txn.currency + ' ' : txn.currency) : ''}
              {Intl.NumberFormat(undefined, { minimumFractionDigits: 2 }).format(Number(txn.amount))}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {txn.date instanceof Date ? txn.date.toLocaleDateString() : String(txn.date ?? '')}
          </span>
        </div>
      </div>
    </div>
  );
};

// ── Empty State ──────────────────────────────────────────────
const EmptyState = ({ title, subtitle }) => (
  <div className="flex flex-col items-center justify-center py-10 text-center">
    <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-4 mb-3">
      <Activity className="h-8 w-8 text-slate-400 dark:text-slate-500" />
    </div>
    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{title}</p>
    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 max-w-xs">{subtitle}</p>
  </div>
);

// ── Main Dashboard Component ────────────────────────────────

export default function Dashboard({ db }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total_amount: 0, transaction_count: 0, alert_count: 0 });
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [recentTxns, setRecentTxns] = useState([]);
  const [ollamaStatus, setOllamaStatus] = useState({ online: false, loading: true });

  const loadData = useCallback(async () => {
    if (!db) return;
    setLoading(true);
    try {
      const [statsRes, catRes, monthRes, recentRes] = await Promise.all([
        getTransactionStats(db),
        getCategoryBreakdown(db),
        getMonthlySpend(db),
        getRecentTransactions(db, 5),
      ]);
      setStats(statsRes);
      setCategoryData(catRes.map((r) => ({ ...r, amount: Number(r.amount) })));
      setMonthlyData(monthRes.map((r) => ({ ...r, Spend: Number(r.spend) })));
      setRecentTxns(recentRes);
    } catch (err) {
      console.error('[Dashboard] Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const domCurr = stats.dominant_currency || '';
  const localCurrencyFormatter = useCallback((val) => {
    const displaySymbol = domCurr ? (domCurr.length > 1 && !domCurr.endsWith('.') ? `${domCurr} ` : domCurr) : '';
    return `${displaySymbol}${Intl.NumberFormat(undefined, { minimumFractionDigits: 2 }).format(Number(val))}`;
  }, [domCurr]);

  // Ollama status check
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const online = await isOllamaOnline();
        if (!cancelled) setOllamaStatus({ online, loading: false });
      } catch {
        if (!cancelled) setOllamaStatus({ online: false, loading: false });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">VaultAudit AI — Financial Overview</p>
        </div>
        <AiStatusBadge online={ollamaStatus.online} loading={ollamaStatus.loading} />
      </div>

      {/* ── Hero Stats ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={TrendingUp}
          label="Total Processed"
          value={localCurrencyFormatter(stats.total_amount)}
          sublabel={`${stats.transaction_count} transactions`}
          accent
          loading={loading}
        />
        <StatCard
          icon={Shield}
          label="Security Status"
          value="Local & Secure"
          sublabel="AES-256-GCM · Zero cloud access"
          loading={false}
        />
        <StatCard
          icon={AlertTriangle}
          label="Audit Alerts"
          value={stats.alert_count}
          sublabel="Flagged transactions"
          loading={loading}
        />
        <StatCard
          icon={Zap}
          label="Processing"
          value="On-Device"
          sublabel="Tesseract.js OCR · Local Ollama"
          loading={false}
        />
      </div>

      {/* ── Charts Row ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Donut Chart */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Spending Breakdown</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">By AI-classified category</p>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Skeleton className="h-40 w-40 !rounded-full" />
            </div>
          ) : categoryData.length === 0 ? (
            <EmptyState
              title="No spending data yet"
              subtitle="Upload receipts to see your spending breakdown visualized here"
            />
          ) : (
            <ErrorBoundary fallback={<EmptyState title="Chart error" subtitle="Could not render spending chart" />}>
              <div className="flex flex-col items-center">
                <DonutChart
                  data={categoryData}
                  category="name"
                  value="amount"
                  className="h-48 w-48"
                  showLabel
                  valueFormatter={localCurrencyFormatter}
                  colors={['slate', 'zinc', 'blue', 'emerald', 'amber', 'violet', 'cyan']}
                />
                {/* Legend */}
                <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
                  {categoryData.slice(0, 5).map((item, i) => {
                    const dotColors = ['bg-slate-700', 'bg-zinc-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500'];
                    return (
                      <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                        <span className={`h-2 w-2 rounded-full ${dotColors[i % dotColors.length]}`} />
                        {item.name}
                      </div>
                    );
                  })}
                </div>
              </div>
            </ErrorBoundary>
          )}
        </div>

        {/* Bar Chart */}
        <div className="lg:col-span-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Monthly Spend</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Total spending by month</p>
          </div>
          {loading ? (
            <Skeleton className="h-72 w-full" />
          ) : monthlyData.length === 0 ? (
            <EmptyState
              title="No monthly data yet"
              subtitle="Process receipts to track your monthly spending trends"
            />
          ) : (
            <ErrorBoundary fallback={<EmptyState title="Chart error" subtitle="Could not render monthly chart" />}>
              <BarChart
                data={monthlyData}
                index="month"
                categories={['Spend']}
                colors={['slate']}
                valueFormatter={currencyFormatter}
                showLegend={false}
                className="h-72"
                yAxisWidth={65}
              />
            </ErrorBoundary>
          )}
        </div>
      </div>

      {/* ── Recent Audit Insights ───────────────────────────── */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Recent Audit Insights</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Latest processed transactions</p>
          </div>
          {recentTxns.length > 0 && (
            <a href="/audits" className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors">
              View all <ArrowUpRight className="h-3 w-3" />
            </a>
          )}
        </div>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
          </div>
        ) : recentTxns.length === 0 ? (
          <EmptyState
            title="No audit insights yet"
            subtitle="Upload receipts via the OCR Ingestion page to start seeing audit results"
          />
        ) : (
          <div className="space-y-3">
            {recentTxns.map((txn) => (
              <InsightCard key={txn.id} txn={txn} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
