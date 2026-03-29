"use client";

import { useDebate } from "@/hooks/useDebate";
import { InputForm } from "@/components/InputForm";
import { ConversationStream } from "@/components/ConversationStream";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { FlipButton } from "@/components/FlipButton";
import { PhaseTransition } from "@/components/PhaseTransition";
import { Report } from "@/components/Report";

export default function Home() {
  const {
    state,
    startDebate,
    triggerFlip,
    reset,
    clearError,
    discardResume,
  } = useDebate();

  const buildMessages = state.transcript.filter((m) => m.phase === "build");
  const demolishMessages = state.transcript.filter(
    (m) => m.phase === "demolish"
  );
  const totalBuildTurns = state.rounds * 4;
  const totalDemolishTurns = state.rounds * 4;

  // Resume prompt: has transcript but not actively running
  const isResuming =
    state.phase !== "idle" &&
    state.phase !== "complete" &&
    state.transcript.length > 0 &&
    !state.currentAgent &&
    state.phase !== "built" &&
    state.phase !== "demolished" &&
    state.phase !== "flipping" &&
    state.phase !== "reporting";

  return (
    <main className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 py-8">
      {/* Flip animation overlay */}
      {state.phase === "flipping" && <PhaseTransition />}

      {/* Error display */}
      {state.error && (
        <div className="mb-4 p-4 rounded-lg border border-red-800/50 bg-red-950/30">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-red-400">
                {state.error.code === "invalid_api_key"
                  ? "API Key 无效"
                  : state.error.code === "rate_limited"
                    ? "请求频率过高"
                    : "发生错误"}
              </div>
              <div className="text-xs text-neutral-400 mt-1">
                {state.error.message}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              {state.error.retryable && (
                <button
                  onClick={clearError}
                  className="px-3 py-1.5 text-xs border border-red-700 rounded text-red-400 hover:bg-red-900/30"
                >
                  重试
                </button>
              )}
              <button
                onClick={reset}
                className="px-3 py-1.5 text-xs border border-neutral-700 rounded text-neutral-400 hover:bg-neutral-800"
              >
                重新开始
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IDLE: Landing + Input */}
      {state.phase === "idle" && (
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-neutral-100 mb-3">
              观点压力测试
            </h1>
            <p className="text-neutral-500 text-lg max-w-lg mx-auto">
              8 个 AI 智能体，先把你的观点加固到&ldquo;无懈可击&rdquo;，再把它彻底摧毁。
            </p>
          </div>
          <InputForm onSubmit={startDebate} />
          <div className="text-center mt-8 text-xs text-neutral-700">
            灵感来自 Andrej Karpathy · lol
          </div>
        </div>
      )}

      {/* Resume prompt */}
      {isResuming && !state.error && (
        <div className="mb-6 p-4 rounded-lg border border-neutral-800 bg-neutral-900">
          <p className="text-sm text-neutral-300 mb-3">
            发现未完成的辩论，是否继续？
          </p>
          <p className="text-xs text-neutral-500 mb-4">
            观点：{state.opinion.slice(0, 80)}
            {state.opinion.length > 80 ? "..." : ""}
          </p>
          <div className="flex gap-3">
            <button
              onClick={discardResume}
              className="px-4 py-2 text-sm border border-neutral-700 rounded text-neutral-400 hover:bg-neutral-800"
            >
              放弃，重新开始
            </button>
          </div>
        </div>
      )}

      {/* BUILDING: Build phase */}
      {(state.phase === "building" || state.phase === "built") && (
        <div className="flex-1 flex flex-col">
          <ProgressIndicator
            phase="build"
            currentRound={state.currentRound || 1}
            totalRounds={state.rounds}
            currentAgent={state.currentAgent}
            totalAgents={4}
            completedTurns={buildMessages.length}
            totalTurns={totalBuildTurns}
          />
          <div className="mt-4 flex-1 flex flex-col min-h-0">
            <ConversationStream
              messages={state.transcript}
              pendingContent={state.pendingContent}
              currentAgent={state.currentAgent}
              currentRound={state.currentRound}
              phase="build"
            />
          </div>
          {state.phase === "built" && <FlipButton onClick={triggerFlip} />}
        </div>
      )}

      {/* DEMOLISHING */}
      {(state.phase === "demolishing" || state.phase === "demolished") && (
        <div className="flex-1 flex flex-col">
          {/* Collapsible build phase summary */}
          <details className="mb-4">
            <summary className="text-xs text-neutral-500 cursor-pointer hover:text-neutral-400">
              查看构建阶段 ({buildMessages.length} 条消息)
            </summary>
            <div className="mt-2 max-h-60 overflow-y-auto opacity-60">
              <ConversationStream
                messages={state.transcript}
                pendingContent=""
                currentAgent={null}
                currentRound={0}
                phase="build"
              />
            </div>
          </details>

          <ProgressIndicator
            phase="demolish"
            currentRound={state.currentRound || 1}
            totalRounds={state.rounds}
            currentAgent={state.currentAgent}
            totalAgents={4}
            completedTurns={demolishMessages.length}
            totalTurns={totalDemolishTurns}
          />
          <div className="mt-4 flex-1 flex flex-col min-h-0">
            <ConversationStream
              messages={state.transcript}
              pendingContent={state.pendingContent}
              currentAgent={state.currentAgent}
              currentRound={state.currentRound}
              phase="demolish"
            />
          </div>
        </div>
      )}

      {/* REPORTING */}
      {state.phase === "reporting" && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4 animate-pulse">📊</div>
            <p className="text-neutral-400">正在生成压力测试报告...</p>
          </div>
        </div>
      )}

      {/* COMPLETE: Report */}
      {state.phase === "complete" && state.report && (
        <div className="flex-1">
          <Report
            report={state.report}
            opinion={state.opinion}
            transcript={state.transcript}
            rounds={state.rounds}
          />
          <div className="text-center mt-8 pb-8">
            <button
              onClick={reset}
              className="px-6 py-2.5 rounded-lg border border-neutral-700 text-neutral-300 hover:bg-neutral-800 transition-colors"
            >
              重新测试
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
