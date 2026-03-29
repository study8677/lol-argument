"use client";

import { useState } from "react";
import { SettingsPanel } from "./SettingsPanel";
import { useApiKey } from "@/hooks/useApiKey";

interface InputFormProps {
  onSubmit: (opinion: string, rounds: number) => void;
}

const ROUND_OPTIONS = [3, 5, 7] as const;

export function InputForm({ onSubmit }: InputFormProps) {
  const [opinion, setOpinion] = useState("");
  const [rounds, setRounds] = useState<number>(3);
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

      {/* Rounds Selector */}
      <div>
        <label className="block text-sm text-neutral-400 mb-2">
          迭代轮数
        </label>
        <div className="flex gap-3">
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
        </div>
        <p className="mt-1.5 text-xs text-neutral-600">
          轮数越多，论证越深入，但耗时和费用也更高
        </p>
      </div>

      {/* Settings */}
      <SettingsPanel />

      {/* Submit */}
      <button
        onClick={() => canSubmit && onSubmit(opinion.trim(), rounds)}
        disabled={!canSubmit}
        className={`w-full py-3 rounded-lg text-base font-medium transition-all ${
          canSubmit
            ? "bg-amber-600 hover:bg-amber-500 text-white cursor-pointer"
            : "bg-neutral-800 text-neutral-600 cursor-not-allowed"
        }`}
      >
        开始压力测试
      </button>

      {!hasKey && (
        <p className="text-center text-xs text-amber-600">
          请先在设置中配置 API Key
        </p>
      )}
    </div>
  );
}
