import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Stateless signed tokens for web-app sign-in. Two uses, same HMAC scheme:
 *   - magic token: embedded in the emailed sign-in link, short-lived (15 min)
 *   - session token: stored in an httpOnly cookie after verify, long-lived (30d)
 *
 * A token is `base64url(payload) + "." + base64url(hmac)`, where payload is
 * {email, typ, exp}. Verification recomputes the HMAC (timing-safe) and checks
 * the type and expiry. No DB round-trip — identity lives in the signature.
 *
 * Needs AUTH_SECRET in production; dev falls back to a fixed dev-only secret so
 * the flow is testable locally (never use that secret in prod).
 */
const SECRET =
  process.env.AUTH_SECRET ?? "dev-only-insecure-secret-change-in-prod";

export const SESSION_COOKIE = "ioc_session";
const MAGIC_TTL_SEC = 15 * 60; // 15 minutes
const SESSION_TTL_SEC = 30 * 24 * 60 * 60; // 30 days

type TokenType = "magic" | "session";
interface Payload {
  email: string;
  typ: TokenType;
  exp: number; // unix seconds
}

function b64url(buf: Buffer): string {
  return buf.toString("base64url");
}

function sign(payloadB64: string): string {
  return b64url(createHmac("sha256", SECRET).update(payloadB64).digest());
}

function makeToken(email: string, typ: TokenType, ttlSec: number, nowSec: number): string {
  const payload: Payload = { email, typ, exp: nowSec + ttlSec };
  const payloadB64 = b64url(Buffer.from(JSON.stringify(payload)));
  return `${payloadB64}.${sign(payloadB64)}`;
}

function verify(token: string, typ: TokenType, nowSec: number): string | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, sig] = parts;

  const expected = sign(payloadB64);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8"),
    ) as Payload;
    if (payload.typ !== typ) return null;
    if (typeof payload.exp !== "number" || payload.exp < nowSec) return null;
    if (!payload.email) return null;
    return payload.email;
  } catch {
    return null;
  }
}

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

export function signMagicToken(email: string): string {
  return makeToken(email, "magic", MAGIC_TTL_SEC, nowSeconds());
}

export function verifyMagicToken(token: string | undefined | null): string | null {
  if (!token) return null;
  return verify(token, "magic", nowSeconds());
}

export function signSessionToken(email: string): string {
  return makeToken(email, "session", SESSION_TTL_SEC, nowSeconds());
}

export function verifySessionToken(token: string | undefined | null): string | null {
  if (!token) return null;
  return verify(token, "session", nowSeconds());
}

export const SESSION_MAX_AGE = SESSION_TTL_SEC;
