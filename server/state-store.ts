/**
 * Durable instance store (SQLite).
 *
 * Replaces the in-memory Maps so instances survive server restarts and dev
 * hot-reloads, and so the stdio MCP server and the Next.js API routes share
 * one view of state instead of two private ones.
 *
 * better-sqlite3 is synchronous, so the registry functions in mcp-server.ts
 * keep their existing sync signatures — no call-site changes anywhere.
 *
 * DB path: MCP_STATE_DB env var, defaulting to .data/mcp-state.db (gitignored).
 */

import "server-only";
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

export interface StoredInstance {
  instanceId: string;
  slug: string;
  state: Record<string, unknown>;
  createdAt: string;
  lastModified: string;
  agentId?: string;
  persistent: boolean;
}

type InstanceRow = {
  instance_id: string;
  slug: string;
  state: string;
  created_at: string;
  last_modified: string;
  agent_id: string | null;
  persistent: number;
};

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    const dbPath =
      process.env.MCP_STATE_DB ??
      path.join(process.cwd(), ".data", "mcp-state.db");
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    db.exec(`
      CREATE TABLE IF NOT EXISTS instances (
        instance_id   TEXT PRIMARY KEY,
        slug          TEXT NOT NULL,
        state         TEXT NOT NULL,
        created_at    TEXT NOT NULL,
        last_modified TEXT NOT NULL,
        agent_id      TEXT,
        persistent    INTEGER NOT NULL DEFAULT 0
      );
      CREATE INDEX IF NOT EXISTS idx_instances_agent ON instances (agent_id);
      CREATE INDEX IF NOT EXISTS idx_instances_slug  ON instances (slug);
      CREATE TABLE IF NOT EXISTS chat_sessions (
        session_id      TEXT PRIMARY KEY,
        title           TEXT NOT NULL,
        messages        TEXT NOT NULL,
        active_instance TEXT,
        created_at      TEXT NOT NULL,
        updated_at      TEXT NOT NULL
      );
    `);
  }
  return db;
}

function rowToInstance(row: InstanceRow): StoredInstance {
  return {
    instanceId: row.instance_id,
    slug: row.slug,
    state: JSON.parse(row.state) as Record<string, unknown>,
    createdAt: row.created_at,
    lastModified: row.last_modified,
    agentId: row.agent_id ?? undefined,
    persistent: row.persistent === 1,
  };
}

export function saveInstance(instance: StoredInstance): void {
  getDb()
    .prepare(
      `INSERT INTO instances
         (instance_id, slug, state, created_at, last_modified, agent_id, persistent)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(instance_id) DO UPDATE SET
         state = excluded.state,
         last_modified = excluded.last_modified`,
    )
    .run(
      instance.instanceId,
      instance.slug,
      JSON.stringify(instance.state),
      instance.createdAt,
      instance.lastModified,
      instance.agentId ?? null,
      instance.persistent ? 1 : 0,
    );
}

export function loadInstance(instanceId: string): StoredInstance | null {
  const row = getDb()
    .prepare(`SELECT * FROM instances WHERE instance_id = ?`)
    .get(instanceId) as InstanceRow | undefined;
  return row ? rowToInstance(row) : null;
}

/**
 * Installations are derived, not stored: an installation is the group of
 * instances a given agent has created on a given pattern. Deriving them
 * removes a second table that could drift from the first.
 */
export function listInstancesByAgent(agentId?: string): StoredInstance[] {
  const rows = (
    agentId
      ? getDb()
          .prepare(
            `SELECT * FROM instances WHERE agent_id = ? ORDER BY created_at`,
          )
          .all(agentId)
      : getDb()
          .prepare(
            `SELECT * FROM instances WHERE agent_id IS NOT NULL ORDER BY created_at`,
          )
          .all()
  ) as InstanceRow[];
  return rows.map(rowToInstance);
}

/* ---- chat sessions (advisor conversation history) --------------------- */

export interface StoredChatSession {
  sessionId: string;
  title: string;
  messages: unknown[];
  activeInstance: unknown | null;
  createdAt: string;
  updatedAt: string;
}

export type ChatSessionSummary = Omit<
  StoredChatSession,
  "messages" | "activeInstance"
> & { messageCount: number };

export function saveChatSession(session: {
  sessionId: string;
  title: string;
  messages: unknown[];
  activeInstance: unknown | null;
}): void {
  const now = new Date().toISOString();
  getDb()
    .prepare(
      `INSERT INTO chat_sessions
         (session_id, title, messages, active_instance, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(session_id) DO UPDATE SET
         title = excluded.title,
         messages = excluded.messages,
         active_instance = excluded.active_instance,
         updated_at = excluded.updated_at`,
    )
    .run(
      session.sessionId,
      session.title,
      JSON.stringify(session.messages),
      session.activeInstance ? JSON.stringify(session.activeInstance) : null,
      now,
      now,
    );
}

export function listChatSessions(): ChatSessionSummary[] {
  const rows = getDb()
    .prepare(
      `SELECT session_id, title, messages, created_at, updated_at
       FROM chat_sessions ORDER BY updated_at DESC LIMIT 50`,
    )
    .all() as Array<{
    session_id: string;
    title: string;
    messages: string;
    created_at: string;
    updated_at: string;
  }>;
  return rows.map((row) => ({
    sessionId: row.session_id,
    title: row.title,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    messageCount: (JSON.parse(row.messages) as unknown[]).length,
  }));
}

export function loadChatSession(sessionId: string): StoredChatSession | null {
  const row = getDb()
    .prepare(`SELECT * FROM chat_sessions WHERE session_id = ?`)
    .get(sessionId) as
    | {
        session_id: string;
        title: string;
        messages: string;
        active_instance: string | null;
        created_at: string;
        updated_at: string;
      }
    | undefined;
  if (!row) return null;
  return {
    sessionId: row.session_id,
    title: row.title,
    messages: JSON.parse(row.messages) as unknown[],
    activeInstance: row.active_instance
      ? (JSON.parse(row.active_instance) as unknown)
      : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Test/ops helper — not used by the request path. */
export function closeDb(): void {
  db?.close();
  db = null;
}
