import { useNavigate } from "react-router-dom";
import { UploadCloud, MessageSquare, Compass, Clock, Globe } from "lucide-react";
import { Card, CardHeader, CardTitle } from "../ui/Card";
import { useCase } from "../../hooks/useCase";

export function QuickActions() {
  const navigate = useNavigate();
  const { state, dispatch } = useCase();

  const toggleLanguage = () => {
    const nextLang = state.language === "en" ? "hi" : state.language === "hi" ? "ta" : "en";
    dispatch({ type: "SET_LANGUAGE", payload: nextLang });
  };

  const actions = [
    {
      title: "Upload Document",
      desc: "Scan or upload birth certificate & address",
      icon: <UploadCloud size={16} className="text-ok" />,
      onClick: () => navigate("/documents"),
    },
    {
      title: "Ask Intake Agent",
      desc: "Verify eligibility & passport service type",
      icon: <MessageSquare size={16} className="text-accent" />,
      onClick: () => navigate("/intake"),
    },
    {
      title: "Review Fee Schedule",
      desc: "Check Normal vs Tatkaal government fees",
      icon: <Compass size={16} className="text-issue" />,
      onClick: () => navigate("/guidance"),
    },
    {
      title: "Track Application",
      desc: "View PSK appointment & status timeline",
      icon: <Clock size={16} className="text-text-secondary" />,
      onClick: () => navigate("/status"),
    },
    {
      title: `Language (${state.language.toUpperCase()})`,
      desc: "Switch language between English / தமிழ் / हिंदी",
      icon: <Globe size={16} className="text-accent" />,
      onClick: toggleLanguage,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {actions.map((act, i) => (
          <button
            key={i}
            type="button"
            onClick={act.onClick}
            className="flex items-start gap-3 p-3 rounded-lg bg-raised/50 hover:bg-raised border border-border/70 hover:border-accent/40 text-left transition-all cursor-pointer group"
          >
            <div className="p-2 rounded-md bg-panel border border-border/80 group-hover:scale-105 transition-transform">
              {act.icon}
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-text block group-hover:text-accent transition-colors">
                {act.title}
              </span>
              <span className="text-[11px] text-text-muted block truncate mt-0.5">
                {act.desc}
              </span>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}
