import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs",
    md: "px-3.5 py-2 text-sm",
    lg: "px-5 py-2.5 text-base font-medium",
  }[size];

  const variantClasses = {
    primary:
      "bg-accent text-white hover:bg-accent-hover shadow-xs active:translate-y-px",
    secondary:
      "bg-raised text-text hover:bg-border/80 border border-border",
    outline:
      "bg-transparent text-text border border-border hover:border-accent hover:text-accent",
    ghost:
      "bg-transparent text-text-secondary hover:text-text hover:bg-raised/70",
    danger:
      "bg-needed/20 text-needed border border-needed/40 hover:bg-needed/30",
  }[variant];

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-[var(--radius-button)] font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : null}
      {children}
    </button>
  );
}
