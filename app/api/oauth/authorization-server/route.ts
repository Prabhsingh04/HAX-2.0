import { NextResponse } from "next/server";
import { authorizationServerMetadata, publicOrigin } from "@/lib/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * RFC 8414 authorization-server metadata, served (via next.config rewrites) at
 * /.well-known/oauth-authorization-server. Advertises the authorize/token/
 * register endpoints, authorization-code grant, and S256 PKCE.
 */
export function GET(request: Request) {
  const origin = publicOrigin(request);
  return NextResponse.json(authorizationServerMetadata(origin), {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}
