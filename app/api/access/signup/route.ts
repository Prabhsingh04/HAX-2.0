import { NextRequest, NextResponse } from "next/server";
import { generateToken, hashToken, isValidEmail } from "@/lib/access";
import { saveAccessToken } from "@/server/state-store";
import { isEmailConfigured, sendEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public signup for a personal MCP access token. The caller supplies an email;
 * we mint a token, store only its hash, and email the raw token to that address.
 * The token is never returned in the HTTP response when email is configured, so
 * it only reaches the verified inbox. (In local dev with no SES creds, the token
 * is returned inline so the flow is still testable.)
 */
export async function POST(request: NextRequest) {
  let email: string;
  try {
    const body = await request.json();
    email = String(body?.email ?? "").trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const token = generateToken();
  try {
    await saveAccessToken({ email, tokenHash: hashToken(token) });
  } catch (error) {
    console.error("Failed to persist access token:", error);
    return NextResponse.json(
      { error: "Could not create a token right now. Please try again." },
      { status: 500 },
    );
  }

  const endpoint = "https://ioc-patterns.intelligaia.com/api/mcp";

  if (isEmailConfigured()) {
    try {
      await sendEmail({
        to: email,
        subject: "Your IoC Patterns MCP access token",
        html: tokenEmailHtml(token, endpoint),
      });
    } catch (error) {
      console.error("Failed to send token email:", error);
      return NextResponse.json(
        {
          error:
            "We created your token but couldn't email it. Please contact the team.",
        },
        { status: 502 },
      );
    }
    return NextResponse.json({
      ok: true,
      emailed: true,
      message: `Access token sent to ${email}. Check your inbox.`,
    });
  }

  // Dev fallback: no SES configured — return the token so the flow is testable.
  return NextResponse.json({
    ok: true,
    emailed: false,
    token,
    endpoint,
    message: "Email is not configured in this environment; token returned inline.",
  });
}

function tokenEmailHtml(token: string, endpoint: string): string {
  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;line-height:1.5">
    <h2 style="margin:0 0 12px">Your IoC Patterns MCP access token</h2>
    <p>Use this token to connect your AI tool (Cursor, Claude Code, Codex, Claude Desktop) to the hosted MCP server.</p>
    <p style="margin:20px 0"><code style="display:block;padding:14px 16px;background:#f4f4f5;border:1px solid #e4e4e7;border-radius:8px;font-size:14px;word-break:break-all">${token}</code></p>
    <p><strong>Endpoint:</strong> <code>${endpoint}</code></p>
    <p>Send it as a bearer token:<br/>
      <code style="font-size:13px">Authorization: Bearer ${token}</code>
    </p>
    <p style="color:#71717a;font-size:13px;margin-top:24px">Keep this token private — it identifies your usage. If it leaks, reply to this email and we'll revoke it.</p>
  </div>`;
}
