import {
  recommendPatterns,
  toChatRecommendation,
  buildAiResponse,
  type ChatRecommendation,
} from "@/lib/pattern-advisor";
import { fetchComponent } from "@/server/mcp-server";
import { patterns } from "@/lib/patterns";
import { generateText, isGatewayConfigured } from "@/lib/llm/gateway";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export type { ChatRecommendation };

const ADVISOR_SYSTEM = `You are the IoC Patterns advisor. You help designers and \
engineers pick the right human-agent interaction pattern for a situation.

If the user's message describes a design situation or problem:
- Choose ONLY from the pattern library provided. Never invent a pattern.
- Pick the single best fit for what the user is actually asking. Read carefully: \
"how a disagreement got resolved" is different from "why agents disagree".
- Name the chosen pattern FIRST, then explain in 2-4 sentences why it fits, in \
plain language, and name its backing strength (Strong / Moderate / Thin) so the \
reader knows how well-supported it is.
- If nothing fits well, say so honestly rather than forcing a match.

If the message is smalltalk, thinking out loud, or too vague to act on:
- Respond naturally in 1-3 short sentences. Invite them to describe a concrete \
situation and mention the kinds of problems the library covers (tracking agent \
decisions, surfacing assumptions, resolving agent disagreement, reviewing \
background agent work). Do not name or force a pattern.

Always be concise and concrete. No preamble like "Great question".`;

/**
 * The whole library as compact grounded context. Seventeen patterns fit
 * comfortably in a prompt, so the model sees everything — keyword retrieval
 * exists only as the offline fallback ranking (it buried Decision Ledger at
 * #13 for a textbook audit-trail query).
 */
function buildLibraryContext(): string {
  return patterns
    .map((p, i) =>
      [
        `${i + 1}. ${p.title} (slug: ${p.slug})`,
        `   Backing strength: ${p.backingStrength ?? "Unrated"}`,
        `   Solves: ${p.whatItSolves ?? p.explanation}`,
        p.example ? `   Example: ${p.example}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n\n");
}

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON" },
      { status: 400 },
    );
  }

  try {
    const message = body.message as string | undefined;
    const sessionId = (body.sessionId as string | undefined) ?? "anonymous";

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    const trimmed = message.trim();

    // Retrieval: rank candidate patterns (keyword scorer over the registry).
    let recommendations = (await recommendPatterns(trimmed)).map(
      toChatRecommendation,
    );

    // Generation: let the model reason over the candidates. Falls back to the
    // deterministic template if the gateway is unconfigured or unreachable, so
    // chat degrades gracefully instead of breaking.
    let aiResponse: string;
    let source: "gateway" | "fallback" = "fallback";

    if (isGatewayConfigured()) {
      try {
        // The model sees the WHOLE library and decides both things: whether
        // the message is a scenario at all, and which pattern fits best.
        aiResponse = await generateText({
          system: ADVISOR_SYSTEM,
          prompt: `User's message:\n"${trimmed}"\n\nPattern library:\n${buildLibraryContext()}`,
          // Reasoning models spend "thinking" tokens from this budget before
          // emitting text; choosing among 17 patterns needs headroom or the
          // reply comes back empty.
          maxTokens: 2000,
        });
        source = "gateway";
        if (!aiResponse) {
          throw new Error("empty model reply (likely max_tokens exhausted)");
        }

        // Align the UI's highlighted card with the model's actual pick: the
        // pattern whose name/slug appears EARLIEST in the reply (the model is
        // instructed to name its recommendation first; later mentions are
        // comparisons). If the model picked something the keyword scorer
        // missed, fetch it and put it on top.
        const lowered = aiResponse.toLowerCase();
        const picked = patterns
          .map((p) => {
            const byName = lowered.indexOf(p.title.toLowerCase());
            const bySlug = lowered.indexOf(p.slug);
            const at = Math.min(
              byName === -1 ? Infinity : byName,
              bySlug === -1 ? Infinity : bySlug,
            );
            return { slug: p.slug, name: p.title, at };
          })
          .filter((entry) => entry.at !== Infinity)
          .sort((a, b) => a.at - b.at)[0];

        if (picked) {
          const existing = recommendations.find(
            (rec) => rec.pattern.slug === picked.slug,
          );
          if (existing) {
            recommendations = [
              existing,
              ...recommendations.filter((rec) => rec !== existing),
            ];
          } else {
            const fullComponent = fetchComponent(picked.slug);
            if (fullComponent) {
              recommendations = [
                {
                  pattern: { name: picked.name, slug: picked.slug },
                  reason: `Recommended for: "${trimmed}"`,
                  confidence: "high",
                  explanation: aiResponse,
                  fullComponent,
                  uiSections: fullComponent.ui.text.sections,
                },
                ...recommendations,
              ];
            }
          }
          // The model's pick plus at most two alternatives — a 12-card dump
          // buries the recommendation.
          recommendations = recommendations.slice(0, 3);
        } else {
          // Conversational reply (smalltalk / meta question): the model named
          // no pattern, so recommendation cards are pure noise.
          recommendations = [];
        }
      } catch (err) {
        console.error("Gateway generation failed, using fallback:", err);
        aiResponse = buildAiResponse(recommendations);
      }
    } else {
      aiResponse = buildAiResponse(recommendations);
    }

    if (source === "fallback") {
      recommendations = recommendations.slice(0, 3);
    }

    const topRecommendation = recommendations[0] ?? null;

    return NextResponse.json({
      sessionId,
      userMessage: trimmed,
      aiResponse,
      source,
      recommendations,
      topRecommendation,
    });
  } catch (error) {
    console.error("Chat error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to process chat";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
