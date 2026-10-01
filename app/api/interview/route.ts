import { generateText, isGatewayConfigured } from "@/lib/llm/gateway";
import { fetchComponent } from "@/server/mcp-server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Generic, model-driven interview questions for ANY pattern.
 *
 * The bespoke extraction flow only covers 6 patterns (each needs a hand-written
 * question script). This route reads a pattern's own definition and has the
 * model generate a short intake interview, so every pattern can absorb the
 * user's scenario instead of showing reference data. Cached per slug.
 */
const cache = new Map<string, string[]>();

const SYSTEM = `You design a short intake interview for a human-agent \
interaction design pattern. Given the pattern, produce 2-4 SHORT questions \
that capture the user's own specific scenario, so the pattern's design can be \
filled with their real details.

Rules:
- Each question targets one concrete thing the design needs (who is involved, \
what happened, what was decided, what the user wants to show).
- Plain language, ONE short sentence each (max ~15 words). No preamble, no numbering.
- Order them the way a person would naturally tell the story.
- Output ONLY a minified JSON array of strings and nothing else, e.g. \
["...","...","..."]. Stop immediately after the closing bracket.`;

/**
 * Resilient question extraction. Tries a clean JSON parse first; if the array
 * is truncated (model ran long) or wrapped in prose, salvages the quoted
 * strings directly so a near-miss still yields usable questions.
 */
function parseQuestions(raw: string): string[] {
  const match = raw.match(/\[[\s\S]*\]/);
  if (match) {
    try {
      const parsed = JSON.parse(match[0]) as unknown;
      if (Array.isArray(parsed)) {
        const qs = parsed.filter(
          (q): q is string => typeof q === "string" && q.trim().length > 5,
        );
        if (qs.length > 0) return qs.slice(0, 4);
      }
    } catch {
      /* fall through to salvage */
    }
  }
  // Salvage: pull quoted strings that look like questions.
  const salvaged = Array.from(raw.matchAll(/"([^"]{6,200})"/g))
    .map((m) => m[1].trim())
    .filter((s) => s.length > 5);
  return salvaged.slice(0, 4);
}

const GENERIC_FALLBACK = [
  "What's the specific situation you're designing for?",
  "Which agents or people are involved, and what did each do?",
  "What do you most need this screen to show or let someone decide?",
];

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON" }, { status: 400 });
  }

  const slug = body.slug as string | undefined;
  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  const component = fetchComponent(slug);
  if (!component) {
    return NextResponse.json({ error: "Pattern not found" }, { status: 404 });
  }

  if (cache.has(slug)) {
    return NextResponse.json({ questions: cache.get(slug), source: "cache" });
  }

  if (!isGatewayConfigured()) {
    return NextResponse.json({ questions: GENERIC_FALLBACK, source: "fallback" });
  }

  try {
    const meta = component.metadata;
    const section = (title: string) =>
      component.ui.text.sections.find((s) => s.title === title)?.content;
    const solves = section("What it solves") ?? meta.description;
    const example = section("Example") ?? "";

    const raw = await generateText({
      system: SYSTEM,
      prompt: `Pattern: ${meta.name}\nWhat it solves: ${solves}\nExample: ${example}`,
      maxTokens: 1024,
      temperature: 0.2,
      timeoutMs: 20_000,
      maxRetries: 0,
    });

    const questions = parseQuestions(raw);
    if (questions.length === 0) throw new Error(`no usable questions: ${raw.slice(0, 120)}`);

    cache.set(slug, questions);
    return NextResponse.json({ questions, source: "gateway" });
  } catch (error) {
    console.error("Interview generation failed, using fallback:", error);
    return NextResponse.json({ questions: GENERIC_FALLBACK, source: "fallback" });
  }
}
