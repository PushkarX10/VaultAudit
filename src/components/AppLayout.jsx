/**
 * VaultAudit AI — App Layout (Shell)
 *
 * Sidebar navigation with the Antigravity Slate/Zinc aesthetic.
 * Uses NavLink for active state, Outlet for child route rendering.
 */

import { Outlet, NavLink } from 'react-router-dom';
import { useTheme } from '../utils/useTheme.js';
import {
  LayoutDashboard,
  ScanSearch,
  FileInput,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/audits', icon: ScanSearch, label: 'Auditor Feed' },
  { to: '/ingest', icon: FileInput, label: 'OCR Ingestion' },
  { to: '/settings', icon: Settings, label: 'Vault Settings' },
];

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside
        className={`
          flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-200 ease-in-out shrink-0
          ${collapsed ? 'w-[68px]' : 'w-[240px]'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 dark:bg-slate-700 shrink-0">
            <Shield className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">VaultAudit</p>
              <p className="text-[10px] text-slate-400 font-medium -mt-0.5">AI · Offline</p>
            </div>
          )}
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-3 px-2.5 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150
                ${isActive
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && <span className="whitespace-nowrap">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Collapse Toggle */}
        <div className="px-2.5 py-3 border-t border-slate-100 dark:border-slate-800/50 flex flex-col gap-1">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="flex items-center justify-center w-full rounded-lg py-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            title="Toggle Sidebar"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-full rounded-lg py-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            title="Toggle Dark Mode"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Footer badge */}
        {!collapsed && (
          <div className="px-4 pb-4">
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 p-3">
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium">End-to-end encrypted</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                All data processed locally. Zero cloud access.
              </p>
            </div>
          </div>
        )}
      </aside>

      {/* ── Main Content ─────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
