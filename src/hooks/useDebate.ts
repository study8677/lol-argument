"use client";

import { useReducer, useCallback, useRef, useEffect } from "react";
import type {
  DebateState,
  AgentRole,
  AgentMessage,
  Phase,
  StressTestReport,
  DebateError,
  ReportRequest,
} from "@/types";
import { getAgentSequence } from "@/lib/agents/orchestrator";
import { saveState, loadState, clearState } from "@/lib/protocol";
import { useAgentStream } from "./useAgentStream";
import { useApiKey } from "./useApiKey";
import { useSettings } from "./useSettings";

// ============================================================
// Reducer
// ============================================================

type Action =
  | { type: "SET_OPINION"; opinion: string }
  | { type: "SET_ROUNDS"; rounds: number }
  | { type: "START_BUILD" }
  | {
      type: "AGENT_START";
      agentRole: AgentRole;
      round: number;
      phase: Phase;
    }
  | { type: "APPEND_TOKEN"; content: string }
  | {
      type: "AGENT_DONE";
      agentRole: AgentRole;
      round: number;
      phase: Phase;
      fullContent: string;
    }
  | { type: "BUILD_DONE" }
  | { type: "START_FLIP" }
  | { type: "FLIP_DONE" }
  | { type: "START_DEMOLISH" }
  | { type: "DEMOLISH_DONE" }
  | { type: "START_REPORT" }
  | { type: "SET_REPORT"; report: StressTestReport }
  | { type: "SET_ERROR"; error: DebateError }
  | { type: "CLEAR_ERROR" }
  | { type: "RESET" }
  | { type: "RESTORE"; state: DebateState };

export const initialState: DebateState = {
  phase: "idle",
  opinion: "",
  rounds: 3,
  transcript: [],
  pendingContent: "",
  currentRound: 0,
  currentAgent: null,
  report: null,
  error: null,
};

export function debateReducer(
  state: DebateState,
  action: Action
): DebateState {
  switch (action.type) {
    case "SET_OPINION":
      return { ...state, opinion: action.opinion };

    case "SET_ROUNDS":
      return { ...state, rounds: action.rounds };

    case "START_BUILD":
      return { ...state, phase: "building", transcript: [], error: null };

    case "AGENT_START":
      return {
        ...state,
        currentAgent: action.agentRole,
        currentRound: action.round,
        pendingContent: "",
      };

    case "APPEND_TOKEN":
      // Temp UI state ONLY — does not touch transcript
      return {
        ...state,
        pendingContent: state.pendingContent + action.content,
      };

    case "AGENT_DONE": {
      // This is the ONLY action that mutates transcript
      const msg: AgentMessage = {
        id: `${action.phase}-${action.round}-${action.agentRole}`,
        agentRole: action.agentRole,
        phase: action.phase,
        round: action.round,
        content: action.fullContent,
        timestamp: Date.now(),
      };
      return {
        ...state,
        transcript: [...state.transcript, msg],
        pendingContent: "",
        currentAgent: null,
      };
    }

    case "BUILD_DONE":
      return { ...state, phase: "built", currentAgent: null, currentRound: 0 };

    case "START_FLIP":
      return { ...state, phase: "flipping" };

    case "FLIP_DONE":
      return { ...state, phase: "demolishing" };

    case "START_DEMOLISH":
      return { ...state, phase: "demolishing", error: null };

    case "DEMOLISH_DONE":
      return {
        ...state,
        phase: "demolished",
        currentAgent: null,
        currentRound: 0,
      };

    case "START_REPORT":
      return { ...state, phase: "reporting" };

    case "SET_REPORT":
      return { ...state, phase: "complete", report: action.report };

    case "SET_ERROR":
      return { ...state, error: action.error };

    case "CLEAR_ERROR":
      return { ...state, error: null };

    case "RESET":
      clearState();
      return { ...initialState };

    case "RESTORE":
      return action.state;

    default:
      return state;
  }
}

// ============================================================
// Hook
// ============================================================

