/**
 * Header.tsx
 * Top bar – 52 px height. Contains:
 *  - Left:   logo + app name
 *  - Center: stepper (reads derived stage from context)
 *  - Right:  Reset demo button, "Synthetic data only" pill + applicant chip
 */

import type { Language } from "../types";
import { useCase } from "../state/caseReducer";
import Stepper from "./Stepper";

/** Map stage name → step number */
const STAGE_TO_STEP: Record<string, number> = {
  Intake: 1,
  Documents: 2,
  Fix: 3,
  Book: 4,
};

const LANGUAGES: { id: Language; label: string; native: string }[] = [
  { id: "en", label: "EN", native: "English" },
  { id: "ta", label: "தமிழ்", native: "Tamil" },
  { id: "hi", label: "हिंदी", native: "Hindi" },
];

export default function Header() {
  const { state, stage, dispatch } = useCase();
  const activeStep = STAGE_TO_STEP[stage] ?? 1;

  const handleReset = () => {
    dispatch({ type: "RESET" });
  };

  const handleLanguageChange = (lang: Language) => {
    dispatch({ type: "SET_LANGUAGE", payload: lang });
  };

  return (
    <header
      className="flex items-center justify-between px-4 border-b border-border shrink-0 relative bg-panel"
      style={{ height: 52 }}
    >
      {/* ── Left: logo + name ────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <div
          className="flex items-center justify-center w-7 h-7 rounded-[var(--radius-button)] bg-accent text-accent-text text-xs font-bold select-none"
          aria-hidden="true"
        >
          PP
        </div>
        <span className="text-sm font-semibold text-text tracking-tight">
          PassPilot
        </span>
      </div>

      {/* ── Center: stepper ──────────────────────────────────────── */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <Stepper activeStep={activeStep} />
      </div>

      {/* ── Right: Language switcher, pills / chips / reset button ──── */}
      <div className="flex items-center gap-2">
        {/* Multilingual Language Switcher (EN / தமிழ் / हिंदी) */}
        <div
          className="flex items-center bg-raised rounded-full p-0.5 border border-border text-xs"
          role="group"
          aria-label="Language selection"
        >
          {LANGUAGES.map((l) => {
            const active = state.language === l.id;
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => handleLanguageChange(l.id)}
                aria-label={`Switch language to ${l.native}`}
                title={`Switch to ${l.native}`}
                className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
                  active
                    ? "bg-accent text-accent-text font-semibold shadow-xs"
                    : "text-text-secondary hover:text-text"
                }`}
              >
                {l.label}
              </button>
            );
          })}
        </div>

        {/* Small Reset button for demo reruns */}
        <button
          type="button"
          onClick={handleReset}
          aria-label="Reset demo to initial case state"
          className="px-2.5 py-1 rounded-[var(--radius-button)] text-xs text-text-muted hover:text-accent hover:border-accent/40 hover:bg-raised transition-colors cursor-pointer border border-border flex items-center gap-1 focus-visible:outline-2 focus-visible:outline-accent"
          title="Reset demo data to initial state"
        >
          <span className="text-[11px]" aria-hidden="true">↻</span> Reset
        </button>

        {/* Synthetic-data-only pill */}
        <span
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-issue-bg text-issue border border-issue/30 select-none"
          role="status"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-issue" aria-hidden="true" />
          Synthetic data
        </span>

        {/* Applicant chip */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-raised text-xs text-text-secondary select-none border border-border"
          title={`Active applicant: ${state.applicant}`}
        >
          <div
            className="w-5 h-5 rounded-full bg-accent/30 flex items-center justify-center text-[10px] font-semibold text-accent"
            aria-hidden="true"
          >
            {state.applicant.charAt(0)}
          </div>
          <span className="font-medium text-text">{state.applicant.split(" ")[0]}</span>
        </div>
      </div>
    </header>
  );
}

