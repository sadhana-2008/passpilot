import { useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowRight, FileCheck, CheckCircle2, Sparkles, HelpCircle } from "lucide-react";
import { Button } from "../../components/ui/Button";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="h-full overflow-y-auto px-6 py-10 max-w-6xl mx-auto flex flex-col justify-between">
      {/* ── Hero Section ────────────────────────────────────────── */}
      <div className="text-center space-y-6 pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-bg border border-accent/30 text-accent text-xs font-medium">
          <Sparkles size={14} />
          <span>DevFest 2026: Solving for Bharat</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-text tracking-tight max-w-3xl mx-auto leading-tight">
          AI-Powered Passport & Consular Readiness Assistant
        </h1>

        <p className="text-sm sm:text-base text-text-secondary max-w-2xl mx-auto leading-relaxed">
          PassPilot orchestrates multi-agent intelligence to verify Aadhaar, Birth Certificates,
          and Annexures before you visit the Passport Seva Kendra (PSK) — eliminating rejection loops.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            size="lg"
            onClick={() => navigate("/dashboard")}
            className="shadow-lg shadow-accent/20"
          >
            <span>Start / Resume Application</span>
            <ArrowRight size={18} />
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/guidance")}
          >
            <span>Explore Fee & Policy Rules</span>
          </Button>
        </div>
      </div>

      {/* ── Feature Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 my-10">
        <div className="p-5 rounded-xl border border-border bg-panel hover:border-accent/40 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-ok-bg text-ok flex items-center justify-center mb-3">
            <CheckCircle2 size={20} />
          </div>
          <h3 className="text-base font-semibold text-text mb-1">Pre-Submission Verification</h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Neutral field cross-referencing between Photo ID, DOB proofs, and addresses to flag discrepancies early.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-border bg-panel hover:border-accent/40 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-accent-bg text-accent flex items-center justify-center mb-3">
            <FileCheck size={20} />
          </div>
          <h3 className="text-base font-semibold text-text mb-1">Automated Annexure Drafting</h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            One-click generation of Annexure E sworn declarations for minor spelling variations per MEA guidelines.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-border bg-panel hover:border-accent/40 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-issue-bg text-issue flex items-center justify-center mb-3">
            <ShieldCheck size={20} />
          </div>
          <h3 className="text-base font-semibold text-text mb-1">Human Officer Handoff</h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Curated verification dockets with official Ministry rule citations ready for senior Granting Officer discretion.
          </p>
        </div>
      </div>

      {/* ── Government Compliance Banner ─────────────────────────── */}
      <div className="p-4 rounded-xl bg-raised border border-border flex items-center justify-between text-xs text-text-secondary">
        <div className="flex items-center gap-2.5">
          <HelpCircle size={16} className="text-accent shrink-0" />
          <span>Compliant with Passport Act 1967 and Ministry of External Affairs Gazette GSR 570(E).</span>
        </div>
        <span className="font-mono text-[11px] text-text-muted hidden sm:inline">100% Client-Side Privacy Safe</span>
      </div>
    </div>
  );
}
