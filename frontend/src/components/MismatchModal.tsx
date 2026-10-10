/**
 * MismatchModal.tsx
 * Centered modal (480px, 12px radius, dimmed backdrop, fade and scale animation).
 * Header: amber dot (#F2A65A) and title.
 * Body: two columns comparing conflicting values in Issue tone (#F2A65A).
 * Footer: primary and secondary button in violet accent.
 */

import { useEffect, useRef } from "react";
import { useCase } from "../state/caseReducer";

export default function MismatchModal() {
  const { state, dispatch } = useCase();
  const currentIssue = state.mismatchQueue[0];
  const modalRef = useRef<HTMLDivElement>(null);
  const primaryBtnRef = useRef<HTMLButtonElement>(null);

  // Close on Escape & trap focus
  useEffect(() => {
    if (!currentIssue) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        dispatch({ type: "DISMISS_MISMATCH" });
      } else if (e.key === "Tab" && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    setTimeout(() => {
      primaryBtnRef.current?.focus();
    }, 50);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIssue, dispatch]);

  if (!currentIssue) return null;

  const handleDismiss = () => {
    if (currentIssue.secondaryAction) {
      currentIssue.secondaryAction();
    }
    dispatch({ type: "DISMISS_MISMATCH" });
  };

  const handlePrimary = () => {
    currentIssue.primaryAction();
    dispatch({ type: "DISMISS_MISMATCH" });
  };

  const handleToolClick = () => {
    dispatch({ type: "SET_ACTIVE_TAB", payload: "activity" });
    const targetIdx = state.trace.findIndex(
      (t) => t.tool === currentIssue.toolName || t.tool === currentIssue.traceToolToSelect
    );
    if (targetIdx !== -1) {
      dispatch({ type: "TOGGLE_EXPAND_TRACE", payload: targetIdx });
    }
    dispatch({ type: "DISMISS_MISMATCH" });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mismatch-modal-title"
      onClick={handleDismiss}
    >
      <div
        ref={modalRef}
        className="w-full max-w-[480px] bg-panel border border-border rounded-[12px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-raised/50">
          <div className="flex items-center gap-2.5">
            <span
              className="w-2.5 h-2.5 rounded-full bg-issue shrink-0 animate-pulse"
              aria-hidden="true"
            />
            <h3
              id="mismatch-modal-title"
              className="text-sm font-semibold text-text tracking-tight"
            >
              {currentIssue.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Close dialog"
            className="text-text-muted hover:text-accent hover:bg-raised text-sm w-7 h-7 flex items-center justify-center rounded transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-accent"
          >
            ✕
          </button>
        </div>

        {/* ── Body ──────────────────────────────────────────────── */}
        <div className="p-5 space-y-4">
          {/* Two comparison columns */}
          <div className="grid grid-cols-2 gap-3">
            {/* Column A */}
            <div className="bg-raised rounded-[var(--radius-button)] p-3 border border-border/80">
              <span className="block text-[11px] font-medium text-text-muted mb-1.5 uppercase tracking-wider">
                {currentIssue.docA}
              </span>
              <div className="text-sm text-text font-mono font-medium break-words">
                {currentIssue.highlightA ? (
                  <>
                    {currentIssue.valA.split(currentIssue.highlightA)[0]}
                    <span className="bg-issue-bg text-issue px-1 py-0.5 rounded border border-issue/40 font-semibold">
                      {currentIssue.highlightA}
                    </span>
                    {currentIssue.valA.split(currentIssue.highlightA)[1]}
                  </>
                ) : (
                  currentIssue.valA
                )}
              </div>
            </div>

            {/* Column B */}
            <div className="bg-raised rounded-[var(--radius-button)] p-3 border border-border/80">
              <span className="block text-[11px] font-medium text-text-muted mb-1.5 uppercase tracking-wider">
                {currentIssue.docB}
              </span>
              <div className="text-sm text-text font-mono font-medium break-words">
                {currentIssue.highlightB ? (
                  <>
                    {currentIssue.valB.split(currentIssue.highlightB)[0]}
                    <span className="bg-issue-bg text-issue px-1 py-0.5 rounded border border-issue/40 font-semibold">
                      {currentIssue.highlightB}
                    </span>
                    {currentIssue.valB.split(currentIssue.highlightB)[1]}
                  </>
                ) : (
                  currentIssue.valB
                )}
              </div>
            </div>
          </div>

          {/* Explanation sentence */}
          <p className="text-xs text-text-secondary leading-relaxed">
            {currentIssue.explanation}
          </p>

          <p className="text-[11px] text-text-muted italic">
            Final decision is made by an officer.
          </p>
        </div>

        {/* ── Footer ────────────────────────────────────────────── */}
        <div className="px-5 py-3.5 bg-raised/30 border-t border-border flex items-center justify-between">
          {/* Clickable tool trace shortcut */}
          <button
            type="button"
            onClick={handleToolClick}
            aria-label={`Open tool ${currentIssue.toolName} in Activity timeline`}
            className="text-[11px] font-mono text-text-muted hover:text-accent transition-colors flex items-center gap-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-accent rounded px-1"
            title="Inspect in Activity timeline"
          >
            <span>tool:</span>
            <span className="underline decoration-dotted">{currentIssue.toolName}</span>
          </button>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDismiss}
              aria-label={currentIssue.secondaryLabel}
              className="px-3 py-1.5 rounded-[var(--radius-button)] text-xs text-text-secondary hover:text-accent hover:border-accent/40 hover:bg-raised transition-colors cursor-pointer border border-border focus-visible:outline-2 focus-visible:outline-accent"
            >
              {currentIssue.secondaryLabel}
            </button>
            <button
              ref={primaryBtnRef}
              type="button"
              onClick={handlePrimary}
              aria-label={currentIssue.primaryLabel}
              className="px-3.5 py-1.5 rounded-[var(--radius-button)] bg-accent text-accent-text text-xs font-semibold hover:bg-accent-hover transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-accent"
            >
              {currentIssue.primaryLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
