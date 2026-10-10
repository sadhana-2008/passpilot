import { Printer, Download, Compass, FileCheck } from "lucide-react";
import { AgentStatusChip } from "../../components/agents/AgentStatusChip";
import { FeeTable } from "../../components/guidance/FeeTable";
import { StepCard } from "../../components/guidance/StepCard";
import { Button } from "../../components/ui/Button";
import { useCase } from "../../hooks/useCase";

const GUIDANCE_STEPS = [
  {
    stepNumber: 1,
    title: "Complete Online Application & Document Upload",
    duration: "15 - 30 mins",
    summary: "Register on Passport Seva Portal and pay the government fees.",
    details: [
      "Select 'Apply for Fresh Passport/Re-issue of Passport'.",
      "Ensure name matches Aadhaar Card and 10th Standard / Birth Certificate exactly.",
      "Upload self-attested PDF copies of identity, address, and DOB proofs.",
    ],
  },
  {
    stepNumber: 2,
    title: "Affidavit / Annexure 'E' Verification (If Name Differs)",
    duration: "1 day",
    summary: "Resolve minor typographical or initials variance with a sworn declaration.",
    details: [
      "Under MEA GSR 570(E), minor spelling differences do not require a deed poll or gazette notification.",
      "Print PassPilot's prepared Annexure E draft.",
      "Present along with original Aadhaar card at Counter A.",
    ],
  },
  {
    stepNumber: 3,
    title: "Visit Passport Seva Kendra (PSK) Counter Sequence",
    duration: "45 mins at PSK",
    summary: "Biometrics, document inspection, and Granting Officer sign-off.",
    details: [
      "Counter A (TCS): Biometric capture, photo, fingerprints, and scanning.",
      "Counter B (Verifying Officer): Physical scrutiny of original documents.",
      "Counter C (Granting Officer): Final approval or discretionary handoff.",
    ],
  },
  {
    stepNumber: 4,
    title: "Police Verification & Speed Post Dispatch",
    duration: "7 - 14 days",
    summary: "Local police station inquiry and passport printing at Security Press.",
    details: [
      "Keep original address proof ready for the local Beat Officer visit.",
      "Track Speed Post consignment tracking code via SMS / Portal.",
    ],
  },
];

export default function GuidancePage() {
  const { state } = useCase();

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const text = `PassPilot Official Checklist\nApplicant: ${state.applicant}\nCase Type: ${state.caseType}\n\nChecklist Items:\n${state.checklist
      .map((c) => `- ${c.item} [${c.status.toUpperCase()}]: ${c.note}`)
      .join("\n")}\n\nGuidance only. Verify on https://passportindia.gov.in`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PassPilot_Checklist_${state.applicant.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
      {/* ── Top Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <AgentStatusChip agent="Guidance Agent" status="Active" />
          <h2 className="text-base font-bold text-text mt-1 flex items-center gap-2">
            <Compass size={18} className="text-accent" />
            Statutory Guidance, Forms & Fee Calculator
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer size={13} />
            <span>Print</span>
          </Button>
          <Button variant="secondary" size="sm" onClick={handleDownload}>
            <Download size={13} />
            <span>Export Checklist</span>
          </Button>
        </div>
      </div>

      {/* ── Step-by-Step Procedure ─────────────────────────────────── */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
          <FileCheck size={14} className="text-accent" />
          Step-by-Step Passport Application Journey
        </h3>
        <div className="space-y-2.5">
          {GUIDANCE_STEPS.map((s) => (
            <StepCard key={s.stepNumber} {...s} />
          ))}
        </div>
      </div>

      {/* ── Fee Structure Table ────────────────────────────────────── */}
      <div>
        <FeeTable />
      </div>
    </div>
  );
}
