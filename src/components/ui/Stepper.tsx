import { Check } from "lucide-react";
import type { Stage } from "../../types";

export interface StepperProps {
  currentStage: Stage;
  onStepClick?: (stage: Stage) => void;
  className?: string;
}

const STAGES: { id: Stage; label: string; stepNumber: number }[] = [
  { id: "Intake", label: "Intake", stepNumber: 1 },
  { id: "Documents", label: "Documents", stepNumber: 2 },
  { id: "Fix", label: "Verification", stepNumber: 3 },
  { id: "Book", label: "Appointment", stepNumber: 4 },
];

export function Stepper({ currentStage, onStepClick, className = "" }: StepperProps) {
  const currentStepNumber =
    STAGES.find((s) => s.id === currentStage)?.stepNumber ?? 1;

  return (
    <nav aria-label="Application Progress" className={`flex items-center gap-1.5 ${className}`}>
      {STAGES.map((s, idx) => {
        const isCompleted = s.stepNumber < currentStepNumber;
        const isCurrent = s.stepNumber === currentStepNumber;

        return (
          <div key={s.id} className="flex items-center gap-1.5">
            {idx > 0 && (
              <div
                className={`w-6 h-0.5 rounded-full transition-colors ${
                  isCompleted ? "bg-accent" : "bg-border"
                }`}
                aria-hidden="true"
              />
            )}
            <button
              type="button"
              onClick={() => onStepClick?.(s.id)}
              disabled={!onStepClick}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                isCurrent
                  ? "bg-accent text-white shadow-xs font-semibold"
                  : isCompleted
                  ? "bg-raised text-text hover:bg-border/60 cursor-pointer"
                  : "bg-transparent text-text-muted cursor-default"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  isCurrent
                    ? "bg-white/20 text-white"
                    : isCompleted
                    ? "bg-accent/20 text-accent font-bold"
                    : "bg-border text-text-muted"
                }`}
              >
                {isCompleted ? <Check size={10} strokeWidth={3} /> : s.stepNumber}
              </span>
              <span>{s.label}</span>
            </button>
          </div>
        );
      })}
    </nav>
  );
}
