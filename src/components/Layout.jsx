/**
 * VaultAudit AI — Layout Component (Skeleton)
 *
 * Minimal app shell. This will be replaced by your Figma / Stitch
 * design — it exists purely so the app is runnable during development.
 */

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <span className="text-emerald-400 text-lg font-bold">V</span>
            </div>
            <h1 className="text-lg font-semibold tracking-tight">
              VaultAudit <span className="text-emerald-400">AI</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Offline Ready
            </span>
          </div>
        </div>
      </header>

      {/* ── Main Content ───────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
