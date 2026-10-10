/**
 * DocumentsView.tsx
 * Full-width Documents View:
 *  - Left: The four document rows (with Upload/Replace action buttons, selection indicators).
 *  - Right: Detail card for the selected document:
 *      "Read by Document agent" label, extracted fields (full name, DOB, document date, address),
 *      and the conflicting value highlighted in Issue tone (#F2A65A) with a note naming the other document.
 */

import { FileText, Loader2, Upload } from "lucide-react";
import { useCase } from "../state/caseReducer";
import type { ChecklistStatus } from "../types";

const STATUS_CFG: Record<
  ChecklistStatus,
  { label: string; bg: string; text: string; border: string; icon: string }
> = {
  ok: {
    label: "OK",
    bg: "bg-ok-bg",
    text: "text-ok",
    border: "border-ok/30",
    icon: "✓",
  },
  issue: {
    label: "Issue",
    bg: "bg-issue-bg",
    text: "text-issue",
    border: "border-issue/30",
    icon: "!",
  },
  needed: {
    label: "Needed",
    bg: "bg-needed-bg",
    text: "text-needed",
    border: "border-needed/30",
    icon: "?",
  },
};

interface ExtractedDocData {
  fullName: string;
  isNameConflict?: boolean;
  nameConflictNote?: string;
  dob: string;
  docDate: string;
  isDateConflict?: boolean;
  dateConflictNote?: string;
  address: string;
  agentLabel: string;
  issuer: string;
}

const EXTRACTED_DATA: Record<string, ExtractedDocData> = {
  birth: {
    fullName: "Meenakshi R",
    isNameConflict: true,
    nameConflictNote: "Differs from ID proof ('Meenakshi Raghavan')",
    dob: "14-Aug-2004",
    docDate: "22-Aug-2004",
    address: "Chennai, Tamil Nadu, 600028",
    agentLabel: "Read by Document agent",
    issuer: "Greater Chennai Corporation (Vital Statistics)",
  },
  id: {
    fullName: "Meenakshi Raghavan",
    isNameConflict: false,
    dob: "14-Aug-2004",
    docDate: "10-Jan-2022",
    address: "Flat 4B, Shanthi Apts, T. Nagar, Chennai 600017",
    agentLabel: "Read by Document agent",
    issuer: "Unique Identification Authority of India",
  },
  address: {
    fullName: "Meenakshi Raghavan",
    dob: "14-Aug-2004",
    docDate: "Dated 5 months ago",
    isDateConflict: true,
    dateConflictNote: "Exceeds 3-month limit (statutory policy)",
    address: "Flat 4B, Shanthi Apts, T. Nagar, Chennai 600017",
    agentLabel: "Read by Document agent",
    issuer: "Tamil Nadu Generation and Distribution Corp",
  },
  photo: {
    fullName: "Meenakshi Raghavan",
    dob: "14-Aug-2004",
    docDate: "Awaiting upload",
    address: "Biometric standard (plain white background, 35x45mm)",
    agentLabel: "Read by Document agent",
    issuer: "Authorized Studio / PSK Biometric Counter",
  },
};

