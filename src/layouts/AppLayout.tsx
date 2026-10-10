import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  FileCheck2,
  Compass,
  Clock,
  FolderKanban,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { Topbar } from "./Topbar";
import { FooterDisclaimer } from "./FooterDisclaimer";
import MismatchModal from "../components/MismatchModal";
import { useCase } from "../hooks/useCase";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/intake", label: "Intake", icon: MessageSquare },
  { path: "/documents", label: "Documents", icon: FileCheck2 },
  { path: "/guidance", label: "Guidance", icon: Compass },
  { path: "/status", label: "Status", icon: Clock },
  { path: "/applications", label: "Cases", icon: FolderKanban },
  { path: "/settings", label: "Settings", icon: Settings },
];

export function AppLayout() {
  const { state } = useCase();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg text-text">
      {/* ── Desktop Sidebar Rail (64px) ─────────────────────────── */}
      <aside
        className="w-16 shrink-0 bg-panel border-r border-border hidden md:flex flex-col items-center py-3 select-none z-20"
        aria-label="Main Navigation"
      >
        {/* Brand logo avatar */}
        <NavLink
          to="/"
          className="w-10 h-10 rounded-[var(--radius-button)] bg-accent text-white flex items-center justify-center font-bold text-xs mb-5 shadow-sm hover:scale-105 transition-transform"
          title="PassPilot Home"
        >
          <ShieldCheck size={20} />
        </NavLink>

        {/* Navigation icons */}
        <nav className="flex-1 flex flex-col gap-1.5 w-full px-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `relative flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors group cursor-pointer ${
                    isActive
                      ? "bg-accent-bg text-accent font-semibold"
                      : "text-text-muted hover:text-text hover:bg-raised/70"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span
                        className="absolute left-[-8px] top-2 bottom-2 w-1 rounded-r-full bg-accent"
                        aria-hidden="true"
                      />
                    )}
                    <Icon size={18} strokeWidth={isActive ? 2.4 : 1.8} />
                    <span className="text-[10px] mt-1 tracking-tight leading-none">
                      {item.label}
                    </span>

                    {/* Notification indicator for documents/handoff */}
                    {item.path === "/documents" && state.handoffHasDot && (
                      <span
                        className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-issue animate-pulse"
                        aria-label="Action required"
                      />
                    )}

                    {/* Tooltip */}
                    <div
                      role="tooltip"
                      className="absolute left-16 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded bg-raised border border-border text-xs text-text whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg"
                    >
                      {item.label}
                    </div>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <span className="text-[10px] text-text-muted font-mono" title="PassPilot v0.3.0">
          v0.3
        </span>
      </aside>

      {/* ── Main Viewport ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Topbar />

        <main className="flex-1 min-h-0 overflow-y-auto bg-bg">
          <Outlet />
        </main>

        <FooterDisclaimer />

        {/* ── Mobile Bottom Navigation Bar ──────────────────────── */}
        <nav
          className="md:hidden h-14 shrink-0 bg-panel border-t border-border flex items-center justify-around px-2 z-20"
          aria-label="Mobile Navigation"
        >
          {NAV_ITEMS.slice(0, 5).map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center p-1 rounded transition-colors ${
                    isActive ? "text-accent font-semibold" : "text-text-muted"
                  }`
                }
              >
                <Icon size={18} />
                <span className="text-[9px] mt-0.5">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <MismatchModal />
    </div>
  );
}
