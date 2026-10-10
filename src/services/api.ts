/**
 * api.ts — Typed client for PassPilot FastAPI backend.
 *
 * All paths are relative so Vite's proxy (/api → http://127.0.0.1:8000)
 * handles both dev and production transparently.
 */

const BASE = "";

/* ── Types ──────────────────────────────────────────────────────────── */

export interface SessionInfo {
  user_id: string;
  session_id: string;
}

export interface DocumentField {
  name?: string;
  date_of_birth?: string;
  address?: string;
  [key: string]: string | undefined;
}

export interface Document {
  type: "identity" | "address" | "date_of_birth" | string;
  fields: DocumentField;
  doc_name?: string;
}

export interface ValidationCheck {
  check_id: string;
  name: string;
  status: "passed" | "failed" | "insufficient_data";
  details: string;
  requires_human_review?: boolean;
}

export interface ValidationResponse {
  case_id?: string;
  checks: ValidationCheck[];
  requires_human_review: boolean;
  has_insufficient_data: boolean;
  disclaimer: string;
}

export interface PolicyRule {
  rule_id: string;
  title: string;
  rule_text: string;
  status: "verified" | "draft";
  source_name: string;
  source_url: string;
  needs_officer_confirmation?: boolean;
}

export interface RulesResponse {
  status: "ok";
  rules: PolicyRule[];
}

/* ── Session ────────────────────────────────────────────────────────── */

export async function createSession(userId?: string): Promise<SessionInfo> {
  const res = await fetch(`${BASE}/api/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userId ? { user_id: userId } : {}),
  });
  if (!res.ok) throw new Error(`Session creation failed: HTTP ${res.status}`);
  return res.json() as Promise<SessionInfo>;
}

/* ── Chat (streaming) ───────────────────────────────────────────────── */

export async function chatStream(
  userId: string,
  sessionId: string,
  message: string,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const res = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, session_id: sessionId, message }),
    signal,
  });

  if (!res.ok || !res.body) {
    throw new Error(`Chat request failed: HTTP ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    onChunk(decoder.decode(value, { stream: true }));
  }
}

/* ── Document Validation ─────────────────────────────────────────────── */

export async function validateDocuments(
  documents: Document[],
  caseId?: string
): Promise<ValidationResponse> {
  const res = await fetch(`${BASE}/api/documents/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ case_id: caseId ?? null, documents }),
  });
  if (!res.ok) throw new Error(`Validation failed: HTTP ${res.status}`);
  return res.json() as Promise<ValidationResponse>;
}

/* ── Policy Rules ────────────────────────────────────────────────────── */

export async function getRules(statusFilter?: "verified" | "draft"): Promise<RulesResponse> {
  const url = statusFilter ? `${BASE}/api/rules?status=${statusFilter}` : `${BASE}/api/rules`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Rules fetch failed: HTTP ${res.status}`);
  return res.json() as Promise<RulesResponse>;
}

/* ── Health Check ────────────────────────────────────────────────────── */

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/api/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}
