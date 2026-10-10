import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from "react";
import type { MismatchIssue, SessionInfo } from "../types";
import { computeReadiness, deriveStage } from "../utils/readiness";
import { createCaseActions } from "./caseActions";
import { caseReducer, getInitialState } from "./caseReducer";
import type { CaseContextValue } from "./caseTypes";

const CaseContext = createContext<CaseContextValue | null>(null);

export function useCase(): CaseContextValue {
  const ctx = useContext(CaseContext);
  if (!ctx) {
    throw new Error("useCase must be used within a <CaseProvider>");
  }
  return ctx;
}

export function CaseProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(caseReducer, getInitialState());

  const readiness = computeReadiness(state.checklist);
  const stage = deriveStage(state.checklist);

  useEffect(() => {
    let isSubscribed = true;
    async function initSession() {
      dispatch({ type: "SET_SESSION_STATUS", payload: "connecting" });
      try {
        const res = await fetch("/api/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: SessionInfo = await res.json();
        if (isSubscribed) {
          dispatch({ type: "SET_SESSION", payload: data });
        }
      } catch (err) {
        if (isSubscribed) {
          dispatch({ type: "SET_SESSION_STATUS", payload: "error" });
        }
      }
    }
    initSession();
    return () => {
      isSubscribed = false;
    };
  }, []);

  const actions = createCaseActions(state, dispatch);

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
        ...actions,
        openMismatchModal,
      }}
    >
      {children}
    </CaseContext.Provider>
  );
}
