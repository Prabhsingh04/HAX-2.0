import { NextResponse } from "next/server";
import { protectedResourceMetadata, publicOrigin } from "@/lib/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * RFC 9728 protected-resource metadata, served (via next.config rewrites) at
 * /.well-known/oauth-protected-resource and its /api/mcp path variant. Tells an
 * MCP host app which authorization server guards this resource so it can start
 * the OAuth flow.
 */
export function GET(request: Request) {
  const origin = publicOrigin(request);
  return NextResponse.json(protectedResourceMetadata(origin), {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}
