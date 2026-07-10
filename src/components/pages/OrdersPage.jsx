/**
 * VaultAudit AI — OrdersPage
 *
 * E-commerce invoice management with:
 *   • Working Upload Invoice button → file picker + OCR
 *   • Editable parsed invoices (click row to edit item/retailer/amount)
 *   • Stat cards with live totals
 *   • Verify/unverify toggle
 */

import { useState, useRef, useCallback } from 'react';
import { PageHeader, Panel } from '@/components/PageShell.jsx';
import { cn } from '@/lib/utils.js';
import { extractText } from '@/services/ocrService.js';
import {
  Upload, Check, ShoppingBag, Package, Zap, Shirt, BookOpen,
  ChevronRight, X, Pencil, Trash2, Loader2, CheckCircle2, Plus,
} from 'lucide-react';

const ICON_CHOICES = [
  { icon: ShoppingBag, name: 'Shopping', tint: 'from-orange-400/20 to-orange-500/5', ic: 'text-orange-300' },
  { icon: Package, name: 'Package', tint: 'from-sky-400/20 to-sky-500/5', ic: 'text-sky-300' },
  { icon: Shirt, name: 'Clothing', tint: 'from-fuchsia-400/20 to-fuchsia-500/5', ic: 'text-fuchsia-300' },
  { icon: Zap, name: 'Electronics', tint: 'from-yellow-400/20 to-yellow-500/5', ic: 'text-yellow-300' },
  { icon: BookOpen, name: 'Books', tint: 'from-emerald-400/20 to-emerald-500/5', ic: 'text-emerald-300' },
];

const initialOrders = [
  { id: 'o1', iconIdx: 0, retailer: 'Amazon', item: 'Sony WH-1000XM5 Headphones', date: 'Jul 3, 2026', amount: 348.0, verified: true, confidence: 0.98 },
  { id: 'o2', iconIdx: 1, retailer: 'Flipkart', item: 'Kitchen Organizer Set (12pc)', date: 'Jul 2, 2026', amount: 42.9, verified: false, confidence: 0.86 },
  { id: 'o3', iconIdx: 2, retailer: 'Myntra', item: "Levi's Slim-Fit Denim", date: 'Jun 29, 2026', amount: 68.5, verified: true, confidence: 0.94 },
  { id: 'o4', iconIdx: 3, retailer: 'BestBuy', item: 'Anker 65W GaN Charger', date: 'Jun 27, 2026', amount: 39.99, verified: false, confidence: 0.79 },
  { id: 'o5', iconIdx: 4, retailer: 'Kindle', item: 'Atomic Habits — Digital', date: 'Jun 25, 2026', amount: 12.99, verified: true, confidence: 0.99 },
];

