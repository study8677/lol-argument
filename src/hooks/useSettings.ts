"use client";

import { useState, useCallback } from "react";
import type { ProviderConfig } from "@/types";

const STORAGE_KEY = "lol-argument-settings";

const DEFAULT_SETTINGS: ProviderConfig = {
  provider: "anthropic",
  model: "claude-sonnet-4-6",
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
