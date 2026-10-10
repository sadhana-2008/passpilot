import { ReactNode } from "react";
import { CaseProvider } from "../store/caseContext";

export function AppProviders({ children }: { children: ReactNode }) {
  return <CaseProvider>{children}</CaseProvider>;
}