// ── Edit Modal ───────────────────────────────────────────────
function EditModal({ open, onClose, onSave, order }) {
  const [item, setItem] = useState('');
  const [retailer, setRetailer] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [iconIdx, setIconIdx] = useState(0);

  useState(() => {
    if (order) {
      setItem(order.item);
      setRetailer(order.retailer);
      setAmount(order.amount);
      setDate(order.date);
      setIconIdx(order.iconIdx ?? 0);
    }
  }, [order]);

  // Sync when order changes
  if (!open) return null;

  const save = () => {
    if (!item.trim()) return;
    onSave({ item: item.trim(), retailer: retailer.trim(), amount: Number(amount), date, iconIdx });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#0a0a0a]/95 backdrop-blur-2xl shadow-[0_30px_80px_-12px_rgba(0,0,0,0.9)] overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <span className="text-sm font-medium text-white">Edit Invoice</span>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.08] transition">
            <X className="w-3.5 h-3.5 text-white/60" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="text-[11px] uppercase tracking-[0.15em] text-white/40">Item Name</label>
            <input value={item} onChange={(e) => setItem(e.target.value)} className="mt-1.5 w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/25 outline-none text-sm text-white placeholder:text-white/25 transition" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] uppercase tracking-[0.15em] text-white/40">Retailer</label>
              <input value={retailer} onChange={(e) => setRetailer(e.target.value)} className="mt-1.5 w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/25 outline-none text-sm text-white placeholder:text-white/25 transition" />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-[0.15em] text-white/40">Amount ($)</label>
              <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1.5 w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/25 outline-none text-sm text-white placeholder:text-white/25 transition" />
            </div>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-[0.15em] text-white/40">Date</label>
            <input value={date} onChange={(e) => setDate(e.target.value)} className="mt-1.5 w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/25 outline-none text-sm text-white placeholder:text-white/25 transition" />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-[0.15em] text-white/40">Category</label>
            <div className="mt-2 flex gap-2">
              {ICON_CHOICES.map((ch, i) => {
                const Ic = ch.icon;
                return (
                  <button key={ch.name} onClick={() => setIconIdx(i)} title={ch.name} className={cn('w-10 h-10 rounded-xl border flex items-center justify-center transition', iconIdx === i ? 'bg-white/10 border-white/25 text-white' : 'bg-white/[0.03] border-white/[0.08] text-white/50 hover:text-white')}>
                    <Ic className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-white/[0.06]">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white transition">Cancel</button>
          <button onClick={save} disabled={!item.trim()} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-b from-white/[0.16] to-white/[0.04] border border-white/20 text-white text-xs shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)] disabled:opacity-30">
            <Check className="w-3.5 h-3.5" /> Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState(initialOrders);
  const [editOrder, setEditOrder] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const fileRef = useRef(null);

  const toggle = (id) => setOrders((os) => os.map((o) => (o.id === id ? { ...o, verified: !o.verified } : o)));
  const deleteOrder = (id) => setOrders((os) => os.filter((o) => o.id !== id));

  const openEdit = (o) => { setEditOrder(o); setEditOpen(true); };
  const handleEditSave = (data) => {
    if (!editOrder) return;
    setOrders((os) => os.map((o) => (o.id === editOrder.id ? { ...o, ...data } : o)));
  };

  // ── Upload invoice via OCR ──────────────────────────────────
  const processUpload = useCallback(async (file) => {
    if (!file) return;
    setUploading(true);
    setUploadMsg(`Scanning ${file.name}…`);

    try {
      const result = await extractText(file);
      if (result.error) {
        setUploadMsg(`Error: ${result.error}`);
        setTimeout(() => { setUploading(false); setUploadMsg(''); }, 3000);
        return;
      }

      // Extract simple info from OCR text
      const lines = result.text.split('\n').filter(Boolean);
      const amountMatch = result.text.match(/[\$₹]\s*([\d,]+\.?\d*)/);
      const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;

      const newOrder = {
        id: `o-${Date.now()}`,
        iconIdx: 0,
        retailer: lines[0]?.slice(0, 30) || 'Unknown',
        item: lines[1]?.slice(0, 50) || file.name.replace(/\.[^.]+$/, ''),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        amount,
        verified: false,
        confidence: result.confidence / 100,
        isNew: true,
      };

      setOrders((prev) => [newOrder, ...prev]);
      setUploadMsg(`Invoice parsed · ${result.confidence}% confidence`);
      setTimeout(() => { setUploading(false); setUploadMsg(''); }, 3000);
    } catch (err) {
      setUploadMsg(`Failed: ${err.message}`);
      setTimeout(() => { setUploading(false); setUploadMsg(''); }, 3000);
    }
  }, []);

  const handleFile = (e) => { processUpload(e.target.files?.[0]); e.target.value = ''; };

  const total = orders.reduce((s, o) => s + o.amount, 0);
  const verifiedCount = orders.filter((o) => o.verified).length;
  const avgConf = orders.length ? Math.round(orders.reduce((s, o) => s + (o.confidence || 0), 0) / orders.length * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow="E-commerce OCR"
        title="My Orders"
        subtitle="Amazon and Flipkart invoices parsed on-device. Verify each line to teach your local model."
        actions={
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 pl-3 pr-4 py-2 rounded-full bg-gradient-to-b from-white/[0.16] to-white/[0.04] border border-white/20 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)] hover:from-white/25 hover:to-white/10 transition disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            <span className="text-xs">{uploading ? 'Scanning…' : 'Upload Invoice'}</span>
          </button>
        }
      />
      <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFile} />

      {/* Upload status toast */}
      {uploadMsg && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-emerald-400/20 bg-emerald-500/[0.06] animate-fade-in">
          {uploading ? <Loader2 className="w-4 h-4 text-emerald-300 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-emerald-300" />}
          <span className="text-xs text-emerald-200">{uploadMsg}</span>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          ['Total captured', `$${total.toFixed(2)}`, `${orders.length} orders parsed`],
          ['Verified', `${verifiedCount} / ${orders.length}`, 'click to confirm extractions'],
          ['Avg OCR confidence', `${avgConf}%`, 'Tesseract-Vault v3.1'],
        ].map(([l, v, s]) => (
          <Panel key={l}>
            <div className="text-[11px] tracking-[0.18em] uppercase text-white/40">{l}</div>
            <div className="mt-2 text-white tracking-tight" style={{ fontSize: 22 }}>{v}</div>
            <div className="mt-1 text-[11px] text-white/50">{s}</div>
          </Panel>
        ))}
      </div>

      {/* Order list */}
      <Panel>
        <div className="text-[11px] tracking-[0.18em] uppercase text-white/40 mb-4">Parsed Invoices</div>
        <div className="divide-y divide-white/[0.05]">
          {orders.map((o) => {
            const choice = ICON_CHOICES[o.iconIdx] || ICON_CHOICES[0];
            const Ic = choice.icon;
            return (
              <div key={o.id} className={cn('group flex items-center gap-3 py-3 px-1 hover:bg-white/[0.02] rounded-lg transition', o.isNew && 'animate-slide-in-right')}>
                <div className={cn('w-10 h-10 rounded-lg bg-gradient-to-br border border-white/10 flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]', choice.tint)}>
                  <Ic className={cn('w-4 h-4', choice.ic)} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-white text-sm tracking-tight truncate">{o.item}</div>
                  <div className="text-[11px] text-white/40 mt-0.5">
                    {o.retailer} · {o.date} · confidence {Math.round((o.confidence || 0) * 100)}%
                  </div>
                </div>
                <div className="text-white tabular-nums tracking-tight shrink-0 w-20 text-right">${o.amount.toFixed(2)}</div>

                {/* Edit button */}
                <button onClick={() => openEdit(o)} className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-white/[0.08]" title="Edit">
                  <Pencil className="w-3 h-3 text-white/60" />
                </button>

                {/* Delete button */}
                <button onClick={() => deleteOrder(o.id)} className="w-7 h-7 rounded-lg bg-rose-500/[0.06] border border-rose-400/15 flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-rose-500/15" title="Delete">
                  <Trash2 className="w-3 h-3 text-rose-400/70" />
                </button>

                {/* Verify toggle */}
                <button
                  onClick={() => toggle(o.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] border transition',
                    o.verified
                      ? 'bg-emerald-500/10 border-emerald-400/25 text-emerald-300 shadow-[0_0_12px_-2px_rgba(52,211,153,0.6)]'
                      : 'bg-white/[0.04] border-white/[0.08] text-white/60 hover:text-white'
                  )}
                >
                  <Check className={cn('w-3 h-3', o.verified ? 'opacity-100' : 'opacity-40')} />
                  {o.verified ? 'Verified' : 'Verify'}
                </button>
                <ChevronRight className="w-4 h-4 text-white/30" />
              </div>
            );
          })}
        </div>
      </Panel>

      <EditModal open={editOpen} onClose={() => setEditOpen(false)} onSave={handleEditSave} order={editOrder} />
    </div>
  );
}
