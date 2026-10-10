import { ShieldCheck, ArrowRight, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";

export function AgentHandoffBanner({
  fromAgent = "Document Checker",
  toAgent = "Human Verification Officer",
  reason = "Name spelling variance detected between Aadhaar and Birth Certificate.",
}: {
  fromAgent?: string;
  toAgent?: string;
  reason?: string;
}) {
  return (
    <div className="p-3.5 rounded-xl bg-issue-bg border border-issue/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-text shadow-xs">
      <div className="flex items-start gap-2.5">
        <div className="p-1.5 rounded-lg bg-issue/20 text-issue shrink-0">
          <UserCheck size={16} />
        </div>
        <div>
          <div className="flex items-center gap-1.5 font-semibold text-issue">
            <span>Handoff Ready: {fromAgent}</span>
            <ArrowRight size={12} />
            <span>{toAgent}</span>
          </div>
          <p className="text-[11px] text-text-secondary mt-0.5">{reason}</p>
        </div>
      </div>

      <Link
        to="/documents"
        className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-issue hover:bg-issue/90 text-black text-xs font-bold shrink-0 transition-colors"
      >
        <ShieldCheck size={13} />
        <span>Inspect Docket</span>
      </Link>
    </div>
  );
}
