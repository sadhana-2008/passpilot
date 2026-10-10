import type { ChecklistItem, Stage } from "../types";

/**
 * Calculates dynamic readiness score across checklist items.
 * Weighted equally up to 100 total (e.g. 4 items = 25 pts each).
 * Status weighting: ok = 100%, issue = 60%, needed = 20%.
 */
export function computeReadiness(checklist: ChecklistItem[]): number {
  if (!checklist || checklist.length === 0) return 0;
  const scorePerItem = 100 / checklist.length;
  let total = 0;
  for (const item of checklist) {
    if (item.status === "ok") {
      total += scorePerItem;
    } else if (item.status === "issue") {
      total += scorePerItem * 0.6;
    } else if (item.status === "needed") {
      total += scorePerItem * 0.2;
    }
  }
  return Math.min(100, Math.round(total));
}

/**
 * Derives current pipeline stage based on checklist readiness.
 */
export function deriveStage(checklist: ChecklistItem[]): Stage {
  if (!checklist || checklist.length === 0) return "Intake";
  const hasNeeded = checklist.some((i) => i.status === "needed");
  const hasIssue = checklist.some((i) => i.status === "issue");
  if (hasNeeded) return "Documents";
  if (hasIssue) return "Fix";
  return "Book";
}
