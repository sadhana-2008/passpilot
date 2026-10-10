/**
 * AboutView.tsx
 * Full-page About View:
 *  - What PassPilot checks (name consistency, address recency, biometric requirements)
 *  - Rule sources it cites (Passports Act 1967, MEA Guidelines, ICAO 9303)
 *  - Safety rules:
 *      • Synthetic data only
 *      • Recommends and never approves
 *      • An officer decides
 */

import { BookOpen, Check, ShieldCheck } from "lucide-react";

export default function AboutView() {
  return (
    <div className="flex-1 h-full min-h-0 flex flex-col p-6 overflow-y-auto">
      <div className="max-w-3xl mx-auto w-full space-y-6">
        <div>
          <h1 className="text-xl font-bold text-text">About PassPilot</h1>
          <p className="text-xs text-text-secondary mt-1">
            An AI passport readiness pre-check assistant designed to prevent appointment rejections and streamline document verification.
          </p>
        </div>

        {/* Section 1: What PassPilot checks */}
        <div className="p-5 rounded-[var(--radius-panel)] bg-panel border border-border space-y-3">
          <h2 className="text-sm font-semibold text-text flex items-center gap-2">
            <Check size={16} className="text-accent" />
            What PassPilot Checks
          </h2>
          <ul className="text-xs text-text-secondary space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold">•</span>
              <span>
                <strong>Cross-Document Name Verification:</strong> Checks given names, initials, and expansions across birth certificates, government photo IDs, and educational records.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold">•</span>
              <span>
                <strong>Address Recency Compliance:</strong> Flags utility bills or bank records older than 90 days as non-compliant with standard statutory thresholds.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold">•</span>
              <span>
                <strong>Biometric Standards Inspection:</strong> Evaluates submitted photographs against ICAO portrait specifications (neutral expression, plain white background).
              </span>
            </li>
          </ul>
        </div>

        {/* Section 2: Rule Sources */}
        <div className="p-5 rounded-[var(--radius-panel)] bg-panel border border-border space-y-3">
          <h2 className="text-sm font-semibold text-text flex items-center gap-2">
            <BookOpen size={16} className="text-accent" />
            Statutory & Rule Sources Cited
          </h2>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded bg-raised border border-border">
              <span className="font-semibold text-text block mb-1">Passports Act 1967</span>
              <p className="text-[11px] text-text-muted">Sections 5 & 6 governing statutory citizenship and eligibility criteria.</p>
            </div>
            <div className="p-3 rounded bg-raised border border-border">
              <span className="font-semibold text-text block mb-1">MEA Gazette Orders</span>
              <p className="text-[11px] text-text-muted">Ministry of External Affairs circulars on name discrepancy affidavits (Annexure E).</p>
            </div>
            <div className="p-3 rounded bg-raised border border-border">
              <span className="font-semibold text-text block mb-1">ICAO Doc 9303</span>
              <p className="text-[11px] text-text-muted">International civil aviation machine-readable travel document specifications.</p>
            </div>
          </div>
        </div>

        {/* Section 3: Safety Guardrails */}
        <div className="p-5 rounded-[var(--radius-panel)] bg-panel border border-border space-y-3">
          <h2 className="text-sm font-semibold text-text flex items-center gap-2">
            <ShieldCheck size={16} className="text-ok" />
            Safety & Operational Guardrails
          </h2>
          <div className="space-y-2.5 text-xs text-text-secondary">
            <div className="flex items-start gap-2.5 p-2.5 rounded bg-raised border border-border">
              <span className="text-xs font-bold text-accent">1</span>
              <div>
                <strong className="text-text block">Synthetic Data Only</strong>
                <span className="text-text-muted text-[11px]">
                  All applicant identities, credentials, and OCR extractions in this preview environment are synthetic demonstration artifacts. No real PII is handled.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded bg-raised border border-border">
              <span className="text-xs font-bold text-accent">2</span>
              <div>
                <strong className="text-text block">Recommends and Never Approves</strong>
                <span className="text-text-muted text-[11px]">
                  PassPilot policy strictly prohibits autonomous issuance or approval. Any direct approval attempt is blocked with a recorded audit trace.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded bg-raised border border-border">
              <span className="text-xs font-bold text-accent">3</span>
              <div>
                <strong className="text-text block">An Officer Decides</strong>
                <span className="text-text-muted text-[11px]">
                  The final legal determination and passport grant rests exclusively with authorized Passport Seva Kendra verification officers.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 text-center text-xs text-text-muted">
          PassPilot Engine • Built for rigorous consular pre-screening workflows.
        </div>
      </div>
    </div>
  );
}
