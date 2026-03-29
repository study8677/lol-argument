"use client";

import { getAgent } from "@/lib/agents/types";
import type { AgentRole } from "@/types";

interface AgentAvatarProps {
  role: AgentRole;
  isActive?: boolean;
  size?: "sm" | "md";
}

export function AgentAvatar({
  role,
  isActive = false,
  size = "md",
}: AgentAvatarProps) {
  const agent = getAgent(role);
  const sizeClasses =
    size === "sm" ? "w-8 h-8 text-base" : "w-10 h-10 text-xl";
  const ringColor = isActive ? `ring-2 ring-${agent.color}-500` : "";

  return (
    <div className="flex items-center gap-2 shrink-0">
      <div
        className={`${sizeClasses} ${ringColor} rounded-full bg-neutral-800 flex items-center justify-center ${isActive ? "animate-streaming-pulse" : ""}`}
      >
        {agent.avatar}
      </div>
      {size === "md" && (
        <div className="min-w-0">
          <div className="text-sm font-medium text-neutral-200 truncate">
            {agent.name}
          </div>
          <div className="text-xs text-neutral-500 truncate">
            {agent.title}
          </div>
        </div>
      )}
    </div>
  );
}
