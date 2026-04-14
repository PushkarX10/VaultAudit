import { useState, useCallback } from "react";
import { Upload, FileText, ShieldCheck, Cpu, CheckCircle2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type Stage = "idle" | "scanning" | "done";

export function OcrIngestion() {
  const [stage, setStage] = useState<Stage>("idle");
  const [dragOver, setDragOver] = useState(false);

  const handleUpload = useCallback(() => {
    setStage("scanning");
    setTimeout(() => setStage("done"), 3500);
  }, []);

  return (
    <div className="max-w-[720px] mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full text-center mb-8"
      >
        <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.02em" }}>
          OCR Ingestion
        </h1>
        <p style={{ fontSize: "14px", color: "#64748B", marginTop: 4 }}>
          Upload receipts and documents for local AI-powered extraction.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full"
      >
        <div
          className="relative w-full rounded-2xl p-1 cursor-pointer"
          onClick={stage === "idle" ? handleUpload : undefined}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); if (stage === "idle") handleUpload(); }}
          style={{
            background: dragOver
              ? "linear-gradient(145deg, rgba(51,65,85,0.8) 0%, rgba(30,41,59,0.9) 100%)"
              : "linear-gradient(145deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.9) 100%)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
            border: "1px solid rgba(51,65,85,0.6)",
          }}
        >
          <div
            className="flex flex-col items-center justify-center rounded-xl py-16 px-8"
            style={{
              border: "2px dashed #475569",
              background: dragOver ? "rgba(51,65,85,0.2)" : "rgba(15,23,42,0.3)",
              transition: "all 0.2s",
            }}
          >
            <AnimatePresence mode="wait">
              {stage === "idle" && (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                  <div
                    className="flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
                    style={{ background: "linear-gradient(135deg, #1E293B 0%, #334155 100%)" }}
                  >
                    <Upload className="w-7 h-7" style={{ color: "#94A3B8" }} />
                  </div>
                  <p style={{ fontSize: "16px", fontWeight: 600, color: "#F1F5F9" }}>
                    Drop receipts here or click to upload
                  </p>
                  <p style={{ fontSize: "13px", color: "#64748B", marginTop: 8 }}>
                    PDF, PNG, JPG — up to 10MB per file
                  </p>
                  <div
                    className="flex items-center gap-2 mt-6 px-4 py-2 rounded-full"
                    style={{ background: "#1E293B", border: "1px solid #334155" }}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" style={{ color: "#94A3B8" }} />
                    <span style={{ fontSize: "12px", fontWeight: 500, color: "#94A3B8" }}>
                      Processed entirely on your device. Zero cloud uploads.
                    </span>
                  </div>
                </motion.div>
              )}

              {stage === "scanning" && (
                <motion.div key="scanning" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                  <div
                    className="flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
                    style={{ background: "linear-gradient(135deg, #1E293B 0%, #334155 100%)" }}
                  >
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}>
                      <Loader2 className="w-7 h-7" style={{ color: "#94A3B8" }} />
                    </motion.div>
                  </div>
                  <p style={{ fontSize: "16px", fontWeight: 600, color: "#F1F5F9" }}>
                    Scanning document locally...
                  </p>
                  <p style={{ fontSize: "13px", color: "#64748B", marginTop: 8 }}>
                    Tesseract.js OCR engine running on-device
                  </p>
                  <div
                    className="relative w-full max-w-[320px] mt-8 rounded-xl overflow-hidden"
                    style={{ height: 120, background: "#0F172A", border: "1px solid #1E293B" }}
                  >
                    <div className="p-4 space-y-2">
                      {[80, 100, 65, 90, 45].map((w, i) => (
                        <div key={i} className="rounded-full" style={{ width: `${w}%`, height: 8, background: "#1E293B" }} />
                      ))}
                    </div>
                    <motion.div
                      className="absolute left-0 right-0"
                      style={{ height: 2, background: "linear-gradient(90deg, transparent, #94A3B8, transparent)" }}
                      animate={{ top: [0, 120, 0] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-5" style={{ fontSize: "11px", color: "#64748B" }}>
                    <Cpu className="w-3 h-3" />
                    Processing via WebAssembly · No network requests
                  </div>
                </motion.div>
              )}

              {stage === "done" && (
                <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                  <div
                    className="flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
                    style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}
                  >
                    <CheckCircle2 className="w-7 h-7" style={{ color: "#4ADE80" }} />
                  </div>
                  <p style={{ fontSize: "16px", fontWeight: 600, color: "#F1F5F9" }}>
                    Document processed successfully
                  </p>
                  <p style={{ fontSize: "13px", color: "#64748B", marginTop: 8 }}>
                    3 line items extracted · AI categorized · Stored locally
                  </p>
                  <div
                    className="w-full max-w-[360px] mt-6 rounded-xl p-4 space-y-3"
                    style={{ background: "rgba(30,41,59,0.6)", border: "1px solid #334155" }}
                  >
                    {[
                      { item: "Organic Milk 2L", price: "$5.49", cat: "Groceries" },
                      { item: "Sourdough Bread", price: "$4.99", cat: "Groceries" },
                      { item: "Almond Butter", price: "$8.79", cat: "Groceries" },
                    ].map((row) => (
                      <div key={row.item} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5" style={{ color: "#475569" }} />
                          <span style={{ fontSize: "13px", color: "#F1F5F9", fontWeight: 500 }}>{row.item}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className="px-2 py-0.5 rounded-full"
                            style={{ fontSize: "10px", fontWeight: 600, color: "#4ADE80", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}
                          >
                            {row.cat}
                          </span>
                          <span style={{ fontSize: "13px", fontWeight: 600, color: "#F1F5F9" }}>{row.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setStage("idle")}
                    className="mt-6 px-5 py-2.5 rounded-xl transition-all"
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#0F172A",
                      background: "linear-gradient(135deg, #E2E8F0 0%, #CBD5E1 100%)",
                    }}
                  >
                    Upload Another
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
