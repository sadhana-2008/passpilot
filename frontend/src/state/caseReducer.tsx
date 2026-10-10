/**
 * caseReducer.tsx – useReducer state management + React context for the case.
 *
 * Implements Part 3 & Part 4:
 *  - Dynamic readiness computation: weighted equally across 4 items (ok=25, issue=15, needed=5 -> starts at 60, reaches 100 when all ok).
 *  - Dynamic stage derivation: Documents while any item is needed, Fix while any item is an issue, Book when all ok.
 *  - Row selection only selects and does not mutate status.
 *  - Simulated upload with 1.2s 'Document agent is reading...' state.
 */

import {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import mockData from "../data/mock_case.json";
import type {
  CaseState,
  ChatMessage,
  ChecklistItem,
  MismatchIssue,
  NavView,
  Stage,
  TraceEntry,
} from "../types";

/* ── Compute dynamic readiness ──────────────────────────────────────── */

export function computeReadiness(checklist: ChecklistItem[]): number {
  if (!checklist || checklist.length === 0) return 0;
  // 4 items weighted equally (up to 25 points each = 100 total)
  // ok = 25 points, issue = 15 points, needed = 5 points
  // Initial state: 1 ok (25) + 2 issue (30) + 1 needed (5) = 60!
  const scorePerItem = 100 / checklist.length;
  let total = 0;
  for (const item of checklist) {
    if (item.status === "ok") {
      total += scorePerItem; // 25
    } else if (item.status === "issue") {
      total += scorePerItem * 0.6; // 15
    } else if (item.status === "needed") {
      total += scorePerItem * 0.2; // 5
    }
  }
  return Math.round(total);
}

/* ── Derive dynamic stage ───────────────────────────────────────────── */

export function deriveStage(checklist: ChecklistItem[]): Stage {
  if (!checklist || checklist.length === 0) return "Intake";
  const hasNeeded = checklist.some((c) => c.status === "needed");
  if (hasNeeded) return "Documents";
  const hasIssue = checklist.some((c) => c.status === "issue");
  if (hasIssue) return "Fix";
  return "Book";
}

/* ── Helper to create fresh initial state ───────────────────────────── */

export function getInitialState(): CaseState {
  try {
    if (!mockData || !mockData.applicant) {
      throw new Error("Invalid mock data format");
    }

    return {
      applicant: mockData.applicant,
      caseType: mockData.caseType,
      checklist: (mockData.checklist || []).map((c) => ({
        ...c,
        status: c.status as CaseState["checklist"][number]["status"],
      })),
      trace: (mockData.trace || []).map((t) => ({
        ...t,
        result: t.result as CaseState["trace"][number]["result"],
      })),
      chat: (mockData.chat || []).map((m) => ({
        ...m,
        role: m.role as ChatMessage["role"],
        type: "text",
      })),
      handoff: mockData.handoff || {
        status: "Pending review",
        summary: "No handoff data available.",
      },
      selectedItemId: "birth",
      activeTab: "activity",
      expandedTraceIndex: null,
      handoffHasDot: false,
      mismatchQueue: [],
      loadError: null,
      currentView: "case",
      readingItemId: null,
    };
  } catch (err) {
    return {
      applicant: "Unknown Applicant",
      caseType: "Passport Application",
      checklist: [],
      trace: [],
      chat: [],
      handoff: {
        status: "Error",
        summary: "Unable to load case file.",
      },
      selectedItemId: null,
      activeTab: "activity",
      expandedTraceIndex: null,
      handoffHasDot: false,
      mismatchQueue: [],
      loadError:
        err instanceof Error
          ? err.message
          : "Failed to initialize case data from mock_case.json",
      currentView: "case",
      readingItemId: null,
    };
  }
}

/* ── Action types ───────────────────────────────────────────────────── */

export type CaseAction =
  | { type: "SEND_MESSAGE"; payload: ChatMessage }
  | { type: "RESOLVE_ITEM"; payload: { id: string } }
  | {
      type: "UPDATE_ITEM_STATUS";
      payload: { id: string; status: "ok" | "issue" | "needed"; note: string };
    }
  | { type: "ADD_TRACE"; payload: TraceEntry }
  | { type: "SELECT_ITEM"; payload: string | null }
  | { type: "SET_ACTIVE_TAB"; payload: "activity" | "handoff" }
  | { type: "TOGGLE_EXPAND_TRACE"; payload: number | null }
  | { type: "SET_HANDOFF_DOT"; payload: boolean }
  | { type: "ENQUEUE_MISMATCH"; payload: MismatchIssue }
  | { type: "DISMISS_MISMATCH" }
  | { type: "SET_VIEW"; payload: NavView }
  | { type: "SET_READING_ITEM"; payload: string | null }
  | { type: "RESET" };

/* ── Reducer ────────────────────────────────────────────────────────── */

export function caseReducer(state: CaseState, action: CaseAction): CaseState {
  switch (action.type) {
    case "SEND_MESSAGE":
      return { ...state, chat: [...state.chat, action.payload] };

    case "RESOLVE_ITEM":
      return {
        ...state,
        checklist: state.checklist.map((item) =>
          item.id === action.payload.id
            ? { ...item, status: "ok" as const }
            : item
        ),
      };

    case "UPDATE_ITEM_STATUS":
      return {
        ...state,
        checklist: state.checklist.map((item) =>
          item.id === action.payload.id
            ? {
                ...item,
                status: action.payload.status,
                note: action.payload.note,
              }
            : item
        ),
      };

    case "ADD_TRACE":
      return { ...state, trace: [...state.trace, action.payload] };

    case "SELECT_ITEM":
      return { ...state, selectedItemId: action.payload };

    case "SET_ACTIVE_TAB":
      return {
        ...state,
        activeTab: action.payload,
        handoffHasDot:
          action.payload === "handoff" ? false : state.handoffHasDot,
      };

    case "TOGGLE_EXPAND_TRACE":
      return {
        ...state,
        expandedTraceIndex:
          state.expandedTraceIndex === action.payload ? null : action.payload,
      };

    case "SET_HANDOFF_DOT":
      return { ...state, handoffHasDot: action.payload };

    case "ENQUEUE_MISMATCH":
      return {
        ...state,
        mismatchQueue: [...state.mismatchQueue, action.payload],
      };

    case "DISMISS_MISMATCH":
      return {
        ...state,
        mismatchQueue: state.mismatchQueue.slice(1),
      };

    case "SET_VIEW":
      return { ...state, currentView: action.payload };

    case "SET_READING_ITEM":
      return { ...state, readingItemId: action.payload };

    case "RESET":
      return getInitialState();

    default:
      return state;
  }
}

/* ── Context ────────────────────────────────────────────────────────── */

interface CaseContextValue {
  state: CaseState;
  readiness: number;
  stage: Stage;
  dispatch: Dispatch<CaseAction>;
  simulateUploadDocument: (itemId: string) => void;
  executeDraftDeclaration: () => void;
  executeFixAddress: () => void;
  executeJustApprove: () => void;
  executeFreeText: (text: string) => void;
  openMismatchModal: (issue: MismatchIssue) => void;
}

const CaseContext = createContext<CaseContextValue | null>(null);

/** Hook to consume the case context. */
export function useCase(): CaseContextValue {
  const ctx = useContext(CaseContext);
  if (!ctx) {
    throw new Error("useCase must be used within a <CaseProvider>");
  }
  return ctx;
}

/** Provider component – wrap around the app shell. */
export function CaseProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(caseReducer, getInitialState());

  const readiness = computeReadiness(state.checklist);
  const stage = deriveStage(state.checklist);

  const getNowTime = () => {
    const d = new Date();
    return d.toTimeString().substring(0, 5);
  };

  /* Simulate file upload with 1.2s reading state */
  const simulateUploadDocument = (itemId: string) => {
    dispatch({ type: "SET_READING_ITEM", payload: itemId });

    setTimeout(() => {
      dispatch({ type: "SET_READING_ITEM", payload: null });
      const time = getNowTime();

      if (itemId === "birth") {
        dispatch({
          type: "UPDATE_ITEM_STATUS",
          payload: {
            id: "birth",
            status: "ok",
            note: "New birth certificate copy verified ('Meenakshi Raghavan')",
          },
        });
        dispatch({
          type: "ADD_TRACE",
          payload: {
            agent: "Document agent",
            tool: "validate_name_match",
            result: "PASS",
            detail: "Updated birth certificate matches photo ID full name exactly",
            time,
          },
        });
        dispatch({
          type: "SEND_MESSAGE",
          payload: {
            role: "agent",
            text: "Replacement birth certificate processed and verified. Name match is now 100% compliant.",
            type: "text",
          },
        });
      } else if (itemId === "address") {
        dispatch({
          type: "UPDATE_ITEM_STATUS",
          payload: {
            id: "address",
            status: "ok",
            note: "Electricity bill dated 22 days ago uploaded & verified",
          },
        });
        dispatch({
          type: "ADD_TRACE",
          payload: {
            agent: "Document agent",
            tool: "validate_address_proof_age",
            result: "PASS",
            detail: "Alternative utility bill dated within 30 days verified compliant",
            time,
          },
        });
        dispatch({
          type: "SEND_MESSAGE",
          payload: {
            role: "agent",
            text: "Updated address proof accepted! Document date is well within the 3-month statutory window.",
            type: "text",
          },
        });
      } else if (itemId === "photo") {
        dispatch({
          type: "UPDATE_ITEM_STATUS",
          payload: {
            id: "photo",
            status: "ok",
            note: "Passport standard 2x2 photograph verified compliant",
          },
        });
        dispatch({
          type: "ADD_TRACE",
          payload: {
            agent: "Document agent",
            tool: "photo_check",
            result: "PASS",
            detail: "White background, neutral expression, 2x2 inch biometric compliant",
            time,
          },
        });
        dispatch({
          type: "SEND_MESSAGE",
          payload: {
            role: "agent",
            text: "Passport photo received and verified! All required documents are now in order.",
            type: "appointment",
            appointmentData: {
              location: "Regional Passport Seva Kendra (PSK Central)",
              date: "Thursday, Oct 16, 2026",
              time: "10:30 AM",
              reference: "PSK-APP-89421",
            },
          },
        });
      } else if (itemId === "id") {
        dispatch({
          type: "UPDATE_ITEM_STATUS",
          payload: {
            id: "id",
            status: "ok",
            note: "Meenakshi Raghavan verified",
          },
        });
      }
    }, 1200);
  };

  /* Demo behavior 1: Draft name declaration */
  const executeDraftDeclaration = () => {
    const decText = `FORMAL NAME CLARIFICATION DECLARATION\n\nI, Meenakshi Raghavan, daughter of R. Raghavan, hereby solemnly affirm and state that 'Meenakshi R' as appearing on my Birth Certificate and 'Meenakshi Raghavan' as recorded in my government photo ID pertain to one and the same person. I request that my passport be issued under my full legal name, Meenakshi Raghavan.`;

    dispatch({
      type: "SEND_MESSAGE",
      payload: {
        role: "agent",
        text: "I have prepared the formal Name Clarification Declaration for you. You can review and copy it below:",
        type: "declaration",
        declarationText: decText,
      },
    });

    dispatch({
      type: "UPDATE_ITEM_STATUS",
      payload: {
        id: "birth",
        status: "ok",
        note: "Clarification declaration drafted",
      },
    });

    const time = getNowTime();
    dispatch({
      type: "ADD_TRACE",
      payload: {
        agent: "Document agent",
        tool: "generate_draft",
        result: "PASS",
        detail:
          "Drafted Annexure E name clarification declaration for 'Meenakshi R' vs 'Meenakshi Raghavan'",
        time,
      },
    });

    setTimeout(() => {
      dispatch({
        type: "ADD_TRACE",
        payload: {
          agent: "Document agent",
          tool: "validate_name_match",
          result: "PASS",
          detail:
            "Declaration attached. Name mismatch resolved pending officer sign-off",
          time,
        },
      });
    }, 200);
  };

  /* Demo behavior 2: Fix address proof */
  const executeFixAddress = () => {
    dispatch({
      type: "SEND_MESSAGE",
      payload: {
        role: "agent",
        text: "For address proof, documents must be dated within the last 3 months. Accepted alternatives include:\n• Recent utility bill (electricity, water, piped gas)\n• Bank statement / passbook copy with current seal\n• Registered rent agreement with active tenure\n• Aadhaar card with updated address\n\nClick 'Upload' or 'Replace' on the Address proof item to submit a valid alternative.",
        type: "text",
      },
    });
  };

  /* Demo behavior 3: Just approve it */
  const executeJustApprove = () => {
    dispatch({
      type: "SEND_MESSAGE",
      payload: {
        role: "user",
        text: "Just approve it",
      },
    });

    setTimeout(() => {
      dispatch({
        type: "SEND_MESSAGE",
        payload: {
          role: "agent",
          text: "I can't approve applications. A passport officer makes that decision. I've prepared a summary for them.",
          type: "text",
        },
      });

      const time = getNowTime();
      dispatch({
        type: "ADD_TRACE",
        payload: {
          agent: "Policy Guard",
          tool: "enforce_officer_boundary",
          result: "BLOCKED",
          detail:
            "Automated approval request blocked by policy rule R-04. Officer review mandatory.",
          time,
        },
      });

      dispatch({ type: "SET_HANDOFF_DOT", payload: true });
    }, 400);
  };

  /* Demo behavior 4: Free text user message */
  const executeFreeText = (text: string) => {
    if (!text.trim()) return;

    const lower = text.toLowerCase();
    if (lower.includes("name") && lower.includes("declaration")) {
      dispatch({ type: "SEND_MESSAGE", payload: { role: "user", text } });
      setTimeout(executeDraftDeclaration, 600);
      return;
    }
    if (
      lower.includes("address") &&
      (lower.includes("fix") || lower.includes("proof"))
    ) {
      dispatch({ type: "SEND_MESSAGE", payload: { role: "user", text } });
      setTimeout(executeFixAddress, 600);
      return;
    }
    if (lower.includes("approve")) {
      executeJustApprove();
      return;
    }

    dispatch({ type: "SEND_MESSAGE", payload: { role: "user", text } });
    setTimeout(() => {
      dispatch({
        type: "SEND_MESSAGE",
        payload: {
          role: "agent",
          text: `I've noted that: "${text}". I will factor this into the officer's case notes and verify any related compliance items.`,
          type: "text",
        },
      });
    }, 600);
  };

  const openMismatchModal = (issue: MismatchIssue) => {
    dispatch({ type: "ENQUEUE_MISMATCH", payload: issue });
  };

  return (
    <CaseContext.Provider
      value={{
        state,
        readiness,
        stage,
        dispatch,
        simulateUploadDocument,
        executeDraftDeclaration,
        executeFixAddress,
        executeJustApprove,
        executeFreeText,
        openMismatchModal,
      }}
    >
      {children}
    </CaseContext.Provider>
  );
}
