/**
 * VaultAudit AI — Root Application Component
 *
 * Boots PGLite, initialises the schema, then renders the AppLayout
 * with route-based navigation (Dashboard, Audits, Ingest, Settings).
 */

import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { getDb } from './db/client.js';
import { initSchema } from './db/schema.js';
import AppLayout from './components/AppLayout.jsx';
import Dashboard from './components/Dashboard.jsx';
import ReceiptUploader from './components/ReceiptUploader.jsx';
import TransactionList from './components/TransactionList.jsx';
import Settings from './components/Settings.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';

export default function App() {
  const [db, setDb] = useState(null);
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState(null);

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

    return () => {
      cancelled = true;
    };
  }, []);

  // ── Loading screen ──────────────────────────────────────────
  if (!dbReady && !dbError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-slate-50">
        <div className="w-10 h-10 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Initialising local vault…</p>
      </div>
    );
  }

  // ── Error screen ────────────────────────────────────────────
  if (dbError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-slate-50">
        <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
          <span className="text-red-500 text-xl">✕</span>
        </div>
        <p className="text-sm text-red-600 font-semibold">Database initialisation failed</p>
        <p className="text-xs text-slate-500 max-w-md text-center">{dbError}</p>
      </div>
    );
  }

  // ── Main app with routing ───────────────────────────────────
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard db={db} />} />
          <Route path="dashboard" element={<Dashboard db={db} />} />
          {/* Active routes */}
          <Route path="audits" element={
            <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Auditor Feed</h1>
                <p className="text-sm text-slate-500 mt-0.5">Review processed transactions and AI audit notes</p>
              </div>
              <TransactionList />
            </div>
          } />
          <Route path="ingest" element={
            <div className="p-6 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">OCR Ingestion</h1>
                <p className="text-sm text-slate-500 mt-0.5">Upload receipts for local, privacy-first processing</p>
              </div>
              <ReceiptUploader />
            </div>
          } />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}

// Temporary placeholder for pages not yet built
function PlaceholderPage({ title }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <div className="rounded-xl bg-slate-100 p-6">
        <p className="text-slate-400 text-4xl">🚧</p>
      </div>
      <p className="text-lg font-semibold text-slate-700">{title}</p>
      <p className="text-sm text-slate-400">This page will be fully implemented in the next phase</p>
    </div>
  );
}
