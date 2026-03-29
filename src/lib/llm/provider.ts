import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

const DEFAULT_PROVIDER = process.env.LLM_PROVIDER ?? "anthropic";
const DEFAULT_MODEL = process.env.LLM_MODEL ?? "claude-sonnet-4-6";

/**
 * Resolve an AI SDK model instance from provider config.
 *
 * Priority: explicit params > env vars > defaults.
 */
export function resolveModel(
  provider?: string,
  modelId?: string,
  apiKey?: string,
  baseURL?: string
): LanguageModel {
  const p = provider ?? DEFAULT_PROVIDER;
  const m = modelId ?? DEFAULT_MODEL;

  switch (p) {
    case "anthropic": {
      const client = createAnthropic({
        apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
      });
      return client(m);
    }
    case "openai": {
      const client = createOpenAI({
        apiKey: apiKey || process.env.OPENAI_API_KEY,
      });
      return client(m);
    }
    case "custom": {
      if (!baseURL) {
        throw new Error("Custom provider requires baseURL");
      }
      const client = createOpenAI({
        apiKey: apiKey || "not-needed",
        baseURL,
      });
      return client(m);
    }
    default:
      throw new Error(`Unknown provider: ${p}`);
  }
}

/**
 * Get the API key for a provider, preferring the explicit key over env.
 */
export function resolveApiKey(
  provider?: string,
  headerKey?: string
): string | undefined {
  if (headerKey) return headerKey;
  const p = provider ?? DEFAULT_PROVIDER;
  switch (p) {
    case "anthropic":
      return process.env.ANTHROPIC_API_KEY;
    case "openai":
      return process.env.OPENAI_API_KEY;
    default:
      return undefined;
  }
}
