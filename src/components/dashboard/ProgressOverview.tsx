import { AlertTriangle, ArrowRight, CheckCircle2, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import type { Stage } from "../../types";

export interface ProgressOverviewProps {
  applicant: string;
  readiness: number;
  stage: Stage;
  nextActionText: string;
  nextActionLink: string;
}

const PIPELINE_STEPS: { id: Stage; label: string; agent: string }[] = [
  { id: "Intake", label: "Intake", agent: "Intake Agent" },
  { id: "Documents", label: "Documents", agent: "Document Checker" },
  { id: "Fix", label: "Guidance", agent: "Guidance Agent" },
  { id: "Book", label: "Status", agent: "Status Agent" },
];

export function ProgressOverview({
  applicant,
  readiness,
  stage,
  nextActionText,
  nextActionLink,
}: ProgressOverviewProps) {
  const getStepStatus = (stepId: Stage) => {
    const order: Stage[] = ["Intake", "Documents", "Fix", "Book"];
    const currentIndex = order.indexOf(stage);
    const stepIndex = order.indexOf(stepId);
    if (stepIndex < currentIndex) return "complete";
    if (stepIndex === currentIndex) return "in_progress";
    return "locked";
  };

  return (
    <div className="space-y-4">
      {/* ── Header & Progress Bar ───────────────────────────────── */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-text">Welcome back, {applicant}</h2>
              <Badge variant={readiness >= 80 ? "ok" : "issue"} size="sm">
                {readiness}% Ready
              </Badge>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Current Phase: <strong className="text-accent">{stage}</strong> — Preparing your docket for PSK submission.
            </p>
          </div>

          <div className="w-full sm:w-48 bg-raised rounded-full h-2.5 overflow-hidden border border-border">
            <div
              className={`h-full transition-all duration-500 ${
                readiness >= 80 ? "bg-ok" : readiness >= 50 ? "bg-accent" : "bg-issue"
              }`}
              style={{ width: `${readiness}%` }}
            />
          </div>
        </div>

        {/* ── Pipeline Steps ───────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-border/60">
          {PIPELINE_STEPS.map((step) => {
            const status = getStepStatus(step.id);
            return (
              <div
                key={step.id}
                className={`p-2.5 rounded-lg border text-xs transition-colors ${
                  status === "complete"
                    ? "bg-ok-bg/30 border-ok/30 text-text"
                    : status === "in_progress"
                    ? "bg-accent-bg border-accent text-text font-semibold shadow-xs"
                    : "bg-raised/40 border-border text-text-muted"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{step.label}</span>
                  {status === "complete" ? (
                    <CheckCircle2 size={13} className="text-ok" />
                  ) : status === "in_progress" ? (
                    <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
                  ) : (
                    <span className="text-[10px] text-text-muted">Locked</span>
                  )}
                </div>
                <span className="text-[10px] text-text-secondary block truncate">
                  {step.agent}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── Next Best Action Banner ─────────────────────────────── */}
      <div className="p-4 rounded-xl bg-accent-bg border border-accent/40 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-accent text-white flex items-center justify-center shrink-0">
            <AlertTriangle size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-accent uppercase tracking-wider block">
              Recommended Next Action
            </span>
            <p className="text-xs text-text font-medium truncate mt-0.5">{nextActionText}</p>
          </div>
        </div>

        <Link
          to={nextActionLink}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-semibold shrink-0 transition-colors"
        >
          <span>Resolve Now</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
