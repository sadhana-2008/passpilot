import { RotateCcw } from "lucide-react";
import { Stepper } from "../components/ui/Stepper";
import { useCase } from "../hooks/useCase";
import type { Language } from "../types";

const LANGUAGES: { id: Language; label: string }[] = [
  { id: "en", label: "EN" },
  { id: "ta", label: "தமிழ்" },
  { id: "hi", label: "हिंदी" },
];

export function Topbar() {
  const { state, stage, dispatch } = useCase();

  const handleReset = () => {
    dispatch({ type: "RESET" });
  };

  const handleLanguageChange = (lang: Language) => {
    dispatch({ type: "SET_LANGUAGE", payload: lang });
  };

  return (
    <header className="h-13 shrink-0 bg-panel border-b border-border px-4 flex items-center justify-between z-10">
      {/* ── Left: Case Meta ────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-text tracking-tight">PassPilot</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/20 text-accent font-semibold">
              Bharat Gov
            </span>
          </div>
          <span className="text-[11px] text-text-muted hidden sm:inline">
            {state.caseType} • Case #PP-2026-88
          </span>
        </div>
      </div>

      {/* ── Center: Application Stepper ────────────────────────── */}
      <div className="hidden md:flex items-center">
        <Stepper currentStage={stage} />
      </div>

      {/* ── Right: Controls & Applicant ────────────────────────── */}
      <div className="flex items-center gap-2.5">
        {/* Language selector */}
        <div className="flex items-center bg-raised rounded-md p-0.5 border border-border">
          {LANGUAGES.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => handleLanguageChange(l.id)}
              className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors cursor-pointer ${
                state.language === l.id
                  ? "bg-accent text-white font-semibold"
                  : "text-text-muted hover:text-text"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Demo Reset button */}
        <button
          type="button"
          onClick={handleReset}
          className="px-2 py-1 text-xs text-text-muted hover:text-text rounded border border-border hover:bg-raised flex items-center gap-1 cursor-pointer transition-colors"
          title="Reset Demo Case Data"
        >
          <RotateCcw size={12} />
          <span className="hidden sm:inline">Reset</span>
        </button>

        {/* Synthetic data badge */}
        <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-issue-bg text-issue border border-issue/30">
          <span className="w-1.5 h-1.5 rounded-full bg-issue" />
          Synthetic data
        </span>

        {/* Applicant chip */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-raised border border-border text-xs text-text">
          <div className="w-5 h-5 rounded-full bg-accent/30 text-accent font-bold flex items-center justify-center text-[10px]">
            {state.applicant.charAt(0)}
          </div>
          <span className="font-medium hidden sm:inline">{state.applicant.split(" ")[0]}</span>
        </div>
      </div>
    </header>
  );
}