export default function DocumentsView() {
  const { state, dispatch, simulateUploadDocument } = useCase();

  const selectedItem =
    state.checklist.find((c) => c.id === state.selectedItemId) ||
    state.checklist[0];
  const selectedDoc = selectedItem ? EXTRACTED_DATA[selectedItem.id] : null;

  return (
    <div className="flex-1 h-full min-h-0 flex flex-col p-6 overflow-hidden">
      <div className="mb-4">
        <h1 className="text-lg font-bold text-text">Document Dossier</h1>
        <p className="text-xs text-text-secondary">
          Review extracted OCR fields, cross-document verification flags, and compliance statuses.
        </p>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-12 gap-6">
        {/* Left column: Checklist items */}
        <div className="col-span-5 flex flex-col rounded-[var(--radius-panel)] border border-border bg-panel overflow-hidden">
          <div className="px-4 py-3 border-b border-border shrink-0 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Submitted Items ({state.checklist.length})
            </span>
            <span className="text-[11px] text-text-muted">Click row to inspect</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {state.checklist.map((item) => {
              const cfg = STATUS_CFG[item.status];
              const isSelected = selectedItem?.id === item.id;
              const isReading = state.readingItemId === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => dispatch({ type: "SELECT_ITEM", payload: item.id })}
                  className={`p-3.5 rounded-[var(--radius-button)] border transition-all cursor-pointer flex flex-col gap-2
                    ${
                      isSelected
                        ? "bg-raised border-accent/60 shadow-sm"
                        : "bg-raised/60 border-border hover:border-border/80"
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className={isSelected ? "text-accent" : "text-text-muted"} />
                      <span className="text-sm font-semibold text-text">{item.item}</span>
                    </div>

                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                    >
                      {cfg.label}
                    </span>
                  </div>

                  <p className="text-xs text-text-secondary leading-snug">{item.note}</p>

                  {/* Upload / Replace Action button if needed or issue */}
                  {item.status !== "ok" && (
                    <div className="pt-2 border-t border-border/50 flex justify-end">
                      <button
                        type="button"
                        disabled={isReading}
                        onClick={(e) => {
                          e.stopPropagation();
                          simulateUploadDocument(item.id);
                        }}
                        className="px-2.5 py-1 rounded text-xs font-semibold bg-accent text-accent-text hover:bg-accent-hover transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                      >
                        {isReading ? (
                          <>
                            <Loader2 size={13} className="animate-spin" />
                            Reading...
                          </>
                        ) : (
                          <>
                            <Upload size={13} />
                            {item.status === "needed" ? "Upload" : "Replace"}
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Document details */}
        <div className="col-span-7 flex flex-col rounded-[var(--radius-panel)] border border-border bg-panel overflow-hidden">
          {selectedDoc && selectedItem ? (
            <div className="flex-1 flex flex-col overflow-y-auto p-5 space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-border pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-text">{selectedItem.item}</h2>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${STATUS_CFG[selectedItem.status].bg} ${STATUS_CFG[selectedItem.status].text} ${STATUS_CFG[selectedItem.status].border}`}
                    >
                      {STATUS_CFG[selectedItem.status].label}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">Issuer: {selectedDoc.issuer}</p>
                </div>

                <span className="text-[11px] font-mono text-accent bg-accent-bg px-2.5 py-1 rounded border border-accent/30">
                  {selectedDoc.agentLabel}
                </span>
              </div>

              {/* Extracted Fields */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Extracted Document Fields
                </h3>

                {/* Full Name */}
                <div className="p-3 rounded-[var(--radius-button)] bg-raised border border-border space-y-1">
                  <span className="text-[11px] text-text-muted block">Full Legal Name</span>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-mono font-medium ${
                        selectedDoc.isNameConflict
                          ? "text-issue bg-issue-bg px-2 py-0.5 rounded border border-issue/40"
                          : "text-text"
                      }`}
                    >
                      {selectedDoc.fullName}
                    </span>
                  </div>
                  {selectedDoc.isNameConflict && selectedDoc.nameConflictNote && (
                    <div className="mt-1 text-xs text-issue flex items-center gap-1.5">
                      <span>⚠</span>
                      <span>{selectedDoc.nameConflictNote}</span>
                    </div>
                  )}
                </div>

                {/* Date of Birth */}
                <div className="p-3 rounded-[var(--radius-button)] bg-raised border border-border">
                  <span className="text-[11px] text-text-muted block mb-0.5">Date of Birth</span>
                  <span className="text-sm font-mono text-text">{selectedDoc.dob}</span>
                </div>

                {/* Document Date */}
                <div className="p-3 rounded-[var(--radius-button)] bg-raised border border-border space-y-1">
                  <span className="text-[11px] text-text-muted block">Document Issuance Date</span>
                  <span
                    className={`text-sm font-mono font-medium ${
                      selectedDoc.isDateConflict
                        ? "text-issue bg-issue-bg px-2 py-0.5 rounded border border-issue/40 inline-block"
                        : "text-text"
                    }`}
                  >
                    {selectedDoc.docDate}
                  </span>
                  {selectedDoc.isDateConflict && selectedDoc.dateConflictNote && (
                    <div className="mt-1 text-xs text-issue flex items-center gap-1.5">
                      <span>⚠</span>
                      <span>{selectedDoc.dateConflictNote}</span>
                    </div>
                  )}
                </div>

                {/* Address */}
                <div className="p-3 rounded-[var(--radius-button)] bg-raised border border-border">
                  <span className="text-[11px] text-text-muted block mb-0.5">Recorded Address</span>
                  <span className="text-sm text-text-secondary leading-relaxed">
                    {selectedDoc.address}
                  </span>
                </div>
              </div>

              {/* Status Note Footer */}
              <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-text-muted">
                <span>Verification state: {selectedItem.note}</span>
                <span className="italic">Subject to officer review</span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-text-muted text-xs">
              Select a document from the left list to inspect extracted fields.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
