/**
 * VaultAudit AI — SavingsPage
 *
 * Savings tracker with:
 *   • Working "New Goal" button → creation modal
 *   • Editable goal cards (click to edit name, target, saved amount)
 *   • Savings donut widget
 *   • Monthly milestones progress bars
 */

import { useState, useRef, useEffect } from 'react';
import { PageHeader, Panel } from '@/components/PageShell.jsx';
import SavingsWidget from '@/components/widgets/SavingsWidget.jsx';
import { cn } from '@/lib/utils.js';
import {
  Plus, Plane, GraduationCap, Home, Car, X, Check,
  Pencil, Trash2, Target, Wallet, DollarSign, PiggyBank,
  ShoppingBag, Heart, Briefcase, Star,
} from 'lucide-react';

// ── Icon picker options ──────────────────────────────────────
const ICON_OPTIONS = [
  { icon: Home, name: 'Home' },
  { icon: Plane, name: 'Travel' },
  { icon: GraduationCap, name: 'Education' },
  { icon: Car, name: 'Vehicle' },
  { icon: PiggyBank, name: 'Emergency' },
  { icon: ShoppingBag, name: 'Shopping' },
  { icon: Heart, name: 'Health' },
  { icon: Briefcase, name: 'Business' },
  { icon: Star, name: 'Other' },
];

const ACCENT_OPTIONS = [
  { cls: 'bg-emerald-400', name: 'Emerald', glow: 'from-emerald-400/25 to-emerald-500/5' },
  { cls: 'bg-sky-400', name: 'Sky', glow: 'from-sky-400/25 to-sky-500/5' },
  { cls: 'bg-fuchsia-400', name: 'Fuchsia', glow: 'from-fuchsia-400/25 to-fuchsia-500/5' },
  { cls: 'bg-amber-400', name: 'Amber', glow: 'from-amber-400/25 to-amber-500/5' },
  { cls: 'bg-rose-400', name: 'Rose', glow: 'from-rose-400/25 to-rose-500/5' },
  { cls: 'bg-violet-400', name: 'Violet', glow: 'from-violet-400/25 to-violet-500/5' },
];

const initialGoals = [
  { id: 1, iconIdx: 0, name: 'Down Payment', saved: 24680, goal: 40000, accentIdx: 0 },
  { id: 2, iconIdx: 1, name: 'Tokyo Trip', saved: 1820, goal: 3500, accentIdx: 1 },
  { id: 3, iconIdx: 2, name: 'Course Fund', saved: 640, goal: 2000, accentIdx: 2 },
  { id: 4, iconIdx: 3, name: 'New EV', saved: 8900, goal: 25000, accentIdx: 3 },
];

