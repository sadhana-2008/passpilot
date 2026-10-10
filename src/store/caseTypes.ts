import type { Dispatch } from "react";
import type {
  CaseState,
  ChatMessage,
  ChecklistItem,
  Language,
  MismatchIssue,
  NavView,
  Stage,
  TraceEntry,
} from "../types";

export type CaseAction =
  | { type: "SEND_MESSAGE"; payload: ChatMessage }
  | { type: "SET_SESSION"; payload: { user_id: string; session_id: string } }
  | { type: "SET_SESSION_STATUS"; payload: "connecting" | "connected" | "error" }
  | { type: "SET_LANGUAGE"; payload: Language }
  | { type: "START_STREAMING_MSG"; payload: { id: string } }
  | { type: "APPEND_STREAM_CHUNK"; payload: { id: string; chunk: string } }
  | { type: "FINISH_STREAMING_MSG"; payload: { id: string } }
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

export interface CaseContextValue {
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
