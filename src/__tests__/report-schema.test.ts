import { describe, it, expect } from "vitest";
import type { StressTestReport } from "@/types";

function isValidReport(obj: unknown): obj is StressTestReport {
  if (typeof obj !== "object" || obj === null) return false;
  const r = obj as Record<string, unknown>;

  if (typeof r.originalOpinion !== "string") return false;
  if (typeof r.buildSummary !== "string") return false;
  if (typeof r.demolishSummary !== "string") return false;
  if (!Array.isArray(r.survivalAssessment)) return false;
  if (!Array.isArray(r.blindSpots)) return false;
  if (typeof r.conclusion !== "string") return false;
  if (!["strong", "moderate", "weak", "demolished"].includes(r.overallStrength as string))
    return false;

  for (const item of r.survivalAssessment) {
    if (typeof item !== "object" || item === null) return false;
    const i = item as Record<string, unknown>;
    if (typeof i.argument !== "string") return false;
    if (typeof i.survived !== "boolean") return false;
    if (typeof i.explanation !== "string") return false;
  }

  for (const spot of r.blindSpots) {
    if (typeof spot !== "string") return false;
  }

  return true;
}

describe("StressTestReport schema validation", () => {
  it("accepts a valid complete report", () => {
    const report: StressTestReport = {
      originalOpinion: "远程办公比坐班更高效",
      buildSummary: "构建了关于效率和生活质量的论证",
      demolishSummary: "攻击了效率假设和协作损失",
      survivalAssessment: [
        {
          argument: "减少通勤时间提高生产力",
          survived: true,
          explanation: "数据支撑充分，反驳方未能有效否定",
        },
        {
          argument: "远程办公促进创新",
          survived: false,
          explanation: "缺乏直接证据，反方用实例有效反驳",
        },
      ],
      blindSpots: ["未考虑行业差异", "忽略了管理成本"],
      conclusion: "观点部分成立但需要限定范围",
      overallStrength: "moderate",
    };

    expect(isValidReport(report)).toBe(true);
  });

  it("accepts report with empty arrays", () => {
    const report: StressTestReport = {
      originalOpinion: "test",
      buildSummary: "test",
      demolishSummary: "test",
      survivalAssessment: [],
      blindSpots: [],
      conclusion: "test",
      overallStrength: "demolished",
    };

    expect(isValidReport(report)).toBe(true);
  });

  it("rejects invalid overallStrength", () => {
    const report = {
      originalOpinion: "test",
      buildSummary: "test",
      demolishSummary: "test",
      survivalAssessment: [],
      blindSpots: [],
      conclusion: "test",
      overallStrength: "very_strong", // invalid
    };

    expect(isValidReport(report)).toBe(false);
  });

  it("rejects missing required fields", () => {
    expect(isValidReport({})).toBe(false);
    expect(isValidReport({ originalOpinion: "test" })).toBe(false);
    expect(isValidReport(null)).toBe(false);
    expect(isValidReport("string")).toBe(false);
  });

  it("rejects invalid survival assessment items", () => {
    const report = {
      originalOpinion: "test",
      buildSummary: "test",
      demolishSummary: "test",
      survivalAssessment: [{ argument: "test" }], // missing survived and explanation
      blindSpots: [],
      conclusion: "test",
      overallStrength: "weak",
    };

    expect(isValidReport(report)).toBe(false);
  });

  it("rejects non-string blind spots", () => {
    const report = {
      originalOpinion: "test",
      buildSummary: "test",
      demolishSummary: "test",
      survivalAssessment: [],
      blindSpots: [123], // should be string
      conclusion: "test",
      overallStrength: "moderate",
    };

    expect(isValidReport(report)).toBe(false);
  });
});