// ── Goal Form Modal ──────────────────────────────────────────
function GoalModal({ open, onClose, onSave, initial }) {
  const [name, setName] = useState(initial?.name || '');
  const [goal, setGoal] = useState(initial?.goal || '');
  const [saved, setSaved] = useState(initial?.saved || 0);
  const [iconIdx, setIconIdx] = useState(initial?.iconIdx ?? 0);
  const [accentIdx, setAccentIdx] = useState(initial?.accentIdx ?? 0);
  const nameRef = useRef(null);

  useEffect(() => {
    if (open) {
      setName(initial?.name || '');
      setGoal(initial?.goal || '');
      setSaved(initial?.saved || 0);
      setIconIdx(initial?.iconIdx ?? 0);
      setAccentIdx(initial?.accentIdx ?? 0);
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [open, initial]);

  if (!open) return null;

  const handleSave = () => {
    if (!name.trim() || !goal) return;
    onSave({ name: name.trim(), goal: Number(goal), saved: Number(saved), iconIdx, accentIdx });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#0a0a0a]/95 backdrop-blur-2xl shadow-[0_30px_80px_-12px_rgba(0,0,0,0.9)] overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <span className="text-sm font-medium text-white">{initial ? 'Edit Goal' : 'Create New Goal'}</span>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.08] transition">
            <X className="w-3.5 h-3.5 text-white/60" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Goal name */}
          <div>
            <label className="text-[11px] uppercase tracking-[0.15em] text-white/40">Goal Name</label>
            <input
              ref={nameRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Emergency Fund"
              className="mt-1.5 w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/25 outline-none text-sm text-white placeholder:text-white/25 transition"
            />
          </div>

          {/* Target + Saved */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] uppercase tracking-[0.15em] text-white/40">Target Amount ($)</label>
              <input
                type="number"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="40000"
                className="mt-1.5 w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/25 outline-none text-sm text-white placeholder:text-white/25 transition"
              />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-[0.15em] text-white/40">Already Saved ($)</label>
              <input
                type="number"
                value={saved}
                onChange={(e) => setSaved(e.target.value)}
                placeholder="0"
                className="mt-1.5 w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/25 outline-none text-sm text-white placeholder:text-white/25 transition"
              />
            </div>
          </div>

          {/* Icon picker */}
          <div>
            <label className="text-[11px] uppercase tracking-[0.15em] text-white/40">Icon</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {ICON_OPTIONS.map((opt, i) => {
                const Ic = opt.icon;
                return (
                  <button
                    key={opt.name}
                    onClick={() => setIconIdx(i)}
                    className={cn(
                      'w-10 h-10 rounded-xl border flex items-center justify-center transition',
                      iconIdx === i
                        ? 'bg-white/10 border-white/25 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)]'
                        : 'bg-white/[0.03] border-white/[0.08] text-white/50 hover:text-white'
                    )}
                    title={opt.name}
                  >
                    <Ic className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="text-[11px] uppercase tracking-[0.15em] text-white/40">Accent Color</label>
            <div className="mt-2 flex gap-2">
              {ACCENT_OPTIONS.map((opt, i) => (
                <button
                  key={opt.name}
                  onClick={() => setAccentIdx(i)}
                  className={cn(
                    'w-8 h-8 rounded-full border-2 transition',
                    opt.cls,
                    accentIdx === i ? 'border-white scale-110 shadow-[0_0_12px_rgba(255,255,255,0.3)]' : 'border-transparent opacity-60 hover:opacity-100'
                  )}
                  title={opt.name}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-white/[0.06]">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white transition">Cancel</button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || !goal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-b from-white/[0.16] to-white/[0.04] border border-white/20 text-white text-xs shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Check className="w-3.5 h-3.5" />
            {initial ? 'Save Changes' : 'Create Goal'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SavingsPage() {
  const [goals, setGoals] = useState(initialGoals);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const openCreate = () => { setEditingGoal(null); setModalOpen(true); };

  const openEdit = (goal) => { setEditingGoal(goal); setModalOpen(true); };

  const handleSave = (data) => {
    if (editingGoal) {
      setGoals((gs) => gs.map((g) => (g.id === editingGoal.id ? { ...g, ...data } : g)));
    } else {
      setGoals((gs) => [...gs, { id: Date.now(), ...data }]);
    }
  };

  const handleDelete = (id) => {
    setGoals((gs) => gs.filter((g) => g.id !== id));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow="Goals"
        title="Savings Tracker"
        subtitle="Every dollar allocated across your goals. Milestones update the moment a transaction posts."
        actions={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 pl-3 pr-4 py-2 rounded-full bg-gradient-to-b from-white/[0.16] to-white/[0.04] border border-white/20 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)] hover:from-white/25 hover:to-white/10 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="text-xs">New Goal</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SavingsWidget />

        <Panel>
          <div className="text-[11px] tracking-[0.18em] uppercase text-white/40">Monthly Milestones</div>
          <div className="mt-4 space-y-4">
            {['Apr', 'May', 'Jun', 'Jul'].map((m, i) => {
              const pct = [58, 72, 61, 88][i];
              return (
                <div key={m}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-white/70">{m} 2026</span>
                    <span className="text-white/50 tabular-nums">{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-emerald-500 shadow-[0_0_12px_rgba(52,211,153,0.5)]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      {/* Goal cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {goals.map((g) => {
          const ic = ICON_OPTIONS[g.iconIdx] || ICON_OPTIONS[0];
          const Ic = ic.icon;
          const acc = ACCENT_OPTIONS[g.accentIdx] || ACCENT_OPTIONS[0];
          const pct = g.goal > 0 ? Math.round((g.saved / g.goal) * 100) : 0;
          return (
            <Panel key={g.id} className="group relative">
              <div className={`absolute -top-16 -right-16 w-40 h-40 rounded-full bg-gradient-to-br ${acc.glow} blur-2xl pointer-events-none`} />

              {/* Edit / Delete buttons (on hover) */}
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition z-10">
                <button
                  onClick={() => openEdit(g)}
                  className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/[0.1] flex items-center justify-center hover:bg-white/[0.12] transition"
                  title="Edit goal"
                >
                  <Pencil className="w-3 h-3 text-white/70" />
                </button>
                <button
                  onClick={() => handleDelete(g.id)}
                  className="w-7 h-7 rounded-lg bg-rose-500/[0.08] border border-rose-400/20 flex items-center justify-center hover:bg-rose-500/20 transition"
                  title="Delete goal"
                >
                  <Trash2 className="w-3 h-3 text-rose-400/80" />
                </button>
              </div>

              <div className="relative">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/15 to-white/5 border border-white/10 flex items-center justify-center">
                    <Ic className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-white tracking-tight">{g.name}</div>
                </div>
                <div className="mt-4 tabular-nums text-white tracking-tight" style={{ fontSize: 22 }}>
                  ${g.saved.toLocaleString()}
                </div>
                <div className="text-[11px] text-white/40 mt-0.5">of ${g.goal.toLocaleString()}</div>
                <div className="mt-3 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className={`h-full rounded-full ${acc.cls}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                <div className="mt-2 text-[11px] text-white/50">{pct}% complete</div>
              </div>
            </Panel>
          );
        })}

        {/* Add Goal Card */}
        <button
          onClick={openCreate}
          className="rounded-2xl border-2 border-dashed border-white/[0.08] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/20 transition flex flex-col items-center justify-center py-10 gap-2"
        >
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
            <Plus className="w-5 h-5 text-white/40" />
          </div>
          <span className="text-xs text-white/40">Add a goal</span>
        </button>
      </div>

      {/* Goal creation/editing modal */}
      <GoalModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={editingGoal}
      />
    </div>
  );
}
