"use client";

import { useState } from "react";
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
    submitOpinion,
    startBuild,
    continueNextRound,
    finishBuildEarly,
    triggerFlip,
    startDemolish,
    generateReportFromTranscript,
    reset,
    clearError,
    discardResume,
    isStreaming,
  } = useDebate();

  const [userInput, setUserInput] = useState("");

  const buildMessages = state.transcript.filter((m) => m.phase === "build");
  const demolishMessages = state.transcript.filter((m) => m.phase === "demolish");
  const totalBuildTurns = state.rounds * 4;
  const totalDemolishTurns = state.rounds * 4;

  const isResuming =
    state.phase !== "idle" &&
    state.phase !== "complete" &&
    state.transcript.length > 0 &&
    !state.currentAgent &&
    !["ready_to_build", "built", "ready_to_demolish", "demolished", "flipping", "reporting", "build_round_done", "demolish_round_done"].includes(state.phase);

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
              <div className="text-xs text-neutral-400 mt-1">{state.error.message}</div>
            </div>
            <div className="flex gap-2 shrink-0">
              {state.error.retryable && (
                <button onClick={clearError} className="px-3 py-1.5 text-xs border border-red-700 rounded text-red-400 hover:bg-red-900/30">
                  重试
                </button>
              )}
              <button onClick={reset} className="px-3 py-1.5 text-xs border border-neutral-700 rounded text-neutral-400 hover:bg-neutral-800">
                重新开始
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== IDLE: Landing + Input ===== */}
      {state.phase === "idle" && (
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-neutral-100 mb-3">观点压力测试</h1>
            <p className="text-neutral-500 text-lg max-w-lg mx-auto">
              8 个 AI 智能体，先把你的观点加固到&ldquo;无懈可击&rdquo;，再把它彻底摧毁。
            </p>
          </div>
          <InputForm onSubmit={submitOpinion} />
          <div className="text-center mt-8 text-xs text-neutral-700">灵感来自 Andrej Karpathy · lol</div>
        </div>
      )}

      {/* ===== READY TO BUILD: Show opinion + "开始构建" button ===== */}
      {state.phase === "ready_to_build" && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="max-w-lg w-full space-y-6 text-center">
            <div className="text-sm text-neutral-500">你的观点</div>
            <blockquote className="text-lg text-neutral-200 border-l-2 border-amber-600 pl-4 text-left italic">
              {state.opinion}
            </blockquote>
            <div className="text-xs text-neutral-600">
              {state.mode === "interactive" ? "交互模式" : "自动模式"} · {state.rounds} 轮
            </div>
            <button
              onClick={startBuild}
              className="px-8 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-lg font-medium transition-all cursor-pointer"
            >
              开始构建
            </button>
            <p className="text-xs text-neutral-600">4 个智能体将合力加固你的论证</p>
          </div>
        </div>
      )}

      {/* ===== Resume prompt ===== */}
      {isResuming && !state.error && (
        <div className="mb-6 p-4 rounded-lg border border-neutral-800 bg-neutral-900">
          <p className="text-sm text-neutral-300 mb-3">发现未完成的辩论，是否继续？</p>
          <p className="text-xs text-neutral-500 mb-4">
            观点：{state.opinion.slice(0, 80)}{state.opinion.length > 80 ? "..." : ""}
          </p>
          <button onClick={discardResume} className="px-4 py-2 text-sm border border-neutral-700 rounded text-neutral-400 hover:bg-neutral-800">
            放弃，重新开始
          </button>
        </div>
      )}

      {/* ===== BUILDING / BUILD_ROUND_DONE / BUILT ===== */}
      {(state.phase === "building" || state.phase === "build_round_done" || state.phase === "built") && (
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

          {/* Interactive: round done — user can input + choose next action */}
          {state.phase === "build_round_done" && (
            <div className="mt-4 space-y-3 border-t border-neutral-800 pt-4">
              <div className="text-sm text-amber-500 font-medium">
                第 {state.currentRound} 轮构建完成
              </div>
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="（可选）输入你的补充、反馈或修正..."
                rows={3}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-600 resize-none focus:outline-none focus:border-neutral-600"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    continueNextRound(userInput || undefined);
                    setUserInput("");
                  }}
                  className="flex-1 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-colors"
                >
                  继续第 {state.currentRound + 1} 轮
                </button>
                <button
                  onClick={() => {
                    if (userInput.trim()) {
                      // Add user message before finishing
                      // We dispatch directly since finishBuildEarly doesn't take params
                    }
                    finishBuildEarly();
                    setUserInput("");
                  }}
                  className="py-2.5 px-4 rounded-lg border border-neutral-700 text-neutral-300 hover:bg-neutral-800 text-sm transition-colors"
                >
                  够了，准备翻转
                </button>
              </div>
            </div>
          )}

          {/* Build complete — flip button */}
          {state.phase === "built" && <FlipButton onClick={triggerFlip} />}
        </div>
      )}

      {/* ===== READY TO DEMOLISH ===== */}
      {state.phase === "ready_to_demolish" && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="max-w-lg w-full space-y-6 text-center">
            <div className="text-4xl">💀</div>
            <h2 className="text-2xl font-bold text-red-400">摧毁模式</h2>
            <p className="text-neutral-400">
              构建阶段产出了 {buildMessages.length} 条论证。
              <br />4 个反驳方智能体已就位，准备发起无情攻击。
            </p>
            <button
              onClick={startDemolish}
              className="px-8 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-lg font-medium transition-all cursor-pointer"
            >
              开始反驳
            </button>
          </div>
        </div>
      )}

      {/* ===== DEMOLISHING / DEMOLISH_ROUND_DONE / DEMOLISHED ===== */}
      {(state.phase === "demolishing" || state.phase === "demolish_round_done" || state.phase === "demolished") && (
        <div className="flex-1 flex flex-col">
          {/* Collapsible build phase */}
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

          {/* Interactive: round done */}
          {state.phase === "demolish_round_done" && (
            <div className="mt-4 space-y-3 border-t border-neutral-800 pt-4">
              <div className="text-sm text-red-500 font-medium">
                第 {state.currentRound} 轮反驳完成
              </div>
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="（可选）输入你的反驳、补充..."
                rows={3}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-600 resize-none focus:outline-none focus:border-neutral-600"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    continueNextRound(userInput || undefined);
                    setUserInput("");
                  }}
                  className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors"
                >
                  继续第 {state.currentRound + 1} 轮
                </button>
                <button
                  onClick={() => {
                    generateReportFromTranscript();
                    setUserInput("");
                  }}
                  className="py-2.5 px-4 rounded-lg border border-neutral-700 text-neutral-300 hover:bg-neutral-800 text-sm transition-colors"
                >
                  够了，生成报告
                </button>
              </div>
            </div>
          )}

          {/* Demolished — generate report */}
          {state.phase === "demolished" && (
            <div className="text-center py-6">
              <button
                onClick={generateReportFromTranscript}
                className="px-6 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors"
              >
                生成压力测试报告
              </button>
            </div>
          )}
        </div>
      )}

      {/* ===== REPORTING ===== */}
      {state.phase === "reporting" && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4 animate-pulse">📊</div>
            <p className="text-neutral-400">正在生成压力测试报告...</p>
          </div>
        </div>
      )}

      {/* ===== COMPLETE: Report ===== */}
      {state.phase === "complete" && state.report && (
        <div className="flex-1">
          <Report report={state.report} opinion={state.opinion} transcript={state.transcript} rounds={state.rounds} />
          <div className="text-center mt-8 pb-8">
            <button onClick={reset} className="px-6 py-2.5 rounded-lg border border-neutral-700 text-neutral-300 hover:bg-neutral-800 transition-colors">
              重新测试
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
