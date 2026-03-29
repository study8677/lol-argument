"use client";

import { useCallback, useRef, useState } from "react";
import type { TurnRequest } from "@/types";
import { parseEvent, type StreamEvent } from "@/lib/protocol";

interface StreamCallbacks {
  onStart?: (event: StreamEvent & { type: "agent_start" }) => void;
  onToken?: (content: string) => void;
  onDone?: (fullContent: string) => void;
  onError?: (code: string, message: string, retryable: boolean) => void;
}

const RETRYABLE_CODES = new Set(["rate_limited", "timeout", "provider_error"]);
const RETRY_DELAY = 2000;

export function useAgentStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
  }, []);

  const streamAgentTurn = useCallback(
    async (
      params: TurnRequest,
      apiKey: string | undefined,
      callbacks: StreamCallbacks,
      isRetry = false
    ) => {
      const controller = new AbortController();
      abortRef.current = controller;
      setIsStreaming(true);

      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (apiKey) {
          headers["X-API-Key"] = apiKey;
        }

        const response = await fetch("/api/debate/turn", {
          method: "POST",
          headers,
          body: JSON.stringify(params),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorText = await response.text();
          const retryable =
            response.status === 429 || response.status >= 500;
          callbacks.onError?.(
            response.status === 429 ? "rate_limited" : "provider_error",
            errorText || `HTTP ${response.status}`,
            retryable
          );
          setIsStreaming(false);
          return;
        }

        if (!response.body) {
          callbacks.onError?.("provider_error", "No response body", false);
          setIsStreaming(false);
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          // Keep the last incomplete line in the buffer
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const event = parseEvent(line);
            if (!event) continue;

            switch (event.type) {
              case "agent_start":
                callbacks.onStart?.(event);
                break;
              case "token":
                callbacks.onToken?.(event.content);
                break;
              case "agent_done":
                callbacks.onDone?.(event.fullContent);
                break;
              case "error": {
                const retryable = RETRYABLE_CODES.has(event.code);
                if (retryable && !isRetry) {
                  // Auto-retry once
                  setIsStreaming(false);
                  await new Promise((r) => setTimeout(r, RETRY_DELAY));
                  return streamAgentTurn(params, apiKey, callbacks, true);
                }
                callbacks.onError?.(event.code, event.message, retryable);
                break;
              }
            }
          }
        }

        // Process any remaining buffer
        if (buffer.trim()) {
          const event = parseEvent(buffer);
          if (event) {
            if (event.type === "agent_done") {
              callbacks.onDone?.(event.fullContent);
            } else if (event.type === "error") {
              callbacks.onError?.(
                event.code,
                event.message,
                RETRYABLE_CODES.has(event.code)
              );
            }
          }
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        const message =
          err instanceof Error ? err.message : "Network error";
        const retryable = true;
        if (!isRetry) {
          // Auto-retry once on network error
          setIsStreaming(false);
          await new Promise((r) => setTimeout(r, RETRY_DELAY));
          return streamAgentTurn(params, apiKey, callbacks, true);
        }
        callbacks.onError?.("timeout", message, retryable);
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    []
  );

  return { streamAgentTurn, isStreaming, abort };
}
