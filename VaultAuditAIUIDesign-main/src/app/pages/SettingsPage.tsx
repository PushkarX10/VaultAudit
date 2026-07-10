import { useState } from "react";
import { PageHeader, Panel } from "../components/page-shell";
import { Database, Cpu, Download, KeyRound, Fingerprint, HardDrive, ShieldCheck } from "lucide-react";

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-10 h-6 rounded-full transition-colors border ${
        on
          ? "bg-emerald-400/80 border-emerald-300/40 shadow-[0_0_12px_-2px_rgba(52,211,153,0.7)]"
          : "bg-white/[0.06] border-white/[0.1]"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
          on ? "translate-x-4" : ""
        }`}
      />
    </button>
  );
}

function Row({
  Icon,
  label,
  desc,
  children,
}: {
  Icon: any;
  label: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 py-4">
      <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-white/80" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-white text-sm tracking-tight">{label}</div>
        <div className="text-[11px] text-white/40 mt-0.5">{desc}</div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function SettingsPage() {
  const [encrypt, setEncrypt] = useState(true);
  const [biometric, setBiometric] = useState(true);
  const [ocr, setOcr] = useState(true);
  const [ocrLarge, setOcrLarge] = useState(false);
  const [telemetry, setTelemetry] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Vault"
        title="Settings"
        subtitle="Manage local storage, biometric locks, on-device OCR models, and data export — all offline."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Panel className="lg:col-span-2">
          <div className="text-[11px] tracking-[0.18em] uppercase text-white/40 mb-2">Security</div>
          <div className="divide-y divide-white/[0.05]">
            <Row Icon={KeyRound} label="Vault encryption (AES-256)" desc="All data at rest encrypted with your master key.">
              <Toggle on={encrypt} onChange={() => setEncrypt(!encrypt)} />
            </Row>
            <Row Icon={Fingerprint} label="Biometric unlock" desc="Use Touch ID / Face ID to open the vault.">
              <Toggle on={biometric} onChange={() => setBiometric(!biometric)} />
            </Row>
            <Row Icon={ShieldCheck} label="Local-only processing" desc="Blocks any outbound network from the app runtime.">
              <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/25 text-emerald-300">
                Enforced
              </span>
            </Row>
          </div>
        </Panel>

        <Panel>
          <div className="text-[11px] tracking-[0.18em] uppercase text-white/40 mb-2">Master Key</div>
          <div className="mt-3 space-y-3">
            <div>
              <label className="text-[11px] text-white/50">Passphrase</label>
              <input
                type="password"
                defaultValue="••••••••••••"
                className="mt-1 w-full px-3 py-2 rounded-lg bg-black/40 border border-white/[0.08] focus:border-white/25 outline-none text-white text-sm tracking-widest"
              />
            </div>
            <button className="w-full text-center px-3 py-2 rounded-lg bg-gradient-to-b from-white/[0.16] to-white/[0.04] border border-white/20 text-white text-xs shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]">
              Rotate Master Key
            </button>
            <div className="text-[10px] text-white/40">
              Rotation re-encrypts your vault. Backups made with the old key remain valid.
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel>
          <div className="text-[11px] tracking-[0.18em] uppercase text-white/40 mb-2">OCR & Models</div>
          <div className="divide-y divide-white/[0.05]">
            <Row Icon={Cpu} label="Tesseract-Vault OCR" desc="Fast on-device receipt parser (~340ms / page).">
              <Toggle on={ocr} onChange={() => setOcr(!ocr)} />
            </Row>
            <Row Icon={Cpu} label="Vision-XL (large)" desc="Handles complex layouts. Uses ~2.1 GB RAM.">
              <Toggle on={ocrLarge} onChange={() => setOcrLarge(!ocrLarge)} />
            </Row>
            <Row Icon={HardDrive} label="Model cache" desc="Currently 4.9 GB used across 3 models.">
              <button className="text-[11px] px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/80 hover:text-white">
                Manage
              </button>
            </Row>
          </div>
        </Panel>

        <Panel>
          <div className="text-[11px] tracking-[0.18em] uppercase text-white/40 mb-2">Data</div>
          <div className="divide-y divide-white/[0.05]">
            <Row Icon={Database} label="Local database" desc="SQLite + WAL, encrypted · 128 MB on disk">
              <span className="text-[11px] text-white/50 tabular-nums">/vault/data.db</span>
            </Row>
            <Row Icon={Download} label="Export vault" desc="Encrypted .vault bundle for offline backup.">
              <button className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/80 text-[11px] hover:text-white">
                <Download className="w-3 h-3" /> Export
              </button>
            </Row>
            <Row Icon={ShieldCheck} label="Anonymous telemetry" desc="Off by default. No financial data ever included.">
              <Toggle on={telemetry} onChange={() => setTelemetry(!telemetry)} />
            </Row>
          </div>
        </Panel>
      </div>
    </div>
  );
}
