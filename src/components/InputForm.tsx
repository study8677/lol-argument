"use client";

import { useState } from "react";
import { SettingsPanel } from "./SettingsPanel";
import { useApiKey } from "@/hooks/useApiKey";
import type { DebateMode } from "@/types";

interface InputFormProps {
  onSubmit: (opinion: string, rounds: number, mode: DebateMode) => void;
}

const ROUND_OPTIONS = [3, 5, 7] as const;

export function InputForm({ onSubmit }: InputFormProps) {
  const [opinion, setOpinion] = useState("");
  const [rounds, setRounds] = useState<number>(3);
  const [mode, setMode] = useState<DebateMode>("interactive");
  const { hasKey } = useApiKey();

  const canSubmit = opinion.trim().length > 0 && hasKey;

  return (
    <div className="space-y-6">
      {/* Opinion Input */}
      <div>
        <textarea
          value={opinion}
          onChange={(e) => setOpinion(e.target.value)}
          placeholder="输入你的观点、论述、或任何你认为正确的看法..."
          rows={6}
          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-neutral-100 placeholder-neutral-600 resize-y focus:outline-none focus:border-neutral-600 text-base leading-relaxed"
        />
        <div className="mt-1 text-right text-xs text-neutral-600">
          {opinion.length} 字
        </div>
      </div>

      {/* Mode Selector */}
      <div>
        <label className="block text-sm text-neutral-400 mb-2">模式</label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setMode("interactive")}
            className={`flex-1 px-4 py-2.5 rounded-lg border text-sm transition-colors ${
              mode === "interactive"
                ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
                : "border-neutral-700 text-neutral-500 hover:text-neutral-300"
            }`}
          >
            <div className="font-medium">交互模式</div>
            <div className="text-xs mt-0.5 opacity-70">每轮暂停，你可以参与讨论</div>
          </button>
          <button
            type="button"
            onClick={() => setMode("auto")}
            className={`flex-1 px-4 py-2.5 rounded-lg border text-sm transition-colors ${
              mode === "auto"
                ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
                : "border-neutral-700 text-neutral-500 hover:text-neutral-300"
            }`}
          >
            <div className="font-medium">自动模式</div>
            <div className="text-xs mt-0.5 opacity-70">智能体自行讨论完所有轮次</div>
          </button>
        </div>
      </div>

      {/* Rounds Selector */}
      <div>
        <label className="block text-sm text-neutral-400 mb-2">
          迭代轮数
        </label>
        <div className="flex items-center gap-3">
          {ROUND_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRounds(n)}
              className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                rounds === n
                  ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
                  : "border-neutral-700 text-neutral-500 hover:text-neutral-300 hover:border-neutral-600"
              }`}
            >
              {n} 轮
            </button>
          ))}
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={1}
              max={20}
              value={rounds}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (v >= 1 && v <= 20) setRounds(v);
              }}
              className="w-16 bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-2 text-sm text-center text-neutral-200 focus:outline-none focus:border-amber-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-sm text-neutral-500">轮</span>
          </div>
        </div>
        <p className="mt-1.5 text-xs text-neutral-600">
          {mode === "interactive"
            ? "交互模式下你可以随时提前结束"
            : "轮数越多，论证越深入，耗时和费用也更高（1-20）"}
        </p>
      </div>

      {/* Settings */}
      <SettingsPanel />

      {/* Submit */}
      <button
        onClick={() => canSubmit && onSubmit(opinion.trim(), rounds, mode)}
        disabled={!canSubmit}
        className={`w-full py-3 rounded-lg text-base font-medium transition-all ${
          canSubmit
            ? "bg-amber-600 hover:bg-amber-500 text-white cursor-pointer"
            : "bg-neutral-800 text-neutral-600 cursor-not-allowed"
        }`}
      >
        提交观点
      </button>

      {!hasKey && (
        <p className="text-center text-xs text-amber-600">
          请先在设置中配置 API Key
        </p>
      )}
    </div>
  );
}
