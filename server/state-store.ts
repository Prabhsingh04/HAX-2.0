/**
 * Durable instance + chat-session store with two interchangeable backends.
 *
 *  - SQLite (better-sqlite3)  — default. Zero-infra, used for local dev and the
 *    pilot. DB file at MCP_STATE_DB (default .data/mcp-state.db, gitignored).
 *  - Postgres (pg)            — used when DATABASE_URL is set. For production /
 *    multiple concurrent teams.
 *
 * The public API is async so either backend fits behind it; switching is a
 * config change (set/unset DATABASE_URL), not a code change.
 */

import "server-only";
import Database from "better-sqlite3";
import { Pool } from "pg";
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

export interface RequestLogEntry {
  id: string;
  ts: string;
  route: string;
  sessionId: string | null;
  summary: string;
  source: string | null;
  status: string;
  ms: number;
}

export interface AccessTokenRecord {
  email: string;
  tokenHash: string;
  createdAt: string;
  lastUsedAt: string | null;
  revoked: boolean;
}

interface StateBackend {
  logRequest(entry: RequestLogEntry): Promise<void>;
  listRequestLogs(limit: number): Promise<RequestLogEntry[]>;
  saveAccessToken(rec: { email: string; tokenHash: string }): Promise<void>;
  findAccessToken(tokenHash: string): Promise<AccessTokenRecord | null>;
  touchAccessToken(tokenHash: string): Promise<void>;
  listAccessTokens(): Promise<AccessTokenRecord[]>;
  revokeAccessTokensByEmail(email: string): Promise<number>;
  saveInstance(instance: StoredInstance): Promise<void>;
  loadInstance(instanceId: string): Promise<StoredInstance | null>;
  listInstancesByAgent(agentId?: string): Promise<StoredInstance[]>;
  saveChatSession(session: {
    sessionId: string;
    title: string;
    messages: unknown[];
    activeInstance: unknown | null;
  }): Promise<void>;
  listChatSessions(): Promise<ChatSessionSummary[]>;
  loadChatSession(sessionId: string): Promise<StoredChatSession | null>;
}

/* ---- SQLite backend --------------------------------------------------- */

class SqliteBackend implements StateBackend {
  private db: Database.Database;

  constructor() {
    const dbPath =
      process.env.MCP_STATE_DB ??
      path.join(process.cwd(), ".data", "mcp-state.db");
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
    this.db.exec(`
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
      CREATE TABLE IF NOT EXISTS request_logs (
        id         TEXT PRIMARY KEY,
        ts         TEXT NOT NULL,
        route      TEXT NOT NULL,
        session_id TEXT,
        summary    TEXT NOT NULL,
        source     TEXT,
        status     TEXT NOT NULL,
        ms         INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_request_logs_ts ON request_logs (ts);
      CREATE TABLE IF NOT EXISTS access_tokens (
        token_hash   TEXT PRIMARY KEY,
        email        TEXT NOT NULL,
        created_at   TEXT NOT NULL,
        last_used_at TEXT,
        revoked      INTEGER NOT NULL DEFAULT 0
      );
      CREATE INDEX IF NOT EXISTS idx_access_tokens_email ON access_tokens (email);
    `);
  }

  async saveAccessToken(rec: { email: string; tokenHash: string }): Promise<void> {
    this.db
      .prepare(
        `INSERT INTO access_tokens (token_hash, email, created_at) VALUES (?, ?, ?)`,
      )
      .run(rec.tokenHash, rec.email, new Date().toISOString());
  }

  async findAccessToken(tokenHash: string): Promise<AccessTokenRecord | null> {
    const r = this.db
      .prepare(`SELECT * FROM access_tokens WHERE token_hash = ?`)
      .get(tokenHash) as Record<string, unknown> | undefined;
    return r ? sqliteRowToAccessToken(r) : null;
  }

  async touchAccessToken(tokenHash: string): Promise<void> {
    this.db
      .prepare(`UPDATE access_tokens SET last_used_at = ? WHERE token_hash = ?`)
      .run(new Date().toISOString(), tokenHash);
  }

  async listAccessTokens(): Promise<AccessTokenRecord[]> {
    const rows = this.db
      .prepare(`SELECT * FROM access_tokens ORDER BY created_at DESC LIMIT 500`)
      .all() as Record<string, unknown>[];
    return rows.map(sqliteRowToAccessToken);
  }

  async revokeAccessTokensByEmail(email: string): Promise<number> {
    const info = this.db
      .prepare(`UPDATE access_tokens SET revoked = 1 WHERE email = ? AND revoked = 0`)
      .run(email);
    return info.changes;
  }

