"use client";

import { getAgent } from "@/lib/agents/types";
import type { AgentRole, Phase } from "@/types";

interface ProgressIndicatorProps {
  phase: Phase;
  currentRound: number;
  totalRounds: number;
  currentAgent: AgentRole | null;
  totalAgents: number;
  completedTurns: number;
  totalTurns: number;
}

export function ProgressIndicator({
  phase,
  currentRound,
  totalRounds,
  currentAgent,
  completedTurns,
  totalTurns,
}: ProgressIndicatorProps) {
  const phaseLabel = phase === "build" ? "构建阶段" : "反驳阶段";
  const agentLabel = currentAgent ? getAgent(currentAgent).name : "准备中";
  const progress = totalTurns > 0 ? (completedTurns / totalTurns) * 100 : 0;
  const barColor = phase === "build" ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-400">
          {phaseLabel} · 第 {currentRound}/{totalRounds} 轮 ·{" "}
          <span className="text-neutral-200">{agentLabel}</span>
          {currentAgent && "发言中..."}
        </span>
        <span className="text-neutral-500 text-xs">
          {completedTurns}/{totalTurns}
        </span>
      </div>
      <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-500`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
