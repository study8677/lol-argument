import { NextRequest } from "next/server";
import type { TurnRequest } from "@/types";
import { getAgent } from "@/lib/agents/types";
import { buildUserPrompt } from "@/lib/agents/orchestrator";
import { resolveModel } from "@/lib/llm/provider";
import { callAgentStreaming, createStreamResponse } from "@/lib/llm/stream";
import { serializeEvent } from "@/lib/protocol";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("X-API-Key") || undefined;
    const body: TurnRequest = await request.json();

    // Validate
    if (!body.opinion?.trim()) {
      return errorResponse("opinion is required", 400);
    }
    if (!body.agentRole || !body.phase) {
      return errorResponse("agentRole and phase are required", 400);
    }
    if (body.round < 1 || body.round > body.rounds) {
      return errorResponse("invalid round number", 400);
    }

    // Resolve agent and model
    const agent = getAgent(body.agentRole);
    const model = resolveModel(
      body.provider,
      body.model,
      apiKey,
      body.baseURL
    );

    // Build prompt
    const userPrompt = buildUserPrompt(
      body.opinion,
      body.transcript ?? [],
      body.agentRole,
      body.round,
      body.rounds,
      body.phase
    );

    // Build provider options (e.g. NVIDIA kimi needs chat_template_kwargs)
    const providerOptions = body.providerOptions ?? undefined;

    // Stream response
    const streamResult = callAgentStreaming(
      model,
      agent.systemPrompt,
      userPrompt,
      2048,
      providerOptions
    );

    return createStreamResponse(
      body.agentRole,
      body.round,
      body.phase,
      streamResult
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    // Return error as a stream event so client can parse it uniformly
    const event = serializeEvent({
      type: "error",
      code: "provider_error",
      message,
    });
    return new Response(event, {
      status: 200, // Use 200 so the stream body is readable
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}
