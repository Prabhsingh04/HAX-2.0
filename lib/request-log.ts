import "server-only";
import { logRequest } from "@/server/state-store";

/**
 * Durable per-request audit trail (request_logs table). One row per API
 * request: route, who (session), a truncated summary of what was asked,
 * outcome, and latency — the governance/observability record that survives
 * restarts, complementing the ephemeral [llm-usage] console lines.
 *
 * Content note: `summary` is truncated to 300 chars. Set REQUEST_LOG_CONTENT=0
 * to log only a redacted placeholder instead of request text.
 */
export function recordRequest(entry: {
  route: string;
  sessionId?: string | null;
  summary: string;
  source?: string | null;
  status: "ok" | "error" | "fallback";
  ms: number;
}): void {
  const logContent = process.env.REQUEST_LOG_CONTENT !== "0";
  const summary = logContent
    ? entry.summary.slice(0, 300)
    : "[content logging disabled]";

  // Fire-and-forget: a logging failure must never break the actual request.
  void logRequest({
    id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    ts: new Date().toISOString(),
    route: entry.route,
    sessionId: entry.sessionId ?? null,
    summary,
    source: entry.source ?? null,
    status: entry.status,
    ms: entry.ms,
  }).catch((err) => console.error("[request-log] failed:", err));
}
