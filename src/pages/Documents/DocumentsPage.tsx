import { useState } from "react";
import { RefreshCw, CheckCircle2 } from "lucide-react";
import { AgentStatusChip } from "../../components/agents/AgentStatusChip";
import { AgentHandoffBanner } from "../../components/agents/AgentHandoffBanner";
import DocumentsView from "../../components/DocumentsView";
import { Button } from "../../components/ui/Button";
import { useCase } from "../../hooks/useCase";

export function DocumentsPage() {
  const { state, dispatch } = useCase();
  const [isRechecking, setIsRechecking] = useState(false);
  const [recheckSuccess, setRecheckSuccess] = useState(false);

  const hasIssues = state.checklist.some((c) => c.status === "issue");

  const handleRecheck = () => {
    setIsRechecking(true);
    setRecheckSuccess(false);
    setTimeout(() => {
      setIsRechecking(false);
      setRecheckSuccess(true);
      dispatch({
        type: "ADD_TRACE",
        payload: {
          agent: "Document agent",
          tool: "revalidate_all_documents",
          result: "PASS",
          detail: "All active checklist items re-audited against MEA rule engine",
          time: new Date().toTimeString().substring(0, 5),
        },
      });
      setTimeout(() => setRecheckSuccess(false), 3000);
    }, 1200);
  };

  return (
    <div className="h-full flex flex-col p-4 space-y-3 max-w-7xl mx-auto overflow-hidden">
      {/* ── Top Bar ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-border">
        <div>
          <AgentStatusChip agent="Document Checker Agent" status="Active" />
          <h2 className="text-sm font-semibold text-text mt-1">
            Pre-Submission OCR & Cross-Document Field Verification
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {recheckSuccess && (
            <span className="text-xs text-ok flex items-center gap-1">
              <CheckCircle2 size={14} /> Re-check finished
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRecheck}
            isLoading={isRechecking}
          >
            <RefreshCw size={13} className={isRechecking ? "animate-spin" : ""} />
            <span>Re-Check Documents</span>
          </Button>
        </div>
      </div>

      {/* ── Handoff Alert if Issue Detected ──────────────────────── */}
      {hasIssues && (
        <AgentHandoffBanner
          fromAgent="Document Checker Agent"
          toAgent="Granting Officer Review"
          reason="Name spelling discrepancy ('Meenakshi R' vs 'Meenakshi Raghavan') flagged on Birth Certificate."
        />
      )}

      {/* ── Core Document Workspace ──────────────────────────────── */}
      <div className="flex-1 min-h-0">
        <DocumentsView />
      </div>
    </div>
  );
}

export default DocumentsPage;
