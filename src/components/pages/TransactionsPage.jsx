/**
 * VaultAudit AI — TransactionsPage
 *
 * Unified transaction ledger with:
 *   • Working receipt OCR scan zone with laser animation
 *   • Category filter pills with dynamic counts
 *   • Color-coded transaction rows
 *   • Live transaction insertion from payment app shares
 *   • Drag-and-drop support
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { PageHeader, Panel } from '@/components/PageShell.jsx';
import { cn } from '@/lib/utils.js';
import { onNewTransaction } from '@/services/liveTransactionService.js';
import { extractText } from '@/services/ocrService.js';
import { detectPaymentSource, autoCategorizeMerchant } from '@/utils/paymentSourceDetector.js';
import {
  Upload, ScanLine, Filter, ArrowUpRight, ArrowDownLeft,
  Coffee, Car, ShoppingBag, Zap, Home, Smartphone, CreditCard,
  Heart, Film, MoreHorizontal, Loader2, CheckCircle2, AlertCircle,
} from 'lucide-react';

// ── Category icon + color mapping ────────────────────────────
const CATEGORY_ICONS = {
  Dining:        { icon: Coffee,       tone: 'text-amber-300',   bg: 'from-amber-400/20 to-amber-500/5' },
  Transport:     { icon: Car,          tone: 'text-sky-300',     bg: 'from-sky-400/20 to-sky-500/5' },
  Shopping:      { icon: ShoppingBag,  tone: 'text-orange-300',  bg: 'from-orange-400/20 to-orange-500/5' },
  Utilities:     { icon: Zap,          tone: 'text-yellow-300',  bg: 'from-yellow-400/20 to-yellow-500/5' },
  Groceries:     { icon: ShoppingBag,  tone: 'text-lime-300',    bg: 'from-lime-400/20 to-lime-500/5' },
  Housing:       { icon: Home,         tone: 'text-fuchsia-300', bg: 'from-fuchsia-400/20 to-fuchsia-500/5' },
  Income:        { icon: ArrowDownLeft,tone: 'text-emerald-300', bg: 'from-emerald-400/20 to-emerald-500/5' },
  Entertainment: { icon: Film,         tone: 'text-pink-300',    bg: 'from-pink-400/20 to-pink-500/5' },
  Health:        { icon: Heart,        tone: 'text-red-300',     bg: 'from-red-400/20 to-red-500/5' },
  UPI:           { icon: Smartphone,   tone: 'text-emerald-300', bg: 'from-emerald-400/20 to-emerald-500/5' },
  Other:         { icon: CreditCard,   tone: 'text-white/60',    bg: 'from-white/10 to-white/5' },
  Uncategorized: { icon: MoreHorizontal, tone: 'text-white/50',  bg: 'from-white/10 to-white/5' },
};

function getCategoryVisual(cat) {
  return CATEGORY_ICONS[cat] || CATEGORY_ICONS['Other'];
}

// ── Demo transaction data ────────────────────────────────────
const DEMO_TXNS = [
  { name: 'Blue Bottle Coffee', cat: 'Dining', date: 'Jul 5 · 09:14', amount: -6.75, source: null },
  { name: 'Amazon Marketplace', cat: 'Shopping', date: 'Jul 4 · 18:32', amount: -348.0, source: null },
  { name: 'Uber', cat: 'Transport', date: 'Jul 4 · 21:07', amount: -14.4, source: null },
  { name: 'Payroll · Acme Corp', cat: 'Income', date: 'Jul 3 · 08:00', amount: 5240.0, source: null },
  { name: 'PG&E Utilities', cat: 'Utilities', date: 'Jul 2 · 12:00', amount: -87.32, source: null },
  { name: 'Kimchi House', cat: 'Dining', date: 'Jul 1 · 20:45', amount: -42.1, source: null },
  { name: 'Rent · July', cat: 'Housing', date: 'Jul 1 · 00:01', amount: -2200.0, source: null },
  { name: 'Flipkart', cat: 'Shopping', date: 'Jun 30 · 14:22', amount: -42.9, source: null },
  { name: 'Swiggy Order', cat: 'Dining', date: 'Jun 29 · 19:30', amount: -249.0, source: 'GooglePay' },
  { name: 'Ola Ride', cat: 'Transport', date: 'Jun 29 · 08:15', amount: -189.0, source: 'PhonePe' },
];

export default function TransactionsPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState(null); // 'scanning' | 'success' | 'error'
  const [scanMessage, setScanMessage] = useState('');
  const [transactions, setTransactions] = useState(DEMO_TXNS);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // ── Listen for live transactions ───────────────────────────
  useEffect(() => {
    const unsub = onNewTransaction((newTxn) => {
      const formatted = {
        name: newTxn.parsedCategory === 'Uncategorized'
          ? (newTxn.sourceFile || 'New Transaction')
          : (newTxn.aiAuditNote?.match(/— (.+?)\./)?.[1] || newTxn.sourceFile || 'New Transaction'),
        cat: newTxn.parsedCategory || 'Other',
        date: 'Just now',
        amount: newTxn.amount ? -Math.abs(newTxn.amount) : 0,
        source: newTxn.paymentSource || null,
        isNew: true,
      };
      setTransactions((prev) => [formatted, ...prev]);
    });
    return unsub;
  }, []);

  // ── Process uploaded file through OCR pipeline ─────────────
  const processFile = useCallback(async (file) => {
    if (!file) return;

    setScanning(true);
    setScanStatus('scanning');
    setScanProgress(0);
    setScanMessage(`Scanning ${file.name}…`);

    try {
      const result = await extractText(file, (pct) => setScanProgress(pct));

      if (result.error) {
        setScanStatus('error');
        setScanMessage(result.error);
        setTimeout(() => { setScanStatus(null); setScanning(false); }, 3000);
        return;
      }

      // Detect payment source from OCR text
      const paymentInfo = detectPaymentSource(result.text);
      const category = autoCategorizeMerchant(paymentInfo.merchant);

      const newTxn = {
        name: paymentInfo.merchant || file.name.replace(/\.[^.]+$/, ''),
        cat: category,
        date: paymentInfo.date || 'Just now',
        amount: paymentInfo.amount ? -Math.abs(paymentInfo.amount) : 0,
        source: paymentInfo.source || null,
        isNew: true,
        ocrText: result.text.slice(0, 200),
        confidence: result.confidence,
      };

      setTransactions((prev) => [newTxn, ...prev]);
      setScanStatus('success');
      setScanMessage(
        paymentInfo.source
          ? `${paymentInfo.source} payment captured · ${paymentInfo.merchant || 'Receipt'} · Confidence ${result.confidence}%`
          : `Receipt scanned · ${result.text.split('\n')[0]?.slice(0, 40) || file.name} · Confidence ${result.confidence}%`
      );
      setTimeout(() => { setScanStatus(null); setScanning(false); }, 4000);
    } catch (err) {
      setScanStatus('error');
      setScanMessage(err.message || 'Scan failed');
      setTimeout(() => { setScanStatus(null); setScanning(false); }, 3000);
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  // ── Drag and drop handlers ─────────────────────────────────
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) processFile(file);
  }, [processFile]);

  // ── Dynamic category counts ────────────────────────────────
  const categories = [
    { name: 'All', count: transactions.length },
    ...Object.keys(CATEGORY_ICONS)
      .filter((k) => k !== 'Other' && k !== 'Uncategorized')
      .map((k) => ({ name: k, count: transactions.filter((t) => t.cat === k).length }))
      .filter((c) => c.count > 0),
  ];

  const filtered = activeFilter === 'All'
    ? transactions
    : transactions.filter((t) => t.cat === activeFilter);

  // ── Payment source badge ───────────────────────────────────
  const sourceBadge = (source) => {
    if (!source) return null;
    const colors = {
      GooglePay: 'bg-green-500/10 border-green-400/20 text-green-300',
      PhonePe: 'bg-purple-500/10 border-purple-400/20 text-purple-300',
      ApplePay: 'bg-white/10 border-white/20 text-white',
      Paytm: 'bg-sky-500/10 border-sky-400/20 text-sky-300',
    };
    return (
      <span className={cn('text-[9px] px-1.5 py-0.5 rounded-full border', colors[source] || 'bg-white/5 border-white/10 text-white/50')}>
        {source}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow="Ledger"
        title="Transactions"
        subtitle="A unified, on-device ledger. Bank sync + receipt OCR merged into one auditable timeline."
      />

      {/* ── Scanner Zone ──────────────────────────────── */}
      <Panel>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !scanning && fileInputRef.current?.click()}
          className={cn(
            'relative rounded-2xl border border-dashed p-6 overflow-hidden transition cursor-pointer',
            dragOver
              ? 'border-emerald-400/50 bg-emerald-500/[0.04]'
              : 'border-white/15 bg-white/[0.02] hover:bg-white/[0.04]',
            scanning && 'pointer-events-none'
          )}
        >
          {/* Scan laser */}
          {scanning && scanStatus === 'scanning' && (
            <div className="absolute inset-x-0 top-0 h-full pointer-events-none">
              <div
                className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-300 to-transparent shadow-[0_0_12px_rgba(52,211,153,0.9)]"
                style={{ animation: 'scanY 1.8s ease-in-out infinite' }}
              />
            </div>
          )}

          <div className="flex items-center gap-4 relative">
            <div className={cn(
              'w-12 h-12 rounded-xl bg-gradient-to-br border border-white/10 flex items-center justify-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]',
              scanStatus === 'success' ? 'from-emerald-400/20 to-emerald-500/5' :
              scanStatus === 'error' ? 'from-rose-400/20 to-rose-500/5' :
              'from-white/15 to-white/5'
            )}>
              {scanStatus === 'scanning' ? <Loader2 className="w-5 h-5 text-emerald-300 animate-spin" /> :
               scanStatus === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-300" /> :
               scanStatus === 'error' ? <AlertCircle className="w-5 h-5 text-rose-300" /> :
               <ScanLine className="w-5 h-5 text-white" />}
            </div>
            <div className="flex-1">
              {scanStatus ? (
                <>
                  <div className={cn('tracking-tight text-sm',
                    scanStatus === 'success' ? 'text-emerald-300' :
                    scanStatus === 'error' ? 'text-rose-300' : 'text-white'
                  )}>
                    {scanStatus === 'scanning' ? `Scanning… ${scanProgress}%` : scanMessage}
                  </div>
                  {scanStatus === 'scanning' && (
                    <div className="mt-2 h-1 rounded-full bg-white/[0.06] overflow-hidden w-48">
                      <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${scanProgress}%` }} />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="text-white tracking-tight">
                    {dragOver ? 'Drop your receipt here' : 'Drop a receipt, invoice, or PDF'}
                  </div>
                  <div className="text-xs text-white/40 mt-0.5">
                    Tesseract-Vault runs locally · avg 340ms per page · no cloud round-trip
                  </div>
                </>
              )}
            </div>
            {!scanning && (
              <button className="inline-flex items-center gap-2 pl-3 pr-4 py-2 rounded-full bg-gradient-to-b from-white/[0.16] to-white/[0.04] border border-white/20 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_10px_30px_-12px_rgba(255,255,255,0.35)]">
                <Upload className="w-3.5 h-3.5" />
                <span className="text-[12px]">Upload / Scan</span>
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>
      </Panel>

      {/* ── Filter + Transaction List ─────────────────── */}
      <Panel>
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <div className="inline-flex items-center gap-1.5 text-white/40 text-[11px] uppercase tracking-[0.18em] pr-2">
            <Filter className="w-3 h-3" /> Filter
          </div>
          {categories.map((c) => (
            <button
              key={c.name}
              onClick={() => setActiveFilter(c.name)}
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] border transition',
                activeFilter === c.name
                  ? 'bg-white/10 border-white/20 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]'
                  : 'bg-white/[0.03] border-white/[0.08] text-white/60 hover:text-white'
              )}
            >
              {c.name}
              <span className="text-white/30">{c.count}</span>
            </button>
          ))}
        </div>

        <div className="divide-y divide-white/[0.05]">
          {filtered.map((t, idx) => {
            const vis = getCategoryVisual(t.cat);
            const Ic = vis.icon;
            const positive = t.amount > 0;
            return (
              <div
                key={`${t.name}-${t.date}-${idx}`}
                className={cn(
                  'flex items-center gap-3 py-3 hover:bg-white/[0.02] rounded-lg px-2 transition',
                  t.isNew && 'animate-slide-in-right'
                )}
              >
                <div className={cn('w-9 h-9 rounded-lg bg-gradient-to-br border border-white/10 flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]', vis.bg)}>
                  <Ic className={cn('w-4 h-4', vis.tone)} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-white text-sm tracking-tight truncate">{t.name}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-white/40">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/60">{t.cat}</span>
                    <span>{t.date}</span>
                    {sourceBadge(t.source)}
                  </div>
                </div>
                <div className={cn('inline-flex items-center gap-1 tabular-nums tracking-tight', positive ? 'text-emerald-300' : 'text-white')}>
                  {positive ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3 text-white/40" />}
                  {positive ? '+' : ''}${Math.abs(t.amount).toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
