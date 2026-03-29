"use client";

import { useState } from "react";
import { useApiKey } from "@/hooks/useApiKey";
import { useSettings } from "@/hooks/useSettings";

export function SettingsPanel() {
  const { apiKey, setApiKey, hasKey } = useApiKey();
  const { settings, updateSettings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [keyInput, setKeyInput] = useState(apiKey);

  return (
    <div className="border border-neutral-800 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
      >
        <span className="flex items-center gap-2">
          <span>设置</span>
          {hasKey && (
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          )}
          {!hasKey && (
            <span className="text-amber-500 text-xs">需要 API Key</span>
          )}
        </span>
        <span
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-4 border-t border-neutral-800">
          {/* API Key */}
          <div className="pt-3">
            <label className="block text-xs text-neutral-500 mb-1.5">
              API Key
            </label>
            <div className="flex gap-2">
              <input
                type={showKey ? "text" : "password"}
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="sk-ant-... 或 sk-..."
                className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-neutral-500"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="px-3 py-2 text-xs border border-neutral-700 rounded text-neutral-400 hover:text-neutral-200"
              >
                {showKey ? "隐藏" : "显示"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setApiKey(keyInput);
                }}
                className="px-3 py-2 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-200 hover:bg-neutral-700"
              >
                保存
              </button>
            </div>
            <p className="mt-1 text-xs text-neutral-600">
              存储在浏览器本地，不会上传到服务器
            </p>
          </div>

          {/* Provider */}
          <div>
            <label className="block text-xs text-neutral-500 mb-1.5">
              Provider
            </label>
            <div className="flex gap-2">
              {(["anthropic", "openai", "custom"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => updateSettings({ provider: p })}
                  className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                    settings.provider === p
                      ? "border-neutral-500 text-neutral-200 bg-neutral-800"
                      : "border-neutral-700 text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  {p === "anthropic"
                    ? "Anthropic"
                    : p === "openai"
                      ? "OpenAI"
                      : "Custom"}
                </button>
              ))}
            </div>
          </div>

          {/* Model */}
          <div>
            <label className="block text-xs text-neutral-500 mb-1.5">
              Model
            </label>
            <input
              type="text"
              value={settings.model}
              onChange={(e) => updateSettings({ model: e.target.value })}
              placeholder="claude-sonnet-4-6"
              className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-neutral-500"
            />
          </div>

          {/* Base URL (custom only) */}
          {settings.provider === "custom" && (
            <>
              <div>
                <label className="block text-xs text-neutral-500 mb-1.5">
                  Base URL
                </label>
                <input
                  type="text"
                  value={settings.baseURL ?? ""}
                  onChange={(e) =>
                    updateSettings({ baseURL: e.target.value || undefined })
                  }
                  placeholder="http://localhost:11434/v1"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-neutral-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="thinking-mode"
                  checked={!!settings.providerOptions}
                  onChange={(e) =>
                    updateSettings({
                      providerOptions: e.target.checked
                        ? { openai: { chat_template_kwargs: { thinking: true } } }
                        : undefined,
                    })
                  }
                  className="rounded border-neutral-700"
                />
                <label htmlFor="thinking-mode" className="text-xs text-neutral-400">
                  Thinking Model (kimi-k2.5 等需要)
                </label>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
