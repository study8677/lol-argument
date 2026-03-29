"use client";

import { useMemo } from "react";
import { AgentAvatar } from "./AgentAvatar";
import { parseAgentOutput } from "@/lib/worklog-parser";
import type { AgentRole, Phase } from "@/types";

interface AgentMessageProps {
  agentRole: AgentRole;
  round: number;
  content: string;
  isStreaming?: boolean;
  phase: Phase;
}

export function AgentMessage({
  agentRole,
  round,
  content,
  isStreaming = false,
  phase,
}: AgentMessageProps) {
  const { worklog, answer } = useMemo(
    () => (isStreaming ? { worklog: null, answer: content } : parseAgentOutput(content)),
    [content, isStreaming]
  );

  const borderColor =
    phase === "build" ? "border-amber-800/50" : "border-red-800/50";
  const accentColor =
    phase === "build" ? "text-amber-600" : "text-red-600";

  return (
    <div
      className={`flex gap-3 p-4 rounded-lg border ${borderColor} bg-neutral-900/50 animate-message-appear`}
    >
      <AgentAvatar role={agentRole} isActive={isStreaming} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs ${accentColor}`}>
            第 {round} 轮
          </span>
        </div>

        {/* Worklog (collapsible) */}
        {worklog && (
          <details className="mb-3">
            <summary className="text-xs text-neutral-500 cursor-pointer hover:text-neutral-400">
              工作笔记
            </summary>
            <div className="mt-1 text-xs text-neutral-500 pl-3 border-l border-neutral-800 whitespace-pre-wrap">
              {worklog}
            </div>
          </details>
        )}

        {/* Answer */}
        <div
          className={`text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed ${isStreaming ? "animate-streaming-pulse" : ""}`}
        >
          {answer}
          {isStreaming && (
            <span className="inline-block w-1.5 h-4 bg-neutral-400 ml-0.5 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}
