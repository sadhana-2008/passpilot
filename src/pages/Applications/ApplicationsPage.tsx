import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderKanban, Plus, ArrowRight, UserCheck } from "lucide-react";
import { Card, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";

interface CaseSummary {
  id: string;
  applicant: string;
  type: string;
  arn: string;
  status: "In Progress" | "Verification Needed" | "Appointment Booked";
  readiness: number;
  lastUpdated: string;
}

const CASES: CaseSummary[] = [
  {
    id: "case-01",
    applicant: "Aarav Sharma",
    type: "Fresh Passport (Normal)",
    arn: "ARN-2026-CH-994821",
    status: "Verification Needed",
    readiness: 60,
    lastUpdated: "Today, 10:14 AM",
  },
  {
    id: "case-02",
    applicant: "Meenakshi Raghavan",
    type: "Passport Renewal (36 pgs)",
    arn: "ARN-2026-TN-481920",
    status: "In Progress",
    readiness: 85,
    lastUpdated: "Yesterday, 4:30 PM",
  },
  {
    id: "case-03",
    applicant: "Rohan V. Kumar",
    type: "Minor Passport (<15 yrs)",
    arn: "ARN-2026-DL-110294",
    status: "Appointment Booked",
    readiness: 100,
    lastUpdated: "06 Oct 2026",
  },
];

export default function ApplicationsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>("all");

  const filteredCases = filter === "all" ? CASES : CASES.filter((c) => c.status === filter);

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-6xl mx-auto">
      {/* ── Top Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <h2 className="text-base font-bold text-text flex items-center gap-2">
            <FolderKanban size={18} className="text-accent" />
            Passport & Consular Applications
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Manage your individual, family, or client dossiers in one place.
          </p>
        </div>

        <Button size="sm" onClick={() => navigate("/intake")}>
          <Plus size={14} />
          <span>New Application</span>
        </Button>
      </div>

      {/* ── Filter Tabs ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {["all", "Verification Needed", "In Progress", "Appointment Booked"].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors cursor-pointer ${
              filter === f
                ? "bg-accent text-white border-accent font-semibold"
                : "bg-raised text-text-secondary border-border hover:text-text"
            }`}
          >
            {f === "all" ? "All Dossiers" : f}
          </button>
        ))}
      </div>

      {/* ── Case Cards List ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCases.map((c) => (
          <Card key={c.id} className="flex flex-col justify-between hover:border-accent/40 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-text-muted">{c.arn}</span>
                <Badge
                  variant={c.status === "Appointment Booked" ? "ok" : c.status === "Verification Needed" ? "issue" : "neutral"}
                  size="sm"
                >
                  {c.status}
                </Badge>
              </div>

              <div className="flex items-center gap-2 mb-1">
                <UserCheck size={16} className="text-accent shrink-0" />
                <h3 className="text-sm font-bold text-text truncate">{c.applicant}</h3>
              </div>

              <p className="text-xs text-text-secondary">{c.type}</p>

              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-text-muted">Readiness</span>
                  <span className="font-semibold text-text">{c.readiness}%</span>
                </div>
                <div className="w-full bg-raised rounded-full h-1.5 overflow-hidden border border-border">
                  <div
                    className={`h-full ${c.readiness === 100 ? "bg-ok" : c.readiness >= 75 ? "bg-accent" : "bg-issue"}`}
                    style={{ width: `${c.readiness}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px]">
              <span className="text-text-muted">{c.lastUpdated}</span>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="text-accent hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
