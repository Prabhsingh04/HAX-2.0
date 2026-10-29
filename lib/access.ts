import "server-only";
import { createHash, randomBytes } from "node:crypto";

/**
 * Per-user access tokens for the MCP endpoint. A token is shown to the user
 * once (emailed); only its SHA-256 hash is stored, so the DB never holds the
 * raw token. Validation hashes the incoming token and looks it up.
 */

export function generateToken(): string {
  return `ioc_${randomBytes(24).toString("hex")}`;
}

/**
 * A connect key identifies a person. It is embedded in the copy-paste connect
 * prompt; when the user's agent runs that prompt it exchanges the key for a
 * personal access token (minted server-side and tied back to the key), so every
 * token traces to the key/person that provisioned it.
 */
export function generateConnectKey(): string {
  return `ioc_key_${randomBytes(18).toString("hex")}`;
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}
