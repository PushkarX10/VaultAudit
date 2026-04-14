/**
 * VaultAudit AI — Transaction List Component
 *
 * Displays all transactions from PGLite in a table.
 * Refreshes when `refreshKey` changes (controlled by parent after uploads).
 *
 * Skeleton UI — will be replaced by Figma / Stitch design.
 */

import { useState, useEffect } from 'react';
import { Edit2, Check, X } from 'lucide-react';
import { getDb } from '../db/client.js';
import { getAllTransactions, updateTransactionCategory } from '../db/schema.js';

/** Colour map for audit flags */
const FLAG_STYLES = {
  normal:              'bg-emerald-400/10 text-emerald-400',
  impulse_buy:         'bg-amber-400/10 text-amber-400',
  hidden_subscription: 'bg-purple-400/10 text-purple-400',
  suspicious:          'bg-red-400/10 text-red-400',
  pending:             'bg-gray-600/20 text-gray-400',
  unclassified:        'bg-gray-600/20 text-gray-500',
};

const FLAG_LABELS = {
  normal:              'Normal',
  impulse_buy:         '⚡ Impulse Buy',
  hidden_subscription: '🔄 Subscription',
  suspicious:          '⚠️ Suspicious',
  pending:             '⏳ Pending',
  unclassified:        'Offline',
};

export default function TransactionList({ refreshKey }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  const CATEGORIES = [
    'groceries', 'dining', 'transport', 'entertainment', 
    'subscription', 'utilities', 'health', 'clothing', 
    'electronics', 'education', 'gifts', 'travel', 
    'Manual Review', 'other'
  ];

  const handleSaveCategory = async (id) => {
    try {
      const db = await getDb();
      await updateTransactionCategory(db, id, editValue);
      setTransactions((prev) => 
        prev.map((t) => (t.id === id ? { ...t, parsed_category: editValue } : t))
      );
      setEditingId(null);
    } catch (err) {
      console.error('[VaultAudit] Failed to update category:', err);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function loadTransactions() {
      try {
        setLoading(true);
        const db = await getDb();
        const rows = await getAllTransactions(db);
        if (!cancelled) {
          setTransactions(rows);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('[VaultAudit] Failed to load transactions:', err);
          setError(err.message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadTransactions();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  // ── Loading state ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-6 h-6 border-2 border-gray-600 border-t-emerald-400 rounded-full animate-spin" />
        <p className="text-sm text-gray-500 mt-3">Loading transactions…</p>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-red-400">Failed to load transactions: {error}</p>
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────
  if (transactions.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto w-16 h-16 rounded-full bg-gray-800/60 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <p className="text-sm text-gray-500">No transactions yet</p>
        <p className="text-xs text-gray-600 mt-1">Upload a receipt to get started</p>
      </div>
    );
  }

  // ── Transaction table ─────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
          Transactions
        </h2>
        <span className="text-xs text-gray-600">{transactions.length} total</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-900/60 text-gray-400">
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
              <th className="px-4 py-3 text-left font-medium">Category</th>
              <th className="px-4 py-3 text-left font-medium">Flag</th>
              <th className="px-4 py-3 text-left font-medium">Source</th>
              <th className="px-4 py-3 text-left font-medium">AI Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {transactions.map((txn) => (
              <tr key={txn.id} className="hover:bg-gray-800/30 transition-colors">
                <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                  {txn.date ? new Date(txn.date).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-3 text-right text-gray-200 font-mono whitespace-nowrap">
                  {txn.amount != null ? `${txn.currency ? (txn.currency.length > 1 && !txn.currency.endsWith('.') ? txn.currency + ' ' : txn.currency) : ''}${Number(txn.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '—'}
                </td>
                <td className="px-4 py-3 text-gray-300 capitalize group">
                  {editingId === txn.id ? (
                    <div className="flex items-center gap-2">
                      <select 
                        className="bg-gray-800 text-sm border border-gray-600 rounded px-2 py-1 focus:ring-1 ring-emerald-400 outline-none w-32"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        autoFocus
                      >
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                      <button onClick={() => handleSaveCategory(txn.id)} className="text-emerald-400 hover:text-emerald-300">
                        <Check size={16} />
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-red-400 hover:text-red-300">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span>{txn.parsed_category || '—'}</span>
                      <button 
                        onClick={() => {
                          setEditValue(txn.parsed_category || 'other');
                          setEditingId(txn.id);
                        }} 
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-gray-300"
                        title="Edit Category"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                    FLAG_STYLES[txn.ai_audit_flag] || FLAG_STYLES.unclassified
                  }`}>
                    {FLAG_LABELS[txn.ai_audit_flag] || '—'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 truncate max-w-[120px]" title={txn.source_file}>
                  {txn.source_file || '—'}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs max-w-[200px] truncate" title={txn.ai_audit_note}>
                  {txn.ai_audit_note || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
