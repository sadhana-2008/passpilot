import { CheckCircle2, AlertCircle, Clock, Shield } from "lucide-react";
import { Card, CardHeader, CardTitle } from "../ui/Card";
import type { TraceEntry } from "../../types";

export function ActivityFeed({ traces }: { traces: TraceEntry[] }) {
  const getResultIcon = (res: string) => {
    if (res === "PASS") return <CheckCircle2 size={13} className="text-ok shrink-0" />;
    if (res === "FAIL") return <AlertCircle size={13} className="text-needed shrink-0" />;
    return <Clock size={13} className="text-issue shrink-0" />;
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield size={15} className="text-accent" />
          <CardTitle>Recent Multi-Agent Activity</CardTitle>
        </div>
        <span className="text-[11px] text-text-muted">{traces.length} events logged</span>
      </CardHeader>

      <div className="space-y-3 overflow-y-auto max-h-72 pr-1">
        {traces.slice(-5).reverse().map((t, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2.5 p-2 rounded-lg bg-raised/50 border border-border/60 text-xs"
          >
            <div className="mt-0.5">{getResultIcon(t.result)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="font-semibold text-text truncate">{t.agent}</span>
                <span className="text-[10px] text-text-muted font-mono">{t.time}</span>
              </div>
              <p className="text-[11px] text-text-secondary font-mono truncate mt-0.5">
                {t.tool}
              </p>
              <p className="text-[11px] text-text mt-1">{t.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
