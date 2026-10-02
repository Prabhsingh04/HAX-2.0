import { listRequestLogs } from "@/server/state-store";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Governance/observability view of the request audit trail (request_logs).
 * Already behind the app's basic-auth gate. ?limit= caps rows (default 100).
 */
export async function GET(request: NextRequest) {
  const limitParam = Number(request.nextUrl.searchParams.get("limit"));
  const limit =
    Number.isFinite(limitParam) && limitParam > 0
      ? Math.min(limitParam, 500)
      : 100;

  try {
    const logs = await listRequestLogs(limit);
    return NextResponse.json({ count: logs.length, logs });
  } catch (error) {
    console.error("Request log read failed:", error);
    return NextResponse.json(
      { error: "Could not read request logs" },
      { status: 500 },
    );
  }
}
