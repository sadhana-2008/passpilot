import { useState } from "react";
import { Settings, Globe, Bell, User, ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle } from "../../components/ui/Card";
import { useCase } from "../../hooks/useCase";
import type { Language } from "../../types";

export default function SettingsPage() {
  const { state, dispatch } = useCase();
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);

  const handleLanguage = (lang: Language) => {
    dispatch({ type: "SET_LANGUAGE", payload: lang });
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-4xl mx-auto">
      <div className="pb-3 border-b border-border">
        <h2 className="text-base font-bold text-text flex items-center gap-2">
          <Settings size={18} className="text-accent" />
          System & Profile Settings
        </h2>
        <p className="text-xs text-text-secondary mt-0.5">
          Configure regional language, automated alerts, and client profile.
        </p>
      </div>

      <div className="space-y-4">
        {/* Language Selection */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-accent" />
              <CardTitle>Regional Language Preference</CardTitle>
            </div>
            <span className="text-[11px] text-text-muted">Solving for Bharat</span>
          </CardHeader>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "en" as const, label: "English", sub: "Default" },
              { id: "ta" as const, label: "தமிழ் (Tamil)", sub: "தமிழ்நாடு" },
              { id: "hi" as const, label: "हिंदी (Hindi)", sub: "राजभाषा" },
            ].map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => handleLanguage(l.id)}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  state.language === l.id
                    ? "bg-accent-bg border-accent text-accent font-semibold shadow-xs"
                    : "bg-raised border-border text-text hover:bg-border/60"
                }`}
              >
                <div className="text-xs font-bold">{l.label}</div>
                <div className="text-[10px] text-text-muted mt-0.5">{l.sub}</div>
              </button>
            ))}
          </div>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-issue" />
              <CardTitle>Alerts & Reminders</CardTitle>
            </div>
          </CardHeader>
          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="font-semibold text-text">SMS Appointment Alerts</div>
                <div className="text-[11px] text-text-muted">Send slot reminders 24h before PSK appointment</div>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="w-4 h-4 accent-accent"
              />
            </label>

            <div className="border-t border-border/60 pt-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="font-semibold text-text">Document Mismatch Notifications</div>
                  <div className="text-[11px] text-text-muted">Receive alerts if validation backend discovers issues</div>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 accent-accent"
                />
              </label>
            </div>
          </div>
        </Card>

        {/* Privacy & Profile */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-ok" />
              <CardTitle>Privacy & Data Handling</CardTitle>
            </div>
          </CardHeader>
          <div className="text-xs text-text-secondary space-y-2">
            <p>
              PassPilot runs OCR & neutral field comparison locally with synthetic PII masking. No raw Aadhaar biometric data or physical credentials are saved on remote servers.
            </p>
            <div className="p-2.5 rounded bg-raised border border-border text-[11px] font-mono text-text-muted">
              Application Identifier: ARN-2026-CH-994821 • Schema: MEA-GSR-570(E)
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
