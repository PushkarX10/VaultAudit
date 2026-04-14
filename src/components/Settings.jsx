import { useState, useRef } from 'react';
import {
  ShieldCheck, Key, HardDrive, Trash2, Download, Lock, ToggleLeft, ToggleRight, AlertCircle
} from "lucide-react";
import { motion } from "motion/react";
import { getDb } from '../db/client.js';
import { purgeAllData, getAllTransactions } from '../db/schema.js';

const Card = ({ children, className = "" }) => (
  <div
    className={`rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm dark:shadow-xl relative overflow-hidden backdrop-blur-md ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800/40 dark:to-slate-900/40 pointer-events-none" />
    <div className="relative z-10">{children}</div>
  </div>
);

function Toggle({ on, onToggle }) {
  return (
    <button onClick={onToggle}>
      {on ? (
        <ToggleRight className="w-7 h-7 text-emerald-500" />
      ) : (
        <ToggleLeft className="w-7 h-7 text-slate-400 dark:text-slate-600" />
      )}
    </button>
  );
}

export default function Settings() {
  const [autoScrub, setAutoScrub] = useState(true);
  const [offlineMode, setOfflineMode] = useState(true);
  const [autoAudit, setAutoAudit] = useState(true);
  
  // Database purging state
  const [isPurging, setIsPurging] = useState(false);
  const [purgeStatus, setPurgeStatus] = useState(null);
  const [confirmPurge, setConfirmPurge] = useState(false);
  const purgeTimeoutRef = useRef(null);

  const handlePurge = async () => {
    if (!confirmPurge) {
      setConfirmPurge(true);
      if (purgeTimeoutRef.current) clearTimeout(purgeTimeoutRef.current);
      purgeTimeoutRef.current = setTimeout(() => setConfirmPurge(false), 4000);
      return;
    }
    
    if (purgeTimeoutRef.current) clearTimeout(purgeTimeoutRef.current);
    setConfirmPurge(false);
    
    try {
      setIsPurging(true);
      setPurgeStatus(null);
      const db = await getDb();
      await purgeAllData(db);
      setPurgeStatus({ success: true, message: 'All vault data has been securely deleted.' });
    } catch (err) {
      console.error('Purge error:', err);
      setPurgeStatus({ success: false, message: 'Failed to purge data. Check console.' });
    } finally {
      setIsPurging(false);
    }
  };

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setPurgeStatus(null);
      const db = await getDb();
      const transactions = await getAllTransactions(db);
      
      const headers = ["ID", "Date", "Amount", "Category", "AI Flag", "AI Note"];
      const csvRows = transactions.map(t => {
        const id = t.id || '';
        const date = t.date || '';
        const amt = t.amount || 0;
        const cat = `"${(t.parsed_category || 'Uncategorized').replace(/"/g, '""')}"`;
        const flag = `"${(t.ai_audit_flag || '').replace(/"/g, '""')}"`;
        const note = `"${(t.ai_audit_note || '').replace(/"/g, '""')}"`;
        return [id, date, amt, cat, flag, note].join(",");
      });
      
      const csvContent = [headers.join(","), ...csvRows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vaultaudit_export_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setPurgeStatus({ success: true, message: 'Vault exported successfully.' });
    } catch (err) {
      console.error(err);
      setPurgeStatus({ success: false, message: 'Failed to export vault data.' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-[720px] mx-auto space-y-6 pt-4">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-[28px] font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Vault Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Configure your local encryption, privacy, and audit preferences.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800">
              <ShieldCheck className="w-[18px] h-[18px] text-slate-600 dark:text-slate-400" />
            </div>
            <h3 className="text-[15px] font-semibold text-slate-800 dark:text-slate-100">Security & Privacy</h3>
          </div>
          <div className="space-y-4">
            {[
              { label: "Auto PII Scrubbing", desc: "Automatically redact personal information from all ingested documents.", on: autoScrub, toggle: () => setAutoScrub(!autoScrub) },
              { label: "Strict Offline Mode", desc: "Block all outbound network requests from the audit engine.", on: offlineMode, toggle: () => setOfflineMode(!offlineMode) },
              { label: "Auto-Audit New Transactions", desc: "Run AI classification immediately upon ingestion.", on: autoAudit, toggle: () => setAutoAudit(!autoAudit) },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-3 px-4 rounded-xl bg-slate-50 border border-slate-100 dark:border-transparent dark:bg-slate-800/50">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{item.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                </div>
                <Toggle on={item.on} onToggle={item.toggle} />
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800">
              <Key className="w-[18px] h-[18px] text-slate-600 dark:text-slate-400" />
            </div>
            <h3 className="text-[15px] font-semibold text-slate-800 dark:text-slate-100">Encryption</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-slate-50 border border-slate-100 dark:border-transparent dark:bg-slate-800/50">
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Encryption Standard</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">AES-256-GCM with PBKDF2 key derivation</p>
              </div>
              <span className="px-3 py-1 rounded-full text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-slate-50 border border-slate-100 dark:border-transparent dark:bg-slate-800/50">
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Vault Key Fingerprint</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">SHA256:a3f8...7d2b</p>
              </div>
              <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800">
              <HardDrive className="w-[18px] h-[18px] text-slate-600 dark:text-slate-400" />
            </div>
            <h3 className="text-[15px] font-semibold text-slate-800 dark:text-slate-100">Local Storage</h3>
          </div>
          <div className="flex items-center justify-between py-3 px-4 rounded-xl mb-4 bg-slate-50 border border-slate-100 dark:border-transparent dark:bg-slate-800/50">
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Vault Size</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Secure PGLite IndexDB Instance</p>
            </div>
            <div className="w-24 h-2 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
              <div className="h-full rounded-full bg-slate-400 dark:bg-slate-500" style={{ width: "24%" }} />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all hover:bg-slate-200 dark:hover:bg-slate-700/80 text-[13px] font-medium text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Exporting...' : 'Export Vault Data'}
            </button>
            <button
              onClick={handlePurge}
              disabled={isExporting || isPurging}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-[13px] font-medium border ${
                confirmPurge 
                  ? 'bg-red-500 hover:bg-red-600 text-white border-red-600 dark:bg-red-600 dark:hover:bg-red-700 dark:border-red-700' 
                  : 'hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              {isPurging ? 'Purging...' : confirmPurge ? 'Are you sure? Click to verify' : 'Purge All Data'}
            </button>
          </div>
          {purgeStatus && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4">
              <div className={`px-4 py-3 text-xs flex items-center gap-2 rounded-lg 
                ${purgeStatus.success ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                <AlertCircle className="w-4 h-4 shrink-0" />
                {purgeStatus.message}
              </div>
            </motion.div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
