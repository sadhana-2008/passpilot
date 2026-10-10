import type { Dispatch } from "react";
import type { CaseAction } from "./caseTypes";
import type { CaseState } from "../types";

const getNowTime = () => new Date().toTimeString().substring(0, 5);

export function createCaseActions(
  state: CaseState,
  dispatch: Dispatch<CaseAction>
) {
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
            text: "✅ Upload complete! The new birth certificate has been verified. Name mismatch resolved with Aadhaar card.",
            type: "text",
          },
        });
      }
    }, 1200);
  };

  const executeDraftDeclaration = () => {
    const time = getNowTime();
    dispatch({
      type: "UPDATE_ITEM_STATUS",
      payload: {
        id: "birth",
        status: "ok",
        note: "One-and-the-same person affidavit annexure drafted",
      },
    });
    dispatch({
      type: "ADD_TRACE",
      payload: {
        agent: "Policy agent",
        tool: "lookup_rules",
        result: "PASS",
        detail: "Annexure 'E' sworn declaration acceptable per MEA GSR 570(E)",
        time,
      },
    });
    dispatch({
      type: "SEND_MESSAGE",
      payload: {
        role: "agent",
        text: "I have prepared the draft Annexure 'E' sworn declaration for name variance. You can sign this at the PSK counter.",
        type: "declaration",
        declarationText: "AFFIDAVIT / DECLARATION OF IDENTITY VARIATION...",
      },
    });
  };

  const executeFixAddress = () => {
    const time = getNowTime();
    dispatch({
      type: "UPDATE_ITEM_STATUS",
      payload: {
        id: "address",
        status: "ok",
        note: "Electricity bill updated to match current Aadhaar premises",
      },
    });
    dispatch({
      type: "ADD_TRACE",
      payload: {
        agent: "Document agent",
        tool: "check_address_utility",
        result: "PASS",
        detail: "Electricity bill consumer address verified against Aadhaar QR record",
        time,
      },
    });
    dispatch({
      type: "SEND_MESSAGE",
      payload: {
        role: "agent",
        text: "Address proof discrepancy updated. Electricity bill now successfully matches Aadhaar address.",
        type: "text",
      },
    });
  };

  const executeJustApprove = () => {
    dispatch({ type: "SET_ACTIVE_TAB", payload: "handoff" });
    dispatch({ type: "SET_HANDOFF_DOT", payload: true });
    dispatch({
      type: "SEND_MESSAGE",
      payload: {
        role: "agent",
        text: "Escalated for senior Granting Officer discretion. View Handoff tab for docket summary.",
        type: "text",
      },
    });
  };

  const executeFreeText = async (text: string) => {
    dispatch({ type: "SEND_MESSAGE", payload: { role: "user", text, type: "text" } });
    if (state.session && state.sessionStatus === "connected") {
      const msgId = `agent_${Date.now()}`;
      dispatch({ type: "START_STREAMING_MSG", payload: { id: msgId } });
      try {
        const res = await fetch("/api/chat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            user_id: state.session.user_id,
            session_id: state.session.session_id,
          }),
        });
        if (!res.ok || !res.body) throw new Error("Stream failed");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          dispatch({
            type: "APPEND_STREAM_CHUNK",
            payload: { id: msgId, chunk: decoder.decode(value, { stream: true }) },
          });
        }
      } catch (err) {
        dispatch({
          type: "APPEND_STREAM_CHUNK",
          payload: {
            id: msgId,
            chunk: "\n\n⚠️ PassPilot local mock mode active. Connect backend server on http://127.0.0.1:8000 for live AI streaming.",
          },
        });
      } finally {
        dispatch({ type: "FINISH_STREAMING_MSG", payload: { id: msgId } });
      }
    } else {
      setTimeout(() => {
        dispatch({
          role: "agent",
          text: `Understood: "${text}". All four checklist items have been analyzed according to Ministry of External Affairs regulations.`,
          type: "text",
        } as any);
      }, 400);
    }
  };

  return {
    simulateUploadDocument,
    executeDraftDeclaration,
    executeFixAddress,
    executeJustApprove,
    executeFreeText,
  };
}
