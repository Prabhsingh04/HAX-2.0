import { patterns, type Pattern } from "@/lib/patterns";
import { anonymizeParticipants } from "@/lib/evidence-privacy";
import {
  PATTERN_UI_COMPONENTS,
  type PatternUiComponent,
} from "@/lib/pattern-ui-components";

export type BackingStrength = "Strong" | "Moderate" | "Thin" | "None";

export type ComponentMetadata = {
  name: string;
  slug: string;
  version: string;
  triggers: string[];
  description: string;
  category?: string;
  backingStrength?: BackingStrength;
  participants?: string;
  evidence_count?: number;
};

/**
 * Structural render spec consumed by client apps (e.g. cisco-my-agent-usecases'
 * PatternView). MCP owns the pattern's structure — layout + label/action
 * vocabulary — while the client owns the pixels, copy, and data.
 */
export type ComponentDefinition = {
  metadata: ComponentMetadata;
  behavior: {
    stateSchema: Record<string, unknown>;
    handlers: Array<{ name: string; description: string }>;
  };
  ui: {
    text: {
      sections: Array<{
        title: string;
        content: string;
        type: "field" | "status";
      }>;
    };
    component?: PatternUiComponent;
  };
};

export function buildComponentFromPattern(pattern: Pattern): ComponentDefinition {
  const triggers = [
    pattern.slug.replace(/-/g, " "),
    pattern.title.toLowerCase(),
    pattern.explanation.split(" ").slice(0, 3).join(" ").toLowerCase(),
  ];

  return {
    metadata: {
      name: pattern.title,
      slug: pattern.slug,
      version: "1.0.0",
      triggers,
      description: pattern.explanation,
      backingStrength: pattern.backingStrength,
      participants: pattern.participants
        ? anonymizeParticipants(pattern.participants)
        : undefined,
      evidence_count: pattern.evidence?.length || 0,
    },
    behavior: {
      stateSchema: {
        pattern_slug: { type: "string", description: "Pattern identifier" },
        title: { type: "string", description: "What we are deciding/doing" },
        description: { type: "string", description: "Context and reasoning" },
        evidence: {
          type: "array",
          description: "Supporting sources or quotes",
        },
        context: {
          type: "string",
          description: "Operator or participant context",
        },
        createdAt: { type: "string" },
        updatedAt: { type: "string" },
      },
      handlers: [
        { name: "instantiate", description: "Create new instance of this pattern" },
        { name: "updateState", description: "Modify instance state" },
        { name: "handoffTo", description: "Transfer to another pattern/agent" },
      ],
    },
    ui: {
      text: {
        sections: [
          { title: "Pattern", content: pattern.title, type: "field" },
          {
            title: "What it solves",
            content: pattern.whatItSolves || pattern.explanation,
            type: "field",
          },
          ...(pattern.interactionModel
            ? [
                {
                  title: "Interaction",
                  content: pattern.interactionModel,
                  type: "field" as const,
                },
              ]
            : []),
          { title: "Example", content: pattern.example, type: "field" },
          {
            title: "Backing",
            content: `${pattern.backingStrength || "Unknown"} (${pattern.participants ? anonymizeParticipants(pattern.participants) : "Research"})`,
            type: "status" as const,
          },
          {
            title: "Evidence",
            content: `${pattern.evidence?.length || 0} sources`,
            type: "status" as const,
          },
        ],
      },
      ...(PATTERN_UI_COMPONENTS[pattern.slug]
        ? { component: PATTERN_UI_COMPONENTS[pattern.slug] }
        : {}),
    },
  };
}

let registryCache: Map<string, ComponentDefinition> | null = null;

export function getPatternRegistry(): Map<string, ComponentDefinition> {
  if (!registryCache) {
    registryCache = new Map(
      patterns.map((pattern) => [
        pattern.slug,
        buildComponentFromPattern(pattern),
      ]),
    );
  }
  return registryCache;
}

/** Words ignored when tokenizing a discovery query. */
const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "can", "do", "for", "from",
  "how", "i", "in", "is", "it", "its", "keep", "make", "me", "my", "of", "on",
  "or", "so", "that", "the", "their", "them", "they", "this", "to", "want",
  "was", "we", "what", "when", "which", "with", "you", "your",
]);

/** Lowercase, split on non-alphanumerics, drop stop words, and lightly stem. */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token))
    .map(stem);
}

