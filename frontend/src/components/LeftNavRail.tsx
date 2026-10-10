/**
 * LeftNavRail.tsx
 * 64px icon rail on the far left with Lucide icons:
 *  - Case (Briefcase)
 *  - Documents (Files)
 *  - Handoff (FileCheck)
 *  - About (Info)
 *
 * Tooltips and visible labels on hover.
 * Active item gets a violet indicator bar on the left.
 */

import {
  Briefcase,
  FileCheck,
  Files,
  Info,
} from "lucide-react";
import { useCase } from "../state/caseReducer";
import type { NavView } from "../types";

interface NavItem {
  id: NavView;
  label: string;
  icon: typeof Briefcase;
}

const NAV_ITEMS: NavItem[] = [
  { id: "case", label: "Case", icon: Briefcase },
  { id: "documents", label: "Documents", icon: Files },
  { id: "handoff", label: "Handoff", icon: FileCheck },
  { id: "about", label: "About", icon: Info },
];

export default function LeftNavRail() {
  const { state, dispatch } = useCase();

  return (
    <nav
      className="w-16 shrink-0 bg-panel border-r border-border flex flex-col items-center py-3 select-none z-20"
      aria-label="Main Navigation"
    >
      {/* Brand logo avatar */}
      <div className="w-10 h-10 rounded-[var(--radius-button)] bg-accent text-accent-text flex items-center justify-center font-bold text-xs mb-6 shadow-sm">
        PP
      </div>

      {/* Nav items */}
      <div className="flex-1 flex flex-col gap-2 w-full px-2" role="tablist">
        {NAV_ITEMS.map((item) => {
          const isActive = state.currentView === item.id;
          const Icon = item.icon;

          return (
            <div key={item.id} className="relative group w-full flex justify-center">
              <button
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={item.label}
                onClick={() => dispatch({ type: "SET_VIEW", payload: item.id })}
                className={`relative w-12 h-12 rounded-[var(--radius-button)] flex flex-col items-center justify-center transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-accent
                  ${
                    isActive
                      ? "bg-accent-bg text-accent font-semibold"
                      : "text-text-muted hover:text-accent hover:bg-raised/70"
                  }
                `}
              >
                {/* Active violet indicator bar */}
                {isActive && (
                  <span
                    className="absolute left-[-8px] top-2.5 bottom-2.5 w-1 rounded-r-full bg-accent"
                    aria-hidden="true"
                  />
                )}

                <Icon size={18} strokeWidth={isActive ? 2.3 : 1.8} />
                <span className="text-[10px] tracking-tight mt-0.5 leading-none">
                  {item.label}
                </span>

                {/* Handoff notification dot if triggered */}
                {item.id === "handoff" && state.handoffHasDot && (
                  <span
                    className="absolute top-2 right-2 w-2 h-2 rounded-full bg-issue animate-pulse"
                    aria-label="New notification"
                  />
                )}
              </button>

              {/* Tooltip on hover */}
              <div
                role="tooltip"
                className="absolute left-16 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded bg-raised border border-border text-xs text-text whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg"
              >
                {item.label} view
              </div>
            </div>
          );
        })}
      </div>

      {/* Subtle version indicator at bottom */}
      <div className="text-[10px] text-text-muted font-mono" title="PassPilot v0.2.0">
        v0.2
      </div>
    </nav>
  );
}
