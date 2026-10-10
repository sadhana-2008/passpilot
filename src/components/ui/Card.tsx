import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "raised" | "bordered";
  hoverable?: boolean;
}

export function Card({
  children,
  variant = "default",
  hoverable = false,
  className = "",
  ...props
}: CardProps) {
  const variantStyles = {
    default: "bg-panel border-border",
    raised: "bg-raised border-border",
    bordered: "bg-panel/50 border-border/80 backdrop-blur-sm",
  }[variant];

  return (
    <div
      className={`rounded-[var(--radius-panel)] border p-4 transition-all duration-200 ${variantStyles} ${
        hoverable ? "hover:border-accent/40 hover:shadow-md cursor-pointer" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`flex items-center justify-between pb-3 mb-3 border-b border-border/60 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`text-sm font-semibold text-text tracking-tight ${className}`} {...props}>
      {children}
    </h3>
  );
}
