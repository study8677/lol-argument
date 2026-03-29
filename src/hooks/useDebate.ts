"use client";

import { useReducer, useCallback, useRef, useEffect } from "react";
import type {
  DebateState,
  DebateMode,
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
  | { type: "SUBMIT_OPINION"; opinion: string; rounds: number; mode: DebateMode }
  | { type: "START_BUILD" }
  | { type: "AGENT_START"; agentRole: AgentRole; round: number; phase: Phase }
  | { type: "APPEND_TOKEN"; content: string }
  | { type: "AGENT_DONE"; agentRole: AgentRole; round: number; phase: Phase; fullContent: string }
  | { type: "ROUND_DONE"; round: number; phase: Phase }  // Interactive: pause after round
  | { type: "ADD_USER_MESSAGE"; content: string; phase: Phase; round: number }
  | { type: "CONTINUE_NEXT_ROUND" }  // User clicks "继续下一轮"
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
  mode: "interactive",
  opinion: "",
  rounds: 3,
  transcript: [],
  pendingContent: "",
  currentRound: 0,
  currentAgent: null,
  report: null,
  error: null,
};

export function debateReducer(state: DebateState, action: Action): DebateState {
  switch (action.type) {
    case "SUBMIT_OPINION":
      return {
        ...state,
        phase: "ready_to_build",
        opinion: action.opinion,
        rounds: action.rounds,
        mode: action.mode,
        transcript: [],
        error: null,
      };

    case "START_BUILD":
      return { ...state, phase: "building", error: null };

    case "AGENT_START":
      return {
        ...state,
        currentAgent: action.agentRole,
        currentRound: action.round,
        pendingContent: "",
      };

    case "APPEND_TOKEN":
      return { ...state, pendingContent: state.pendingContent + action.content };

    case "AGENT_DONE": {
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

    case "ROUND_DONE": {
      // Interactive mode: pause for user after round completes
      const pausePhase = action.phase === "build" ? "build_round_done" : "demolish_round_done";
      return {
        ...state,
        phase: pausePhase as DebateState["phase"],
        currentRound: action.round,
        currentAgent: null,
      };
    }

    case "ADD_USER_MESSAGE": {
      const msg: AgentMessage = {
        id: `user-${action.phase}-${action.round}-${Date.now()}`,
        agentRole: "user",
        phase: action.phase,
        round: action.round,
        content: action.content,
        timestamp: Date.now(),
      };
      return { ...state, transcript: [...state.transcript, msg] };
    }

    case "CONTINUE_NEXT_ROUND": {
      // Resume from round_done to building/demolishing
      const resumePhase = state.phase === "build_round_done" ? "building" : "demolishing";
      return { ...state, phase: resumePhase };
    }

    case "BUILD_DONE":
      return { ...state, phase: "built", currentAgent: null, currentRound: 0 };

    case "START_FLIP":
      return { ...state, phase: "flipping" };

    case "FLIP_DONE":
      return { ...state, phase: "ready_to_demolish" };

    case "START_DEMOLISH":
      return { ...state, phase: "demolishing", error: null };

    case "DEMOLISH_DONE":
      return { ...state, phase: "demolished", currentAgent: null, currentRound: 0 };

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

  // Save to sessionStorage on transcript/phase/report changes
  useEffect(() => {
    if (state.phase !== "idle") {
      saveState(state);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.transcript, state.phase, state.report]);

  /**
   * Run a single round (4 agent turns) for a given phase.
   */
  const runRound = useCallback(
    async (phase: Phase, opinion: string, round: number, totalRounds: number) => {
      const agents = getAgentSequence(phase);

      for (const agentRole of agents) {
        if (abortedRef.current) return;

        await new Promise<void>((resolve, reject) => {
          const currentTranscript = stateRef.current.transcript;
          const currentSettings = settingsRef.current;
          const currentKey = apiKeyRef.current;

          streamAgentTurn(
            {
              opinion,
              transcript: currentTranscript,
              agentRole,
              round,
              rounds: totalRounds,
              phase,
              provider: currentSettings.provider,
              model: currentSettings.model,
              baseURL: currentSettings.baseURL,
              providerOptions: currentSettings.providerOptions,
            },
            currentKey || undefined,
            {
              onStart: (event) => {
                dispatch({ type: "AGENT_START", agentRole: event.agentRole, round: event.round, phase: event.phase });
              },
              onToken: (content) => {
                dispatch({ type: "APPEND_TOKEN", content });
              },
              onDone: (fullContent) => {
                dispatch({ type: "AGENT_DONE", agentRole, round, phase, fullContent });
                resolve();
              },
              onError: (code, message, retryable) => {
                dispatch({ type: "SET_ERROR", error: { code, message, retryable } });
                reject(new Error(message));
              },
            }
          );
        });
      }
    },
    [streamAgentTurn]
  );

  /**
   * Run an entire phase. In auto mode, runs all rounds. In interactive mode, runs one round then pauses.
   */
  const runPhase = useCallback(
    async (phase: Phase, opinion: string, totalRounds: number, startRound: number = 1) => {
      abortedRef.current = false;
      const mode = stateRef.current.mode;

      for (let round = startRound; round <= totalRounds; round++) {
        if (abortedRef.current) return;

        await runRound(phase, opinion, round, totalRounds);

        // In interactive mode, pause after each round (except the last)
        if (mode === "interactive" && round < totalRounds) {
          dispatch({ type: "ROUND_DONE", round, phase });
          return; // Exit — user will call continueNextRound to resume
        }
      }

      // All rounds done
      if (phase === "build") {
        dispatch({ type: "BUILD_DONE" });
      } else {
        dispatch({ type: "DEMOLISH_DONE" });
      }
    },
    [runRound]
  );

  // ---- Public API ----

  const submitOpinion = useCallback((opinion: string, rounds: number, mode: DebateMode) => {
    dispatch({ type: "SUBMIT_OPINION", opinion, rounds, mode });
  }, []);

  const startBuild = useCallback(async () => {
    const s = stateRef.current;
    dispatch({ type: "START_BUILD" });
    try {
      await runPhase("build", s.opinion, s.rounds);
    } catch {
      // Error already dispatched
    }
  }, [runPhase]);

  const continueNextRound = useCallback(async (userMessage?: string) => {
    const s = stateRef.current;
    const currentPhase: Phase = s.phase === "build_round_done" ? "build" : "demolish";
    const nextRound = s.currentRound + 1;

    // Add user message if provided
    if (userMessage?.trim()) {
      dispatch({
        type: "ADD_USER_MESSAGE",
        content: userMessage.trim(),
        phase: currentPhase,
        round: s.currentRound, // Attach to the round just completed
      });
    }

    dispatch({ type: "CONTINUE_NEXT_ROUND" });

    try {
      await runPhase(currentPhase, s.opinion, s.rounds, nextRound);
    } catch {
      // Error already dispatched
    }
  }, [runPhase]);

  const finishBuildEarly = useCallback(() => {
    // In interactive mode, user can decide "够了" before all rounds complete
    dispatch({ type: "BUILD_DONE" });
  }, []);

  const triggerFlip = useCallback(() => {
    dispatch({ type: "START_FLIP" });
    setTimeout(() => {
      dispatch({ type: "FLIP_DONE" });
      // Now at ready_to_demolish — user clicks "开始反驳"
    }, 1500);
  }, []);

  const startDemolish = useCallback(async () => {
    const s = stateRef.current;
    dispatch({ type: "START_DEMOLISH" });
    try {
      await runPhase("demolish", s.opinion, s.rounds);
      // If auto mode, auto-generate report after demolish
      if (stateRef.current.phase === "demolished") {
        dispatch({ type: "START_REPORT" });
        await generateReportFromTranscript();
      }
    } catch {
      // Error already dispatched
    }
  }, [runPhase]);

  const generateReportFromTranscript = useCallback(async () => {
    const s = stateRef.current;
    const currentKey = apiKeyRef.current;
    const currentSettings = settingsRef.current;

    dispatch({ type: "START_REPORT" });

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (currentKey) headers["X-API-Key"] = currentKey;

    const body: ReportRequest = {
      opinion: s.opinion,
      transcript: s.transcript,
      provider: currentSettings.provider,
      model: currentSettings.model,
      baseURL: currentSettings.baseURL,
      providerOptions: currentSettings.providerOptions,
    };

    const response = await fetch("/api/report", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      dispatch({ type: "SET_ERROR", error: { code: "model_error", message: text || "Report generation failed", retryable: true } });
      return;
    }

    const report = await response.json();
    dispatch({ type: "SET_REPORT", report });
  }, []);

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
    submitOpinion,
    startBuild,
    continueNextRound,
    finishBuildEarly,
    triggerFlip,
    startDemolish,
    generateReportFromTranscript,
    reset,
    clearError,
    discardResume,
    isStreaming,
  };
}
