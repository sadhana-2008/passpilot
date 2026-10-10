/**
 * CasePanel.tsx
 * Left panel (300 px) – Case Overview.
 *  - Real progress ring (64px): dim track, violet arc filled to dynamic readiness %, animated on change.
 *  - Compact checklist rows (56 px each): icon, title, badge (12px, high contrast tinted), note.
 *      Badge tones: Issue -> #F2A65A, Needed -> #EB7A7A, OK -> #6FCF97.
 *  - Clicking a checklist row ONLY selects it (never mutates status).
 *  - Rows with status 'issue' or 'needed' show a small 'Upload' or 'Replace' button that simulates upload.
 *  - Detail view has been moved to the full Documents view.
 */

import { Loader2, Upload } from "lucide-react";
import { useCase } from "../state/caseReducer";
import type { ChecklistStatus } from "../types";

/* ── Status config map (14% tinted, 1px border, high contrast text) ─── */

const STATUS_CFG: Record<
  ChecklistStatus,
  { label: string; bg: string; text: string; border: string; icon: string }
> = {
  ok: {
    label: "OK",
    bg: "bg-ok-bg",
    text: "text-ok",
    border: "border-ok/30",
    icon: "✓",
  },
  issue: {
    label: "Issue",
    bg: "bg-issue-bg",
    text: "text-issue",
    border: "border-issue/30",
    icon: "!",
  },
  needed: {
    label: "Needed",
    bg: "bg-needed-bg",
    text: "text-needed",
    border: "border-needed/30",
    icon: "?",
  },
};

/* ── Real progress ring (dim track, violet arc, animated, unclipped) ─── */

function ReadinessRing({ value }: { value: number }) {
  const size = 68;
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1.5 select-none py-1">
      <div className="relative w-[68px] h-[68px] flex items-center justify-center p-0.5">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90 overflow-visible"
          aria-label={`Readiness score: ${clamped} percent`}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {/* Dim background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#22222D"
            strokeWidth={stroke}
          />
          {/* Muted violet arc filled to readiness % */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#8B7CF6"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition:
                "stroke-dashoffset 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          />
        </svg>

        {/* Center percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-base font-bold text-accent tracking-tight">
            {clamped}%
          </span>
        </div>
      </div>
      <p className="text-[11px] text-text-muted">Readiness score</p>
    </div>
  );
}

/* ── Main panel ─────────────────────────────────────────────────────── */

export default function CasePanel() {
  const { state, readiness, dispatch, simulateUploadDocument } = useCase();

  const handleRowClick = (itemId: string) => {
    // Only selects the row; does NOT alter status
    dispatch({
      type: "SELECT_ITEM",
      payload: state.selectedItemId === itemId ? null : itemId,
    });
  };

  return (
    <aside className="flex flex-col rounded-[var(--radius-panel)] border border-border bg-panel min-h-0">
      {/* Panel header */}
      <div className="px-4 py-3 border-b border-border shrink-0 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text">Case Overview</h2>
        <span className="text-[11px] text-text-muted">{state.caseType}</span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-3.5 py-3 min-h-0">
        {/* Friendly Error State */}
        {state.loadError ? (
          <div className="p-3 rounded-[var(--radius-button)] bg-needed-bg border border-needed/30 text-needed text-xs space-y-1 my-2">
            <p className="font-semibold">Unable to load case file</p>
            <p className="text-[11px] text-text-secondary">{state.loadError}</p>
          </div>
        ) : null}

        {/* ── Applicant name ────────────────────────────────────── */}
        <p className="text-xs text-text-muted mb-0.5">Applicant</p>
        <p
          className="text-sm font-medium text-text mb-2.5 truncate"
          title={state.applicant}
        >
          {state.applicant}
        </p>

        {/* ── Readiness ring (computed dynamically) ─────────────── */}
        <div className="flex justify-center mb-2">
          <ReadinessRing value={readiness} />
        </div>

        {/* ── Documents checklist ───────────────────────────────── */}
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Documents
          </p>
          <button
            type="button"
            onClick={() => dispatch({ type: "SET_VIEW", payload: "documents" })}
            className="text-[11px] text-accent hover:underline cursor-pointer"
          >
            View Dossier →
          </button>
        </div>

        {state.checklist.length === 0 ? (
          <div className="text-center py-6 text-xs text-text-muted">
            No document requirements loaded for this case.
          </div>
        ) : (
          <div className="flex flex-col space-y-2">
            {state.checklist.map((item) => {
              const cfg = STATUS_CFG[item.status];
              const isSelected = state.selectedItemId === item.id;
              const isReading = state.readingItemId === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => handleRowClick(item.id)}
                  aria-label={`${item.item}: status ${cfg.label}. ${item.note}`}
                  className={`p-2.5 rounded-[var(--radius-button)] transition-all cursor-pointer border flex flex-col gap-1.5 focus-within:border-accent/60
                    ${
                      isSelected
                        ? "bg-raised border-accent/60 shadow-xs"
                        : "bg-raised/40 border-border hover:bg-raised hover:border-border/80 text-text-secondary"
                    }
                  `}
                >
                  {/* Top row: icon + title + badge */}
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold shrink-0 border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                        aria-hidden="true"
                      >
                        {cfg.icon}
                      </span>
                      <span className="text-xs font-semibold text-text truncate">
                        {item.item}
                      </span>
                    </div>

                    <span
                      className={`shrink-0 inline-flex items-center px-1.5 py-0.2 rounded text-[11px] font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                    >
                      {cfg.label}
                    </span>
                  </div>

                  {/* Note line */}
                  <p
                    className="text-[11px] text-text-muted leading-tight truncate pl-6"
                    title={item.note}
                  >
                    {item.note}
                  </p>

                  {/* Upload / Replace button for issue or needed */}
                  {item.status !== "ok" && (
                    <div className="pl-6 pt-1 flex justify-end">
                      <button
                        type="button"
                        disabled={isReading}
                        onClick={(e) => {
                          e.stopPropagation();
                          simulateUploadDocument(item.id);
                        }}
                        aria-label={`${item.status === "needed" ? "Upload" : "Replace"} ${item.item}`}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-accent text-accent-text hover:bg-accent-hover transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-accent"
                      >
                        {isReading ? (
                          <>
                            <Loader2 size={11} className="animate-spin" />
                            Reading...
                          </>
                        ) : (
                          <>
                            <Upload size={10} />
                            {item.status === "needed" ? "Upload" : "Replace"}
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
