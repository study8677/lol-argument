"use client";

import { useEffect, useRef } from "react";
import { AgentMessage } from "./AgentMessage";
import type { AgentMessage as AgentMessageType, AgentRole, Phase } from "@/types";

interface ConversationStreamProps {
  messages: AgentMessageType[];
  pendingContent: string;
  currentAgent: AgentRole | null;
  currentRound: number;
  phase: Phase;
}

export function ConversationStream({
  messages,
  pendingContent,
  currentAgent,
  currentRound,
  phase,
}: ConversationStreamProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, pendingContent]);

  // Group messages by round
  const phaseMessages = messages.filter((m) => m.phase === phase);
  const rounds = new Map<number, AgentMessageType[]>();
  for (const msg of phaseMessages) {
    const arr = rounds.get(msg.round) ?? [];
    arr.push(msg);
    rounds.set(msg.round, arr);
  }

  const phaseLabel = phase === "build" ? "构建" : "反驳";
  const separatorColor =
    phase === "build" ? "text-amber-700" : "text-red-700";

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto space-y-3 pb-4">
      {Array.from(rounds.entries()).map(([round, msgs]) => (
        <div key={round}>
          {/* Round separator */}
          <div
            className={`text-center text-xs ${separatorColor} py-3 select-none`}
          >
            ═══ {phaseLabel}阶段 · 第 {round} 轮 ═══
          </div>
          <div className="space-y-3">
            {msgs.map((msg) => (
              <AgentMessage
                key={msg.id}
                agentRole={msg.agentRole}
                round={msg.round}
                content={msg.content}
                phase={msg.phase}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Streaming message (not yet committed) */}
      {currentAgent && pendingContent && (
        <div>
          {/* Show round separator if this is a new round */}
          {!phaseMessages.some(
            (m) => m.round === currentRound
          ) && (
            <div
              className={`text-center text-xs ${separatorColor} py-3 select-none`}
            >
              ═══ {phaseLabel}阶段 · 第 {currentRound} 轮 ═══
            </div>
          )}
          <div className="space-y-3">
            <AgentMessage
              agentRole={currentAgent}
              round={currentRound}
              content={pendingContent}
              isStreaming
              phase={phase}
            />
          </div>
        </div>
      )}

      {/* Waiting indicator */}
      {currentAgent && !pendingContent && (
        <div className="text-center text-sm text-neutral-600 py-4">
          正在思考...
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
