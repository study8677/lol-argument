"use client";

import { useCallback } from "react";
import type { StressTestReport, AgentMessage } from "@/types";

interface ReportProps {
  report: StressTestReport;
  opinion: string;
  transcript: AgentMessage[];
  rounds: number;
}

const STRENGTH_LABELS: Record<string, { label: string; color: string }> = {
  strong: { label: "坚固", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  moderate: { label: "中等", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  weak: { label: "脆弱", color: "text-orange-400 bg-orange-500/10 border-orange-500/30" },
  demolished: { label: "被摧毁", color: "text-red-400 bg-red-500/10 border-red-500/30" },
};

export function Report({ report, opinion, transcript, rounds }: ReportProps) {
  const strength = STRENGTH_LABELS[report.overallStrength] ?? STRENGTH_LABELS.moderate;

  const copyAsMarkdown = useCallback(() => {
    const md = formatAsMarkdown(report);
    navigator.clipboard.writeText(md);
  }, [report]);

  const downloadJson = useCallback(() => {
    const data = { opinion, rounds, transcript, report };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lol-argument-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [opinion, rounds, transcript, report]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-neutral-100">
          观点压力测试报告
        </h2>
        <div className={`inline-block mt-3 px-4 py-1.5 rounded-full border text-sm font-medium ${strength.color}`}>
          总体强度：{strength.label}
        </div>
      </div>

      {/* Original Opinion */}
      <section>
        <h3 className="text-sm font-medium text-neutral-400 mb-2">
          原始观点
        </h3>
        <blockquote className="border-l-2 border-neutral-700 pl-4 text-neutral-300 italic">
          {report.originalOpinion}
        </blockquote>
      </section>

      {/* Build Summary */}
      <section>
        <h3 className="text-sm font-medium text-amber-500 mb-2">
          核心论证（构建阶段）
        </h3>
        <p className="text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed">
          {report.buildSummary}
        </p>
      </section>

      {/* Demolish Summary */}
      <section>
        <h3 className="text-sm font-medium text-red-500 mb-2">
          核心攻击（反驳阶段）
        </h3>
        <p className="text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed">
          {report.demolishSummary}
        </p>
      </section>

      {/* Survival Assessment */}
      <section>
        <h3 className="text-sm font-medium text-neutral-400 mb-3">
          存活评估
        </h3>
        <div className="space-y-2">
          {report.survivalAssessment.map((item, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg border ${
                item.survived
                  ? "border-emerald-800/50 bg-emerald-950/30"
                  : "border-red-800/50 bg-red-950/30"
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-base mt-0.5">
                  {item.survived ? "✅" : "❌"}
                </span>
                <div>
                  <div className="text-sm font-medium text-neutral-200">
                    {item.argument}
                  </div>
                  <div className="text-xs text-neutral-400 mt-1">
                    {item.explanation}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Blind Spots */}
      {report.blindSpots.length > 0 && (
        <section>
          <h3 className="text-sm font-medium text-purple-400 mb-2">
            盲点分析
          </h3>
          <ul className="space-y-1.5">
            {report.blindSpots.map((spot, i) => (
              <li key={i} className="flex gap-2 text-sm text-neutral-300">
                <span className="text-purple-500 shrink-0">•</span>
                {spot}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Conclusion */}
      <section>
        <h3 className="text-sm font-medium text-neutral-400 mb-2">
          最终结论
        </h3>
        <p className="text-sm text-neutral-200 whitespace-pre-wrap leading-relaxed">
          {report.conclusion}
        </p>
      </section>

      {/* Export */}
      <div className="flex gap-3 pt-4 border-t border-neutral-800">
        <button
          onClick={copyAsMarkdown}
          className="flex-1 py-2.5 rounded-lg border border-neutral-700 text-sm text-neutral-300 hover:bg-neutral-800 transition-colors"
        >
          复制为 Markdown
        </button>
        <button
          onClick={downloadJson}
          className="flex-1 py-2.5 rounded-lg border border-neutral-700 text-sm text-neutral-300 hover:bg-neutral-800 transition-colors"
        >
          下载 JSON
        </button>
      </div>
    </div>
  );
}

function formatAsMarkdown(report: StressTestReport): string {
  const lines: string[] = [
    "# 观点压力测试报告",
    "",
    `**总体强度：${STRENGTH_LABELS[report.overallStrength]?.label ?? report.overallStrength}**`,
    "",
    "## 原始观点",
    "",
    `> ${report.originalOpinion}`,
    "",
    "## 核心论证（构建阶段）",
    "",
    report.buildSummary,
    "",
    "## 核心攻击（反驳阶段）",
    "",
    report.demolishSummary,
    "",
    "## 存活评估",
    "",
    ...report.survivalAssessment.map(
      (item) =>
        `- ${item.survived ? "✅" : "❌"} **${item.argument}**：${item.explanation}`
    ),
    "",
  ];

  if (report.blindSpots.length > 0) {
    lines.push("## 盲点分析", "");
    for (const spot of report.blindSpots) {
      lines.push(`- ${spot}`);
    }
    lines.push("");
  }

  lines.push("## 最终结论", "", report.conclusion, "");

  return lines.join("\n");
}
