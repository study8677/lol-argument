import { describe, it, expect } from "vitest";
import {
  getAgentSequence,
  formatTranscript,
  extractFortifiedArgument,
  buildUserPrompt,
} from "@/lib/agents/orchestrator";
import type { AgentMessage } from "@/types";

function makeMsg(
  agentRole: AgentMessage["agentRole"],
  phase: AgentMessage["phase"],
  round: number,
  content: string
): AgentMessage {
  return {
    id: `${phase}-${round}-${agentRole}`,
    agentRole,
    phase,
    round,
    content,
    timestamp: Date.now(),
  };
}

describe("getAgentSequence", () => {
  it("returns build agents in correct order", () => {
    const seq = getAgentSequence("build");
    expect(seq).toEqual(["logician", "empiricist", "philosopher", "synthesizer"]);
  });

  it("returns demolish agents in correct order", () => {
    const seq = getAgentSequence("demolish");
    expect(seq).toEqual(["skeptic", "devils_advocate", "realist", "deconstructor"]);
  });

  it("returns a new array each time (not a reference)", () => {
    const a = getAgentSequence("build");
    const b = getAgentSequence("build");
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });
});

describe("formatTranscript", () => {
  it("returns empty string for empty array", () => {
    expect(formatTranscript([])).toBe("");
  });

  it("formats messages with round separators", () => {
    const messages: AgentMessage[] = [
      makeMsg("logician", "build", 1, "逻辑分析内容"),
      makeMsg("empiricist", "build", 1, "实证分析内容"),
      makeMsg("logician", "build", 2, "第二轮逻辑"),
    ];

    const result = formatTranscript(messages);
    expect(result).toContain("构建阶段 · 第 1 轮");
    expect(result).toContain("构建阶段 · 第 2 轮");
    expect(result).toContain("【逻辑学家】:");
    expect(result).toContain("【实证主义者】:");
    expect(result).toContain("逻辑分析内容");
  });

  it("labels demolish phase correctly", () => {
    const messages: AgentMessage[] = [
      makeMsg("skeptic", "demolish", 1, "质疑内容"),
    ];

    const result = formatTranscript(messages);
    expect(result).toContain("反驳阶段 · 第 1 轮");
    expect(result).toContain("【怀疑论者】:");
  });
});

describe("extractFortifiedArgument", () => {
  it("returns synthesizer last message from build phase", () => {
    const transcript: AgentMessage[] = [
      makeMsg("logician", "build", 1, "R1 logic"),
      makeMsg("synthesizer", "build", 1, "R1 synthesis"),
      makeMsg("logician", "build", 2, "R2 logic"),
      makeMsg("synthesizer", "build", 2, "R2 synthesis - fortified"),
    ];

    expect(extractFortifiedArgument(transcript)).toBe(
      "R2 synthesis - fortified"
    );
  });

  it("ignores demolish phase messages", () => {
    const transcript: AgentMessage[] = [
      makeMsg("synthesizer", "build", 1, "Build synthesis"),
      makeMsg("skeptic", "demolish", 1, "Demolish content"),
    ];

    expect(extractFortifiedArgument(transcript)).toBe("Build synthesis");
  });

  it("returns null when no synthesizer messages", () => {
    const transcript: AgentMessage[] = [
      makeMsg("logician", "build", 1, "Logic only"),
    ];

    expect(extractFortifiedArgument(transcript)).toBeNull();
  });

  it("returns null for empty transcript", () => {
    expect(extractFortifiedArgument([])).toBeNull();
  });
});

describe("buildUserPrompt", () => {
  const opinion = "远程办公比坐班更高效";

  it("includes original opinion", () => {
    const prompt = buildUserPrompt(opinion, [], "logician", 1, 3, "build");
    expect(prompt).toContain(opinion);
    expect(prompt).toContain("用户的原始观点");
  });

  it("includes current round info", () => {
    const prompt = buildUserPrompt(opinion, [], "logician", 2, 3, "build");
    expect(prompt).toContain("第 2/3 轮");
  });

  it("marks last round for synthesizer", () => {
    const prompt = buildUserPrompt(opinion, [], "synthesizer", 3, 3, "build");
    expect(prompt).toContain("加固版论证");
    expect(prompt).toContain("最后一轮");
  });

  it("does not mark last round for non-synthesizer", () => {
    const prompt = buildUserPrompt(opinion, [], "logician", 3, 3, "build");
    expect(prompt).not.toContain("加固版论证");
  });

  it("includes build transcript for demolish phase", () => {
    const transcript: AgentMessage[] = [
      makeMsg("logician", "build", 1, "Build logic"),
      makeMsg("synthesizer", "build", 1, "Fortified content"),
    ];

    const prompt = buildUserPrompt(
      opinion,
      transcript,
      "skeptic",
      1,
      3,
      "demolish"
    );
    expect(prompt).toContain("构建阶段的完整讨论记录");
    expect(prompt).toContain("Build logic");
    expect(prompt).toContain("加固版论证（Fortified Argument）");
    expect(prompt).toContain("Fortified content");
  });

  it("lists previously spoken agents in current round", () => {
    const transcript: AgentMessage[] = [
      makeMsg("logician", "build", 1, "Logic done"),
    ];

    const prompt = buildUserPrompt(
      opinion,
      transcript,
      "empiricist",
      1,
      3,
      "build"
    );
    expect(prompt).toContain("逻辑学家");
    expect(prompt).toContain("已经发言");
  });

  it("works for different round counts", () => {
    for (const rounds of [3, 5, 7]) {
      const prompt = buildUserPrompt(opinion, [], "logician", 1, rounds, "build");
      expect(prompt).toContain(`第 1/${rounds} 轮`);
    }
  });

  it("marks last round for deconstructor in demolish", () => {
    const prompt = buildUserPrompt(
      opinion,
      [],
      "deconstructor",
      3,
      3,
      "demolish"
    );
    expect(prompt).toContain("最后一轮");
    expect(prompt).toContain("总体损害");
  });
});
