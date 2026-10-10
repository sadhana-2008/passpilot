/**
 * ActivityPanel.tsx
 * Right panel (320 px) with two tabs: "Activity" and "Handoff".
 *
 * Tab 1 - Activity:
 *  - Compact timeline with two lines per event.
 *  - Tool name in mono font with small PASS / FAIL / BLOCKED badge. Long names wrap.
 *  - Clicking an event expands its detail with an animated height transition.
 *  - Keyboard support for tabs and events.
 *  - Empty state when trace is empty.
 *
 * Tab 2 - Handoff:
 *  - Card titled "Recommendation, pending officer review"
 *  - Sections: Applicant, Flags found, Drafts prepared, Recommended next step
 *  - Muted note: "Prepared by PassPilot. Not an approval."
 */

import { useCase } from "../state/caseReducer";
import type { TraceResult } from "../types";

/* ── Result badge (14% tint, 1px border) ────────────────────────────── */

function ResultBadge({ result }: { result: TraceResult }) {
  const map: Record<TraceResult, { bg: string; text: string; border: string }> = {
    PASS: { bg: "bg-ok-bg", text: "text-ok", border: "border-ok/30" },
    FAIL: { bg: "bg-needed-bg", text: "text-needed", border: "border-needed/30" },
    BLOCKED: { bg: "bg-issue-bg", text: "text-issue", border: "border-issue/30" },
  };

  const c = map[result] || map.PASS;

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-semibold shrink-0 tracking-wider select-none border ${c.bg} ${c.text} ${c.border}`}
      role="status"
    >
      {result}
    </span>
  );
}

export default function ActivityPanel() {
  const { state, dispatch, readiness } = useCase();

  return (
    <aside className="flex flex-col rounded-[var(--radius-panel)] border border-border bg-panel min-h-0">
      {/* ── Tabs header ────────────────────────────────────────── */}
      <div
        className="flex items-center border-b border-border shrink-0 px-2 pt-1.5 bg-raised/30"
        role="tablist"
        aria-label="Activity and handoff information"
      >
        <button
          type="button"
          role="tab"
          id="tab-activity"
          aria-selected={state.activeTab === "activity"}
          aria-controls="panel-activity"
          tabIndex={state.activeTab === "activity" ? 0 : -1}
          onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: "activity" })}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") {
              dispatch({ type: "SET_ACTIVE_TAB", payload: "handoff" });
              document.getElementById("tab-handoff")?.focus();
            }
          }}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-accent
            ${
              state.activeTab === "activity"
                ? "border-accent text-accent"
                : "border-transparent text-text-muted hover:text-accent hover:border-accent/40"
            }
          `}
        >
          Activity
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-raised text-text-muted" aria-label={`${state.trace.length} events logged`}>
            {state.trace.length}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          id="tab-handoff"
          aria-selected={state.activeTab === "handoff"}
          aria-controls="panel-handoff"
          tabIndex={state.activeTab === "handoff" ? 0 : -1}
          onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: "handoff" })}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") {
              dispatch({ type: "SET_ACTIVE_TAB", payload: "activity" });
              document.getElementById("tab-activity")?.focus();
            }
          }}
          className={`relative flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-accent
            ${
              state.activeTab === "handoff"
                ? "border-accent text-accent"
                : "border-transparent text-text-muted hover:text-accent hover:border-accent/40"
            }
          `}
        >
          Handoff
          {state.handoffHasDot && (
            <span
              className="w-1.5 h-1.5 rounded-full bg-issue animate-pulse"
              aria-label="New notification on handoff tab"
            />
          )}
        </button>
      </div>

      {/* ── Tab Content ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-3 py-3 min-h-0">
        {state.activeTab === "activity" ? (
          /* ── Tab 1: Activity Timeline ───────────────────────────── */
          <div
            id="panel-activity"
            role="tabpanel"
            aria-labelledby="tab-activity"
            className="space-y-2"
          >
            {state.trace.length === 0 ? (
              <div className="text-center py-8 text-xs text-text-muted space-y-1">
                <p className="font-medium text-text">No activity yet</p>
                <p>Events and tool evaluations will appear here in real-time.</p>
              </div>
            ) : (
              state.trace.map((entry, idx) => {
                const isExpanded = state.expandedTraceIndex === idx;

                return (
                  <div
                    key={`${entry.tool}-${idx}`}
                    role="button"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                    aria-label={`Event ${idx + 1}: ${entry.agent} ran tool ${entry.tool} with result ${entry.result}. Click to toggle details.`}
                    onClick={() => dispatch({ type: "TOGGLE_EXPAND_TRACE", payload: idx })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        dispatch({ type: "TOGGLE_EXPAND_TRACE", payload: idx });
                      }
                    }}
                    className={`rounded-[var(--radius-button)] border border-border bg-raised p-2.5 transition-all cursor-pointer hover:border-accent/40 focus-visible:outline-2 focus-visible:outline-accent ${
                      idx === state.trace.length - 1 ? "animate-in fade-in slide-in-from-bottom-2 duration-300" : ""
                    }`}
                  >
                    {/* Line 1: agent name and time */}
                    <div className="flex items-center justify-between text-[11px] text-text-secondary mb-1">
                      <span className="font-medium text-text truncate pr-2">{entry.agent}</span>
                      <span className="text-[10px] text-text-muted font-mono shrink-0">{entry.time}</span>
                    </div>

                    {/* Line 2: tool name in mono font + small PASS/FAIL/BLOCKED badge */}
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-xs text-accent break-all leading-snug">
                        {entry.tool}
                      </span>
                      <ResultBadge result={entry.result} />
                    </div>

                    {/* Animated height transition for detail */}
                    <div
                      className={`grid transition-[grid-template-rows,opacity] duration-250 ease-out ${
                        isExpanded ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="pt-2 border-t border-border/60 text-xs text-text-secondary leading-relaxed bg-panel/40 p-2 rounded">
                          <span className="text-[10px] text-text-muted uppercase tracking-wider block mb-1">Detail</span>
                          {entry.detail}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {state.trace.length > 0 && (
              <p className="text-[11px] text-text-muted text-center pt-2 select-none">
                Click any event to inspect parameters & outputs
              </p>
            )}
          </div>
        ) : (
          /* ── Tab 2: Handoff ─────────────────────────────────────── */
          <div
            id="panel-handoff"
            role="tabpanel"
            aria-labelledby="tab-handoff"
            className="space-y-3"
          >
            <div className="rounded-[var(--radius-panel)] border border-border bg-raised p-3.5 space-y-3.5 shadow-sm">
              {/* Header */}
              <div className="border-b border-border/80 pb-2.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full bg-issue" aria-hidden="true" />
                  <h3 className="text-xs font-semibold text-text tracking-tight uppercase">
                    Recommendation
                  </h3>
                </div>
                <p className="text-xs font-medium text-text-secondary">
                  Pending officer review
                </p>
              </div>

              {/* Section: Applicant */}
              <div>
                <span className="text-[10px] uppercase font-semibold text-text-muted tracking-wider block mb-1">
                  Applicant
                </span>
                <p className="text-xs text-text font-medium">
                  {state.applicant} <span className="text-text-muted font-normal">({state.caseType})</span>
                </p>
              </div>

              {/* Section: Flags found */}
              <div>
                <span className="text-[10px] uppercase font-semibold text-text-muted tracking-wider block mb-1">
                  Flags found
                </span>
                <ul className="text-xs text-text-secondary space-y-1">
                  <li className="flex items-start gap-1.5">
                    <span className="text-issue mt-0.5" aria-hidden="true">•</span>
                    <span>
                      <strong>Name mismatch:</strong> Birth cert 'Meenakshi R' vs Photo ID 'Meenakshi Raghavan'
                    </span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-issue mt-0.5" aria-hidden="true">•</span>
                    <span>
                      <strong>Address proof date:</strong> 5 months old (statutory limit: 3 months)
                    </span>
                  </li>
                </ul>
              </div>

              {/* Section: Drafts prepared */}
              <div>
                <span className="text-[10px] uppercase font-semibold text-text-muted tracking-wider block mb-1">
                  Drafts prepared
                </span>
                <p className="text-xs text-text-secondary leading-relaxed bg-panel/60 p-2 rounded border border-border/50">
                  {readiness >= 78
                    ? "Annexure E Name Clarification Declaration generated & attached to dossier."
                    : "Annexure E Name Clarification Declaration template queued for generation."}
                </p>
              </div>

              {/* Section: Recommended next step */}
              <div>
                <span className="text-[10px] uppercase font-semibold text-text-muted tracking-wider block mb-1">
                  Recommended next step
                </span>
                <p className="text-xs text-text leading-relaxed">
                  {readiness >= 90
                    ? "Verify uploaded alternative address document and authorize biometric appointment."
                    : "Require applicant to submit refreshed utility bill or bank statement dated within 90 days."}
                </p>
              </div>

              {/* Muted note */}
              <div className="pt-2 border-t border-border/80">
                <p className="text-[11px] text-text-muted text-center italic select-none">
                  Prepared by PassPilot. Not an approval.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
