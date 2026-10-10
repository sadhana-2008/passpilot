import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "ok" | "issue" | "needed" | "neutral" | "accent";
  size?: "sm" | "md";
}

export function Badge({
  children,
  variant = "neutral",
  size = "md",
  className = "",
  ...props
}: BadgeProps) {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  const variantClasses = {
    ok: "bg-ok-bg text-ok border-ok/30",
    issue: "bg-issue-bg text-issue border-issue/30",
    needed: "bg-needed-bg text-needed border-needed/30",
    neutral: "bg-raised text-text-secondary border-border",
    accent: "bg-accent-bg text-accent border-accent/30",
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border select-none transition-colors ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          variant === "ok"
            ? "bg-ok"
            : variant === "issue"
            ? "bg-issue"
            : variant === "needed"
            ? "bg-needed"
            : variant === "accent"
            ? "bg-accent"
            : "bg-text-muted"
        }`}
        aria-hidden="true"
      />
      {children}
    </span>
  );
}
