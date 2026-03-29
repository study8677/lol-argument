import { generateText } from "ai";
import type { LanguageModel } from "ai";
import type { AgentMessage, StressTestReport } from "@/types";
import { formatTranscript } from "@/lib/agents/orchestrator";
import { STRESS_TEST_REPORT_SCHEMA } from "./schema";

const REPORT_SYSTEM_PROMPT = `你是一位严谨的分析师，负责生成「观点压力测试报告」。

## 你的任务
你将看到一场完整的辩论记录：构建阶段（正方加固论证）和反驳阶段（反方攻击论证）。
你需要生成一份结构化的分析报告。

## 关键原则
1. **分析，不复述**：不要总结对话内容。分析哪些论证存活了、哪些被摧毁了、为什么。
2. **评判性**：给出明确的判断，不要模棱两可。如果一个论证被摧毁了，直说。
3. **盲点识别**：找出用户原始观点中完全没有考虑到的角度——这些可能是对话双方都没提到的。
4. **诚实**：如果原始观点确实很弱，就说弱。不要为了"平衡"而人为抬高评分。

## 输出格式
你必须输出且只能输出一个 JSON 对象，严格匹配以下 schema：

${JSON.stringify(STRESS_TEST_REPORT_SCHEMA, null, 2)}

不要输出任何 JSON 之外的内容。不要用 markdown 代码块包裹。直接输出 JSON。`;

/**
 * Generate a stress test report from the full debate transcript.
 * Uses prompt-based JSON (not structured output API) for provider compatibility.
 * Includes one retry on parse failure.
 */
export async function generateReport(
  model: LanguageModel,
  opinion: string,
  transcript: AgentMessage[]
): Promise<StressTestReport> {
  const buildMessages = transcript.filter((m) => m.phase === "build");
  const demolishMessages = transcript.filter((m) => m.phase === "demolish");

  const userPrompt = `## 用户的原始观点

${opinion}

## 构建阶段记录

${formatTranscript(buildMessages)}

## 反驳阶段记录

${formatTranscript(demolishMessages)}

请根据以上辩论记录，生成观点压力测试报告。输出 JSON。`;

  // First attempt
  let result = await generateText({
    model,
    system: REPORT_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
    maxOutputTokens: 4096,
  });

  let report = tryParseReport(result.text);
  if (report) return report;

  // Retry once with error feedback
  result = await generateText({
    model,
    system: REPORT_SYSTEM_PROMPT,
    messages: [
      { role: "user", content: userPrompt },
      { role: "assistant", content: result.text },
      {
        role: "user",
        content: `你的输出不是有效的 JSON。请直接输出 JSON 对象，不要包含任何其他文字或 markdown 格式。`,
      },
    ],
    maxOutputTokens: 4096,
  });

  report = tryParseReport(result.text);
  if (report) return report;

  throw new Error("Failed to generate valid report JSON after retry");
}

function tryParseReport(text: string): StressTestReport | null {
  try {
    // Strip markdown code fences if present
    let cleaned = text.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
    }
    const parsed = JSON.parse(cleaned);

    // Basic validation
    if (
      typeof parsed.originalOpinion !== "string" ||
      typeof parsed.buildSummary !== "string" ||
      typeof parsed.demolishSummary !== "string" ||
      !Array.isArray(parsed.survivalAssessment) ||
      !Array.isArray(parsed.blindSpots) ||
      typeof parsed.conclusion !== "string" ||
      !["strong", "moderate", "weak", "demolished"].includes(
        parsed.overallStrength
      )
    ) {
      return null;
    }

    return parsed as StressTestReport;
  } catch {
    return null;
  }
}
