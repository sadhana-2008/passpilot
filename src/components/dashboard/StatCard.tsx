import React from "react";
import { Card } from "../ui/Card";

export interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trendColor?: "ok" | "issue" | "needed" | "accent";
}

export function StatCard({ label, value, subtitle, icon, trendColor = "accent" }: StatCardProps) {
  const iconBg = {
    ok: "bg-ok-bg text-ok",
    issue: "bg-issue-bg text-issue",
    needed: "bg-needed-bg text-needed",
    accent: "bg-accent-bg text-accent",
  }[trendColor];

  return (
    <Card className="flex items-center gap-4 hover:border-accent/40 transition-colors">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[11px] text-text-secondary font-medium uppercase tracking-wider block truncate">
          {label}
        </span>
        <div className="text-xl font-bold text-text tracking-tight mt-0.5">{value}</div>
        {subtitle && <p className="text-[11px] text-text-muted mt-0.5 truncate">{subtitle}</p>}
      </div>
    </Card>
  );
}
