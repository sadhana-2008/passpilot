/**
 * ChatPanel.tsx
 * Center panel – AI chat interface.
 *  - Header with model tag "Gemini Flash"
 *  - 15px message text, compact bubble padding
 *  - User bubbles with lighter raised background than agent bubbles
 *  - Three-dot typing indicator
 *  - Auto-scroll to newest message
 *  - Compact single-row quick-reply chips
 *  - Attach button (paperclip) simulates upload for the currently selected row
 *  - Muted disclaimer below input
 *  - Declaration card with Copy button
 *  - Appointment card
 */

import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCase } from "../state/caseReducer";

/* ── Quick-reply chip labels ────────────────────────────────────────── */

const QUICK_REPLIES = [
  "Draft name declaration",
  "Fix address proof",
  "Just approve it",
];

/* ── Typing indicator dots ──────────────────────────────────────────── */

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 px-1" role="status" aria-label="PassPilot is typing">
      {/* Agent avatar */}
      <div
        className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0"
        aria-hidden="true"
      >
        <span className="text-[10px] font-bold text-accent">PP</span>
      </div>
      {/* Dots */}
      <div className="flex items-center gap-1 bg-panel border border-border rounded-[var(--radius-button)] px-2.5 py-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-text-muted"
            style={{
              animation: "typing-dot 1.2s ease-in-out infinite",
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Declaration Card Component ─────────────────────────────────────── */

function DeclarationCard({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-2 rounded-[var(--radius-button)] border border-border bg-raised/90 p-3 space-y-2 text-xs">
      <div className="flex items-center justify-between border-b border-border/80 pb-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-accent">
          Declaration Draft (Annexure E)
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "Declaration text copied" : "Copy declaration draft text"}
          className="px-2 py-0.5 rounded text-[11px] font-medium bg-panel border border-border text-text hover:text-accent hover:border-accent/40 hover:bg-raised transition-colors cursor-pointer flex items-center gap-1 focus-visible:outline-2 focus-visible:outline-accent"
        >
          {copied ? "✓ Copied" : "Copy text"}
        </button>
      </div>
      <pre className="font-mono text-xs text-text-secondary whitespace-pre-wrap leading-relaxed select-all bg-panel/70 p-2 rounded border border-border/40">
        {text}
      </pre>
      <p className="text-[10px] text-text-muted italic">
        Print on plain paper and sign before submitting at Passport Seva Kendra.
      </p>
    </div>
  );
}

/* ── Appointment Card Component ─────────────────────────────────────── */

function AppointmentCard({
  data,
}: {
  data: { location: string; date: string; time: string; reference: string };
}) {
  return (
    <div className="mt-2 rounded-[var(--radius-button)] border border-ok/40 bg-ok-bg/30 p-3 space-y-1.5 text-xs">
      <div className="flex items-center justify-between border-b border-border/60 pb-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-ok">
          Suggested Appointment Slot
        </span>
        <span className="font-mono text-[10px] text-text-muted">
          {data.reference}
        </span>
      </div>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-text-muted">Center:</span>
          <span className="font-medium text-text">{data.location}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">Date:</span>
          <span className="font-medium text-text">{data.date}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">Time:</span>
          <span className="font-medium text-text">{data.time}</span>
        </div>
      </div>
      <div className="pt-1.5 flex justify-end">
        <button
          type="button"
          aria-label={`Reserve appointment slot for ${data.date} at ${data.time}`}
          className="px-2.5 py-1 rounded-[var(--radius-button)] bg-accent text-accent-text text-xs font-semibold cursor-pointer hover:bg-accent-hover transition-colors focus-visible:outline-2 focus-visible:outline-accent"
        >
          Reserve this slot
        </button>
      </div>
    </div>
  );
}

/* ── Handoff Banner Component ───────────────────────────────────────── */

function HandoffBanner({
  fromAgent,
  toAgent,
  summary,
}: {
  fromAgent: string;
  toAgent: string;
  summary: string;
}) {
  return (
    <div className="w-full my-1 rounded-[var(--radius-button)] border border-accent/30 bg-accent-bg/40 px-3 py-2 text-xs flex items-center gap-2 select-none animate-fade-in">
      <div className="w-5 h-5 rounded-full bg-accent/30 flex items-center justify-center shrink-0 text-accent font-bold text-[10px]">
        ⚡
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 font-semibold text-accent text-[11px] tracking-tight">
          <span>{fromAgent}</span>
          <span className="text-text-muted">→</span>
          <span className="text-text">{toAgent}</span>
        </div>
        <p className="text-[11px] text-text-secondary truncate">{summary}</p>
      </div>
    </div>
  );
}

/* ── Agent Badge Helpers ────────────────────────────────────────────── */

function getAgentTag(name?: string) {
  switch (name) {
    case "Intake Agent":
      return { tag: "INTAKE", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" };
    case "Document Checker":
      return { tag: "DOCS", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" };
    case "Guidance Agent":
      return { tag: "GUIDE", color: "bg-violet-500/20 text-violet-400 border-violet-500/30" };
    case "Status & Follow-up Agent":
      return { tag: "STATUS", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" };
    default:
      return { tag: "CORE", color: "bg-accent/20 text-accent border-accent/30" };
  }
}

/* ── Main panel ─────────────────────────────────────────────────────── */

export default function ChatPanel() {
  const {
    state,
    executeDraftDeclaration,
    executeFixAddress,
    executeJustApprove,
    executeFreeText,
    simulateUploadDocument,
  } = useCase();
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  /* Auto-scroll on new messages or when typing indicator appears */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.chat.length, isTyping]);

  /** Send a message (from input or quick-reply chip) */
  const handleChipClick = (label: string) => {
    if (label === "Draft name declaration") {
      executeDraftDeclaration();
    } else if (label === "Fix address proof") {
      executeFixAddress();
    } else if (label === "Just approve it") {
      executeJustApprove();
    }
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const txt = inputValue;
    setInputValue("");
    setIsTyping(true);
    executeFreeText(txt);
    setTimeout(() => {
      setIsTyping(false);
    }, 600);
  };

  /** Paperclip button simulates upload for the currently selected checklist row */
  const handlePaperclipClick = () => {
    const targetId = state.selectedItemId || "photo";
    simulateUploadDocument(targetId);
  };

  const isReading = state.readingItemId !== null;

  return (
    <section className="flex flex-col rounded-[var(--radius-panel)] border border-border bg-panel min-h-0">
      {/* Panel header: Real-time ADK status */}
      <div className="px-4 py-3 border-b border-border shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-text">PassPilot Chat</h2>
          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-accent/20 text-accent border border-accent/30">
            {state.language === "ta" ? "தமிழ்" : state.language === "hi" ? "हिंदी" : "EN"}
          </span>
        </div>
        <span
          className={`text-[11px] font-medium tracking-tight px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${
            state.sessionStatus === "connected"
              ? "bg-ok-bg text-ok border-ok/30"
              : state.sessionStatus === "connecting"
              ? "bg-issue-bg text-issue border-issue/30"
              : "bg-needed-bg text-needed border-needed/30"
          }`}
          aria-label={`Status: ${state.sessionStatus}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              state.sessionStatus === "connected"
                ? "bg-ok"
                : state.sessionStatus === "connecting"
                ? "bg-issue animate-pulse"
                : "bg-needed"
            }`}
          />
          {state.sessionStatus === "connected"
            ? "Connected (Gemini ADK)"
            : state.sessionStatus === "connecting"
            ? "Connecting…"
            : "Offline"}
        </span>
      </div>

      {/* ── Scrollable message area (15px font, compact bubble padding) ──── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 min-h-0"
        style={{ fontSize: "15px", lineHeight: "1.45" }}
      >
        {state.chat.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10 gap-2">
            <span className="text-2xl text-accent" aria-hidden="true">💬</span>
            <p className="text-sm text-text font-medium">No messages yet</p>
            <p className="text-xs text-text-muted max-w-xs">
              Select one of the suggestion chips below or ask a question to begin.
            </p>
          </div>
        ) : (
          state.chat.map((msg, idx) => {
            const isAgent = msg.role === "agent";

            if (msg.type === "handoff_banner" && msg.handoffInfo) {
              return (
                <HandoffBanner
                  key={msg.id || idx}
                  fromAgent={msg.handoffInfo.fromAgent}
                  toAgent={msg.handoffInfo.toAgent}
                  summary={msg.handoffInfo.summary}
                />
              );
            }

            const agentMeta = getAgentTag(msg.agentName);

            return (
              <div
                key={msg.id || idx}
                className={`flex items-start gap-2 ${
                  isAgent ? "justify-start" : "justify-end"
                }`}
              >
                {/* Agent avatar with identity badge */}
                {isAgent && (
                  <div
                    className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5 select-none"
                    aria-hidden="true"
                    title={msg.agentName || "Orchestrator"}
                  >
                    <span className="text-[10px] font-bold text-accent">
                      {agentMeta.tag.substring(0, 2)}
                    </span>
                  </div>
                )}

                {/* Bubble */}
                <div
                  className={`rounded-[var(--radius-button)] px-3 py-1.5 leading-relaxed
                    ${
                      isAgent
                        ? "bg-panel border border-border text-text"
                        : "bg-[#252530] border border-[#383846] text-[#F3F1EC] shadow-xs"
                    }
                  `}
                  style={{ maxWidth: "85%", fontSize: "15px" }}
                >
                  {/* Agent Header Tag */}
                  {isAgent && (
                    <div className="flex items-center gap-1.5 mb-1 select-none">
                      <span className="text-[11px] font-semibold text-text-secondary">
                        {msg.agentName || "PassPilot Assistant"}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1 py-0.2 rounded border ${agentMeta.color}`}
                      >
                        {agentMeta.tag}
                      </span>
                    </div>
                  )}

                  {msg.isStreaming && !msg.text ? (
                    <div className="py-1">
                      <TypingIndicator />
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">
                      {msg.text}
                      {msg.isStreaming && (
                        <span className="inline-block ml-0.5 text-accent animate-pulse font-mono font-bold">
                          ▋
                        </span>
                      )}
                    </div>
                  )}

                  {/* Optional declaration draft card */}
                  {msg.type === "declaration" && msg.declarationText && (
                    <DeclarationCard text={msg.declarationText} />
                  )}

                  {/* Optional appointment card */}
                  {msg.type === "appointment" && msg.appointmentData && (
                    <AppointmentCard data={msg.appointmentData} />
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {isTyping && <TypingIndicator />}
      </div>

      {/* ── Quick-reply chips + input bar ─────────────────────────── */}
      <div className="px-3 pb-3 pt-2 border-t border-border shrink-0 space-y-2">
        {/* Quick-reply chips */}
        <div
          className="flex items-center gap-1.5 overflow-x-hidden flex-nowrap"
          role="toolbar"
          aria-label="Quick response suggestions"
        >
          {QUICK_REPLIES.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => handleChipClick(label)}
              aria-label={`Send suggested action: ${label}`}
              className="px-2.5 py-0.5 rounded-full border border-border text-[11px] font-medium text-text-secondary hover:text-accent hover:border-accent/40 hover:bg-raised transition-colors cursor-pointer shrink-0 truncate focus-visible:outline-2 focus-visible:outline-accent"
            >
              {label}
            </button>
          ))}
        </div>

        {/* Input bar */}
        <div className="flex items-center gap-2 rounded-[var(--radius-button)] bg-raised border border-border px-3 py-1.5 focus-within:border-accent/50 transition-colors">
          <button
            type="button"
            disabled={isReading}
            onClick={handlePaperclipClick}
            className="text-text-muted hover:text-accent transition-colors shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-accent rounded p-0.5 disabled:opacity-50"
            aria-label="Attach supporting document file (simulates upload for active item)"
            title="Attach document to active checklist row"
          >
            {isReading ? (
              <Loader2 size={15} className="animate-spin text-accent" />
            ) : (
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
              </svg>
            )}
          </button>

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            placeholder={
              state.language === "ta"
                ? "உங்கள் கேள்வியை உள்ளிடவும்..."
                : state.language === "hi"
                ? "अपना प्रश्न दर्ज करें..."
                : "Describe the applicant's situation…"
            }
            className="flex-1 bg-transparent text-sm text-text placeholder:text-text-muted outline-none"
            aria-label="Message PassPilot"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!inputValue.trim()}
            aria-label="Send message"
            className={`px-3 py-1 rounded-[var(--radius-button)] text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-accent
              ${
                inputValue.trim()
                  ? "bg-accent text-accent-text hover:bg-accent-hover"
                  : "bg-accent/30 text-accent-text/50 cursor-not-allowed"
              }
            `}
          >
            Send
          </button>
        </div>

        {/* Mandatory Hackathon Disclaimer */}
        <p className="text-[11px] text-text-muted text-center select-none">
          Guidance only. Always verify on the official Passport Seva / MEA portal.
        </p>
      </div>

      {/* ── Inline keyframe for typing dots ──────────────────────── */}
      <style>{`
        @keyframes typing-dot {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-2px); }
        }
      `}</style>
    </section>
  );
}