  async logRequest(e: RequestLogEntry): Promise<void> {
    this.db
      .prepare(
        `INSERT INTO request_logs (id, ts, route, session_id, summary, source, status, ms)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(e.id, e.ts, e.route, e.sessionId, e.summary, e.source, e.status, e.ms);
  }

  async listRequestLogs(limit: number): Promise<RequestLogEntry[]> {
    const rows = this.db
      .prepare(`SELECT * FROM request_logs ORDER BY ts DESC LIMIT ?`)
      .all(limit) as Record<string, unknown>[];
    return rows.map((r) => ({
      id: r.id as string,
      ts: r.ts as string,
      route: r.route as string,
      sessionId: (r.session_id as string | null) ?? null,
      summary: r.summary as string,
      source: (r.source as string | null) ?? null,
      status: r.status as string,
      ms: r.ms as number,
    }));
  }

  async saveInstance(instance: StoredInstance): Promise<void> {
    this.db
      .prepare(
        `INSERT INTO instances
           (instance_id, slug, state, created_at, last_modified, agent_id, persistent)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(instance_id) DO UPDATE SET
           state = excluded.state, last_modified = excluded.last_modified`,
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

  async loadInstance(instanceId: string): Promise<StoredInstance | null> {
    const row = this.db
      .prepare(`SELECT * FROM instances WHERE instance_id = ?`)
      .get(instanceId) as Record<string, unknown> | undefined;
    return row ? sqliteRowToInstance(row) : null;
  }

  async listInstancesByAgent(agentId?: string): Promise<StoredInstance[]> {
    const rows = (
      agentId
        ? this.db
            .prepare(
              `SELECT * FROM instances WHERE agent_id = ? ORDER BY created_at`,
            )
            .all(agentId)
        : this.db
            .prepare(
              `SELECT * FROM instances WHERE agent_id IS NOT NULL ORDER BY created_at`,
            )
            .all()
    ) as Record<string, unknown>[];
    return rows.map(sqliteRowToInstance);
  }

  async saveChatSession(session: {
    sessionId: string;
    title: string;
    messages: unknown[];
    activeInstance: unknown | null;
  }): Promise<void> {
    const now = new Date().toISOString();
    this.db
      .prepare(
        `INSERT INTO chat_sessions
           (session_id, title, messages, active_instance, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(session_id) DO UPDATE SET
           title = excluded.title, messages = excluded.messages,
           active_instance = excluded.active_instance, updated_at = excluded.updated_at`,
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

  async listChatSessions(): Promise<ChatSessionSummary[]> {
    const rows = this.db
      .prepare(
        `SELECT session_id, title, messages, created_at, updated_at
         FROM chat_sessions ORDER BY updated_at DESC LIMIT 50`,
      )
      .all() as Record<string, string>[];
    return rows.map((row) => ({
      sessionId: row.session_id,
      title: row.title,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      messageCount: (JSON.parse(row.messages) as unknown[]).length,
    }));
  }

  async loadChatSession(sessionId: string): Promise<StoredChatSession | null> {
    const row = this.db
      .prepare(`SELECT * FROM chat_sessions WHERE session_id = ?`)
      .get(sessionId) as Record<string, string | null> | undefined;
    if (!row) return null;
    return {
      sessionId: row.session_id as string,
      title: row.title as string,
      messages: JSON.parse(row.messages as string) as unknown[],
      activeInstance: row.active_instance
        ? (JSON.parse(row.active_instance) as unknown)
        : null,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }
}

function sqliteRowToInstance(row: Record<string, unknown>): StoredInstance {
  return {
    instanceId: row.instance_id as string,
    slug: row.slug as string,
    state: JSON.parse(row.state as string) as Record<string, unknown>,
    createdAt: row.created_at as string,
    lastModified: row.last_modified as string,
    agentId: (row.agent_id as string | null) ?? undefined,
    persistent: row.persistent === 1,
  };
}

function sqliteRowToAccessToken(row: Record<string, unknown>): AccessTokenRecord {
  return {
    email: row.email as string,
    tokenHash: row.token_hash as string,
    createdAt: row.created_at as string,
    lastUsedAt: (row.last_used_at as string | null) ?? null,
    revoked: row.revoked === 1,
  };
}

/* ---- Postgres backend ------------------------------------------------- */

class PostgresBackend implements StateBackend {
  private pool: Pool;
  private ready: Promise<void>;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString, max: 10 });
    this.ready = this.pool
      .query(
        `CREATE TABLE IF NOT EXISTS instances (
           instance_id   TEXT PRIMARY KEY,
           slug          TEXT NOT NULL,
           state         JSONB NOT NULL,
           created_at    TEXT NOT NULL,
           last_modified TEXT NOT NULL,
           agent_id      TEXT,
           persistent    BOOLEAN NOT NULL DEFAULT FALSE
         );
         CREATE INDEX IF NOT EXISTS idx_instances_agent ON instances (agent_id);
         CREATE INDEX IF NOT EXISTS idx_instances_slug  ON instances (slug);
         CREATE TABLE IF NOT EXISTS chat_sessions (
           session_id      TEXT PRIMARY KEY,
           title           TEXT NOT NULL,
           messages        JSONB NOT NULL,
           active_instance JSONB,
           created_at      TEXT NOT NULL,
           updated_at      TEXT NOT NULL
         );
         CREATE TABLE IF NOT EXISTS request_logs (
           id         TEXT PRIMARY KEY,
           ts         TEXT NOT NULL,
           route      TEXT NOT NULL,
           session_id TEXT,
           summary    TEXT NOT NULL,
           source     TEXT,
           status     TEXT NOT NULL,
           ms         INTEGER NOT NULL
         );
         CREATE INDEX IF NOT EXISTS idx_request_logs_ts ON request_logs (ts);
         CREATE TABLE IF NOT EXISTS access_tokens (
           token_hash   TEXT PRIMARY KEY,
           email        TEXT NOT NULL,
           created_at   TEXT NOT NULL,
           last_used_at TEXT,
           revoked      BOOLEAN NOT NULL DEFAULT FALSE
         );
         CREATE INDEX IF NOT EXISTS idx_access_tokens_email ON access_tokens (email);`,
      )
      .then(() => undefined);
  }

  async saveAccessToken(rec: { email: string; tokenHash: string }): Promise<void> {
    await this.ready;
    await this.pool.query(
      `INSERT INTO access_tokens (token_hash, email, created_at) VALUES ($1, $2, $3)`,
      [rec.tokenHash, rec.email, new Date().toISOString()],
    );
  }

  async findAccessToken(tokenHash: string): Promise<AccessTokenRecord | null> {
    await this.ready;
    const { rows } = await this.pool.query(
      `SELECT * FROM access_tokens WHERE token_hash = $1`,
      [tokenHash],
    );
    return rows[0] ? pgRowToAccessToken(rows[0]) : null;
  }

  async touchAccessToken(tokenHash: string): Promise<void> {
    await this.ready;
    await this.pool.query(
      `UPDATE access_tokens SET last_used_at = $1 WHERE token_hash = $2`,
      [new Date().toISOString(), tokenHash],
    );
  }

  async listAccessTokens(): Promise<AccessTokenRecord[]> {
    await this.ready;
    const { rows } = await this.pool.query(
      `SELECT * FROM access_tokens ORDER BY created_at DESC LIMIT 500`,
    );
    return rows.map(pgRowToAccessToken);
  }

  async revokeAccessTokensByEmail(email: string): Promise<number> {
    await this.ready;
    const res = await this.pool.query(
      `UPDATE access_tokens SET revoked = TRUE WHERE email = $1 AND revoked = FALSE`,
      [email],
    );
    return res.rowCount ?? 0;
  }

  async logRequest(e: RequestLogEntry): Promise<void> {
    await this.ready;
    await this.pool.query(
      `INSERT INTO request_logs (id, ts, route, session_id, summary, source, status, ms)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [e.id, e.ts, e.route, e.sessionId, e.summary, e.source, e.status, e.ms],
    );
  }

  async listRequestLogs(limit: number): Promise<RequestLogEntry[]> {
    await this.ready;
    const { rows } = await this.pool.query(
      `SELECT * FROM request_logs ORDER BY ts DESC LIMIT $1`,
      [limit],
    );
    return rows.map((r) => ({
      id: r.id,
      ts: r.ts,
      route: r.route,
      sessionId: r.session_id ?? null,
      summary: r.summary,
      source: r.source ?? null,
      status: r.status,
      ms: Number(r.ms),
    }));
  }

  async saveInstance(instance: StoredInstance): Promise<void> {
    await this.ready;
    await this.pool.query(
      `INSERT INTO instances
         (instance_id, slug, state, created_at, last_modified, agent_id, persistent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (instance_id) DO UPDATE SET
         state = EXCLUDED.state, last_modified = EXCLUDED.last_modified`,
      [
        instance.instanceId,
        instance.slug,
        JSON.stringify(instance.state),
        instance.createdAt,
        instance.lastModified,
        instance.agentId ?? null,
        instance.persistent,
      ],
    );
  }

  async loadInstance(instanceId: string): Promise<StoredInstance | null> {
    await this.ready;
    const { rows } = await this.pool.query(
      `SELECT * FROM instances WHERE instance_id = $1`,
      [instanceId],
    );
    return rows[0] ? pgRowToInstance(rows[0]) : null;
  }

  async listInstancesByAgent(agentId?: string): Promise<StoredInstance[]> {
    await this.ready;
    const { rows } = agentId
      ? await this.pool.query(
          `SELECT * FROM instances WHERE agent_id = $1 ORDER BY created_at`,
          [agentId],
        )
      : await this.pool.query(
          `SELECT * FROM instances WHERE agent_id IS NOT NULL ORDER BY created_at`,
        );
    return rows.map(pgRowToInstance);
  }

  async saveChatSession(session: {
    sessionId: string;
    title: string;
    messages: unknown[];
    activeInstance: unknown | null;
  }): Promise<void> {
    await this.ready;
    const now = new Date().toISOString();
    await this.pool.query(
      `INSERT INTO chat_sessions
         (session_id, title, messages, active_instance, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (session_id) DO UPDATE SET
         title = EXCLUDED.title, messages = EXCLUDED.messages,
         active_instance = EXCLUDED.active_instance, updated_at = EXCLUDED.updated_at`,
      [
        session.sessionId,
        session.title,
        JSON.stringify(session.messages),
        session.activeInstance ? JSON.stringify(session.activeInstance) : null,
        now,
        now,
      ],
    );
  }

  async listChatSessions(): Promise<ChatSessionSummary[]> {
    await this.ready;
    const { rows } = await this.pool.query(
      `SELECT session_id, title, messages, created_at, updated_at
       FROM chat_sessions ORDER BY updated_at DESC LIMIT 50`,
    );
    return rows.map((row) => ({
      sessionId: row.session_id,
      title: row.title,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      messageCount: Array.isArray(row.messages) ? row.messages.length : 0,
    }));
  }

  async loadChatSession(sessionId: string): Promise<StoredChatSession | null> {
    await this.ready;
    const { rows } = await this.pool.query(
      `SELECT * FROM chat_sessions WHERE session_id = $1`,
      [sessionId],
    );
    const row = rows[0];
    if (!row) return null;
    return {
      sessionId: row.session_id,
      title: row.title,
      messages: (row.messages as unknown[]) ?? [],
      activeInstance: row.active_instance ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

// pg returns JSONB already parsed, and booleans as booleans.
function pgRowToInstance(row: Record<string, unknown>): StoredInstance {
  return {
    instanceId: row.instance_id as string,
    slug: row.slug as string,
    state: row.state as Record<string, unknown>,
    createdAt: row.created_at as string,
    lastModified: row.last_modified as string,
    agentId: (row.agent_id as string | null) ?? undefined,
    persistent: Boolean(row.persistent),
  };
}

function pgRowToAccessToken(row: Record<string, unknown>): AccessTokenRecord {
  return {
    email: row.email as string,
    tokenHash: row.token_hash as string,
    createdAt: row.created_at as string,
    lastUsedAt: (row.last_used_at as string | null) ?? null,
    revoked: Boolean(row.revoked),
  };
}

/* ---- backend selection + public API ----------------------------------- */

let backend: StateBackend | null = null;
function store(): StateBackend {
  if (!backend) {
    const url = process.env.DATABASE_URL;
    backend = url ? new PostgresBackend(url) : new SqliteBackend();
    console.log(`[state-store] backend: ${url ? "postgres" : "sqlite"}`);
  }
  return backend;
}

export const saveInstance = (instance: StoredInstance): Promise<void> =>
  store().saveInstance(instance);
export const loadInstance = (instanceId: string): Promise<StoredInstance | null> =>
  store().loadInstance(instanceId);
export const listInstancesByAgent = (
  agentId?: string,
): Promise<StoredInstance[]> => store().listInstancesByAgent(agentId);
export const saveChatSession = (session: {
  sessionId: string;
  title: string;
  messages: unknown[];
  activeInstance: unknown | null;
}): Promise<void> => store().saveChatSession(session);
export const listChatSessions = (): Promise<ChatSessionSummary[]> =>
  store().listChatSessions();
export const loadChatSession = (
  sessionId: string,
): Promise<StoredChatSession | null> => store().loadChatSession(sessionId);
export const logRequest = (entry: RequestLogEntry): Promise<void> =>
  store().logRequest(entry);
export const listRequestLogs = (limit = 100): Promise<RequestLogEntry[]> =>
  store().listRequestLogs(limit);
export const saveAccessToken = (rec: {
  email: string;
  tokenHash: string;
}): Promise<void> => store().saveAccessToken(rec);
export const findAccessToken = (
  tokenHash: string,
): Promise<AccessTokenRecord | null> => store().findAccessToken(tokenHash);
export const touchAccessToken = (tokenHash: string): Promise<void> =>
  store().touchAccessToken(tokenHash);
export const listAccessTokens = (): Promise<AccessTokenRecord[]> =>
  store().listAccessTokens();
export const revokeAccessTokensByEmail = (email: string): Promise<number> =>
  store().revokeAccessTokensByEmail(email);
