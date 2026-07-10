/**
 * VaultAudit AI — TopHeader
 *
 * Global top bar with fully functional:
 *   • Command-palette search with ⌘K shortcut
 *   • Notification dropdown with activity feed
 *   • Profile dropdown with account actions
 *   • Local-Only Processing badge
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search, Bell, Lock, X, User, Settings, LogOut, Shield,
  CreditCard, ArrowUpRight, Sparkles, Check, Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils.js';

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  auditor: 'AI Auditor',
  transactions: 'Transactions',
  savings: 'Savings Tracker',
  stocks: 'My Stocks',
  orders: 'My Orders',
  settings: 'Vault Settings',
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// ── Searchable items ─────────────────────────────────────────
const SEARCH_ITEMS = [
  { type: 'page', id: 'dashboard', label: 'Dashboard', desc: 'Financial overview' },
  { type: 'page', id: 'auditor', label: 'AI Auditor', desc: 'On-device financial analyst' },
  { type: 'page', id: 'transactions', label: 'Transactions', desc: 'Unified ledger' },
  { type: 'page', id: 'savings', label: 'Savings Tracker', desc: 'Goal tracking' },
  { type: 'page', id: 'stocks', label: 'My Stocks', desc: 'Portfolio view' },
  { type: 'page', id: 'orders', label: 'My Orders', desc: 'Invoice management' },
  { type: 'page', id: 'settings', label: 'Vault Settings', desc: 'Configuration' },
  { type: 'action', id: 'scan', label: 'Scan Receipt', desc: 'Upload & OCR a receipt' },
  { type: 'action', id: 'export', label: 'Export Vault', desc: 'Download encrypted backup' },
  { type: 'txn', id: 't1', label: 'Blue Bottle Coffee', desc: 'Dining · Jul 5 · $6.75' },
  { type: 'txn', id: 't2', label: 'Amazon Marketplace', desc: 'Shopping · Jul 4 · $348.00' },
  { type: 'txn', id: 't3', label: 'Uber', desc: 'Transport · Jul 4 · $14.40' },
  { type: 'txn', id: 't4', label: 'Payroll · Acme Corp', desc: 'Income · Jul 3 · $5,240' },
  { type: 'txn', id: 't5', label: 'Swiggy Order', desc: 'Dining · Jun 29 · ₹249 via GooglePay' },
  { type: 'stock', id: 's1', label: 'AAPL – Apple Inc.', desc: '$214.50 · +1.42%' },
  { type: 'stock', id: 's2', label: 'NVDA – NVIDIA Corp.', desc: '$138.20 · +3.05%' },
  { type: 'stock', id: 's3', label: 'TSLA – Tesla Inc.', desc: '$246.80 · -2.18%' },
];

// ── Initial notifications ────────────────────────────────────
const INITIAL_NOTIFICATIONS = [
  { id: 1, icon: Sparkles, text: 'AI Auditor flagged 3 anomalies in July spend', time: '2m ago', read: false, tone: 'text-emerald-300' },
  { id: 2, icon: CreditCard, text: '₹249.00 to Swiggy via GooglePay captured', time: '14m ago', read: false, tone: 'text-green-300' },
  { id: 3, icon: ArrowUpRight, text: 'NVDA is up +3.05% today', time: '1h ago', read: true, tone: 'text-sky-300' },
  { id: 4, icon: Shield, text: 'Vault encryption verified · AES-256', time: '3h ago', read: true, tone: 'text-white/60' },
];

export default function TopHeader({ activePage, onNavigate }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const dateString = useMemo(() => format(new Date(), 'EEEE, MMMM d'), []);
  const title = PAGE_TITLES[activePage] || 'Dashboard';
  const unreadCount = notifications.filter((n) => !n.read).length;

  // ── ⌘K keyboard shortcut ───────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setNotifOpen(false);
        setProfileOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ── Close dropdowns on outside click ───────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Search filter ──────────────────────────────────────────
  const filtered = searchQuery.trim()
    ? SEARCH_ITEMS.filter(
        (i) =>
          i.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.desc.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : SEARCH_ITEMS.slice(0, 8);

  const handleSelect = (item) => {
    if (item.type === 'page' && onNavigate) onNavigate(item.id);
    if (item.type === 'action' && item.id === 'scan' && onNavigate) onNavigate('transactions');
    if (item.type === 'txn' && onNavigate) onNavigate('transactions');
    if (item.type === 'stock' && onNavigate) onNavigate('stocks');
    setSearchOpen(false);
    setSearchQuery('');
  };

  const markAllRead = () => setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
  const clearNotif = (id) => setNotifications((ns) => ns.filter((n) => n.id !== id));

  const typeIcons = { page: '📄', action: '⚡', txn: '💳', stock: '📈' };

  return (
    <>
      <header className="relative z-30 h-16 shrink-0 border-b border-white/[0.06] bg-white/[0.02] backdrop-blur-xl flex items-center px-8 gap-6">
        {/* Page title + date */}
        <div className="flex flex-col leading-tight">
          <span className="text-white tracking-tight font-medium">{title}</span>
          <span className="text-xs text-white/40">
            {dateString} · {getGreeting()}, User
          </span>
        </div>

        {/* Right side controls */}
        <div className="ml-auto flex items-center gap-3">
          {/* Search trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] w-72 hover:border-white/20 transition"
          >
            <Search className="w-3.5 h-3.5 text-white/40" />
            <span className="text-xs text-white/30 flex-1 text-left">Search transactions, tickers…</span>
            <kbd className="text-[10px] text-white/40 px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/10">
              ⌘K
            </kbd>
          </button>

          {/* Local-Only badge */}
          <div className="group flex items-center gap-2.5 pl-3 pr-4 py-2 rounded-full bg-gradient-to-b from-emerald-400/[0.14] to-emerald-500/[0.04] border border-emerald-400/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_0_20px_-8px_rgba(52,211,153,0.6)]">
            <span className="relative flex w-2 h-2">
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
              <span className="relative w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]" />
            </span>
            <Lock className="w-3 h-3 text-emerald-300" />
            <span className="text-[11px] tracking-wide text-emerald-100">Local-Only Processing</span>
          </div>

          {/* Notification bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
              className="relative w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.06] transition"
            >
              <Bell className="w-4 h-4 text-white/60" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 text-[9px] text-white flex items-center justify-center font-medium shadow-[0_0_8px_rgba(52,211,153,0.8)]">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-[360px] rounded-2xl border border-white/[0.1] bg-[#0a0a0a]/95 backdrop-blur-2xl shadow-[0_20px_60px_-12px_rgba(0,0,0,0.8)] z-50 overflow-hidden animate-fade-in">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                  <span className="text-xs font-medium text-white">Notifications</span>
                  <button onClick={markAllRead} className="text-[10px] text-emerald-300 hover:text-emerald-200">
                    Mark all read
                  </button>
                </div>
                <div className="max-h-[320px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-xs text-white/30">No notifications</div>
                  ) : (
                    notifications.map((n) => {
                      const Ic = n.icon;
                      return (
                        <div key={n.id} className={cn('flex items-start gap-3 px-4 py-3 hover:bg-white/[0.03] transition', !n.read && 'bg-white/[0.02]')}>
                          <Ic className={cn('w-4 h-4 mt-0.5 shrink-0', n.tone)} />
                          <div className="flex-1 min-w-0">
                            <div className={cn('text-xs', n.read ? 'text-white/60' : 'text-white')}>{n.text}</div>
                            <div className="text-[10px] text-white/30 mt-0.5">{n.time}</div>
                          </div>
                          <button onClick={() => clearNotif(n.id)} className="text-white/20 hover:text-white/60 mt-0.5">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile avatar */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-white/20 to-white/5 border border-white/10 flex items-center justify-center text-xs text-white font-medium shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)] hover:from-white/30 hover:to-white/10 transition"
            >
              VA
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-[220px] rounded-2xl border border-white/[0.1] bg-[#0a0a0a]/95 backdrop-blur-2xl shadow-[0_20px_60px_-12px_rgba(0,0,0,0.8)] z-50 overflow-hidden animate-fade-in">
                <div className="px-4 py-3 border-b border-white/[0.06]">
                  <div className="text-sm text-white font-medium">VaultAudit User</div>
                  <div className="text-[11px] text-white/40 mt-0.5">vault@local · On-Device</div>
                </div>
                <div className="py-1">
                  {[
                    { icon: User, label: 'Profile', action: null },
                    { icon: Settings, label: 'Vault Settings', action: () => { onNavigate?.('settings'); setProfileOpen(false); } },
                    { icon: Shield, label: 'Security', action: () => { onNavigate?.('settings'); setProfileOpen(false); } },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-white/70 hover:bg-white/[0.04] hover:text-white transition"
                    >
                      <item.icon className="w-3.5 h-3.5" />
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="border-t border-white/[0.06] py-1">
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-rose-400/80 hover:bg-rose-500/[0.06] hover:text-rose-300 transition">
                    <LogOut className="w-3.5 h-3.5" />
                    Lock Vault
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Command Palette Search Modal ──────────────────────── */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onClick={() => setSearchOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-2xl border border-white/[0.1] bg-[#0a0a0a]/95 backdrop-blur-2xl shadow-[0_30px_80px_-12px_rgba(0,0,0,0.9)] overflow-hidden animate-fade-in"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.06]">
              <Search className="w-4 h-4 text-white/40 shrink-0" />
              <input
                ref={searchRef}
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pages, transactions, stocks…"
                className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/30"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setSearchOpen(false);
                  if (e.key === 'Enter' && filtered.length > 0) handleSelect(filtered[0]);
                }}
              />
              <kbd className="text-[10px] text-white/30 px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/10">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[340px] overflow-y-auto py-2">
              {filtered.length === 0 ? (
                <div className="px-4 py-8 text-center text-xs text-white/30">No results for "{searchQuery}"</div>
              ) : (
                filtered.map((item) => (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleSelect(item)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/[0.04] transition"
                  >
                    <span className="text-sm">{typeIcons[item.type]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white truncate">{item.label}</div>
                      <div className="text-[11px] text-white/40 truncate">{item.desc}</div>
                    </div>
                    <span className="text-[10px] text-white/30 uppercase tracking-wider">{item.type}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
