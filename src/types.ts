/**
 * types.ts – TypeScript types for the PassPilot case data.
 * Mirrors the shape of src/data/mock_case.json and includes demo & mismatch types.
 */

/* ── Checklist ──────────────────────────────────────────────────────── */

/** Status of a single checklist document */
export type ChecklistStatus = "ok" | "issue" | "needed";

export interface ChecklistItem {
  id: string;
  item: string;
  status: ChecklistStatus;
  note: string;
}

/* ── Agent trace ────────────────────────────────────────────────────── */

export type TraceResult = "PASS" | "FAIL" | "BLOCKED";

export interface TraceEntry {
  id?: string;
  agent: string;
  tool: string;
  result: TraceResult;
  detail: string;
  time: string;
}

/* ── Language ───────────────────────────────────────────────────────── */

export type Language = "en" | "ta" | "hi";

/* ── Chat ───────────────────────────────────────────────────────────── */

export type ChatRole = "agent" | "user";

export interface ChatMessage {
  id?: string;
  role: ChatRole;
  text: string;
  type?: "text" | "declaration" | "appointment" | "handoff_banner";
  agentName?: "Intake Agent" | "Document Checker" | "Guidance Agent" | "Status & Follow-up Agent" | "Orchestrator";
  declarationText?: string;
  appointmentData?: {
    location: string;
    date: string;
    time: string;
    reference: string;
  };
  handoffInfo?: {
    fromAgent: string;
    toAgent: string;
    summary: string;
  };
  isStreaming?: boolean;
}

/* ── Handoff ────────────────────────────────────────────────────────── */

export interface Handoff {
  status: string;
  summary: string;
}

/* ── Pipeline stage ─────────────────────────────────────────────────── */

export type Stage = "Intake" | "Documents" | "Fix" | "Book";

/* ── Navigation View ────────────────────────────────────────────────── */

export type NavView = "case" | "documents" | "handoff" | "about";

/* ── Mismatch Dialog Issue ──────────────────────────────────────────── */

export interface MismatchIssue {
  id: string;
  title: string;
  docA: string;
  valA: string;
  highlightA?: string;
  docB: string;
  valB: string;
  highlightB?: string;
  explanation: string;
  primaryLabel: string;
  primaryAction: () => void;
  secondaryLabel: string;
  secondaryAction?: () => void;
  toolName: string;
  traceToolToSelect?: string;
}

/* ── Full case state ────────────────────────────────────────────────── */

export interface SessionInfo {
  user_id: string;
  session_id: string;
}

export interface CaseState {
  applicant: string;
  caseType: string;
  checklist: ChecklistItem[];
  trace: TraceEntry[];
  chat: ChatMessage[];
  handoff: Handoff;
  /** Currently selected checklist item id */
  selectedItemId: string | null;
  /** Active tab in right panel: 'activity' | 'handoff' */
  activeTab: "activity" | "handoff";
  /** Expanded trace index or tool name */
  expandedTraceIndex: number | null;
  /** Whether handoff tab has unread notification dot */
  handoffHasDot: boolean;
  /** Queue of pending mismatch modal issues */
  mismatchQueue: MismatchIssue[];
  /** Friendly error message if data failed to load */
  loadError: string | null;
  /** Active view from left navigation rail */
  currentView: NavView;
  /** Whether an upload simulation is active for a checklist item */
  readingItemId: string | null;
  /** Active backend session info */
  session: SessionInfo | null;
  /** Connection status with FastAPI backend */
  sessionStatus: "connecting" | "connected" | "error";
  /** Active language selection for multilingual guidance (en, ta, hi) */
  language: Language;
}


