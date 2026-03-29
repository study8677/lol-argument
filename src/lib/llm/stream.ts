import { streamText } from "ai";
import type { LanguageModel } from "ai";
import type { AgentRole, Phase } from "@/types";
import { serializeEvent, type StreamEvent, type ErrorCode } from "@/lib/protocol";

/**
 * Call an agent with streaming, returning the AI SDK StreamTextResult.
 */
export function callAgentStreaming(
  model: LanguageModel,
  systemPrompt: string,
  userPrompt: string,
  maxOutputTokens: number = 2048,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  providerOptions?: any
) {
  return streamText({
    model,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
    maxOutputTokens,
    providerOptions,
  });
}

/**
 * Convert an AI SDK streaming result into a Response with newline-delimited
 * JSON StreamEvents.
 */
export function createStreamResponse(
  agentRole: AgentRole,
  round: number,
  phase: Phase,
  streamResult: ReturnType<typeof streamText>
): Response {
  let fullContent = "";

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      // Emit agent_start
      const startEvent: StreamEvent = {
        type: "agent_start",
        agentRole,
        round,
        phase,
      };
      controller.enqueue(encoder.encode(serializeEvent(startEvent)));

      try {
        for await (const chunk of streamResult.textStream) {
          fullContent += chunk;
          const tokenEvent: StreamEvent = {
            type: "token",
            content: chunk,
          };
          controller.enqueue(encoder.encode(serializeEvent(tokenEvent)));
        }

        // Emit agent_done with full content
        const doneEvent: StreamEvent = {
          type: "agent_done",
          fullContent,
        };
        controller.enqueue(encoder.encode(serializeEvent(doneEvent)));
      } catch (err) {
        const errorEvent: StreamEvent = {
          type: "error",
          code: classifyError(err),
          message: err instanceof Error ? err.message : "Unknown error",
        };
        controller.enqueue(encoder.encode(serializeEvent(errorEvent)));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-store",
      "Transfer-Encoding": "chunked",
    },
  });
}

function classifyError(err: unknown): ErrorCode {
  if (!(err instanceof Error)) return "model_error";
  const msg = err.message.toLowerCase();
  if (msg.includes("401") || msg.includes("403") || msg.includes("invalid") && msg.includes("key")) {
    return "invalid_api_key";
  }
  if (msg.includes("429") || msg.includes("rate")) {
    return "rate_limited";
  }
  if (msg.includes("context") || msg.includes("too long") || msg.includes("token")) {
    return "context_too_long";
  }
  if (msg.includes("timeout") || msg.includes("timed out")) {
    return "timeout";
  }
  return "model_error";
}
