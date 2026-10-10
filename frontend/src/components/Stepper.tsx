/**
 * Stepper.tsx
 * Horizontal 4-step progress stepper shown in the header.
 * Steps: Intake → Documents → Fix → Book
 */

/** Step metadata */
interface Step {
  label: string;
  /** 1-based step number */
  number: number;
}

const STEPS: Step[] = [
  { label: "Intake", number: 1 },
  { label: "Documents", number: 2 },
  { label: "Fix", number: 3 },
  { label: "Book", number: 4 },
];

interface StepperProps {
  /** Currently active step (1-based). Defaults to 1. */
  activeStep?: number;
}

export default function Stepper({ activeStep = 1 }: StepperProps) {
  return (
    <nav className="flex items-center gap-1" aria-label="Passport application progress steps">
      <ol className="flex items-center gap-1 list-none p-0 m-0">
        {STEPS.map((step, idx) => {
          const isActive = step.number === activeStep;
          const isCompleted = step.number < activeStep;

          return (
            <li key={step.number} className="flex items-center gap-1">
              {/* Connector line (not before first step) */}
              {idx > 0 && (
                <div
                  className={`w-8 h-px transition-colors ${
                    isCompleted ? "bg-accent" : "bg-border"
                  }`}
                  aria-hidden="true"
                />
              )}

              {/* Step indicator */}
              <div
                aria-current={isActive ? "step" : undefined}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full transition-colors select-none
                  ${
                    isActive
                      ? "bg-accent text-accent-text font-semibold shadow-xs"
                      : isCompleted
                        ? "bg-raised text-text"
                        : "bg-transparent text-text-muted"
                  }
                `}
              >
                {/* Step number circle */}
                <span
                  className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-semibold leading-none
                    ${
                      isActive
                        ? "bg-white/20 text-accent-text"
                        : isCompleted
                          ? "bg-accent/20 text-accent"
                          : "bg-border text-text-muted"
                    }
                  `}
                  aria-hidden="true"
                >
                  {isCompleted ? "✓" : step.number}
                </span>
                <span>{step.label}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
