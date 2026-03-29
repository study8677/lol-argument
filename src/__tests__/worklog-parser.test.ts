import { describe, it, expect } from "vitest";
import { parseAgentOutput } from "@/lib/worklog-parser";

describe("parseAgentOutput", () => {
  it("parses complete output with both delimiters", () => {
    const raw = `[[WORKLOG]]
我的分析思路：检查前提的逻辑有效性
[[/WORKLOG]]
[[ANSWER]]
这个观点的核心逻辑结构如下...
[[/ANSWER]]`;

    const result = parseAgentOutput(raw);
    expect(result.worklog).toBe("我的分析思路：检查前提的逻辑有效性");
    expect(result.answer).toBe("这个观点的核心逻辑结构如下...");
  });

  it("falls back to entire content as answer when no delimiters", () => {
    const raw = "This is just plain text without any delimiters.";
    const result = parseAgentOutput(raw);
    expect(result.worklog).toBeNull();
    expect(result.answer).toBe(raw);
  });

  it("handles missing ANSWER delimiters with WORKLOG present", () => {
    const raw = `[[WORKLOG]]
思路分析
[[/WORKLOG]]
这是正文内容`;

    const result = parseAgentOutput(raw);
    expect(result.worklog).toBe("思路分析");
    expect(result.answer).toBe("这是正文内容");
  });

  it("handles missing WORKLOG delimiters with ANSWER present", () => {
    const raw = `[[ANSWER]]
只有正文，没有工作笔记
[[/ANSWER]]`;

    const result = parseAgentOutput(raw);
    expect(result.worklog).toBeNull();
    expect(result.answer).toBe("只有正文，没有工作笔记");
  });

  it("handles malformed order (end before start)", () => {
    const raw = `[[/WORKLOG]]
内容
[[WORKLOG]]`;

    const result = parseAgentOutput(raw);
    expect(result.worklog).toBeNull();
    expect(result.answer).toBe(raw.trim());
  });

  it("handles empty worklog and answer", () => {
    const raw = `[[WORKLOG]]
[[/WORKLOG]]
[[ANSWER]]
[[/ANSWER]]`;

    const result = parseAgentOutput(raw);
    expect(result.worklog).toBe("");
    expect(result.answer).toBe("");
  });

  it("preserves multi-line content", () => {
    const raw = `[[WORKLOG]]
第一行
第二行
第三行
[[/WORKLOG]]
[[ANSWER]]
论点一：xxx
论点二：yyy
论点三：zzz
[[/ANSWER]]`;

    const result = parseAgentOutput(raw);
    expect(result.worklog).toContain("第一行");
    expect(result.worklog).toContain("第三行");
    expect(result.answer).toContain("论点一：xxx");
    expect(result.answer).toContain("论点三：zzz");
  });

  it("handles empty input", () => {
    const result = parseAgentOutput("");
    expect(result.worklog).toBeNull();
    expect(result.answer).toBe("");
  });

  it("handles whitespace-only input", () => {
    const result = parseAgentOutput("   \n\n  ");
    expect(result.worklog).toBeNull();
    expect(result.answer).toBe("");
  });
});
