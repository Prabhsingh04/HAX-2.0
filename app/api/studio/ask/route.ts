import { NextRequest, NextResponse } from "next/server";
import { generateText, isGatewayConfigured, type ChatTurn } from "@/lib/llm/gateway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Free-form Q&A for the Studio side panel. The Studio's own answerer is a
 * keyword matcher, so anything a person types that isn't one of its trigger
 * words ("testing", "how do I use this in my app?") gets the same canned line.
 * This answers any question, but ONLY from the selected pattern's catalog data
 * (sent by the Studio, so it always matches the catalog version on screen) —
 * keeping the Studio's intent that answers never invent pattern behavior.
 *
 *   POST { pattern: <catalog Pattern>, question: string, history?: ChatTurn[] }
 *   → { ok: true, answer } | { ok: false } (the Studio then falls back to its
 *     keyword answer, so a gateway outage is never worse than before)
 */

const MAX_PATTERN_CHARS = 14_000;
const MAX_QUESTION_CHARS = 1_000;
const MAX_HISTORY = 6;

const SYSTEM = `You answer questions about ONE interaction pattern from the HAX \
pattern library, inside a design Studio. The pattern's catalog entry is given \
as JSON. Rules:
- Answer only from that catalog entry. Never invent behavior, responses, \
levels, channels, or examples it does not contain. If the entry doesn't cover \
the question, say so plainly and point to what it does cover.
- The reader may be non-technical. Use plain language, no JSON field names.
- Only if the message is a greeting, a single word, or a test ("testing", "hi", \
"?"): keep it short and warm. Start with "Hi!" ONLY if their message was a \
greeting (hi, hello, hey); otherwise start directly. Say in ONE short sentence \
(under 25 words) what this pattern does, then offer 2 example questions, each \
in quotes, that make sense for THIS pattern — only suggest asking about \
responses or choices if the catalog entry lists responses for a person to \
pick; otherwise pick from when it appears, what the person sees, or an example. \
Any real question — even a broad one like "how would I use this?" — gets a \
direct answer, never a deflection.
- For "how would I use / apply this" questions, answer practically: the moment \
in their product when it should appear (from the triggers), what the person \
would see and be able to do (from the steps and responses), and a short \
illustration drawn from the catalog example. Assume a non-developer unless \
told otherwise.
- Be concise: 2-5 sentences, or a short numbered list for step-by-step questions.
- Plain text only, no markdown: no **bold**, no # headings, no * bullets. For \
lists use "1." numbering on separate lines.
- No preamble like "Great question".`;

export async function POST(request: NextRequest) {
  if (!isGatewayConfigured()) {
    return NextResponse.json({ ok: false, error: "model unavailable" }, { status: 503 });
  }

  let pattern: unknown;
  let question = "";
  let history: ChatTurn[] = [];
  try {
    const body = await request.json();
    pattern = body?.pattern;
    question = String(body?.question ?? "").trim().slice(0, MAX_QUESTION_CHARS);
    if (Array.isArray(body?.history)) {
      history = (body.history as unknown[])
        .filter(
          (t): t is ChatTurn =>
            !!t &&
            typeof t === "object" &&
            ((t as ChatTurn).role === "user" || (t as ChatTurn).role === "assistant") &&
            typeof (t as ChatTurn).content === "string" &&
            (t as ChatTurn).content.trim().length > 0,
        )
        .slice(-MAX_HISTORY)
        .map((t) => ({ role: t.role, content: t.content.slice(0, 2_000) }));
    }
  } catch {
    return NextResponse.json({ ok: false, error: "invalid body" }, { status: 400 });
  }

  if (!question || !pattern || typeof pattern !== "object") {
    return NextResponse.json({ ok: false, error: "pattern and question required" }, { status: 400 });
  }

  const patternJson = JSON.stringify(pattern).slice(0, MAX_PATTERN_CHARS);
  const system = `${SYSTEM}\n\nCatalog entry:\n${patternJson}`;

  // The conversation must start with a user turn and alternate; drop a leading
  // assistant turn (the Studio's opening card) if present.
  while (history.length > 0 && history[0].role !== "user") history.shift();
  const messages: ChatTurn[] = [];
  for (const turn of [...history, { role: "user" as const, content: question }]) {
    const last = messages[messages.length - 1];
    if (last && last.role === turn.role) last.content += `\n\n${turn.content}`;
    else messages.push({ ...turn });
  }

  try {
    const answer = await generateText({
      system,
      messages,
      maxTokens: 1200,
      temperature: 0.2,
      timeoutMs: 25_000,
      task: "advisor",
    });
    return NextResponse.json({ ok: true, answer });
  } catch (error) {
    console.error("studio/ask failed:", error);
    return NextResponse.json({ ok: false, error: "model error" }, { status: 502 });
  }
}
