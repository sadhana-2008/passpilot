import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

export function Toast({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}) {
  const icon = {
    success: <CheckCircle2 size={16} className="text-ok shrink-0" />,
    error: <AlertCircle size={16} className="text-needed shrink-0" />,
    info: <Info size={16} className="text-accent shrink-0" />,
  }[toast.type];

  const borderClass = {
    success: "border-ok/30 bg-ok-bg",
    error: "border-needed/30 bg-needed-bg",
    info: "border-accent/30 bg-accent-bg",
  }[toast.type];

  return (
    <div
      role="status"
      className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border shadow-lg text-xs font-medium text-text backdrop-blur-md transition-all duration-200 ${borderClass}`}
    >
      {icon}
      <span className="flex-1">{toast.message}</span>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="p-0.5 text-text-muted hover:text-text rounded transition-colors cursor-pointer"
        aria-label="Dismiss toast"
      >
        <X size={14} />
      </button>
    </div>
  );
}
