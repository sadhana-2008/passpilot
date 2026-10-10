export function AgentStatusChip({
  status = "Active",
  agent = "Intake Agent",
}: {
  status?: "Active" | "Analyzing" | "Review" | "Idle";
  agent: string;
}) {
  const isPulse = status === "Active" || status === "Analyzing";

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-raised border border-border text-xs text-text select-none">
      <span
        className={`w-2 h-2 rounded-full ${
          status === "Active"
            ? "bg-ok"
            : status === "Analyzing"
            ? "bg-accent"
            : status === "Review"
            ? "bg-issue"
            : "bg-text-muted"
        } ${isPulse ? "animate-pulse" : ""}`}
      />
      <span className="font-semibold text-text">{agent}</span>
      <span className="text-[10px] text-text-muted font-medium">• {status}</span>
    </div>
  );
}
