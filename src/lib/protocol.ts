import type { AgentRole, Phase } from "@/types";

// ============================================================
// State Version — bump when DebateState shape changes
// ============================================================

export const STATE_VERSION = 1;

// ============================================================
// Error Codes
// ============================================================

export type ErrorCode =
  | "invalid_api_key"
  | "rate_limited"
  | "context_too_long"
  | "model_error"
  | "timeout"
  | "provider_error";

// ============================================================
// Stream Events (server → client, per-turn)
// ============================================================

export type StreamEvent =
  | {
      type: "agent_start";
      agentRole: AgentRole;
      round: number;
      phase: Phase;
    }
  | { type: "token"; content: string }
  | { type: "agent_done"; fullContent: string }
  | { type: "error"; code: ErrorCode; message: string };

// ============================================================
// Serialization (newline-delimited JSON)
// ============================================================

export function serializeEvent(event: StreamEvent): string {
  return JSON.stringify(event) + "\n";
}

export function parseEvent(line: string): StreamEvent | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  try {
    const parsed = JSON.parse(trimmed);
    if (typeof parsed !== "object" || parsed === null || !("type" in parsed)) {
      return null;
    }
    return parsed as StreamEvent;
  } catch {
    return null;
  }
}

// ============================================================
// SessionStorage helpers
// ============================================================

import type { DebateState } from "@/types";

interface StoredState {
  version: number;
  state: DebateState;
}

const STORAGE_KEY = "lol-argument-debate";

export function saveState(state: DebateState): void {
  try {
    const stored: StoredState = { version: STATE_VERSION, state };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // sessionStorage full or unavailable — silently ignore
  }
}

export function loadState(): DebateState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const stored: StoredState = JSON.parse(raw);
    if (stored.version !== STATE_VERSION) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return stored.state;
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function clearState(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
