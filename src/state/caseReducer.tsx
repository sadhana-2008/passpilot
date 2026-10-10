/**
 * Legacy re-export module to maintain 100% backward compatibility
 * with existing components while logic is decomposed into src/store/ and src/utils/.
 */
export { computeReadiness, deriveStage } from "../utils/readiness";
export { getInitialState, caseReducer } from "../store/caseReducer";
export { CaseProvider, useCase } from "../store/caseContext";
export type { CaseAction, CaseContextValue } from "../store/caseTypes";
