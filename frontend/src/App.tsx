/**
 * App.tsx – PassPilot Shell Layout with LeftNavRail
 *
 * Views:
 *  - 'case': 3-panel layout (CasePanel, ChatPanel, ActivityPanel)
 *  - 'documents': full-width DocumentsView (Left checklist rows, Right extracted details)
 *  - 'handoff': full-page HandoffView
 *  - 'about': full-page AboutView
 */

import AboutView from "./components/AboutView";
import ActivityPanel from "./components/ActivityPanel";
import CasePanel from "./components/CasePanel";
import ChatPanel from "./components/ChatPanel";
import DocumentsView from "./components/DocumentsView";
import HandoffView from "./components/HandoffView";
import Header from "./components/Header";
import LeftNavRail from "./components/LeftNavRail";
import MismatchModal from "./components/MismatchModal";
import { CaseProvider, useCase } from "./state/caseReducer";

function AppContent() {
  const { state } = useCase();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg">
      {/* ── Left 64px Navigation Rail ─────────────────────────────── */}
      <LeftNavRail />

      {/* ── Main View Area ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* Dynamic Views */}
        <main className="flex-1 min-h-0 overflow-hidden">
          {state.currentView === "case" && (
            <div
              className="h-full grid gap-4 p-4 min-h-0"
              style={{
                gridTemplateColumns: "300px minmax(0, 1fr) 320px",
              }}
            >
              <CasePanel />
              <ChatPanel />
              <ActivityPanel />
            </div>
          )}

          {state.currentView === "documents" && <DocumentsView />}

          {state.currentView === "handoff" && <HandoffView />}

          {state.currentView === "about" && <AboutView />}
        </main>
      </div>

      {/* ── Mismatch Modal dialog ────────────────────────────────── */}
      <MismatchModal />
    </div>
  );
}

export default function App() {
  return (
    <CaseProvider>
      <AppContent />
    </CaseProvider>
  );
}
