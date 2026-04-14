import {
  ShieldCheck, Key, HardDrive, Trash2, Download, Lock, ToggleLeft, ToggleRight,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`rounded-2xl ${className}`}
    style={{
      background: "linear-gradient(145deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.9) 100%)",
      boxShadow: "0 1px 3px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
      border: "1px solid rgba(51,65,85,0.6)",
      backdropFilter: "blur(12px)",
    }}
  >
    {children}
  </div>
);

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle}>
      {on ? (
        <ToggleRight className="w-7 h-7" style={{ color: "#4ADE80" }} />
      ) : (
        <ToggleLeft className="w-7 h-7" style={{ color: "#475569" }} />
      )}
    </button>
  );
}

export function VaultSettings() {
  const [autoScrub, setAutoScrub] = useState(true);
  const [offlineMode, setOfflineMode] = useState(true);
  const [autoAudit, setAutoAudit] = useState(true);

  return (
    <div className="max-w-[720px] mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.02em" }}>
          Vault Settings
        </h1>
        <p style={{ fontSize: "14px", color: "#64748B", marginTop: 2 }}>
          Configure your local encryption, privacy, and audit preferences.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl" style={{ background: "#1E293B" }}>
              <ShieldCheck className="w-[18px] h-[18px]" style={{ color: "#94A3B8" }} />
            </div>
            <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#F1F5F9" }}>Security & Privacy</h3>
          </div>
          <div className="space-y-4">
            {[
              { label: "Auto PII Scrubbing", desc: "Automatically redact personal information from all ingested documents.", on: autoScrub, toggle: () => setAutoScrub(!autoScrub) },
              { label: "Strict Offline Mode", desc: "Block all outbound network requests from the audit engine.", on: offlineMode, toggle: () => setOfflineMode(!offlineMode) },
              { label: "Auto-Audit New Transactions", desc: "Run AI classification immediately upon ingestion.", on: autoAudit, toggle: () => setAutoAudit(!autoAudit) },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-3 px-4 rounded-xl" style={{ background: "rgba(30,41,59,0.5)" }}>
                <div>
                  <p style={{ fontSize: "14px", fontWeight: 500, color: "#F1F5F9" }}>{item.label}</p>
                  <p style={{ fontSize: "12px", color: "#64748B", marginTop: 2 }}>{item.desc}</p>
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
            <div className="flex items-center justify-center w-9 h-9 rounded-xl" style={{ background: "#1E293B" }}>
              <Key className="w-[18px] h-[18px]" style={{ color: "#94A3B8" }} />
            </div>
            <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#F1F5F9" }}>Encryption</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 px-4 rounded-xl" style={{ background: "rgba(30,41,59,0.5)" }}>
              <div>
                <p style={{ fontSize: "14px", fontWeight: 500, color: "#F1F5F9" }}>Encryption Standard</p>
                <p style={{ fontSize: "12px", color: "#64748B", marginTop: 2 }}>AES-256-GCM with PBKDF2 key derivation</p>
              </div>
              <span className="px-3 py-1 rounded-full" style={{ fontSize: "11px", fontWeight: 600, color: "#4ADE80", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
                Active
              </span>
            </div>
            <div className="flex items-center justify-between py-3 px-4 rounded-xl" style={{ background: "rgba(30,41,59,0.5)" }}>
              <div>
                <p style={{ fontSize: "14px", fontWeight: 500, color: "#F1F5F9" }}>Vault Key Fingerprint</p>
                <p style={{ fontSize: "12px", color: "#64748B", fontFamily: "monospace", marginTop: 2 }}>SHA256:a3f8...7d2b</p>
              </div>
              <Lock className="w-4 h-4" style={{ color: "#64748B" }} />
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl" style={{ background: "#1E293B" }}>
              <HardDrive className="w-[18px] h-[18px]" style={{ color: "#94A3B8" }} />
            </div>
            <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#F1F5F9" }}>Local Storage</h3>
          </div>
          <div className="flex items-center justify-between py-3 px-4 rounded-xl mb-3" style={{ background: "rgba(30,41,59,0.5)" }}>
            <div>
              <p style={{ fontSize: "14px", fontWeight: 500, color: "#F1F5F9" }}>Vault Size</p>
              <p style={{ fontSize: "12px", color: "#64748B", marginTop: 2 }}>142 transactions · 23 documents · 12.4 MB</p>
            </div>
            <div className="w-24 h-2 rounded-full overflow-hidden" style={{ background: "#1E293B" }}>
              <div className="h-full rounded-full" style={{ width: "24%", background: "#94A3B8" }} />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all"
              style={{ fontSize: "13px", fontWeight: 500, color: "#94A3B8", background: "#1E293B", border: "1px solid #334155" }}
            >
              <Download className="w-4 h-4" />
              Export Vault
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all"
              style={{ fontSize: "13px", fontWeight: 500, color: "#FB7185", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)" }}
            >
              <Trash2 className="w-4 h-4" />
              Purge All Data
            </button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
