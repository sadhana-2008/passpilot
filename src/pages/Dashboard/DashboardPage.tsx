import { FileCheck, AlertCircle, Calendar, Clock } from "lucide-react";
import { useCase } from "../../hooks/useCase";
import { ProgressOverview } from "../../components/dashboard/ProgressOverview";
import { AgentCards } from "../../components/dashboard/AgentCards";
import { StatCard } from "../../components/dashboard/StatCard";
import { ActivityFeed } from "../../components/dashboard/ActivityFeed";
import { QuickActions } from "../../components/dashboard/QuickActions";

export default function DashboardPage() {
  const { state, readiness, stage } = useCase();

  const verifiedCount = state.checklist.filter((c) => c.status === "ok").length;
  const missingCount = state.checklist.filter((c) => c.status !== "ok").length;

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      {/* ── Progress & Pipeline Overview ────────────────────────── */}
      <ProgressOverview
        applicant={state.applicant}
        readiness={readiness}
        stage={stage}
        nextActionText={
          missingCount > 0
            ? "Name variance detected on Birth Certificate. Generate Annexure 'E' or re-upload clear scan."
            : "All documents verified! Proceed to schedule PSK Appointment."
        }
        nextActionLink={missingCount > 0 ? "/documents" : "/status"}
      />

      {/* ── Metric Stat Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Documents Verified"
          value={`${verifiedCount} / ${state.checklist.length}`}
          subtitle={`${Math.round((verifiedCount / (state.checklist.length || 1)) * 100)}% verified`}
          icon={<FileCheck size={20} />}
          trendColor="ok"
        />
        <StatCard
          label="Action Items"
          value={missingCount}
          subtitle={missingCount > 0 ? "Requires correction" : "All cleared"}
          icon={<AlertCircle size={20} />}
          trendColor={missingCount > 0 ? "issue" : "ok"}
        />
        <StatCard
          label="PSK Slot Window"
          value="18 Oct 2026"
          subtitle="PSK Saligramam, Chennai"
          icon={<Calendar size={20} />}
          trendColor="accent"
        />
        <StatCard
          label="Docket Age"
          value="2 Days"
          subtitle="Target completion: 3 days"
          icon={<Clock size={20} />}
          trendColor="neutral"
        />
      </div>

      {/* ── 4 Agent Cards ───────────────────────────────────────── */}
      <div>
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2.5">
          Active Multi-Agent Orchestration
        </h3>
        <AgentCards />
      </div>

      {/* ── Activity Feed & Quick Actions ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ActivityFeed traces={state.trace} />
        <QuickActions />
      </div>
    </div>
  );
}
