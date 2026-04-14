import {
  ShieldCheck,
  HardDrive,
  TrendingDown,
  TrendingUp,
  ArrowUpRight,
  Lock,
  Eye,
  Cpu,
} from "lucide-react";
import { motion } from "motion/react";

const doughnutData = [
  { name: "Necessities", value: 3240, color: "#94A3B8" },
  { name: "Recurring", value: 1860, color: "#64748B" },
  { name: "Impulse Spends", value: 720, color: "#475569" },
  { name: "Savings", value: 1580, color: "#334155" },
  { name: "Other", value: 400, color: "#1E293B" },
];

const barData = [
  { month: "Jul", amount: 4200 },
  { month: "Aug", amount: 3800 },
  { month: "Sep", amount: 4600 },
  { month: "Oct", amount: 3900 },
  { month: "Nov", amount: 5100 },
  { month: "Dec", amount: 4400 },
];

function DonutChart({
  data,
  size,
  innerRadius,
  outerRadius,
}: {
  data: { name: string; value: number; color: string }[];
  size: number;
  innerRadius: number;
  outerRadius: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const gap = 0.03;
  let currentAngle = -Math.PI / 2;

  const segments = data.map((d) => {
    const angle = (d.value / total) * (2 * Math.PI) - gap;
    const startAngle = currentAngle + gap / 2;
    const endAngle = startAngle + angle;
    currentAngle = endAngle + gap / 2;

    const x1Outer = cx + outerRadius * Math.cos(startAngle);
    const y1Outer = cy + outerRadius * Math.sin(startAngle);
    const x2Outer = cx + outerRadius * Math.cos(endAngle);
    const y2Outer = cy + outerRadius * Math.sin(endAngle);
    const x1Inner = cx + innerRadius * Math.cos(endAngle);
    const y1Inner = cy + innerRadius * Math.sin(endAngle);
    const x2Inner = cx + innerRadius * Math.cos(startAngle);
    const y2Inner = cy + innerRadius * Math.sin(startAngle);

    const largeArc = angle > Math.PI ? 1 : 0;

    const path = [
      `M ${x1Outer} ${y1Outer}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2Outer} ${y2Outer}`,
      `L ${x1Inner} ${y1Inner}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x2Inner} ${y2Inner}`,
      "Z",
    ].join(" ");

    return { path, color: d.color, name: d.name };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments.map((seg) => (
        <path key={seg.name} d={seg.path} fill={seg.color} />
      ))}
    </svg>
  );
}

function CustomBarChart({ data }: { data: { month: string; amount: number }[] }) {
  const maxVal = Math.max(...data.map((d) => d.amount));
  const padding = { top: 10, right: 10, bottom: 28, left: 40 };
  const barGap = 12;

  return (
    <div style={{ width: "100%", height: 180, position: "relative" }}>
      <svg width="100%" height="100%" viewBox="0 0 500 180" preserveAspectRatio="none">
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
          const y = padding.top + (1 - pct) * (180 - padding.top - padding.bottom);
          return (
            <line
              key={`grid-${pct}`}
              x1={padding.left}
              x2={500 - padding.right}
              y1={y}
              y2={y}
              stroke="#1E293B"
              strokeDasharray="3 3"
            />
          );
        })}
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
          const y = padding.top + (1 - pct) * (180 - padding.top - padding.bottom);
          const val = Math.round(maxVal * pct);
          return (
            <text
              key={`ylabel-${pct}`}
              x={padding.left - 6}
              y={y + 4}
              textAnchor="end"
              fill="#64748B"
              fontSize="11"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              ${val >= 1000 ? `${val / 1000}k` : val}
            </text>
          );
        })}
        {data.map((d, i) => {
          const chartW = 500 - padding.left - padding.right;
          const chartH = 180 - padding.top - padding.bottom;
          const barW = (chartW - barGap * (data.length + 1)) / data.length;
          const x = padding.left + barGap + i * (barW + barGap);
          const barH = (d.amount / maxVal) * chartH;
          const y = padding.top + chartH - barH;
          const r = 8;
          const isLast = i === data.length - 1;

          return (
            <g key={d.month}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={r}
                ry={r}
                fill={isLast ? "#94A3B8" : "#334155"}
              />
              <rect
                x={x}
                y={y + barH - r}
                width={barW}
                height={r}
                fill={isLast ? "#94A3B8" : "#334155"}
              />
              <text
                x={x + barW / 2}
                y={180 - 6}
                textAnchor="middle"
                fill="#64748B"
                fontSize="11"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {d.month}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

const Card = ({
  children,
  className = "",
  style = {},
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) => (
  <div
    className={`rounded-2xl ${className}`}
    style={{
      background: "linear-gradient(145deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.9) 100%)",
      boxShadow:
        "0 1px 3px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
      border: "1px solid rgba(51,65,85,0.6)",
      backdropFilter: "blur(12px)",
      ...style,
    }}
  >
    {children}
  </div>
);

export function Dashboard() {
  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 700,
              color: "#F1F5F9",
              letterSpacing: "-0.02em",
            }}
          >
            The Vault
          </h1>
          <p style={{ fontSize: "14px", color: "#64748B", marginTop: 2 }}>
            Your financial audit overview — all processed offline.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              background: "linear-gradient(135deg, #1E293B 0%, #334155 100%)",
              border: "1px solid #334155",
            }}
          >
            <Cpu className="w-3.5 h-3.5" style={{ color: "#94A3B8" }} />
            <span
              style={{ fontSize: "12px", fontWeight: 500, color: "#94A3B8" }}
            >
              AI Engine: Active
            </span>
          </div>
        </div>
      </motion.div>

      {/* Hero cards row */}
      <div className="grid grid-cols-3 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div
                className="flex items-center justify-center w-10 h-10 rounded-xl"
                style={{ background: "#1E293B" }}
              >
                <HardDrive className="w-5 h-5" style={{ color: "#94A3B8" }} />
              </div>
              <span
                className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#4ADE80",
                  background: "rgba(34,197,94,0.1)",
                  border: "1px solid rgba(34,197,94,0.2)",
                }}
              >
                <TrendingUp className="w-3 h-3" />
                +12%
              </span>
            </div>
            <p
              style={{ fontSize: "12px", color: "#64748B", fontWeight: 500 }}
            >
              Total Processed Offline
            </p>
            <p
              style={{
                fontSize: "32px",
                fontWeight: 700,
                color: "#F1F5F9",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                marginTop: 4,
              }}
            >
              $7,800
            </p>
            <p
              style={{
                fontSize: "12px",
                color: "#64748B",
                marginTop: 4,
              }}
            >
              142 transactions audited
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div
                className="flex items-center justify-center w-10 h-10 rounded-xl"
                style={{ background: "#1E293B" }}
              >
                <ShieldCheck
                  className="w-5 h-5"
                  style={{ color: "#94A3B8" }}
                />
              </div>
              <span
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#4ADE80",
                  background: "rgba(34,197,94,0.1)",
                  border: "1px solid rgba(34,197,94,0.2)",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "#4ADE80" }}
                />
                Secure
              </span>
            </div>
            <p
              style={{ fontSize: "12px", color: "#64748B", fontWeight: 500 }}
            >
              Security Status
            </p>
            <p
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "#F1F5F9",
                letterSpacing: "-0.01em",
                lineHeight: 1.3,
                marginTop: 4,
              }}
            >
              Local & Encrypted
            </p>
            <p
              style={{
                fontSize: "12px",
                color: "#64748B",
                marginTop: 4,
              }}
            >
              AES-256 · Zero cloud exposure
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div
                className="flex items-center justify-center w-10 h-10 rounded-xl"
                style={{ background: "#1E293B" }}
              >
                <Eye className="w-5 h-5" style={{ color: "#94A3B8" }} />
              </div>
              <span
                className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#FB7185",
                  background: "rgba(244,63,94,0.1)",
                  border: "1px solid rgba(244,63,94,0.2)",
                }}
              >
                <TrendingDown className="w-3 h-3" />3 flagged
              </span>
            </div>
            <p
              style={{ fontSize: "12px", color: "#64748B", fontWeight: 500 }}
            >
              Audit Alerts
            </p>
            <p
              style={{
                fontSize: "32px",
                fontWeight: 700,
                color: "#F1F5F9",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                marginTop: 4,
              }}
            >
              7
            </p>
            <p
              style={{
                fontSize: "12px",
                color: "#64748B",
                marginTop: 4,
              }}
            >
              Potential savings: $284/mo
            </p>
          </Card>
        </motion.div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-5 gap-5">
        <motion.div
          className="col-span-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="p-6 h-full">
            <div className="flex items-center justify-between mb-1">
              <h3
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "#F1F5F9",
                }}
              >
                Semantic Budgeting
              </h3>
              <span
                className="px-2.5 py-1 rounded-full"
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "#94A3B8",
                  background: "#1E293B",
                }}
              >
                AI Categorized
              </span>
            </div>
            <p
              style={{
                fontSize: "12px",
                color: "#64748B",
                marginBottom: 16,
              }}
            >
              Spending breakdown by AI classification
            </p>
            <div className="flex items-center">
              <div style={{ width: 160, height: 160 }}>
                <DonutChart
                  data={doughnutData}
                  size={160}
                  innerRadius={48}
                  outerRadius={72}
                />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          className="col-span-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <Card className="p-6 h-full">
            <div className="flex items-center justify-between mb-1">
              <h3
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "#F1F5F9",
                }}
              >
                Monthly Spend Trend
              </h3>
              <div className="flex items-center gap-1.5">
                <span
                  style={{
                    fontSize: "12px",
                    color: "#4ADE80",
                    fontWeight: 500,
                  }}
                >
                  -14% vs last month
                </span>
                <ArrowUpRight
                  className="w-3.5 h-3.5"
                  style={{ color: "#4ADE80", transform: "rotate(180deg)" }}
                />
              </div>
            </div>
            <p
              style={{
                fontSize: "12px",
                color: "#64748B",
                marginBottom: 20,
              }}
            >
              6-month audit history
            </p>
            <div style={{ height: 180, width: "100%" }}>
              <CustomBarChart data={barData} />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Recent audits */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3
              style={{
                fontSize: "15px",
                fontWeight: 600,
                color: "#F1F5F9",
              }}
            >
              Recent Audit Insights
            </h3>
            <a
              href="/audits"
              className="flex items-center gap-1"
              style={{ fontSize: "13px", color: "#64748B", fontWeight: 500 }}
            >
              View All
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
          <div className="space-y-3">
            {[
              {
                title: "Netflix Standard",
                tag: "Hidden Subscription Found",
                tagColor: "#FB7185",
                tagBg: "rgba(244,63,94,0.1)",
                tagBorder: "rgba(244,63,94,0.2)",
                amount: "-$15.49",
                date: "Apr 10, 2026",
              },
              {
                title: "Whole Foods Market",
                tag: "Necessity",
                tagColor: "#4ADE80",
                tagBg: "rgba(34,197,94,0.1)",
                tagBorder: "rgba(34,197,94,0.2)",
                amount: "-$87.23",
                date: "Apr 9, 2026",
              },
              {
                title: "Amazon Prime",
                tag: "Policy Violation",
                tagColor: "#FB7185",
                tagBg: "rgba(244,63,94,0.1)",
                tagBorder: "rgba(244,63,94,0.2)",
                amount: "-$14.99",
                date: "Apr 8, 2026",
              },
            ].map((tx) => (
              <div
                key={tx.title}
                className="flex items-center justify-between py-3 px-4 rounded-xl transition-colors"
                style={{ background: "rgba(30,41,59,0.5)" }}
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-3.5 h-3.5" style={{ color: "#64748B" }} />
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#F1F5F9",
                    }}
                  >
                    {tx.title}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#64748B",
                      marginLeft: 2,
                    }}
                  >
                    PII Scrubbed
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className="px-3 py-1 rounded-full"
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: tx.tagColor,
                      background: tx.tagBg,
                      border: `1px solid ${tx.tagBorder}`,
                    }}
                  >
                    {tx.tag}
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#F1F5F9",
                      minWidth: 70,
                      textAlign: "right",
                    }}
                  >
                    {tx.amount}
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#64748B",
                      minWidth: 90,
                    }}
                  >
                    {tx.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
