import { describe, it, expect, vi, beforeEach } from "vitest";
import { resolveApiKey } from "@/lib/llm/provider";

describe("resolveApiKey", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  it("prefers header key over env", () => {
    process.env.ANTHROPIC_API_KEY = "env-key";
    const key = resolveApiKey("anthropic", "header-key");
    expect(key).toBe("header-key");
  });

  it("falls back to ANTHROPIC_API_KEY for anthropic provider", () => {
    process.env.ANTHROPIC_API_KEY = "env-anthropic-key";
    const key = resolveApiKey("anthropic", undefined);
    expect(key).toBe("env-anthropic-key");
  });

  it("falls back to OPENAI_API_KEY for openai provider", () => {
    process.env.OPENAI_API_KEY = "env-openai-key";
    const key = resolveApiKey("openai", undefined);
    expect(key).toBe("env-openai-key");
  });

  it("returns undefined for unknown provider with no header", () => {
    const key = resolveApiKey("custom", undefined);
    expect(key).toBeUndefined();
  });

  it("header key works for any provider", () => {
    const key = resolveApiKey("custom", "my-custom-key");
    expect(key).toBe("my-custom-key");
  });

  it("returns undefined when no header and no env", () => {
    delete process.env.ANTHROPIC_API_KEY;
    const key = resolveApiKey("anthropic", undefined);
    expect(key).toBeUndefined();
  });

  it("defaults to anthropic provider when none specified", () => {
    process.env.ANTHROPIC_API_KEY = "default-key";
    const key = resolveApiKey(undefined, undefined);
    expect(key).toBe("default-key");
  });
});
