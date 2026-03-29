"use client";

import { useMemo } from "react";
import { AgentAvatar } from "./AgentAvatar";
import { parseAgentOutput } from "@/lib/worklog-parser";
import type { AgentRole, Phase } from "@/types";

interface AgentMessageProps {
  agentRole: AgentRole | "user";
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
  const isUser = agentRole === "user";

  const { worklog, answer } = useMemo(
    () => (isStreaming || isUser ? { worklog: null, answer: content } : parseAgentOutput(content)),
    [content, isStreaming, isUser]
  );

  if (isUser) {
    return (
      <div className="flex gap-3 p-4 rounded-lg border border-blue-800/50 bg-blue-950/30 animate-message-appear">
        <div className="w-10 h-10 rounded-full bg-blue-900/50 flex items-center justify-center text-xl shrink-0">
          👤
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-blue-400">你</span>
            <span className="text-xs text-blue-600">第 {round} 轮</span>
          </div>
          <div className="text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed">
            {answer}
          </div>
        </div>
      </div>
    );
  }

  const borderColor = phase === "build" ? "border-amber-800/50" : "border-red-800/50";
  const accentColor = phase === "build" ? "text-amber-600" : "text-red-600";

  return (
    <div className={`flex gap-3 p-4 rounded-lg border ${borderColor} bg-neutral-900/50 animate-message-appear`}>
      <AgentAvatar role={agentRole} isActive={isStreaming} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs ${accentColor}`}>第 {round} 轮</span>
        </div>

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

        <div className={`text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed ${isStreaming ? "animate-streaming-pulse" : ""}`}>
          {answer}
          {isStreaming && <span className="inline-block w-1.5 h-4 bg-neutral-400 ml-0.5 animate-pulse" />}
        </div>
      </div>
    </div>
  );
}
