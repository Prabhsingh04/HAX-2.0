import {
  listChatSessions,
  loadChatSession,
  saveChatSession,
} from "@/server/state-store";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Advisor conversation history. Action-dispatch like /api/instances:
 *   { "action": "save", "session_id": "...", "title": "...", "messages": [...], "active_instance": {...} }
 *   { "action": "list" }
 *   { "action": "get", "session_id": "..." }
 *
 * Chats are scoped to the signed-in user (session cookie). A signed-in user
 * sees and saves only their own; without a session, chats fall into the shared
 * "guest" pool (owner_email NULL) — the pre-login behaviour, kept non-breaking.
 */
export async function POST(request: NextRequest) {
  const ownerEmail = verifySessionToken(
    request.cookies.get(SESSION_COOKIE)?.value,
  );
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON" },
      { status: 400 },
    );
  }

  try {
    switch (body.action) {
      case "save": {
        const sessionId = body.session_id as string | undefined;
        const messages = body.messages as unknown[] | undefined;
        if (!sessionId || !Array.isArray(messages)) {
          return NextResponse.json(
            { error: "session_id and messages are required" },
            { status: 400 },
          );
        }
        await saveChatSession({
          sessionId,
          title: (body.title as string | undefined)?.trim() || "Untitled chat",
          messages,
          activeInstance: body.active_instance ?? null,
          ownerEmail,
        });
        return NextResponse.json({ success: true });
      }
      case "list":
        return NextResponse.json({
          success: true,
          sessions: await listChatSessions(ownerEmail),
        });
      case "get": {
        const sessionId = body.session_id as string | undefined;
        if (!sessionId) {
          return NextResponse.json(
            { error: "session_id is required" },
            { status: 400 },
          );
        }
        const session = await loadChatSession(sessionId, ownerEmail);
        if (!session) {
          return NextResponse.json(
            { error: "Session not found" },
            { status: 404 },
          );
        }
        return NextResponse.json({ success: true, session });
      }
      default:
        return NextResponse.json(
          { error: `Unknown action: ${body.action}` },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Sessions error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to process request";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
