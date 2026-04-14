import {
  ShieldCheck,
  Key,
  HardDrive,
  Trash2,
  Download,
  Lock,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`rounded-2xl ${className}`}
    style={{
      background: "linear-gradient(145deg, #FFFFFF 0%, #F1F5F9 100%)",
      boxShadow:
        "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.8)",
      border: "1px solid rgba(226,232,240,0.6)",
    }}
  >
    {children}
  </div>
);

function Toggle({
  on,
  onToggle,
}: {
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button onClick={onToggle}>
      {on ? (
        <ToggleRight className="w-7 h-7" style={{ color: "#166534" }} />
      ) : (
        <ToggleLeft className="w-7 h-7" style={{ color: "#CBD5E1" }} />
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
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: 700,
            color: "#0F172A",
            letterSpacing: "-0.02em",
          }}
        >
          Vault Settings
        </h1>
        <p style={{ fontSize: "14px", color: "#64748B", marginTop: 2 }}>
          Configure your local encryption, privacy, and audit preferences.
        </p>
      </motion.div>

      {/* Security */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div
              className="flex items-center justify-center w-9 h-9 rounded-xl"
              style={{ background: "#F1F5F9" }}
            >
              <ShieldCheck className="w-[18px] h-[18px]" style={{ color: "#475569" }} />
            </div>
            <h3
              style={{
                fontSize: "15px",
                fontWeight: 600,
                color: "#0F172A",
              }}
            >
              Security & Privacy
            </h3>
          </div>
          <div className="space-y-4">
            {[
              {
                label: "Auto PII Scrubbing",
                desc: "Automatically redact personal information from all ingested documents.",
                on: autoScrub,
                toggle: () => setAutoScrub(!autoScrub),
              },
              {
                label: "Strict Offline Mode",
                desc: "Block all outbound network requests from the audit engine.",
                on: offlineMode,
                toggle: () => setOfflineMode(!offlineMode),
              },
              {
                label: "Auto-Audit New Transactions",
                desc: "Run AI classification immediately upon ingestion.",
                on: autoAudit,
                toggle: () => setAutoAudit(!autoAudit),
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between py-3 px-4 rounded-xl"
                style={{ background: "#FAFBFC" }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#0F172A",
                    }}
                  >
                    {item.label}
                  </p>
                  <p style={{ fontSize: "12px", color: "#94A3B8", marginTop: 2 }}>
                    {item.desc}
                  </p>
                </div>
                <Toggle on={item.on} onToggle={item.toggle} />
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Encryption */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div
              className="flex items-center justify-center w-9 h-9 rounded-xl"
              style={{ background: "#F1F5F9" }}
            >
              <Key className="w-[18px] h-[18px]" style={{ color: "#475569" }} />
            </div>
            <h3
              style={{
                fontSize: "15px",
                fontWeight: 600,
                color: "#0F172A",
              }}
            >
              Encryption
            </h3>
          </div>
          <div className="space-y-3">
            <div
              className="flex items-center justify-between py-3 px-4 rounded-xl"
              style={{ background: "#FAFBFC" }}
            >
              <div>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#0F172A",
                  }}
                >
                  Encryption Standard
                </p>
                <p style={{ fontSize: "12px", color: "#94A3B8", marginTop: 2 }}>
                  AES-256-GCM with PBKDF2 key derivation
                </p>
              </div>
              <span
                className="px-3 py-1 rounded-full"
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#166534",
                  background: "#F0FDF4",
                  border: "1px solid #BBF7D0",
                }}
              >
                Active
              </span>
            </div>
            <div
              className="flex items-center justify-between py-3 px-4 rounded-xl"
              style={{ background: "#FAFBFC" }}
            >
              <div>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#0F172A",
                  }}
                >
                  Vault Key Fingerprint
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#94A3B8",
                    fontFamily: "monospace",
                    marginTop: 2,
                  }}
                >
                  SHA256:a3f8...7d2b
                </p>
              </div>
              <Lock className="w-4 h-4" style={{ color: "#94A3B8" }} />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Data */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div
              className="flex items-center justify-center w-9 h-9 rounded-xl"
              style={{ background: "#F1F5F9" }}
            >
              <HardDrive className="w-[18px] h-[18px]" style={{ color: "#475569" }} />
            </div>
            <h3
              style={{
                fontSize: "15px",
                fontWeight: 600,
                color: "#0F172A",
              }}
            >
              Local Storage
            </h3>
          </div>
          <div
            className="flex items-center justify-between py-3 px-4 rounded-xl mb-3"
            style={{ background: "#FAFBFC" }}
          >
            <div>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#0F172A",
                }}
              >
                Vault Size
              </p>
              <p style={{ fontSize: "12px", color: "#94A3B8", marginTop: 2 }}>
                142 transactions · 23 documents · 12.4 MB
              </p>
            </div>
            {/* Usage bar */}
            <div
              className="w-24 h-2 rounded-full overflow-hidden"
              style={{ background: "#E2E8F0" }}
            >
              <div
                className="h-full rounded-full"
                style={{ width: "24%", background: "#475569" }}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all"
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "#475569",
                background: "#F1F5F9",
                border: "1px solid #E2E8F0",
              }}
            >
              <Download className="w-4 h-4" />
              Export Vault
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all"
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "#9F1239",
                background: "#FFF1F2",
                border: "1px solid #FECDD3",
              }}
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
