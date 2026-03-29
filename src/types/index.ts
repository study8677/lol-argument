// ============================================================
// Debate Phases
// ============================================================

export type DebatePhase =
  | "idle"
  | "building"
  | "built"
  | "flipping"
  | "demolishing"
  | "demolished"
  | "reporting"
  | "complete";

// ============================================================
// Agent Roles
// ============================================================

export type BuildAgentRole =
  | "logician"
  | "empiricist"
  | "philosopher"
  | "synthesizer";

export type DemolishAgentRole =
  | "skeptic"
  | "devils_advocate"
  | "realist"
  | "deconstructor";

export type AgentRole = BuildAgentRole | DemolishAgentRole;

export type Phase = "build" | "demolish";

// ============================================================
// Agent Definition
// ============================================================

export interface AgentDefinition {
  role: AgentRole;
  name: string; // Chinese display name, e.g. "逻辑学家"
  title: string; // English subtitle, e.g. "The Logician"
  description: string;
  color: string; // Tailwind color class for border/accent
  avatar: string; // Emoji
  phase: Phase;
  systemPrompt: string;
}

// ============================================================
// Messages & Transcript
// ============================================================

export interface AgentMessage {
  id: string;
  agentRole: AgentRole;
  phase: Phase;
  round: number;
  content: string; // Full committed content (worklog + answer raw)
  timestamp: number;
}

// ============================================================
// Provider Config
// ============================================================

export interface ProviderConfig {
  provider: "anthropic" | "openai" | "custom";
  model: string;
  baseURL?: string;
}

// ============================================================
// Debate State
// ============================================================

export interface DebateState {
  phase: DebatePhase;
  opinion: string;
  rounds: number;
  transcript: AgentMessage[]; // Single array, phase on each message
  pendingContent: string; // Temp UI buffer for streaming tokens
  currentRound: number;
  currentAgent: AgentRole | null;
  report: StressTestReport | null;
  error: DebateError | null;
}

export interface DebateError {
  code: string;
  message: string;
  retryable: boolean;
}

// ============================================================
// Stress Test Report
// ============================================================

export interface StressTestReport {
  originalOpinion: string;
  buildSummary: string;
  demolishSummary: string;
  survivalAssessment: SurvivalItem[];
  blindSpots: string[];
  conclusion: string;
  overallStrength: "strong" | "moderate" | "weak" | "demolished";
}

export interface SurvivalItem {
  argument: string;
  survived: boolean;
  explanation: string;
}

// ============================================================
// API Request Types
// ============================================================

export interface TurnRequest {
  opinion: string;
  transcript: AgentMessage[];
  agentRole: AgentRole;
  round: number;
  rounds: number;
  phase: Phase;
  provider?: string;
  model?: string;
  baseURL?: string;
}

export interface ReportRequest {
  opinion: string;
  transcript: AgentMessage[];
  provider?: string;
  model?: string;
  baseURL?: string;
}
