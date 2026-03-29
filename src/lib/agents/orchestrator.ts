import type { AgentMessage, AgentRole, Phase } from "@/types";
import { getAgent, BUILD_AGENT_ORDER, DEMOLISH_AGENT_ORDER } from "./types";

/**
 * Get the ordered list of agent roles for a given phase.
 */
export function getAgentSequence(phase: Phase): AgentRole[] {
  return phase === "build" ? [...BUILD_AGENT_ORDER] : [...DEMOLISH_AGENT_ORDER];
}

/**
 * Format an AgentMessage[] into readable transcript text with round markers
 * and agent names, for use as LLM context.
 */
export function formatTranscript(messages: AgentMessage[]): string {
  if (messages.length === 0) return "";

  const lines: string[] = [];
  let currentRound = 0;

  for (const msg of messages) {
    if (msg.round !== currentRound) {
      currentRound = msg.round;
      const phaseLabel = msg.phase === "build" ? "构建" : "反驳";
      lines.push(`\n═══ ${phaseLabel}阶段 · 第 ${currentRound} 轮 ═══\n`);
    }

    const agent = getAgent(msg.agentRole);
    lines.push(`【${agent.name}】:`);
    lines.push(msg.content);
    lines.push("");
  }

  return lines.join("\n").trim();
}

/**
 * Extract the fortified argument from the build transcript.
 * This is the synthesizer's last message in the build phase.
 */
export function extractFortifiedArgument(
  transcript: AgentMessage[]
): string | null {
  const buildMessages = transcript.filter((m) => m.phase === "build");
  for (let i = buildMessages.length - 1; i >= 0; i--) {
    if (buildMessages[i].agentRole === "synthesizer") {
      return buildMessages[i].content;
    }
  }
  return null;
}

/**
 * Build the user prompt for a single agent turn.
 */
export function buildUserPrompt(
  opinion: string,
  transcript: AgentMessage[],
  agentRole: AgentRole,
  round: number,
  totalRounds: number,
  phase: Phase
): string {
  const agent = getAgent(agentRole);
  const parts: string[] = [];

  // Original opinion
  parts.push(`## 用户的原始观点\n\n${opinion}`);

  // Build phase context for demolish agents
  if (phase === "demolish") {
    const buildMessages = transcript.filter((m) => m.phase === "build");
    if (buildMessages.length > 0) {
      parts.push(`## 构建阶段的完整讨论记录\n\n${formatTranscript(buildMessages)}`);
    }

    const fortified = extractFortifiedArgument(transcript);
    if (fortified) {
      parts.push(
        `## 加固版论证（Fortified Argument）\n\n以下是构建阶段的最终加固版论证，这是你需要重点攻击的靶子：\n\n${fortified}`
      );
    }
  }

  // Current phase transcript (only messages from current phase)
  const phaseMessages = transcript.filter((m) => m.phase === phase);
  if (phaseMessages.length > 0) {
    const label = phase === "build" ? "构建" : "反驳";
    parts.push(
      `## ${label}阶段的已有讨论\n\n${formatTranscript(phaseMessages)}`
    );
  }

  // Current turn instructions
  const isLastRound = round === totalRounds;
  const phaseLabel = phase === "build" ? "构建" : "反驳";

  parts.push(`## 当前任务`);
  parts.push(`你是「${agent.name}」，现在是${phaseLabel}阶段的第 ${round}/${totalRounds} 轮。`);

  if (phase === "build") {
    // Find agents who already spoke this round
    const thisRoundMessages = phaseMessages.filter((m) => m.round === round);
    if (thisRoundMessages.length > 0) {
      const spoke = thisRoundMessages.map(
        (m) => getAgent(m.agentRole).name
      );
      parts.push(`本轮已经发言的智能体：${spoke.join("、")}。请在他们的基础上继续加固论证。`);
    }

    if (isLastRound && agentRole === "synthesizer") {
      parts.push(
        `\n⚠️ 这是最后一轮，你的输出将作为「加固版论证」(Fortified Argument)——整个构建阶段的最终成果。请产出一份完整、自洽、经过多轮迭代加固的最终论证。`
      );
    }
  } else {
    // Demolish phase
    const thisRoundMessages = phaseMessages.filter((m) => m.round === round);
    if (thisRoundMessages.length > 0) {
      const spoke = thisRoundMessages.map(
        (m) => getAgent(m.agentRole).name
      );
      parts.push(`本轮已经发言的攻击者：${spoke.join("、")}。配合他们的攻击，从你的角度继续摧毁论证。`);
    }

    if (isLastRound && agentRole === "deconstructor") {
      parts.push(
        `\n⚠️ 这是最后一轮，你是最后一个发言者。请总结整个反驳阶段对论证造成的总体损害，评估原始论证中有多少经受住了攻击。`
      );
    }
  }

  return parts.join("\n\n");
}
