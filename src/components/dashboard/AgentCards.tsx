import { useNavigate } from "react-router-dom";
import { MessageSquare, FileCheck2, Compass, Clock, ArrowRight } from "lucide-react";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";

export function AgentCards() {
  const navigate = useNavigate();

  const agents = [
    {
      name: "Intake Agent",
      role: "Conversational intake & category profiling",
      status: "Active",
      badgeVariant: "ok" as const,
      lastAction: "Processed applicant bio & category details",
      path: "/intake",
      icon: <MessageSquare size={18} className="text-accent" />,
    },
    {
      name: "Document Checker",
      role: "Cross-document verification & OCR validation",
      status: "Review Needed",
      badgeVariant: "issue" as const,
      lastAction: "Detected name variation on Birth Certificate",
      path: "/documents",
      icon: <FileCheck2 size={18} className="text-issue" />,
    },
    {
      name: "Guidance Agent",
      role: "Statutory rules, Annexure drafting & fees",
      status: "Ready",
      badgeVariant: "ok" as const,
      lastAction: "Annexure E sworn affidavit draft prepared",
      path: "/guidance",
      icon: <Compass size={18} className="text-ok" />,
    },
    {
      name: "Status & Follow-up",
      role: "Application timeline & appointment tracker",
      status: "Scheduled",
      badgeVariant: "neutral" as const,
      lastAction: "Target PSK appointment pending document fix",
      path: "/status",
      icon: <Clock size={18} className="text-text-secondary" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {agents.map((ag) => (
        <Card
          key={ag.name}
          className="flex flex-col justify-between p-4 hover:border-accent/40 transition-colors"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-raised border border-border">
                {ag.icon}
              </div>
              <Badge variant={ag.badgeVariant} size="sm">
                {ag.status}
              </Badge>
            </div>
            <h4 className="text-xs font-bold text-text">{ag.name}</h4>
            <p className="text-[11px] text-text-muted mt-0.5 line-clamp-1">{ag.role}</p>
            <div className="mt-3 p-2 rounded bg-raised/60 border border-border/50 text-[10px] text-text-secondary">
              <strong className="text-text">Latest:</strong> {ag.lastAction}
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate(ag.path)}
            className="mt-3 w-full py-1.5 px-2.5 rounded bg-raised hover:bg-border/60 text-xs font-semibold text-text flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Open Agent</span>
            <ArrowRight size={12} />
          </button>
        </Card>
      ))}
    </div>
  );
}
