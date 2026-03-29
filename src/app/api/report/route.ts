import { NextRequest } from "next/server";
import type { ReportRequest } from "@/types";
import { resolveModel } from "@/lib/llm/provider";
import { generateReport } from "@/lib/report/generator";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("X-API-Key") || undefined;
    const body: ReportRequest = await request.json();

    if (!body.opinion?.trim()) {
      return Response.json({ error: "opinion is required" }, { status: 400 });
    }
    if (!body.transcript?.length) {
      return Response.json(
        { error: "transcript is required" },
        { status: 400 }
      );
    }

    const model = resolveModel(
      body.provider,
      body.model,
      apiKey,
      body.baseURL
    );

    const report = await generateReport(model, body.opinion, body.transcript);
    return Response.json(report);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return Response.json({ error: message }, { status: 500 });
  }
}
