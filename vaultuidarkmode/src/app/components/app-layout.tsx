import { NavLink, Outlet } from "react-router";
import {
  LayoutDashboard,
  ScanSearch,
  Upload,
  Settings,
  ShieldCheck,
  Lock,
} from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/audits", icon: ScanSearch, label: "Audits" },
  { to: "/ingest", icon: Upload, label: "Ingest" },
  { to: "/settings", icon: Settings, label: "Vault Settings" },
];

export function AppLayout() {
  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif", background: "#0B0F1A" }}
    >
      {/* Sidebar */}
      <aside
        className="flex flex-col w-[260px] min-w-[260px] h-full border-r"
        style={{
          background:
            "linear-gradient(180deg, #111827 0%, #0F172A 100%)",
          borderColor: "#1E293B",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 pt-8 pb-6">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{
              background: "linear-gradient(135deg, #334155 0%, #475569 100%)",
            }}
          >
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1
              className="tracking-tight"
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#F1F5F9",
                lineHeight: 1.2,
              }}
            >
              VaultAudit
            </h1>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 500,
                color: "#64748B",
                letterSpacing: "0.08em",
              }}
            >
              AI
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 px-3 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className="group"
            >
              {({ isActive }) => (
                <div
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200"
                  style={{
                    background: isActive
                      ? "linear-gradient(135deg, #1E293B 0%, #334155 100%)"
                      : "transparent",
                    color: isActive ? "#F1F5F9" : "#64748B",
                  }}
                >
                  <item.icon
                    className="w-[18px] h-[18px]"
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: isActive ? 600 : 400,
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom card */}
        <div className="px-4 pb-6">
          <div
            className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
            style={{
              background:
                "linear-gradient(135deg, #1E293B 0%, #334155 100%)",
            }}
          >
            <Lock className="w-4 h-4" style={{ color: "#94A3B8" }} />
            <div>
              <p
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#F1F5F9",
                }}
              >
                End-to-End Encrypted
              </p>
              <p style={{ fontSize: "11px", color: "#64748B" }}>
                All data stored locally
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
