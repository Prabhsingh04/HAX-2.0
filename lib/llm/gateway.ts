import "server-only";
import Anthropic from "@anthropic-ai/sdk";

/**
 * Single call site for all model inference, with a task-aware model pool.
 *
 * Points the Anthropic SDK at a configurable, Anthropic-Messages-compatible
 * gateway via env vars. Nothing else in the app talks to a model directly, so
 * switching gateways (e.g. Intelligaia -> Cisco's own) is a config change, not
 * a code change.
 *
 *   LLM_BASE_URL          root URL; the SDK appends /v1/messages
 *   LLM_API_KEY           sent as the x-api-key header
 *   LLM_MODEL             default/primary model (default: gemma4)
 *   LLM_MODEL_<TASK>      per-task primary override (ADVISOR / JUDGE / INTERVIEW)
 *   LLM_FALLBACK_MODELS   comma-separated chain tried if the primary fails
 *   LLM_TIMEOUT_MS        per-request timeout (default 20s)
 *
 * The supervisor pool: each task resolves to [primary, ...fallbacks]. We try
 * them in order, so a slow/down model (or an empty reply) transparently fails
 * over to the next — local-first, cloud only as last resort. Every attempt
 * logs {task, model, tokens, ms} for cost/observability.
 */
const baseURL = process.env.LLM_BASE_URL;
const apiKey = process.env.LLM_API_KEY;
const MODEL = process.env.LLM_MODEL ?? "gemma4";
const EMBED_MODEL = process.env.LLM_EMBED_MODEL ?? "bge-m3";
const TIMEOUT_MS = Number(process.env.LLM_TIMEOUT_MS ?? 20_000);

/**
 * Embed text via the gateway's OpenAI-compatible /v1/embeddings (bge-m3,
 * local). Used for deterministic semantic retrieval over the pattern library.
 */
export async function embed(text: string): Promise<number[]> {
  if (!isGatewayConfigured()) {
    throw new Error("Model gateway not configured");
  }
  const res = await fetch(`${baseURL}/v1/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: EMBED_MODEL, input: text }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`embeddings ${res.status}`);
  const data = (await res.json()) as { data?: Array<{ embedding?: number[] }> };
  const vec = data.data?.[0]?.embedding;
  if (!vec) throw new Error("embeddings: no vector in response");
  return vec;
}

export type LlmTask = "advisor" | "judge" | "interview" | "default";

function perTaskPrimary(task: LlmTask): string {
  const env: Record<LlmTask, string | undefined> = {
    advisor: process.env.LLM_MODEL_ADVISOR,
    judge: process.env.LLM_MODEL_JUDGE,
    interview: process.env.LLM_MODEL_INTERVIEW,
    default: undefined,
  };
  return env[task] ?? MODEL;
}

/** Ordered model chain for a task: primary first, then shared fallbacks. */
function modelsForTask(task: LlmTask): string[] {
  const primary = perTaskPrimary(task);
  const fallbacks = (process.env.LLM_FALLBACK_MODELS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return [primary, ...fallbacks.filter((m) => m !== primary)];
}

export function isGatewayConfigured(): boolean {
  return Boolean(baseURL && apiKey);
}

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) {
    if (!isGatewayConfigured()) {
      throw new Error(
        "Model gateway not configured: set LLM_BASE_URL and LLM_API_KEY",
      );
    }
    client = new Anthropic({ baseURL, apiKey, timeout: TIMEOUT_MS, maxRetries: 1 });
  }
  return client;
}

export type ChatTurn = { role: "user" | "assistant"; content: string };

export type GenerateOptions = {
  system: string;
  /** Single-turn prompt. Ignored if `messages` is provided. */
  prompt?: string;
  /** Multi-turn conversation (for context-aware follow-ups). */
  messages?: ChatTurn[];
  maxTokens?: number;
  temperature?: number;
  /** Per-call timeout override for latency-sensitive paths (e.g. judging). */
  timeoutMs?: number;
  maxRetries?: number;
  /** Which task this call serves — selects the model routing chain. */
  task?: LlmTask;
};

function extractText(response: Anthropic.Message): string {
  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();
}

/**
 * Send one prompt through the task's model chain, returning the first
 * non-empty reply. Throws only if every model in the chain fails — callers
 * keep their own deterministic fallback for that case.
 */
export async function generateText({
  system,
  prompt,
  messages,
  maxTokens = 700,
  temperature = 0.3,
  timeoutMs,
  maxRetries,
  task = "default",
}: GenerateOptions): Promise<string> {
  const turns: ChatTurn[] =
    messages && messages.length > 0
      ? messages
      : prompt !== undefined
        ? [{ role: "user", content: prompt }]
        : [];
  if (turns.length === 0) {
    throw new Error("generateText needs a prompt or messages");
  }

  const models = modelsForTask(task);
  let lastError: unknown;

  for (const model of models) {
    const startedAt = Date.now();
    try {
      const response = await getClient().messages.create(
        {
          model,
          max_tokens: maxTokens,
          temperature,
          system,
          messages: turns,
        },
        {
          ...(timeoutMs !== undefined ? { timeout: timeoutMs } : {}),
          ...(maxRetries !== undefined ? { maxRetries } : {}),
        },
      );
      const text = extractText(response);
      logUsage(task, model, response.usage, Date.now() - startedAt, text ? "ok" : "empty");
      if (text) return text;
      lastError = new Error(`empty reply from ${model}`);
    } catch (error) {
      logUsage(task, model, undefined, Date.now() - startedAt, "error");
      lastError = error;
      console.warn(`[llm] ${task} via ${model} failed, trying next:`, error);
    }
  }

  throw lastError ?? new Error("all models in the pool failed");
}

/** Structured usage line — pm2 logs become a simple cost/latency ledger. */
function logUsage(
  task: LlmTask,
  model: string,
  usage: Anthropic.Usage | undefined,
  ms: number,
  status: "ok" | "empty" | "error",
): void {
  console.log(
    `[llm-usage] ${JSON.stringify({
      task,
      model,
      status,
      ms,
      input_tokens: usage?.input_tokens ?? 0,
      output_tokens: usage?.output_tokens ?? 0,
    })}`,
  );
}
