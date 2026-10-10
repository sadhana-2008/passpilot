import mockData from "../data/mock_case.json";
import type { CaseState, ChatMessage } from "../types";
import type { CaseAction } from "./caseTypes";

export function getInitialState(): CaseState {
  try {
    return {
      applicant: mockData.applicant || "Aarav Sharma",
      caseType: mockData.caseType || "Fresh Passport",
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
      session: null,
      sessionStatus: "connecting",
      language: "en",
    };
  } catch (err) {
    return {
      applicant: "Aarav Sharma",
      caseType: "Passport Application",
      checklist: [],
      trace: [],
      chat: [],
      handoff: { status: "Error", summary: "Unable to load case file." },
      selectedItemId: null,
      activeTab: "activity",
      expandedTraceIndex: null,
      handoffHasDot: false,
      mismatchQueue: [],
      loadError: err instanceof Error ? err.message : "Failed to load mock data",
      currentView: "case",
      readingItemId: null,
      session: null,
      sessionStatus: "error",
      language: "en",
    };
  }
}

export function caseReducer(state: CaseState, action: CaseAction): CaseState {
  switch (action.type) {
    case "SEND_MESSAGE":
      return { ...state, chat: [...state.chat, action.payload] };

    case "SET_LANGUAGE":
      return { ...state, language: action.payload };

    case "SET_SESSION":
      return { ...state, session: action.payload, sessionStatus: "connected" };

    case "SET_SESSION_STATUS":
      return { ...state, sessionStatus: action.payload };

    case "START_STREAMING_MSG":
      return {
        ...state,
        chat: [
          ...state.chat,
          { id: action.payload.id, role: "agent", text: "", type: "text", isStreaming: true },
        ],
      };

    case "APPEND_STREAM_CHUNK":
      return {
        ...state,
        chat: state.chat.map((msg) =>
          msg.id === action.payload.id ? { ...msg, text: msg.text + action.payload.chunk } : msg
        ),
      };

    case "FINISH_STREAMING_MSG":
      return {
        ...state,
        chat: state.chat.map((msg) =>
          msg.id === action.payload.id ? { ...msg, isStreaming: false } : msg
        ),
      };

    case "RESOLVE_ITEM":
      return {
        ...state,
        checklist: state.checklist.map((item) =>
          item.id === action.payload.id ? { ...item, status: "ok" as const } : item
        ),
      };

    case "UPDATE_ITEM_STATUS":
      return {
        ...state,
        checklist: state.checklist.map((item) =>
          item.id === action.payload.id
            ? { ...item, status: action.payload.status, note: action.payload.note }
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
        handoffHasDot: action.payload === "handoff" ? false : state.handoffHasDot,
      };

    case "TOGGLE_EXPAND_TRACE":
      return {
        ...state,
        expandedTraceIndex: state.expandedTraceIndex === action.payload ? null : action.payload,
      };

    case "SET_HANDOFF_DOT":
      return { ...state, handoffHasDot: action.payload };

    case "ENQUEUE_MISMATCH":
      return { ...state, mismatchQueue: [...state.mismatchQueue, action.payload] };

    case "DISMISS_MISMATCH":
      return { ...state, mismatchQueue: state.mismatchQueue.slice(1) };

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
