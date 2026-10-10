import { Clock, Calendar, CheckCircle2, AlertCircle, Bell, MapPin } from "lucide-react";
import { AgentStatusChip } from "../../components/agents/AgentStatusChip";
import { Card, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { useCase } from "../../hooks/useCase";

const TIMELINE_EVENTS = [
  { stage: "Case Initialized", date: "08 Oct 2026", status: "completed", desc: "Profile created, ARN generated" },
  { stage: "Document OCR Ingestion", date: "09 Oct 2026", status: "completed", desc: "Aadhaar, Birth Certificate, Electricity Bill scanned" },
  { stage: "Field Mismatch Flagged", date: "10 Oct 2026", status: "in_progress", desc: "Initial name variation awaiting Annexure E resolution" },
  { stage: "PSK Appointment Scheduled", date: "18 Oct 2026 (Expected)", status: "pending", desc: "Biometric and physical document verification" },
  { stage: "Police Verification", date: "24 Oct 2026 (Est.)", status: "pending", desc: "Beat officer field visit" },
  { stage: "Dispatch & Delivery", date: "02 Nov 2026 (Est.)", status: "pending", desc: "India Post Speed Post tracking" },
];

export default function StatusPage() {
  const { state } = useCase();

  const pendingItems = state.checklist.filter((c) => c.status !== "ok");

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
      {/* ── Top Bar ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <AgentStatusChip agent="Status & Follow-up Agent" status="Active" />
          <h2 className="text-base font-bold text-text mt-1 flex items-center gap-2">
            <Clock size={18} className="text-accent" />
            Application Stage Timeline & Follow-Up Tracker
          </h2>
        </div>

        <Badge variant="issue" size="md">
          Action Required Before Booking
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left 2 Columns: Application Timeline ────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Milestone Progress Tracker</CardTitle>
              <span className="text-[11px] text-text-muted">ARN-2026-CH-994821</span>
            </CardHeader>

            <div className="space-y-4 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
              {TIMELINE_EVENTS.map((evt, idx) => (
                <div key={idx} className="relative flex items-start gap-3">
                  <div
                    className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] ${
                      evt.status === "completed"
                        ? "bg-ok"
                        : evt.status === "in_progress"
                        ? "bg-accent animate-pulse"
                        : "bg-border text-text-muted"
                    }`}
                  >
                    {evt.status === "completed" ? "✓" : idx + 1}
                  </div>

                  <div className="flex-1 min-w-0 bg-raised/50 border border-border/70 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-text">{evt.stage}</span>
                      <span className="text-[11px] font-mono text-text-muted">{evt.date}</span>
                    </div>
                    <p className="text-[11px] text-text-secondary mt-1">{evt.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ── Right Column: Pending Items & PSK Appointment ───────── */}
        <div className="space-y-4">
          {/* PSK Appointment Slot */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar size={15} className="text-accent" />
                <CardTitle>Target Appointment</CardTitle>
              </div>
            </CardHeader>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-text">
                <MapPin size={14} className="text-issue shrink-0" />
                <span className="font-medium">PSK Saligramam, Chennai</span>
              </div>
              <p className="text-[11px] text-text-secondary">
                Slot reservation opens 48 hrs prior. Pre-verification clears you for express Counter B processing.
              </p>
            </div>
          </Card>

          {/* Pending Action Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle size={15} className="text-issue" />
                <CardTitle>Pending Action Items ({pendingItems.length})</CardTitle>
              </div>
            </CardHeader>
            <div className="space-y-2">
              {pendingItems.map((item) => (
                <div key={item.id} className="p-2.5 rounded bg-raised border border-border text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-text">{item.item}</span>
                    <Badge variant={item.status === "issue" ? "issue" : "needed"} size="sm">
                      {item.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-text-muted mt-1">{item.note}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* SMS / WhatsApp Reminder Simulation */}
          <Card>
            <div className="flex items-center gap-2.5 text-xs text-text">
              <Bell size={15} className="text-ok shrink-0" />
              <div>
                <span className="font-semibold block">Automated SMS Reminders Active</span>
                <span className="text-[11px] text-text-muted">+91 98****3210 registered for alerts</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
