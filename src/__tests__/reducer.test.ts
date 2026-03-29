import { describe, it, expect } from "vitest";
import { debateReducer, initialState } from "@/hooks/useDebate";
import type { DebateState } from "@/types";

describe("debateReducer", () => {
  it("starts with idle phase", () => {
    expect(initialState.phase).toBe("idle");
    expect(initialState.transcript).toEqual([]);
    expect(initialState.pendingContent).toBe("");
  });

  it("SET_OPINION updates opinion", () => {
    const state = debateReducer(initialState, {
      type: "SET_OPINION",
      opinion: "远程办公更好",
    });
    expect(state.opinion).toBe("远程办公更好");
  });

  it("SET_ROUNDS updates rounds", () => {
    const state = debateReducer(initialState, {
      type: "SET_ROUNDS",
      rounds: 5,
    });
    expect(state.rounds).toBe(5);
  });

  it("START_BUILD transitions to building and clears transcript", () => {
    const preState: DebateState = {
      ...initialState,
      transcript: [
        {
          id: "old",
          agentRole: "logician",
          phase: "build",
          round: 1,
          content: "old",
          timestamp: 1,
        },
      ],
    };
    const state = debateReducer(preState, { type: "START_BUILD" });
    expect(state.phase).toBe("building");
    expect(state.transcript).toEqual([]);
    expect(state.error).toBeNull();
  });

  it("AGENT_START sets current agent and clears pending", () => {
    const state = debateReducer(initialState, {
      type: "AGENT_START",
      agentRole: "logician",
      round: 1,
      phase: "build",
    });
    expect(state.currentAgent).toBe("logician");
    expect(state.currentRound).toBe(1);
    expect(state.pendingContent).toBe("");
  });

  it("APPEND_TOKEN only updates pendingContent, NOT transcript", () => {
    const baseState: DebateState = {
      ...initialState,
      phase: "building",
      currentAgent: "logician",
    };
    const state = debateReducer(baseState, {
      type: "APPEND_TOKEN",
      content: "Hello",
    });
    expect(state.pendingContent).toBe("Hello");
    expect(state.transcript).toEqual([]);

    const state2 = debateReducer(state, {
      type: "APPEND_TOKEN",
      content: " World",
    });
    expect(state2.pendingContent).toBe("Hello World");
    expect(state2.transcript).toEqual([]);
  });

  it("AGENT_DONE is the only action that mutates transcript", () => {
    const baseState: DebateState = {
      ...initialState,
      phase: "building",
      currentAgent: "logician",
      pendingContent: "some pending",
    };

    const state = debateReducer(baseState, {
      type: "AGENT_DONE",
      agentRole: "logician",
      round: 1,
      phase: "build",
      fullContent: "Full committed content",
    });

    expect(state.transcript).toHaveLength(1);
    expect(state.transcript[0].content).toBe("Full committed content");
    expect(state.transcript[0].agentRole).toBe("logician");
    expect(state.transcript[0].phase).toBe("build");
    expect(state.transcript[0].round).toBe(1);
    expect(state.pendingContent).toBe("");
    expect(state.currentAgent).toBeNull();
  });

  it("BUILD_DONE transitions to built", () => {
    const state = debateReducer(
      { ...initialState, phase: "building" },
      { type: "BUILD_DONE" }
    );
    expect(state.phase).toBe("built");
    expect(state.currentAgent).toBeNull();
  });

  it("START_FLIP → FLIP_DONE transitions through flipping", () => {
    let state = debateReducer(
      { ...initialState, phase: "built" },
      { type: "START_FLIP" }
    );
    expect(state.phase).toBe("flipping");

    state = debateReducer(state, { type: "FLIP_DONE" });
    expect(state.phase).toBe("demolishing");
  });

  it("DEMOLISH_DONE transitions to demolished", () => {
    const state = debateReducer(
      { ...initialState, phase: "demolishing" },
      { type: "DEMOLISH_DONE" }
    );
    expect(state.phase).toBe("demolished");
  });

  it("SET_REPORT transitions to complete", () => {
    const report = {
      originalOpinion: "test",
      buildSummary: "built",
      demolishSummary: "demolished",
      survivalAssessment: [],
      blindSpots: [],
      conclusion: "done",
      overallStrength: "moderate" as const,
    };
    const state = debateReducer(
      { ...initialState, phase: "reporting" },
      { type: "SET_REPORT", report }
    );
    expect(state.phase).toBe("complete");
    expect(state.report).toBe(report);
  });

  it("SET_ERROR stores error", () => {
    const error = { code: "invalid_api_key", message: "Bad key", retryable: false };
    const state = debateReducer(initialState, {
      type: "SET_ERROR",
      error,
    });
    expect(state.error).toEqual(error);
  });

  it("CLEAR_ERROR clears error", () => {
    const withError: DebateState = {
      ...initialState,
      error: { code: "test", message: "test", retryable: true },
    };
    const state = debateReducer(withError, { type: "CLEAR_ERROR" });
    expect(state.error).toBeNull();
  });

  it("RESET returns to initial state", () => {
    const modified: DebateState = {
      ...initialState,
      phase: "complete",
      opinion: "something",
      transcript: [
        {
          id: "x",
          agentRole: "logician",
          phase: "build",
          round: 1,
          content: "x",
          timestamp: 1,
        },
      ],
    };
    const state = debateReducer(modified, { type: "RESET" });
    expect(state.phase).toBe("idle");
    expect(state.transcript).toEqual([]);
    expect(state.opinion).toBe("");
  });

  it("RESTORE replaces entire state", () => {
    const restored: DebateState = {
      ...initialState,
      phase: "building",
      opinion: "restored opinion",
      rounds: 5,
    };
    const state = debateReducer(initialState, {
      type: "RESTORE",
      state: restored,
    });
    expect(state.phase).toBe("building");
    expect(state.opinion).toBe("restored opinion");
    expect(state.rounds).toBe(5);
  });

  it("multiple AGENT_DONE calls accumulate transcript", () => {
    let state: DebateState = { ...initialState, phase: "building" };

    state = debateReducer(state, {
      type: "AGENT_DONE",
      agentRole: "logician",
      round: 1,
      phase: "build",
      fullContent: "Logic R1",
    });
    expect(state.transcript).toHaveLength(1);

    state = debateReducer(state, {
      type: "AGENT_DONE",
      agentRole: "empiricist",
      round: 1,
      phase: "build",
      fullContent: "Empirical R1",
    });
    expect(state.transcript).toHaveLength(2);
    expect(state.transcript[0].agentRole).toBe("logician");
    expect(state.transcript[1].agentRole).toBe("empiricist");
  });
});