export function useDebate() {
  const [state, dispatch] = useReducer(debateReducer, initialState);
  const { streamAgentTurn, isStreaming, abort } = useAgentStream();
  const { apiKey } = useApiKey();
  const { settings } = useSettings();
  const abortedRef = useRef(false);
  const resumeCheckedRef = useRef(false);
  // Use refs to avoid stale closure in runPhase
  const stateRef = useRef(state);
  stateRef.current = state;
  const apiKeyRef = useRef(apiKey);
  apiKeyRef.current = apiKey;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  // Check sessionStorage on mount
  useEffect(() => {
    if (resumeCheckedRef.current) return;
    resumeCheckedRef.current = true;
    const saved = loadState();
    if (saved && saved.phase !== "idle" && saved.phase !== "complete") {
      dispatch({ type: "RESTORE", state: { ...saved, pendingContent: "", currentAgent: null, error: null } });
    }
  }, []);

  // Save to sessionStorage on every transcript change
  useEffect(() => {
    if (state.phase !== "idle") {
      saveState(state);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.transcript, state.phase, state.report]);

  const runPhase = useCallback(
    async (phase: Phase, opinion: string, rounds: number) => {
      const agents = getAgentSequence(phase);
      abortedRef.current = false;

      for (let round = 1; round <= rounds; round++) {
        for (const agentRole of agents) {
          if (abortedRef.current) return;

          await new Promise<void>((resolve, reject) => {
            // Read latest transcript via ref to avoid stale closure
            const currentTranscript = stateRef.current.transcript;
            const currentSettings = settingsRef.current;
            const currentKey = apiKeyRef.current;

            streamAgentTurn(
              {
                opinion,
                transcript: currentTranscript,
                agentRole,
                round,
                rounds,
                phase,
                provider: currentSettings.provider,
                model: currentSettings.model,
                baseURL: currentSettings.baseURL,
              },
              currentKey || undefined,
              {
                onStart: (event) => {
                  dispatch({
                    type: "AGENT_START",
                    agentRole: event.agentRole,
                    round: event.round,
                    phase: event.phase,
                  });
                },
                onToken: (content) => {
                  dispatch({ type: "APPEND_TOKEN", content });
                },
                onDone: (fullContent) => {
                  dispatch({
                    type: "AGENT_DONE",
                    agentRole,
                    round,
                    phase,
                    fullContent,
                  });
                  resolve();
                },
                onError: (code, message, retryable) => {
                  dispatch({
                    type: "SET_ERROR",
                    error: { code, message, retryable },
                  });
                  reject(new Error(message));
                },
              }
            );
          });
        }
      }
    },
    [streamAgentTurn]
  );

  const startDebate = useCallback(
    async (opinion: string, rounds: number) => {
      dispatch({ type: "SET_OPINION", opinion });
      dispatch({ type: "SET_ROUNDS", rounds });
      dispatch({ type: "START_BUILD" });

      try {
        await runPhase("build", opinion, rounds);
        dispatch({ type: "BUILD_DONE" });
      } catch {
        // Error already dispatched via SET_ERROR
      }
    },
    [runPhase]
  );

  const generateReportFromTranscript = useCallback(async () => {
    const s = stateRef.current;
    const currentKey = apiKeyRef.current;
    const currentSettings = settingsRef.current;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (currentKey) headers["X-API-Key"] = currentKey;

    const body: ReportRequest = {
      opinion: s.opinion,
      transcript: s.transcript,
      provider: currentSettings.provider,
      model: currentSettings.model,
      baseURL: currentSettings.baseURL,
    };

    const response = await fetch("/api/report", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      dispatch({
        type: "SET_ERROR",
        error: {
          code: "model_error",
          message: text || "Report generation failed",
          retryable: true,
        },
      });
      return;
    }

    const report = await response.json();
    dispatch({ type: "SET_REPORT", report });
  }, []);

  const triggerFlip = useCallback(() => {
    const s = stateRef.current;
    dispatch({ type: "START_FLIP" });
    setTimeout(async () => {
      dispatch({ type: "FLIP_DONE" });
      try {
        await runPhase("demolish", s.opinion, s.rounds);
        dispatch({ type: "DEMOLISH_DONE" });
        dispatch({ type: "START_REPORT" });
        await generateReportFromTranscript();
      } catch {
        // Error already dispatched
      }
    }, 1500);
  }, [runPhase, generateReportFromTranscript]);

  const reset = useCallback(() => {
    abort();
    abortedRef.current = true;
    dispatch({ type: "RESET" });
  }, [abort]);

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  const discardResume = useCallback(() => {
    clearState();
    dispatch({ type: "RESET" });
  }, []);

  return {
    state,
    dispatch,
    startDebate,
    triggerFlip,
    reset,
    clearError,
    discardResume,
    isStreaming,
  };
}
