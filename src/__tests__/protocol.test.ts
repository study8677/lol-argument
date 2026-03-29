import { describe, it, expect } from "vitest";
import {
  serializeEvent,
  parseEvent,
  type StreamEvent,
} from "@/lib/protocol";

describe("serializeEvent", () => {
  it("serializes agent_start event", () => {
    const event: StreamEvent = {
      type: "agent_start",
      agentRole: "logician",
      round: 1,
      phase: "build",
    };
    const line = serializeEvent(event);
    expect(line).toBe(
      '{"type":"agent_start","agentRole":"logician","round":1,"phase":"build"}\n'
    );
  });

  it("serializes token event", () => {
    const event: StreamEvent = { type: "token", content: "Hello" };
    const line = serializeEvent(event);
    expect(line).toBe('{"type":"token","content":"Hello"}\n');
  });

  it("serializes agent_done event", () => {
    const event: StreamEvent = {
      type: "agent_done",
      fullContent: "Full response text",
    };
    const line = serializeEvent(event);
    expect(JSON.parse(line.trim())).toEqual(event);
  });

  it("serializes error event", () => {
    const event: StreamEvent = {
      type: "error",
      code: "rate_limited",
      message: "Too many requests",
    };
    const line = serializeEvent(event);
    expect(JSON.parse(line.trim())).toEqual(event);
  });
});

describe("parseEvent", () => {
  it("round-trips all event types", () => {
    const events: StreamEvent[] = [
      { type: "agent_start", agentRole: "skeptic", round: 2, phase: "demolish" },
      { type: "token", content: "一些中文内容" },
      { type: "agent_done", fullContent: "Complete response" },
      { type: "error", code: "invalid_api_key", message: "Bad key" },
    ];

    for (const event of events) {
      const serialized = serializeEvent(event);
      const parsed = parseEvent(serialized);
      expect(parsed).toEqual(event);
    }
  });

  it("returns null for empty string", () => {
    expect(parseEvent("")).toBeNull();
    expect(parseEvent("  ")).toBeNull();
    expect(parseEvent("\n")).toBeNull();
  });

  it("returns null for invalid JSON", () => {
    expect(parseEvent("not json")).toBeNull();
    expect(parseEvent("{broken")).toBeNull();
  });

  it("returns null for JSON without type field", () => {
    expect(parseEvent('{"content":"hello"}')).toBeNull();
  });

  it("returns null for non-object JSON", () => {
    expect(parseEvent('"just a string"')).toBeNull();
    expect(parseEvent("42")).toBeNull();
    expect(parseEvent("null")).toBeNull();
  });

  it("handles content with special characters", () => {
    const event: StreamEvent = {
      type: "token",
      content: 'line1\nline2\t"quoted"',
    };
    const parsed = parseEvent(serializeEvent(event));
    expect(parsed).toEqual(event);
  });
});
