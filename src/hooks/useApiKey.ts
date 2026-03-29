"use client";

import { useState, useCallback } from "react";

const STORAGE_KEY = "lol-argument-api-key";

function readStoredKey(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function useApiKey() {
  const [apiKey, setApiKeyState] = useState<string>(readStoredKey);

  const setApiKey = useCallback((key: string) => {
    setApiKeyState(key);
    try {
      if (key) {
        localStorage.setItem(STORAGE_KEY, key);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  const clearApiKey = useCallback(() => {
    setApiKeyState("");
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage unavailable
    }
  }, []);

  return {
    apiKey,
    setApiKey,
    clearApiKey,
    hasKey: apiKey.length > 0,
  };
}
