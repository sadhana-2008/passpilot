/**
 * HandoffView.tsx
 * Full-page Officer Summary View:
 *  - Labeled "Recommendation, pending officer review"
 *  - Sections: Case Dossier, Discrepancies & Flags, Prepared Drafts, Recommended Officer Disposition
 *  - Disclaimer: "Prepared by PassPilot. Not an approval."
 */

import { AlertTriangle, CheckCircle, FileCheck, ShieldAlert } from "lucide-react";
import { useCase } from "../state/caseReducer";

export default function HandoffView() {
  const { state, readiness } = useCase();

  return (
    <div className="flex-1 h-full min-h-0 flex flex-col p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        {/* Header Banner */}
        <div className="p-5 rounded-[var(--radius-panel)] border border-issue/40 bg-issue-bg flex items-start gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-issue/20 flex items-center justify-center shrink-0 text-issue mt-0.5">
            <ShieldAlert size={22} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-issue">
                Officer Review File
              </span>
              <span className="text-[11px] text-text-muted font-mono">
                REF-2026-IN-908
              </span>
            </div>
            <h1 className="text-lg font-bold text-text">
              Recommendation, pending officer review
            </h1>
            <p className="text-xs text-text-secondary mt-1 leading-relaxed">
              Automated pre-verification checks completed by PassPilot agents. Final authority resides exclusively with the designated passport issuing officer.
            </p>
          </div>
        </div>

        {/* Grid of Sections */}
        <div className="grid grid-cols-2 gap-5">
          {/* Section: Applicant & Case Dossier */}
          <div className="p-4 rounded-[var(--radius-panel)] bg-panel border border-border space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <FileCheck size={14} className="text-accent" />
              Applicant Dossier
            </h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-text-muted">Applicant Name</span>
                <span className="font-semibold text-text">{state.applicant}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-text-muted">Application Type</span>
                <span className="text-text">{state.caseType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-text-muted">Computed Readiness</span>
                <span className="font-mono font-semibold text-accent">{readiness}%</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-text-muted">Jurisdiction</span>
                <span className="text-text">Regional Passport Office (Chennai)</span>
              </div>
            </div>
          </div>

          {/* Section: Recommended Next Step */}
          <div className="p-4 rounded-[var(--radius-panel)] bg-panel border border-border space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <CheckCircle size={14} className="text-ok" />
              Recommended Next Step
            </h2>
            <div className="text-xs text-text-secondary leading-relaxed space-y-2">
              <p>
                {readiness >= 90
                  ? "All statutory requirements satisfied or remediated with conforming affidavits. Recommended for biometric appointment approval."
                  : "Review applicant's uploaded address proof documentation and ensure date of issue remains within the statutory 90-day threshold."}
              </p>
              <div className="p-2.5 rounded bg-raised border border-border/80 text-[11px] text-text-secondary font-mono">
                Status: {state.handoff.status}
              </div>
            </div>
          </div>
        </div>

        {/* Section: Flags & Findings */}
        <div className="p-4 rounded-[var(--radius-panel)] bg-panel border border-border space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
            <AlertTriangle size={14} className="text-issue" />
            Flags Found & Remediation Status
          </h2>
          <div className="space-y-2.5">
            {state.checklist.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded bg-raised border border-border text-xs"
              >
                <div>
                  <span className="font-medium text-text block">{item.item}</span>
                  <span className="text-[11px] text-text-muted">{item.note}</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border
                    ${
                      item.status === "ok"
                        ? "bg-ok-bg text-ok border-ok/30"
                        : item.status === "issue"
                          ? "bg-issue-bg text-issue border-issue/30"
                          : "bg-needed-bg text-needed border-needed/30"
                    }
                  `}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Prepared Drafts */}
        <div className="p-4 rounded-[var(--radius-panel)] bg-panel border border-border space-y-2.5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Prepared Drafts
          </h2>
          <div className="p-3 rounded bg-raised border border-border text-xs text-text-secondary leading-relaxed">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-text">Annexure E (Name Clarification Declaration)</span>
              <span className="text-[10px] text-accent font-mono">DRAFTED</span>
            </div>
            <p className="text-[11px] text-text-muted">
              Pre-populated for Meenakshi Raghavan resolving birth certificate initial 'R'. Stored in digital case bundle.
            </p>
          </div>
        </div>

        {/* Muted Disclaimer Footer */}
        <div className="pt-4 border-t border-border text-center">
          <p className="text-xs text-text-muted italic">
            Prepared by PassPilot. Not an approval.
          </p>
        </div>
      </div>
    </div>
  );
}
