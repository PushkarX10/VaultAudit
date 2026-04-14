import { Lock, Search, Filter, ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const transactions = [
  {
    id: 1,
    title: "Netflix Standard Plan",
    category: "Entertainment",
    tag: "Hidden Subscription Found",
    tagType: "alert",
    amount: -15.49,
    date: "Apr 10, 2026",
    confidence: 97,
  },
  {
    id: 2,
    title: "Whole Foods Market",
    category: "Groceries",
    tag: "Necessity",
    tagType: "ok",
    amount: -87.23,
    date: "Apr 9, 2026",
    confidence: 99,
  },
  {
    id: 3,
    title: "Amazon Prime Renewal",
    category: "Subscription",
    tag: "Policy Violation",
    tagType: "alert",
    amount: -14.99,
    date: "Apr 8, 2026",
    confidence: 94,
  },
  {
    id: 4,
    title: "Starbucks Coffee",
    category: "Dining",
    tag: "Impulse Spend",
    tagType: "warn",
    amount: -6.45,
    date: "Apr 8, 2026",
    confidence: 88,
  },
  {
    id: 5,
    title: "Verizon Wireless",
    category: "Utilities",
    tag: "Recurring — Verified",
    tagType: "ok",
    amount: -85.0,
    date: "Apr 7, 2026",
    confidence: 100,
  },
  {
    id: 6,
    title: "Adobe Creative Cloud",
    category: "Software",
    tag: "Hidden Subscription Found",
    tagType: "alert",
    amount: -54.99,
    date: "Apr 6, 2026",
    confidence: 96,
  },
  {
    id: 7,
    title: "Trader Joe's",
    category: "Groceries",
    tag: "Necessity",
    tagType: "ok",
    amount: -42.17,
    date: "Apr 5, 2026",
    confidence: 99,
  },
  {
    id: 8,
    title: "Uber Ride",
    category: "Transport",
    tag: "Impulse Spend",
    tagType: "warn",
    amount: -23.8,
    date: "Apr 5, 2026",
    confidence: 91,
  },
  {
    id: 9,
    title: "Gym Membership",
    category: "Health",
    tag: "Recurring — Verified",
    tagType: "ok",
    amount: -49.99,
    date: "Apr 4, 2026",
    confidence: 100,
  },
  {
    id: 10,
    title: "Steam Game Purchase",
    category: "Entertainment",
    tag: "Impulse Spend",
    tagType: "warn",
    amount: -29.99,
    date: "Apr 3, 2026",
    confidence: 85,
  },
];

const tagStyles: Record<string, { color: string; bg: string; border: string }> =
  {
    alert: {
      color: "#9F1239",
      bg: "#FFF1F2",
      border: "#FECDD3",
    },
    ok: {
      color: "#166534",
      bg: "#F0FDF4",
      border: "#BBF7D0",
    },
    warn: {
      color: "#92400E",
      bg: "#FFFBEB",
      border: "#FDE68A",
    },
  };

export function AuditorFeed() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const filtered = transactions.filter((tx) => {
    if (filter !== "all" && tx.tagType !== filter) return false;
    if (search && !tx.title.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
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
          Auditor Feed
        </h1>
        <p style={{ fontSize: "14px", color: "#64748B", marginTop: 2 }}>
          AI-classified transactions with privacy-first audit tags.
        </p>
      </motion.div>

      {/* Controls */}
      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl flex-1"
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <Search className="w-4 h-4" style={{ color: "#94A3B8" }} />
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 outline-none bg-transparent"
            style={{ fontSize: "13px", color: "#0F172A" }}
          />
        </div>
        {["all", "alert", "warn", "ok"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-2.5 rounded-xl transition-all"
            style={{
              fontSize: "12px",
              fontWeight: 500,
              background:
                filter === f
                  ? "linear-gradient(135deg, #E2E8F0 0%, #CBD5E1 100%)"
                  : "#FFFFFF",
              color: filter === f ? "#0F172A" : "#64748B",
              border: `1px solid ${filter === f ? "#CBD5E1" : "#E2E8F0"}`,
            }}
          >
            {f === "all"
              ? "All"
              : f === "alert"
                ? "Flagged"
                : f === "warn"
                  ? "Impulse"
                  : "Verified"}
          </button>
        ))}
      </motion.div>

      {/* Transaction list */}
      <div className="space-y-2.5">
        {filtered.map((tx, i) => {
          const style = tagStyles[tx.tagType];
          return (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 + i * 0.03 }}
              className="flex items-center justify-between p-5 rounded-2xl cursor-pointer group"
              style={{
                background:
                  "linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)",
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.8)",
                border: "1px solid rgba(226,232,240,0.6)",
              }}
            >
              <div className="flex items-center gap-4 flex-1">
                <Lock
                  className="w-4 h-4 shrink-0"
                  style={{ color: "#CBD5E1" }}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2.5">
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#0F172A",
                      }}
                    >
                      {tx.title}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#94A3B8",
                        fontWeight: 500,
                      }}
                    >
                      PII Scrubbed
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span style={{ fontSize: "12px", color: "#94A3B8" }}>
                      {tx.category}
                    </span>
                    <span style={{ fontSize: "12px", color: "#CBD5E1" }}>
                      ·
                    </span>
                    <span style={{ fontSize: "12px", color: "#94A3B8" }}>
                      {tx.date}
                    </span>
                    <span style={{ fontSize: "12px", color: "#CBD5E1" }}>
                      ·
                    </span>
                    <span style={{ fontSize: "11px", color: "#94A3B8" }}>
                      {tx.confidence}% confidence
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className="px-3 py-1 rounded-full"
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: style.color,
                    background: style.bg,
                    border: `1px solid ${style.border}`,
                  }}
                >
                  {tx.tag}
                </span>
                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "#0F172A",
                    minWidth: 80,
                    textAlign: "right",
                  }}
                >
                  ${Math.abs(tx.amount).toFixed(2)}
                </span>
                <ArrowUpRight
                  className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: "#94A3B8" }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
