import "server-only";
import Anthropic from "@anthropic-ai/sdk";

/**
 * Single call site for all model inference.
 *
 * Points the Anthropic SDK at a configurable, Anthropic-Messages-compatible
 * gateway via env vars. Nothing else in the app talks to a model directly, so
 * switching gateways (e.g. Intelligaia -> Cisco's own) is a config change to
 * these three env vars, not a code change.
 *
 *   LLM_BASE_URL  root URL; the SDK appends /v1/messages
 *   LLM_API_KEY   sent as the x-api-key header
 *   LLM_MODEL     model id served by the gateway (default: gemma4)
 */
const baseURL = process.env.LLM_BASE_URL;
const apiKey = process.env.LLM_API_KEY;
const MODEL = process.env.LLM_MODEL ?? "gemma4";
// Fail fast: if the gateway hangs, the caller's fallback should take over in
// seconds, not minutes. Overridable per deployment.
const TIMEOUT_MS = Number(process.env.LLM_TIMEOUT_MS ?? 20_000);

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

export type GenerateOptions = {
  system: string;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  /** Per-call override for latency-sensitive paths (e.g. interview judging). */
  timeoutMs?: number;
  maxRetries?: number;
};

/** Send one prompt, return the concatenated text of the reply. */
export async function generateText({
  system,
  prompt,
  maxTokens = 700,
  temperature = 0.3,
  timeoutMs,
  maxRetries,
}: GenerateOptions): Promise<string> {
  const response = await getClient().messages.create(
    {
      model: MODEL,
      max_tokens: maxTokens,
      temperature,
      system,
      messages: [{ role: "user", content: prompt }],
    },
    {
      ...(timeoutMs !== undefined ? { timeout: timeoutMs } : {}),
      ...(maxRetries !== undefined ? { maxRetries } : {}),
    },
  );

  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();
}
