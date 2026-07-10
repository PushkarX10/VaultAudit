import { useState } from "react";
import { SidebarNav, PageId } from "./components/sidebar-nav";
import { TopHeader } from "./components/top-header";
import { DashboardPage } from "./pages/DashboardPage";
import { AuditorPage } from "./pages/AuditorPage";
import { TransactionsPage } from "./pages/TransactionsPage";
import { SavingsPage } from "./pages/SavingsPage";
import { StocksPage } from "./pages/StocksPage";
import { OrdersPage } from "./pages/OrdersPage";
import { SettingsPage } from "./pages/SettingsPage";

export default function App() {
  const [page, setPage] = useState<PageId>("dashboard");
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-10%] left-[20%] w-[520px] h-[520px] rounded-full bg-emerald-500/[0.06] blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[520px] h-[520px] rounded-full bg-sky-500/[0.05] blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />
      </div>

      <div className="relative flex min-h-screen">
        <SidebarNav
          active={page}
          onSelect={setPage}
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <TopHeader />
          <main className="flex-1 overflow-y-auto px-8 py-8">
            <div className="max-w-[1400px] mx-auto">
              {page === "dashboard" && <DashboardPage />}
              {page === "auditor" && <AuditorPage />}
              {page === "transactions" && <TransactionsPage />}
              {page === "savings" && <SavingsPage />}
              {page === "stocks" && <StocksPage />}
              {page === "orders" && <OrdersPage />}
              {page === "settings" && <SettingsPage />}
              <div className="pt-8 pb-2 text-center text-[11px] text-white/30 tracking-wide">
                VaultAudit AI · v1.4.0 · Local runtime engaged
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
