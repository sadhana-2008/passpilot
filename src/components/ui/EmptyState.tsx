import React from "react";
import { FolderOpen } from "lucide-react";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon = <FolderOpen size={36} className="text-text-muted" />,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-border bg-panel/40">
      <div className="p-3 mb-3 rounded-full bg-raised text-text-muted">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-text mb-1">{title}</h3>
      <p className="text-xs text-text-secondary max-w-sm mb-4">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
