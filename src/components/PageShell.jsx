/**
 * VaultAudit AI — PageShell
 *
 * Shared layout primitives used across every page:
 *   • PageHeader — eyebrow label + title + subtitle + action slot
 *   • Panel     — glassmorphism card container
 */

import { cn } from '@/lib/utils.js';

export function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <div className="flex items-end justify-between flex-wrap gap-4">
      <div>
        <div className="text-[11px] tracking-[0.2em] uppercase text-white/40">
          {eyebrow}
        </div>
        <h1 className="mt-1 text-white tracking-tight" style={{ fontSize: 30 }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-white/40 mt-1 text-sm max-w-2xl">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ children, className = '' }) {
  return (
    <div
      className={cn(
        'relative rounded-2xl border border-white/[0.08]',
        'bg-gradient-to-b from-white/[0.05] to-white/[0.01]',
        'backdrop-blur-2xl p-6 overflow-hidden',
        'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]',
        className
      )}
    >
      {children}
    </div>
  );
}
