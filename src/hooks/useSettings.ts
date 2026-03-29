"use client";

import { useState, useCallback } from "react";
import type { ProviderConfig } from "@/types";

const STORAGE_KEY = "lol-argument-settings";

const DEFAULT_SETTINGS: ProviderConfig = {
  provider: (typeof window !== "undefined" && process.env.NEXT_PUBLIC_LLM_PROVIDER as ProviderConfig["provider"]) || "anthropic",
  model: process.env.NEXT_PUBLIC_LLM_MODEL || "claude-sonnet-4-6",
  baseURL: process.env.NEXT_PUBLIC_CUSTOM_BASE_URL || undefined,
  providerOptions: process.env.NEXT_PUBLIC_LLM_PROVIDER === "custom"
    ? { openai: { chat_template_kwargs: { thinking: true } } }
    : undefined,
};

function readStoredSettings(): ProviderConfig {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch {
    // localStorage unavailable or corrupt
  }
  return DEFAULT_SETTINGS;
}

export function useSettings() {
  const [settings, setSettingsState] =
    useState<ProviderConfig>(readStoredSettings);

  const updateSettings = useCallback((update: Partial<ProviderConfig>) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...update };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // localStorage unavailable
      }
      return next;
    });
  }, []);

  return { settings, updateSettings };
}
