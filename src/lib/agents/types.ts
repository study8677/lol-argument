import type { AgentDefinition, AgentRole, Phase } from "@/types";
import { BUILD_AGENTS } from "./build-agents";
import { DEMOLISH_AGENTS } from "./demolish-agents";

export const ALL_AGENTS: AgentDefinition[] = [
  ...BUILD_AGENTS,
  ...DEMOLISH_AGENTS,
];

export function getAgent(role: AgentRole): AgentDefinition {
  const agent = ALL_AGENTS.find((a) => a.role === role);
  if (!agent) throw new Error(`Unknown agent role: ${role}`);
  return agent;
}

export function getAgentsForPhase(phase: Phase): AgentDefinition[] {
  return phase === "build" ? BUILD_AGENTS : DEMOLISH_AGENTS;
}

export const BUILD_AGENT_ORDER: AgentRole[] = [
  "logician",
  "empiricist",
  "philosopher",
  "synthesizer",
];

export const DEMOLISH_AGENT_ORDER: AgentRole[] = [
  "skeptic",
  "devils_advocate",
  "realist",
  "deconstructor",
];
