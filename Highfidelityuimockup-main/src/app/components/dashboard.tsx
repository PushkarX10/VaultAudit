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

// All charts rendered as pure SVG - no recharts dependency

const doughnutData = [
  { name: "Necessities", value: 3240, color: "#334155" },
  { name: "Recurring", value: 1860, color: "#64748B" },
  { name: "Impulse Spends", value: 720, color: "#94A3B8" },
  { name: "Savings", value: 1580, color: "#CBD5E1" },
  { name: "Other", value: 400, color: "#E2E8F0" },
];

const barData = [
  { month: "Jul", amount: 4200 },
  { month: "Aug", amount: 3800 },
  { month: "Sep", amount: 4600 },
  { month: "Oct", amount: 3900 },
  { month: "Nov", amount: 5100 },
  { month: "Dec", amount: 4400 },
];

// Custom SVG Donut Chart to avoid recharts PieChart duplicate key bug
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
  const gap = 0.03; // radians gap between segments
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

// Custom SVG Bar Chart to avoid recharts duplicate key bug
function CustomBarChart({ data }: { data: { month: string; amount: number }[] }) {
  const maxVal = Math.max(...data.map((d) => d.amount));
  const padding = { top: 10, right: 10, bottom: 28, left: 40 };
  const barGap = 12;

  return (
    <div style={{ width: "100%", height: 180, position: "relative" }}>
      <svg width="100%" height="100%" viewBox="0 0 500 180" preserveAspectRatio="none">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
          const y = padding.top + (1 - pct) * (180 - padding.top - padding.bottom);
          return (
            <line
              key={`grid-${pct}`}
              x1={padding.left}
              x2={500 - padding.right}
              y1={y}
              y2={y}
              stroke="#F1F5F9"
              strokeDasharray="3 3"
            />
          );
        })}
        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
          const y = padding.top + (1 - pct) * (180 - padding.top - padding.bottom);
          const val = Math.round(maxVal * pct);
          return (
            <text
              key={`ylabel-${pct}`}
              x={padding.left - 6}
              y={y + 4}
              textAnchor="end"
              fill="#94A3B8"
              fontSize="11"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              ${val >= 1000 ? `${val / 1000}k` : val}
            </text>
          );
        })}
        {/* Bars */}
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
                fill={isLast ? "#475569" : "#CBD5E1"}
              />
              {/* Cover bottom corners to make them square */}
              <rect
                x={x}
                y={y + barH - r}
                width={barW}
                height={r}
                fill={isLast ? "#475569" : "#CBD5E1"}
              />
              {/* X label */}
              <text
                x={x + barW / 2}
                y={180 - 6}
                textAnchor="middle"
                fill="#94A3B8"
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
      background: "linear-gradient(145deg, #FFFFFF 0%, #F1F5F9 100%)",
      boxShadow:
        "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.8)",
      border: "1px solid rgba(226,232,240,0.6)",
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
              color: "#0F172A",
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
              background: "linear-gradient(135deg, #E2E8F0 0%, #CBD5E1 100%)",
              border: "1px solid #CBD5E1",
            }}
          >
            <Cpu className="w-3.5 h-3.5" style={{ color: "#475569" }} />
            <span
              style={{ fontSize: "12px", fontWeight: 500, color: "#475569" }}
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
                style={{ background: "#F1F5F9" }}
              >
                <HardDrive className="w-5 h-5" style={{ color: "#475569" }} />
              </div>
              <span
                className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#166534",
                  background: "#F0FDF4",
                  border: "1px solid #BBF7D0",
                }}
              >
                <TrendingUp className="w-3 h-3" />
                +12%
              </span>
            </div>
            <p
              style={{ fontSize: "12px", color: "#94A3B8", fontWeight: 500 }}
            >
              Total Processed Offline
            </p>
            <p
              style={{
                fontSize: "32px",
                fontWeight: 700,
                color: "#0F172A",
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
                color: "#94A3B8",
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
                style={{ background: "#F1F5F9" }}
              >
                <ShieldCheck
                  className="w-5 h-5"
                  style={{ color: "#475569" }}
                />
              </div>
              <span
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#166534",
                  background: "#F0FDF4",
                  border: "1px solid #BBF7D0",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "#22C55E" }}
                />
                Secure
              </span>
            </div>
            <p
              style={{ fontSize: "12px", color: "#94A3B8", fontWeight: 500 }}
            >
              Security Status
            </p>
            <p
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "#0F172A",
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
                color: "#94A3B8",
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
                style={{ background: "#F1F5F9" }}
              >
                <Eye className="w-5 h-5" style={{ color: "#475569" }} />
              </div>
              <span
                className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#9F1239",
                  background: "#FFF1F2",
                  border: "1px solid #FECDD3",
                }}
              >
                <TrendingDown className="w-3 h-3" />3 flagged
              </span>
            </div>
            <p
              style={{ fontSize: "12px", color: "#94A3B8", fontWeight: 500 }}
            >
              Audit Alerts
            </p>
            <p
              style={{
                fontSize: "32px",
                fontWeight: 700,
                color: "#0F172A",
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
                color: "#94A3B8",
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
        {/* Doughnut chart */}
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
                  color: "#0F172A",
                }}
              >
                Semantic Budgeting
              </h3>
              <span
                className="px-2.5 py-1 rounded-full"
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "#64748B",
                  background: "#F1F5F9",
                }}
              >
                AI Categorized
              </span>
            </div>
            <p
              style={{
                fontSize: "12px",
                color: "#94A3B8",
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

        {/* Bar chart */}
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
                  color: "#0F172A",
                }}
              >
                Monthly Spend Trend
              </h3>
              <div className="flex items-center gap-1.5">
                <span
                  style={{
                    fontSize: "12px",
                    color: "#166534",
                    fontWeight: 500,
                  }}
                >
                  -14% vs last month
                </span>
                <ArrowUpRight
                  className="w-3.5 h-3.5"
                  style={{ color: "#166534", transform: "rotate(180deg)" }}
                />
              </div>
            </div>
            <p
              style={{
                fontSize: "12px",
                color: "#94A3B8",
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
                color: "#0F172A",
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
                tagColor: "#9F1239",
                tagBg: "#FFF1F2",
                tagBorder: "#FECDD3",
                amount: "-$15.49",
                date: "Apr 10, 2026",
              },
              {
                title: "Whole Foods Market",
                tag: "Necessity",
                tagColor: "#166534",
                tagBg: "#F0FDF4",
                tagBorder: "#BBF7D0",
                amount: "-$87.23",
                date: "Apr 9, 2026",
              },
              {
                title: "Amazon Prime",
                tag: "Policy Violation",
                tagColor: "#9F1239",
                tagBg: "#FFF1F2",
                tagBorder: "#FECDD3",
                amount: "-$14.99",
                date: "Apr 8, 2026",
              },
            ].map((tx) => (
              <div
                key={tx.title}
                className="flex items-center justify-between py-3 px-4 rounded-xl transition-colors"
                style={{ background: "#FAFBFC" }}
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-3.5 h-3.5" style={{ color: "#94A3B8" }} />
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#0F172A",
                    }}
                  >
                    {tx.title}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#94A3B8",
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
                      color: "#0F172A",
                      minWidth: 70,
                      textAlign: "right",
                    }}
                  >
                    {tx.amount}
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#94A3B8",
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