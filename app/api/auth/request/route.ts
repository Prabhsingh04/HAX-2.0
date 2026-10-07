import { NextRequest, NextResponse } from "next/server";
import { isValidEmail } from "@/lib/access";
import { signMagicToken } from "@/lib/auth";
import { isEmailConfigured, sendEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Step 1 of magic-link sign-in: the user submits an email, we sign a short-lived
 * magic token and email a sign-in link to it. The token is only ever sent to the
 * address itself, so clicking the link proves control of that inbox.
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

  const token = signMagicToken(email);
  const origin = originOf(request);
  const link = `${origin}/api/auth/verify?token=${encodeURIComponent(token)}`;

  if (!isEmailConfigured()) {
    // Dev fallback: no SES — return the link so sign-in is testable locally.
    return NextResponse.json({
      ok: true,
      emailed: false,
      link,
      message: "Email not configured; sign-in link returned inline (dev only).",
    });
  }

  try {
    await sendEmail({
      to: email,
      subject: "Sign in to IoC Patterns",
      html: magicLinkHtml(link),
    });
  } catch (error) {
    console.error("Failed to send sign-in email:", error);
    return NextResponse.json(
      { error: "Couldn't send the sign-in email. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    emailed: true,
    message: `Sign-in link sent to ${email}. It expires in 15 minutes.`,
  });
}

function originOf(request: NextRequest): string {
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  return host ? `${proto}://${host}` : request.nextUrl.origin;
}

function magicLinkHtml(link: string): string {
  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;color:#1a1a1a;line-height:1.5">
    <h2 style="margin:0 0 12px">Sign in to IoC Patterns</h2>
    <p>Click the button below to sign in. This link is valid for 15 minutes.</p>
    <p style="margin:24px 0">
      <a href="${link}" style="display:inline-block;padding:12px 20px;background:#0b5fff;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Sign in</a>
    </p>
    <p style="color:#71717a;font-size:13px">If you didn't request this, you can ignore this email.</p>
  </div>`;
}
