import React, { useState } from "react";
import { Send, UserCheck, Bot, Sparkles, CheckCircle2 } from "lucide-react";
import { useCase } from "../../hooks/useCase";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { AgentStatusChip } from "../../components/agents/AgentStatusChip";
import { Badge } from "../../components/ui/Badge";

const SUGGESTED_CHIPS = [
  "Apply for Fresh Passport",
  "Re-issue / Passport Renewal",
  "Lost / Damaged Passport",
  "Police Clearance Certificate (PCC)",
  "Minor / Child Passport (Under 18)",
  "Tatkaal Urgent Processing",
];

export default function IntakePage() {
  const { state, executeFreeText } = useCase();
  const [inputText, setInputText] = useState("");

  const handleSend = (textToSend?: string) => {
    const msg = textToSend || inputText;
    if (!msg.trim()) return;
    executeFreeText(msg.trim());
    setInputText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row p-4 gap-4 max-w-7xl mx-auto overflow-hidden">
      {/* ── Left / Main: Conversational Intake Form ───────────────── */}
      <div className="flex-1 flex flex-col min-h-0 bg-panel border border-border rounded-xl overflow-hidden shadow-xs">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border bg-raised flex items-center justify-between">
          <AgentStatusChip agent="Intake Agent" status="Active" />
          <span className="text-[11px] text-text-muted">Conversational Application Setup</span>
        </div>

        {/* Quick Chips */}
        <div className="p-3 border-b border-border/60 bg-panel flex flex-wrap gap-1.5">
          {SUGGESTED_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleSend(chip)}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-raised hover:bg-accent-bg hover:text-accent border border-border text-text-secondary transition-colors cursor-pointer"
            >
              + {chip}
            </button>
          ))}
        </div>

        {/* Chat message history */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {state.chat.map((msg, idx) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={idx}
                className={`flex items-start gap-2.5 max-w-[85%] ${
                  isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser ? "bg-accent text-white" : "bg-raised border border-border text-accent"
                  }`}
                >
                  {isUser ? <UserCheck size={14} /> : <Bot size={14} />}
                </div>

                <div
                  className={`p-3 rounded-xl text-xs leading-relaxed ${
                    isUser
                      ? "bg-accent text-white rounded-tr-none shadow-xs"
                      : "bg-raised border border-border text-text rounded-tl-none shadow-xs"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input box */}
        <div className="p-3 border-t border-border bg-panel flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your category, previous passport number, or requirements..."
            className="flex-1 bg-raised border border-border rounded-lg px-3.5 py-2 text-xs text-text placeholder-text-muted focus:outline-accent"
          />
          <Button size="sm" onClick={() => handleSend()}>
            <Send size={14} />
            <span>Send</span>
          </Button>
        </div>
      </div>

      {/* ── Right Panel: Live Case-Profile Summary ───────────────── */}
      <div className="w-full md:w-80 shrink-0 space-y-3 flex flex-col">
        <Card className="p-4 flex-1">
          <div className="flex items-center gap-2 pb-3 mb-3 border-b border-border">
            <Sparkles size={16} className="text-accent" />
            <h3 className="text-xs font-bold text-text uppercase tracking-wider">
              Live Profile Summary
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] text-text-muted uppercase block">Applicant Full Name</span>
              <span className="font-semibold text-text">{state.applicant}</span>
            </div>

            <div>
              <span className="text-[10px] text-text-muted uppercase block">Passport Service Type</span>
              <span className="font-semibold text-text">{state.caseType}</span>
            </div>

            <div>
              <span className="text-[10px] text-text-muted uppercase block">Application Reference</span>
              <span className="font-mono text-text-secondary">ARN-2026-CH-994821</span>
            </div>

            <div>
              <span className="text-[10px] text-text-muted uppercase block">Jurisdiction Office</span>
              <span className="text-text font-medium">RPO Chennai • PSK Saligramam</span>
            </div>

            <div className="pt-2 border-t border-border">
              <span className="text-[10px] text-text-muted uppercase block mb-1">
                Document Readiness
              </span>
              <div className="space-y-1.5">
                {state.checklist.map((c) => (
                  <div key={c.id} className="flex items-center justify-between text-[11px]">
                    <span className="text-text-secondary truncate max-w-[140px]">{c.item}</span>
                    <Badge variant={c.status === "ok" ? "ok" : c.status === "issue" ? "issue" : "needed"} size="sm">
                      {c.status.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
