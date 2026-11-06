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
  /** Hash of the connect key that provisioned this token (null if minted via the email signup flow). */
  connectKey: string | null;
  /** The client the token was provisioned for, e.g. "cursor" (null if unknown). */
  tool: string | null;
}

/** A connect key identifies a person; the connect prompt embeds it and the
 *  agent exchanges it for a personal token. Only the hash is stored. */
export interface ConnectKeyRecord {
  keyHash: string;
  email: string | null;
  label: string | null;
  createdAt: string;
  revoked: boolean;
}

/** A host app (claude.ai, ChatGPT) that registered itself via Dynamic Client
 *  Registration. Public client, so no secret is stored — PKCE is the proof. */
export interface OAuthClientRecord {
  clientId: string;
  redirectUris: string[];
  clientName: string | null;
  createdAt: string;
}

/** A one-time authorization code issued at /authorize and exchanged at /token.
 *  Short-lived and single-use; carries the PKCE challenge and the attributed
 *  email so /token can mint a personal access token for that person. */
export interface AuthCodeRecord {
  codeHash: string;
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  codeChallengeMethod: string;
  email: string;
  scope: string | null;
  resource: string | null;
  expiresAt: string;
  createdAt: string;
}

interface StateBackend {
  logRequest(entry: RequestLogEntry): Promise<void>;
  saveOAuthClient(rec: OAuthClientRecord): Promise<void>;
  findOAuthClient(clientId: string): Promise<OAuthClientRecord | null>;
  saveAuthCode(rec: AuthCodeRecord): Promise<void>;
  /** Fetch + delete a code atomically (single-use). Returns null if missing or
   *  expired; always removes the row so a code can never be replayed. */
  consumeAuthCode(codeHash: string): Promise<AuthCodeRecord | null>;
  listRequestLogs(limit: number): Promise<RequestLogEntry[]>;
  saveAccessToken(rec: {
    email: string;
    tokenHash: string;
    connectKey?: string | null;
    tool?: string | null;
  }): Promise<void>;
  findAccessToken(tokenHash: string): Promise<AccessTokenRecord | null>;
  touchAccessToken(tokenHash: string): Promise<void>;
  listAccessTokens(): Promise<AccessTokenRecord[]>;
  revokeAccessTokensByEmail(email: string): Promise<number>;
  /** Record a magic token as used; returns false if it was already used. */
  consumeMagicToken(tokenHash: string, expiresAtIso: string): Promise<boolean>;
  createConnectKey(rec: {
    keyHash: string;
    email?: string | null;
    label?: string | null;
  }): Promise<void>;
  findConnectKey(keyHash: string): Promise<ConnectKeyRecord | null>;
  listConnectKeys(): Promise<ConnectKeyRecord[]>;
  saveInstance(instance: StoredInstance): Promise<void>;
  loadInstance(instanceId: string): Promise<StoredInstance | null>;
  listInstancesByAgent(agentId?: string): Promise<StoredInstance[]>;
  saveChatSession(session: {
    sessionId: string;
    title: string;
    messages: unknown[];
    activeInstance: unknown | null;
    ownerEmail: string | null;
  }): Promise<void>;
  listChatSessions(ownerEmail: string | null): Promise<ChatSessionSummary[]>;
  loadChatSession(
    sessionId: string,
    ownerEmail: string | null,
  ): Promise<StoredChatSession | null>;
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
      CREATE TABLE IF NOT EXISTS used_magic_tokens (
        token_hash TEXT PRIMARY KEY,
        expires_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS connect_keys (
        key_hash   TEXT PRIMARY KEY,
        email      TEXT,
        label      TEXT,
        created_at TEXT NOT NULL,
        revoked    INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS oauth_clients (
        client_id     TEXT PRIMARY KEY,
        redirect_uris TEXT NOT NULL,
        client_name   TEXT,
        created_at    TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS oauth_codes (
        code_hash             TEXT PRIMARY KEY,
        client_id             TEXT NOT NULL,
        redirect_uri          TEXT NOT NULL,
        code_challenge        TEXT NOT NULL,
        code_challenge_method TEXT NOT NULL,
        email                 TEXT NOT NULL,
        scope                 TEXT,
        resource              TEXT,
        expires_at            TEXT NOT NULL,
        created_at            TEXT NOT NULL
      );
    `);
    // Migration: owner_email scopes a chat to a signed-in user (NULL = guest).
    if (!this.columnExists("chat_sessions", "owner_email")) {
      this.db.exec(`ALTER TABLE chat_sessions ADD COLUMN owner_email TEXT;`);
    }
    this.db.exec(
      `CREATE INDEX IF NOT EXISTS idx_chat_sessions_owner ON chat_sessions (owner_email);`,
    );
    // Migration: connect-key provisioning stamps tokens with their key + tool.
    if (!this.columnExists("access_tokens", "connect_key")) {
      this.db.exec(`ALTER TABLE access_tokens ADD COLUMN connect_key TEXT;`);
    }
    if (!this.columnExists("access_tokens", "tool")) {
      this.db.exec(`ALTER TABLE access_tokens ADD COLUMN tool TEXT;`);
    }
  }

  private columnExists(table: string, column: string): boolean {
    const rows = this.db
      .prepare(`PRAGMA table_info(${table})`)
      .all() as Array<{ name: string }>;
    return rows.some((r) => r.name === column);
  }

  async saveAccessToken(rec: {
    email: string;
    tokenHash: string;
    connectKey?: string | null;
    tool?: string | null;
  }): Promise<void> {
    this.db
      .prepare(
        `INSERT INTO access_tokens (token_hash, email, created_at, connect_key, tool)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .run(
        rec.tokenHash,
        rec.email,
        new Date().toISOString(),
        rec.connectKey ?? null,
        rec.tool ?? null,
      );
  }

  async createConnectKey(rec: {
    keyHash: string;
    email?: string | null;
    label?: string | null;
  }): Promise<void> {
    this.db
      .prepare(
        `INSERT INTO connect_keys (key_hash, email, label, created_at) VALUES (?, ?, ?, ?)`,
      )
      .run(rec.keyHash, rec.email ?? null, rec.label ?? null, new Date().toISOString());
  }

  async findConnectKey(keyHash: string): Promise<ConnectKeyRecord | null> {
    const r = this.db
      .prepare(`SELECT * FROM connect_keys WHERE key_hash = ?`)
      .get(keyHash) as Record<string, unknown> | undefined;
    return r ? sqliteRowToConnectKey(r) : null;
  }

  async saveOAuthClient(rec: OAuthClientRecord): Promise<void> {
    this.db
      .prepare(
        `INSERT INTO oauth_clients (client_id, redirect_uris, client_name, created_at)
         VALUES (?, ?, ?, ?)`,
      )
      .run(
        rec.clientId,
        JSON.stringify(rec.redirectUris),
        rec.clientName,
        rec.createdAt,
      );
  }

  async findOAuthClient(clientId: string): Promise<OAuthClientRecord | null> {
    const r = this.db
      .prepare(`SELECT * FROM oauth_clients WHERE client_id = ?`)
      .get(clientId) as Record<string, unknown> | undefined;
    return r ? sqliteRowToOAuthClient(r) : null;
  }

  async saveAuthCode(rec: AuthCodeRecord): Promise<void> {
    this.db
      .prepare(
        `INSERT INTO oauth_codes
           (code_hash, client_id, redirect_uri, code_challenge, code_challenge_method,
            email, scope, resource, expires_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        rec.codeHash,
        rec.clientId,
        rec.redirectUri,
        rec.codeChallenge,
        rec.codeChallengeMethod,
        rec.email,
        rec.scope,
        rec.resource,
        rec.expiresAt,
        rec.createdAt,
      );
  }

  async consumeAuthCode(codeHash: string): Promise<AuthCodeRecord | null> {
    // Opportunistic cleanup of expired codes, then fetch-and-delete this one so
    // it can never be replayed (returned only if it had not yet expired).
    this.db
      .prepare(`DELETE FROM oauth_codes WHERE expires_at < ?`)
      .run(new Date().toISOString());
    const row = this.db
      .prepare(`SELECT * FROM oauth_codes WHERE code_hash = ?`)
      .get(codeHash) as Record<string, unknown> | undefined;
    this.db.prepare(`DELETE FROM oauth_codes WHERE code_hash = ?`).run(codeHash);
    if (!row) return null;
    const rec = sqliteRowToAuthCode(row);
    return rec.expiresAt < new Date().toISOString() ? null : rec;
  }

  async listConnectKeys(): Promise<ConnectKeyRecord[]> {
    const rows = this.db
      .prepare(`SELECT * FROM connect_keys ORDER BY created_at DESC LIMIT 500`)
      .all() as Record<string, unknown>[];
    return rows.map(sqliteRowToConnectKey);
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

  async consumeMagicToken(
    tokenHash: string,
    expiresAtIso: string,
  ): Promise<boolean> {
    // Opportunistic cleanup of expired rows; then atomic insert-if-absent.
    this.db
      .prepare(`DELETE FROM used_magic_tokens WHERE expires_at < ?`)
      .run(new Date().toISOString());
    const info = this.db
      .prepare(
        `INSERT INTO used_magic_tokens (token_hash, expires_at) VALUES (?, ?)
         ON CONFLICT(token_hash) DO NOTHING`,
      )
      .run(tokenHash, expiresAtIso);
    return info.changes === 1; // 1 = first use, 0 = already consumed
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
    ownerEmail: string | null;
  }): Promise<void> {
    const now = new Date().toISOString();
    this.db
      .prepare(
        `INSERT INTO chat_sessions
           (session_id, title, messages, active_instance, created_at, updated_at, owner_email)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(session_id) DO UPDATE SET
           title = excluded.title, messages = excluded.messages,
           active_instance = excluded.active_instance, updated_at = excluded.updated_at
         WHERE chat_sessions.owner_email IS excluded.owner_email`,
      )
      .run(
        session.sessionId,
        session.title,
        JSON.stringify(session.messages),
        session.activeInstance ? JSON.stringify(session.activeInstance) : null,
        now,
        now,
        session.ownerEmail,
      );
  }

  async listChatSessions(
    ownerEmail: string | null,
  ): Promise<ChatSessionSummary[]> {
    const rows = this.db
      .prepare(
        `SELECT session_id, title, messages, created_at, updated_at
         FROM chat_sessions WHERE owner_email IS ?
         ORDER BY updated_at DESC LIMIT 50`,
      )
      .all(ownerEmail) as Record<string, string>[];
    return rows.map((row) => ({
      sessionId: row.session_id,
      title: row.title,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      messageCount: (JSON.parse(row.messages) as unknown[]).length,
    }));
  }

  async loadChatSession(
    sessionId: string,
    ownerEmail: string | null,
  ): Promise<StoredChatSession | null> {
    const row = this.db
      .prepare(
        `SELECT * FROM chat_sessions WHERE session_id = ? AND owner_email IS ?`,
      )
      .get(sessionId, ownerEmail) as Record<string, string | null> | undefined;
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
    connectKey: (row.connect_key as string | null) ?? null,
    tool: (row.tool as string | null) ?? null,
  };
}

function sqliteRowToConnectKey(row: Record<string, unknown>): ConnectKeyRecord {
  return {
    keyHash: row.key_hash as string,
    email: (row.email as string | null) ?? null,
    label: (row.label as string | null) ?? null,
    createdAt: row.created_at as string,
    revoked: row.revoked === 1,
  };
}

function rowToOAuthClient(row: Record<string, unknown>): OAuthClientRecord {
  const raw = row.redirect_uris as string;
  let redirectUris: string[] = [];
  try {
    redirectUris = JSON.parse(raw) as string[];
  } catch {
    redirectUris = [];
  }
  return {
    clientId: row.client_id as string,
    redirectUris,
    clientName: (row.client_name as string | null) ?? null,
    createdAt: row.created_at as string,
  };
}

function rowToAuthCode(row: Record<string, unknown>): AuthCodeRecord {
  return {
    codeHash: row.code_hash as string,
    clientId: row.client_id as string,
    redirectUri: row.redirect_uri as string,
    codeChallenge: row.code_challenge as string,
    codeChallengeMethod: row.code_challenge_method as string,
    email: row.email as string,
    scope: (row.scope as string | null) ?? null,
    resource: (row.resource as string | null) ?? null,
    expiresAt: row.expires_at as string,
    createdAt: row.created_at as string,
  };
}

// redirect_uris is stored as a JSON string in both backends, so the mappers are
// shared.
const sqliteRowToOAuthClient = rowToOAuthClient;
const pgRowToOAuthClient = rowToOAuthClient;
const sqliteRowToAuthCode = rowToAuthCode;
const pgRowToAuthCode = rowToAuthCode;

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
           updated_at      TEXT NOT NULL,
           owner_email     TEXT
         );
         ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS owner_email TEXT;
         CREATE INDEX IF NOT EXISTS idx_chat_sessions_owner ON chat_sessions (owner_email);
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
         CREATE INDEX IF NOT EXISTS idx_access_tokens_email ON access_tokens (email);
         ALTER TABLE access_tokens ADD COLUMN IF NOT EXISTS connect_key TEXT;
         ALTER TABLE access_tokens ADD COLUMN IF NOT EXISTS tool TEXT;
         CREATE TABLE IF NOT EXISTS used_magic_tokens (
           token_hash TEXT PRIMARY KEY,
           expires_at TEXT NOT NULL
         );
         CREATE TABLE IF NOT EXISTS connect_keys (
           key_hash   TEXT PRIMARY KEY,
           email      TEXT,
           label      TEXT,
           created_at TEXT NOT NULL,
           revoked    BOOLEAN NOT NULL DEFAULT FALSE
         );
         CREATE TABLE IF NOT EXISTS oauth_clients (
           client_id     TEXT PRIMARY KEY,
           redirect_uris TEXT NOT NULL,
           client_name   TEXT,
           created_at    TEXT NOT NULL
         );
         CREATE TABLE IF NOT EXISTS oauth_codes (
           code_hash             TEXT PRIMARY KEY,
           client_id             TEXT NOT NULL,
           redirect_uri          TEXT NOT NULL,
           code_challenge        TEXT NOT NULL,
           code_challenge_method TEXT NOT NULL,
           email                 TEXT NOT NULL,
           scope                 TEXT,
           resource              TEXT,
           expires_at            TEXT NOT NULL,
           created_at            TEXT NOT NULL
         );`,
      )
      .then(() => undefined);
  }

  async saveOAuthClient(rec: OAuthClientRecord): Promise<void> {
    await this.ready;
    await this.pool.query(
      `INSERT INTO oauth_clients (client_id, redirect_uris, client_name, created_at)
       VALUES ($1, $2, $3, $4)`,
      [rec.clientId, JSON.stringify(rec.redirectUris), rec.clientName, rec.createdAt],
    );
  }

  async findOAuthClient(clientId: string): Promise<OAuthClientRecord | null> {
    await this.ready;
    const { rows } = await this.pool.query(
      `SELECT * FROM oauth_clients WHERE client_id = $1`,
      [clientId],
    );
    return rows[0] ? pgRowToOAuthClient(rows[0]) : null;
  }

  async saveAuthCode(rec: AuthCodeRecord): Promise<void> {
    await this.ready;
    await this.pool.query(
      `INSERT INTO oauth_codes
         (code_hash, client_id, redirect_uri, code_challenge, code_challenge_method,
          email, scope, resource, expires_at, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        rec.codeHash,
        rec.clientId,
        rec.redirectUri,
        rec.codeChallenge,
        rec.codeChallengeMethod,
        rec.email,
        rec.scope,
        rec.resource,
        rec.expiresAt,
        rec.createdAt,
      ],
    );
  }

  async consumeAuthCode(codeHash: string): Promise<AuthCodeRecord | null> {
    await this.ready;
    await this.pool.query(`DELETE FROM oauth_codes WHERE expires_at < $1`, [
      new Date().toISOString(),
    ]);
    // Fetch-and-delete atomically so the code is single-use even under a race.
    const { rows } = await this.pool.query(
      `DELETE FROM oauth_codes WHERE code_hash = $1 RETURNING *`,
      [codeHash],
    );
    if (!rows[0]) return null;
    const rec = pgRowToAuthCode(rows[0]);
    return rec.expiresAt < new Date().toISOString() ? null : rec;
  }

  async createConnectKey(rec: {
    keyHash: string;
    email?: string | null;
    label?: string | null;
  }): Promise<void> {
    await this.ready;
    await this.pool.query(
      `INSERT INTO connect_keys (key_hash, email, label, created_at) VALUES ($1, $2, $3, $4)`,
      [rec.keyHash, rec.email ?? null, rec.label ?? null, new Date().toISOString()],
    );
  }

  async findConnectKey(keyHash: string): Promise<ConnectKeyRecord | null> {
    await this.ready;
    const { rows } = await this.pool.query(
      `SELECT * FROM connect_keys WHERE key_hash = $1`,
      [keyHash],
    );
    return rows[0] ? pgRowToConnectKey(rows[0]) : null;
  }

  async listConnectKeys(): Promise<ConnectKeyRecord[]> {
    await this.ready;
    const { rows } = await this.pool.query(
      `SELECT * FROM connect_keys ORDER BY created_at DESC LIMIT 500`,
    );
    return rows.map(pgRowToConnectKey);
  }

  async consumeMagicToken(
    tokenHash: string,
    expiresAtIso: string,
  ): Promise<boolean> {
    await this.ready;
    await this.pool.query(`DELETE FROM used_magic_tokens WHERE expires_at < $1`, [
      new Date().toISOString(),
    ]);
    const res = await this.pool.query(
      `INSERT INTO used_magic_tokens (token_hash, expires_at) VALUES ($1, $2)
       ON CONFLICT (token_hash) DO NOTHING`,
      [tokenHash, expiresAtIso],
    );
    return res.rowCount === 1; // 1 = first use, 0 = already consumed
  }

  async saveAccessToken(rec: {
    email: string;
    tokenHash: string;
    connectKey?: string | null;
    tool?: string | null;
  }): Promise<void> {
    await this.ready;
    await this.pool.query(
      `INSERT INTO access_tokens (token_hash, email, created_at, connect_key, tool)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        rec.tokenHash,
        rec.email,
        new Date().toISOString(),
        rec.connectKey ?? null,
        rec.tool ?? null,
      ],
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
    ownerEmail: string | null;
  }): Promise<void> {
    await this.ready;
    const now = new Date().toISOString();
    await this.pool.query(
      `INSERT INTO chat_sessions
         (session_id, title, messages, active_instance, created_at, updated_at, owner_email)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (session_id) DO UPDATE SET
         title = EXCLUDED.title, messages = EXCLUDED.messages,
         active_instance = EXCLUDED.active_instance, updated_at = EXCLUDED.updated_at
       WHERE chat_sessions.owner_email IS NOT DISTINCT FROM EXCLUDED.owner_email`,
      [
        session.sessionId,
        session.title,
        JSON.stringify(session.messages),
        session.activeInstance ? JSON.stringify(session.activeInstance) : null,
        now,
        now,
        session.ownerEmail,
      ],
    );
  }

  async listChatSessions(
    ownerEmail: string | null,
  ): Promise<ChatSessionSummary[]> {
    await this.ready;
    const { rows } = await this.pool.query(
      `SELECT session_id, title, messages, created_at, updated_at
       FROM chat_sessions WHERE owner_email IS NOT DISTINCT FROM $1
       ORDER BY updated_at DESC LIMIT 50`,
      [ownerEmail],
    );
    return rows.map((row) => ({
      sessionId: row.session_id,
      title: row.title,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      messageCount: Array.isArray(row.messages) ? row.messages.length : 0,
    }));
  }

  async loadChatSession(
    sessionId: string,
    ownerEmail: string | null,
  ): Promise<StoredChatSession | null> {
    await this.ready;
    const { rows } = await this.pool.query(
      `SELECT * FROM chat_sessions
       WHERE session_id = $1 AND owner_email IS NOT DISTINCT FROM $2`,
      [sessionId, ownerEmail],
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
    connectKey: (row.connect_key as string | null) ?? null,
    tool: (row.tool as string | null) ?? null,
  };
}

function pgRowToConnectKey(row: Record<string, unknown>): ConnectKeyRecord {
  return {
    keyHash: row.key_hash as string,
    email: (row.email as string | null) ?? null,
    label: (row.label as string | null) ?? null,
    createdAt: row.created_at as string,
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
  ownerEmail: string | null;
}): Promise<void> => store().saveChatSession(session);
export const listChatSessions = (
  ownerEmail: string | null,
): Promise<ChatSessionSummary[]> => store().listChatSessions(ownerEmail);
export const loadChatSession = (
  sessionId: string,
  ownerEmail: string | null,
): Promise<StoredChatSession | null> =>
  store().loadChatSession(sessionId, ownerEmail);
export const logRequest = (entry: RequestLogEntry): Promise<void> =>
  store().logRequest(entry);
export const listRequestLogs = (limit = 100): Promise<RequestLogEntry[]> =>
  store().listRequestLogs(limit);
export const saveAccessToken = (rec: {
  email: string;
  tokenHash: string;
  connectKey?: string | null;
  tool?: string | null;
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
export const consumeMagicToken = (
  tokenHash: string,
  expiresAtIso: string,
): Promise<boolean> => store().consumeMagicToken(tokenHash, expiresAtIso);
export const createConnectKey = (rec: {
  keyHash: string;
  email?: string | null;
  label?: string | null;
}): Promise<void> => store().createConnectKey(rec);
export const findConnectKey = (
  keyHash: string,
): Promise<ConnectKeyRecord | null> => store().findConnectKey(keyHash);
export const listConnectKeys = (): Promise<ConnectKeyRecord[]> =>
  store().listConnectKeys();
export const saveOAuthClient = (rec: OAuthClientRecord): Promise<void> =>
  store().saveOAuthClient(rec);
export const findOAuthClient = (
  clientId: string,
): Promise<OAuthClientRecord | null> => store().findOAuthClient(clientId);
export const saveAuthCode = (rec: AuthCodeRecord): Promise<void> =>
  store().saveAuthCode(rec);
export const consumeAuthCode = (
  codeHash: string,
): Promise<AuthCodeRecord | null> => store().consumeAuthCode(codeHash);
