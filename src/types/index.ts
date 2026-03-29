// ============================================================
// Debate Phases
// ============================================================

export type DebatePhase =
  | "idle"
  | "ready_to_build"    // Opinion submitted, waiting for user to click "开始构建"
  | "building"
  | "build_round_done"  // Interactive mode: round finished, waiting for user input / continue
  | "built"             // All build rounds done, waiting for user to flip
  | "flipping"
  | "ready_to_demolish" // After flip animation, waiting for user to click "开始反驳"
  | "demolishing"
  | "demolish_round_done" // Interactive mode: round finished, waiting for user input / continue
  | "demolished"
  | "reporting"
  | "complete";

export type DebateMode = "auto" | "interactive";

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
  agentRole: AgentRole | "user"; // "user" for user-inserted messages
  phase: Phase;
  round: number;
  content: string;
  timestamp: number;
}

// ============================================================
// Provider Config
// ============================================================

export interface ProviderConfig {
  provider: "anthropic" | "openai" | "custom";
  model: string;
  baseURL?: string;
  providerOptions?: Record<string, unknown>;
}

// ============================================================
// Debate State
// ============================================================

export interface DebateState {
  phase: DebatePhase;
  mode: DebateMode;
  opinion: string;
  rounds: number; // 0 = unlimited (interactive decides when to stop)
  transcript: AgentMessage[];
  pendingContent: string;
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
  providerOptions?: Record<string, unknown>;
}

export interface ReportRequest {
  opinion: string;
  transcript: AgentMessage[];
  provider?: string;
  model?: string;
  baseURL?: string;
  providerOptions?: Record<string, unknown>;
}