/** Crude suffix stemmer — enough to fold plurals/gerunds onto a common root. */
function stem(word: string): string {
  if (word.length > 5 && word.endsWith("ing")) return word.slice(0, -3);
  if (word.length > 4 && word.endsWith("ed")) return word.slice(0, -2);
  if (word.length > 4 && word.endsWith("ies")) return `${word.slice(0, -3)}y`;
  if (word.length > 3 && word.endsWith("es")) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith("s")) return word.slice(0, -1);
  return word;
}

export function discoverComponents(query: string): ComponentMetadata[] {
  const normalizedQuery = query.trim().toLowerCase();
  const queryTokens = tokenize(normalizedQuery);
  const results: Array<ComponentMetadata & { _score?: number }> = [];

  for (const component of getPatternRegistry().values()) {
    const { metadata } = component;
    let score = 0;

    const triggerText = metadata.triggers.join(" ").toLowerCase();
    const nameText = metadata.name.toLowerCase();
    const descriptionText = metadata.description.toLowerCase();

    // Whole-phrase hits (strongest signal, kept from the original heuristic).
    if (normalizedQuery.length > 2) {
      if (
        metadata.triggers.some(
          (trigger) =>
            normalizedQuery.includes(trigger.toLowerCase()) ||
            trigger.toLowerCase().includes(normalizedQuery),
        )
      ) {
        score += 10;
      }
      if (nameText.includes(normalizedQuery)) score += 6;
      if (descriptionText.includes(normalizedQuery)) score += 2;
    }

    // Per-token hits (handles multi-word / natural-language queries).
    const haystacks = tokenize(
      `${metadata.slug} ${triggerText} ${nameText} ${descriptionText}`,
    );
    const haystackSet = new Set(haystacks);
    for (const token of queryTokens) {
      if (haystackSet.has(token)) {
        // Weight matches by where they land.
        if (tokenize(nameText).includes(token)) score += 4;
        else if (tokenize(triggerText).includes(token)) score += 3;
        else score += 1;
      }
    }

    if (score > 0) {
      results.push({ ...metadata, _score: score });
    }
  }

  return results
    .sort((a, b) => (b._score ?? 0) - (a._score ?? 0))
    .map(({ _score: _, ...rest }) => rest);
}

export function fetchComponent(slug: string): ComponentDefinition | null {
  return getPatternRegistry().get(slug) ?? null;
}

export function createLocalInstance(
  slug: string,
  initialState: Record<string, unknown> = {},
): { instanceId: string; state: Record<string, unknown> } {
  const now = new Date().toISOString();
  return {
    instanceId: `${slug}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    state: {
      pattern_slug: slug,
      ...initialState,
      createdAt: now,
      updatedAt: now,
    },
  };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

/**
 * Recursively merge `updates` into `base`. Nested plain objects (e.g. `workspace`)
 * are merged key-by-key rather than replaced wholesale; arrays and primitives
 * overwrite.
 */
export function deepMerge(
  base: Record<string, unknown>,
  updates: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(updates)) {
    const existing = result[key];
    if (isPlainObject(existing) && isPlainObject(value)) {
      result[key] = deepMerge(existing, value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

export function mergeLocalInstanceState(
  state: Record<string, unknown>,
  updates: Record<string, unknown>,
): Record<string, unknown> {
  return {
    ...deepMerge(state, updates),
    updatedAt: new Date().toISOString(),
  };
}

/** True when fetch returned HTML (static host) instead of JSON API. */
export function isHtmlResponse(text: string): boolean {
  const trimmed = text.trimStart();
  return trimmed.startsWith("<!") || trimmed.startsWith("<html");
}

const FETCH_TIMEOUT_MS = 4000;

async function fetchWithTimeout(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function postJson<T>(
  url: string,
  body: unknown,
): Promise<{ ok: true; data: T } | { ok: false }> {
  if (typeof window === "undefined") {
    return { ok: false };
  }

  try {
    const response = await fetchWithTimeout(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const text = await response.text();
    if (isHtmlResponse(text) || !response.ok) {
      return { ok: false };
    }
    return { ok: true, data: JSON.parse(text) as T };
  } catch {
    return { ok: false };
  }
}

export async function getJson<T>(
  url: string,
): Promise<{ ok: true; data: T } | { ok: false }> {
  if (typeof window === "undefined") {
    return { ok: false };
  }

  try {
    const response = await fetchWithTimeout(url);
    const text = await response.text();
    if (isHtmlResponse(text) || !response.ok) {
      return { ok: false };
    }
    return { ok: true, data: JSON.parse(text) as T };
  } catch {
    return { ok: false };
  }
}
