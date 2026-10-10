import { useNavigate } from "react-router-dom";
import { AlertCircle, Home } from "lucide-react";
import { Button } from "../../components/ui/Button";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-needed-bg text-needed border border-needed/30 flex items-center justify-center">
        <AlertCircle size={28} />
      </div>
      <h1 className="text-2xl font-bold text-text">404 — Page Not Found</h1>
      <p className="text-xs text-text-secondary max-w-sm">
        The passport readiness page you are looking for does not exist or has been relocated.
      </p>
      <Button onClick={() => navigate("/dashboard")} size="md">
        <Home size={16} />
        <span>Return to Dashboard</span>
      </Button>
    </div>
  );
}
