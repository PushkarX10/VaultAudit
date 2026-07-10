/**
 * VaultAudit AI — AuditorPage
 *
 * On-device AI financial analyst with:
 *   • Chat interface with typing indicator
 *   • Collapsible insight cards (warn/good/info)
 *   • Recharts bar visualization for spend breakdown
 *   • Quick prompt buttons
 *   • Runtime info panel
 */

import { useState } from 'react';
import {
  Sparkles,
  Send,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  Zap,
  Cpu,
} from 'lucide-react';
import { PageHeader, Panel } from '@/components/PageShell.jsx';
import { BarChart, Bar, ResponsiveContainer, Cell } from 'recharts';
import { cn } from '@/lib/utils.js';

// ── Spend data for the bar chart ─────────────────────────────
const spendBars = [
  { c: 'Groceries', v: 420, tone: '#a7f3d0' },
  { c: 'Dining', v: 310, tone: '#fca5a5' },
  { c: 'Transport', v: 180, tone: '#93c5fd' },
  { c: 'Shopping', v: 540, tone: '#f0abfc' },
  { c: 'Utilities', v: 220, tone: '#fcd34d' },
  { c: 'Health', v: 90, tone: '#67e8f9' },
];

// ── Typing dots ──────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="inline-flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

// ── Insight Card ─────────────────────────────────────────────
function InsightCard({ tone, Icon, title, body, children }) {
  const [open, setOpen] = useState(true);
  const toneClass =
    tone === 'warn'
      ? 'from-rose-500/[0.12] to-rose-500/[0.02] border-rose-400/20 text-rose-200'
      : tone === 'good'
      ? 'from-emerald-500/[0.12] to-emerald-500/[0.02] border-emerald-400/20 text-emerald-200'
      : 'from-sky-500/[0.10] to-sky-500/[0.02] border-sky-400/20 text-sky-200';

  return (
    <div
      className={cn(
        'rounded-2xl bg-gradient-to-b border overflow-hidden',
        'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]',
        toneClass
      )}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        <div className="w-8 h-8 rounded-lg bg-black/30 border border-white/10 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white tracking-tight text-sm">{title}</div>
          <div className="text-white/50 text-xs mt-0.5 truncate">{body}</div>
        </div>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-white/40 transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>
      {open && children && (
        <div className="px-4 pb-4 border-t border-white/[0.06] pt-3">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Quick prompts ────────────────────────────────────────────
const QUICK_PROMPTS = [
  'Where can I cut $200/mo?',
  'Detect duplicate charges',
  'Forecast next month spend',
  'Draft a monthly budget',
];

// ── Main component ───────────────────────────────────────────
export default function AuditorPage() {
  const [thinking, setThinking] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: "I finished auditing your July transactions. Three anomalies stood out — click any card to expand the analysis.",
    },
  ]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: 'user', text: input }]);
    setThinking(true);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: `Based on your spending patterns, here's my analysis: ${input.includes('cut') ? 'You could save approximately $47.97/mo by canceling unused subscriptions (Adobe, Audible, Notion). Additionally, reducing dining frequency by 2 meals/week saves ~$80/mo.' : input.includes('duplicate') ? 'No duplicate charges detected in the last 90 days. All recurring payments have unique transaction IDs.' : 'Your spending trajectory suggests a ~$2,100 total for next month, down 8% from July, driven primarily by lower housing costs.'}`,
        },
      ]);
      setThinking(false);
    }, 1600);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow="Local Model · Llama-Vault 8B"
        title="AI Auditor"
        subtitle="Your on-device financial analyst. Every insight below was generated locally — nothing was uploaded."
        actions={
          <div className="inline-flex items-center gap-2 pl-2.5 pr-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08]">
            <Cpu className="w-3.5 h-3.5 text-emerald-300" />
            <span className="text-[11px] text-white/70 tracking-wide">
              Model ready · 4.2 GB in RAM
            </span>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Chat + Insights (2 col) ─────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          <Panel className="min-h-[520px] flex flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto pr-1">
              {/* AI messages */}
              {messages.map((msg, idx) =>
                msg.role === 'ai' ? (
                  <div key={idx} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/20 to-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[11px] text-white/40 mb-1">
                        VaultAudit · just now
                      </div>
                      <div className="rounded-2xl rounded-tl-sm bg-white/[0.04] border border-white/[0.08] p-4 text-sm text-white/90">
                        {msg.text}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key={idx} className="flex gap-3 justify-end">
                    <div className="rounded-2xl rounded-tr-sm bg-emerald-500/10 border border-emerald-400/20 p-4 text-sm text-white/90 max-w-[80%]">
                      {msg.text}
                    </div>
                  </div>
                )
              )}

              {/* Insight cards (shown after first AI message) */}
              {messages.length <= 2 && (
                <>
                  <InsightCard
                    tone="warn"
                    Icon={AlertTriangle}
                    title="Dining spend up 42% vs your 90-day average"
                    body="$310 across 11 transactions · biggest jump since March"
                  >
                    <div className="h-24 -mx-2">
                      <ResponsiveContainer>
                        <BarChart data={spendBars}>
                          <Bar dataKey="v" radius={[6, 6, 2, 2]}>
                            {spendBars.map((d) => (
                              <Cell
                                key={d.c}
                                fill={d.tone}
                                fillOpacity={d.c === 'Dining' ? 1 : 0.35}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-2 flex justify-between text-[10px] text-white/40 px-1">
                      {spendBars.map((d) => (
                        <span key={d.c}>{d.c}</span>
                      ))}
                    </div>
                  </InsightCard>

                  <InsightCard
                    tone="good"
                    Icon={TrendingUp}
                    title="Savings rate improved to 24.6%"
                    body="Up from 19.1% in June · on pace for your $40k goal"
                  >
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { l: 'Income', v: '$5,240' },
                        { l: 'Saved', v: '$1,290' },
                        { l: 'Rate', v: '24.6%' },
                      ].map((m) => (
                        <div
                          key={m.l}
                          className="rounded-lg bg-black/30 border border-white/10 p-2"
                        >
                          <div className="text-[10px] text-white/40 uppercase tracking-wider">
                            {m.l}
                          </div>
                          <div className="text-white mt-0.5">{m.v}</div>
                        </div>
                      ))}
                    </div>
                  </InsightCard>

                  <InsightCard
                    tone="info"
                    Icon={TrendingDown}
                    title="3 recurring subscriptions unused in 60 days"
                    body="Potential savings: $47.97 / month if canceled"
                  >
                    <div className="space-y-2">
                      {[
                        { n: 'Adobe Creative Cloud', a: '$22.99', used: '62d ago' },
                        { n: 'Audible Premium', a: '$14.99', used: '88d ago' },
                        { n: 'Notion Personal Pro', a: '$9.99', used: '71d ago' },
                      ].map((s) => (
                        <div
                          key={s.n}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-white/80">{s.n}</span>
                          <span className="text-white/40 text-xs">{s.used}</span>
                          <span className="text-white tabular-nums">{s.a}</span>
                        </div>
                      ))}
                    </div>
                  </InsightCard>
                </>
              )}

              {/* Typing indicator */}
              {thinking && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/20 to-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-white/[0.04] border border-white/[0.08] px-4 py-3">
                    <TypingDots />
                  </div>
                </div>
              )}
            </div>

            {/* Chat input */}
            <div className="mt-4 flex items-center gap-2 p-2 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about your finances… e.g. why is my July dining up?"
                className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/30 px-3"
              />
              <button
                onClick={handleSend}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-b from-white/[0.16] to-white/[0.04] border border-white/20 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="text-xs">Ask</span>
              </button>
            </div>
          </Panel>
        </div>

        {/* ── Sidebar panels (1 col) ──────────────────── */}
        <div className="space-y-4">
          <Panel>
            <div className="text-[11px] tracking-[0.18em] uppercase text-white/40">
              Quick Prompts
            </div>
            <div className="mt-3 space-y-2">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => setInput(p)}
                  className="w-full text-left px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white/80 hover:bg-white/[0.06] hover:border-white/20 transition"
                >
                  {p}
                </button>
              ))}
            </div>
          </Panel>

          <Panel>
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-emerald-300" />
              <div className="text-[11px] tracking-[0.18em] uppercase text-white/40">
                Runtime
              </div>
            </div>
            <div className="mt-3 space-y-2 text-xs">
              {[
                ['Inference device', 'WebGPU · Neural Engine'],
                ['Context window', '128k tokens'],
                ['Last audit', '2 minutes ago'],
                ['Data transmitted', '0 bytes'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-white/40">{k}</span>
                  <span className="text-white/90">{v}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
