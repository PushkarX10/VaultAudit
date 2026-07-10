/**
 * VaultAudit AI v2.0 — Root Application Component
 *
 * Premium dark-mode financial intelligence PWA.
 *
 * Architecture:
 *   • PGLite database boot → dark loading screen
 *   • Sidebar + TopHeader shell
 *   • State-based page switching (7 pages)
 *   • Live transaction toast system
 *   • Ambient glow background effects
 */

import { useState, useEffect } from 'react';
import { getDb } from './db/client.js';
import { initSchema } from './db/schema.js';
import SidebarNav from './components/SidebarNav.jsx';
import TopHeader from './components/TopHeader.jsx';
import DashboardPage from './components/pages/DashboardPage.jsx';
import AuditorPage from './components/pages/AuditorPage.jsx';
import TransactionsPage from './components/pages/TransactionsPage.jsx';
import SavingsPage from './components/pages/SavingsPage.jsx';
import StocksPage from './components/pages/StocksPage.jsx';
import OrdersPage from './components/pages/OrdersPage.jsx';
import SettingsPage from './components/pages/SettingsPage.jsx';
import { VaultToaster } from './components/LiveTransactionToast.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';

export default function App() {
  const [db, setDb] = useState(null);
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState(null);
  const [page, setPage] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);

  // ── Boot database on mount ──────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        const dbInstance = await getDb();
        await initSchema(dbInstance);
        if (!cancelled) {
          setDb(dbInstance);
          setDbReady(true);
        }
      } catch (err) {
        console.error('[VaultAudit] Boot failed:', err);
        if (!cancelled) setDbError(err.message);
      }
    }

    boot();
    return () => { cancelled = true; };
  }, []);

  // ── Loading screen (dark themed) ───────────────────────────
  if (!dbReady && !dbError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-[#050505]">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 border border-white/10 flex items-center justify-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]">
            <div className="w-6 h-6 border-2 border-white/20 border-t-emerald-400 rounded-full animate-spin" />
          </div>
          <div className="absolute -inset-8 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none" />
        </div>
        <div className="text-center">
          <p className="text-sm text-white/60 font-medium tracking-tight">Initialising local vault…</p>
          <p className="text-[11px] text-white/30 mt-1">Booting PGLite · encrypting workspace</p>
        </div>
      </div>
    );
  }

  // ── Error screen (dark themed) ─────────────────────────────
  if (dbError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-[#050505]">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-400/20 flex items-center justify-center">
          <span className="text-rose-400 text-xl">✕</span>
        </div>
        <p className="text-sm text-rose-400 font-semibold">Database initialisation failed</p>
        <p className="text-xs text-white/40 max-w-md text-center">{dbError}</p>
      </div>
    );
  }

  // ── Main app ───────────────────────────────────────────────
  return (
    <ErrorBoundary>
      <div className="min-h-screen w-full bg-[#050505] text-white relative overflow-hidden">
        {/* Ambient background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-[-10%] left-[20%] w-[520px] h-[520px] rounded-full bg-emerald-500/[0.06] blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[10%] w-[520px] h-[520px] rounded-full bg-sky-500/[0.05] blur-[120px]" />
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
              maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
            }}
          />
        </div>

        {/* Layout */}
        <div className="relative flex min-h-screen">
          <SidebarNav
            active={page}
            onSelect={setPage}
            collapsed={collapsed}
            onToggle={() => setCollapsed(!collapsed)}
          />

          <div className="flex-1 flex flex-col min-w-0">
            <TopHeader activePage={page} onNavigate={setPage} />

            <main className="flex-1 overflow-y-auto px-8 py-8">
              <div className="max-w-[1400px] mx-auto">
                {page === 'dashboard' && <DashboardPage />}
                {page === 'auditor' && <AuditorPage />}
                {page === 'transactions' && <TransactionsPage />}
                {page === 'savings' && <SavingsPage />}
                {page === 'stocks' && <StocksPage />}
                {page === 'orders' && <OrdersPage />}
                {page === 'settings' && <SettingsPage />}

                <div className="pt-8 pb-2 text-center text-[11px] text-white/30 tracking-wide">
                  VaultAudit AI · v2.0.0 · Local runtime engaged
                </div>
              </div>
            </main>
          </div>
        </div>

        {/* Toast system for live transaction notifications */}
        <VaultToaster />
      </div>
    </ErrorBoundary>
  );
}
