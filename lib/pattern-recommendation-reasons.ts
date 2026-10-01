import type { ChatRecommendation } from "@/lib/pattern-advisor";
import { getPattern } from "@/lib/patterns";

function sentenceBullets(text: string, max = 3): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 12)
    .slice(0, max);
}

/**
 * Build “Why this pattern?” bullets for the recommendation card.
 *
 * Grounded in the PATTERN's own content only. The old version derived bullets
 * from keyword regexes on the user's input and stamped them on every card
 * identically — so a single-agent scenario mentioning "resolved" gave all 12
 * cards "Clear disagreement detected" / "N agents with different positions".
 */
export function buildRecommendationReasons(
  _userInput: string,
  recommendation: ChatRecommendation,
): string[] {
  const reasons: string[] = [];

  const pattern = getPattern(recommendation.pattern.slug);
  if (pattern?.oneliner) {
    reasons.push(pattern.oneliner);
  }

  if (reasons.length < 2) {
    reasons.push(...sentenceBullets(recommendation.reason, 2));
  }

  if (reasons.length < 2) {
    reasons.push(...sentenceBullets(recommendation.explanation, 2));
  }

  const unique: string[] = [];
  for (const reason of reasons) {
    const normalized = reason.toLowerCase();
    if (!unique.some((existing) => existing.toLowerCase() === normalized)) {
      unique.push(reason);
    }
  }

  return unique.slice(0, 3);
}

/**
 * Practitioner quote for the recommendation card evidence block.
 */
export function buildRecommendationEvidence(slug: string): string {
  const pattern = getPattern(slug);
  if (!pattern) {
    return "Practitioners use this when the scenario needs structured visibility.";
  }

  const evidenceQuote = pattern.evidence?.[0]?.quote?.trim();
  if (evidenceQuote) {
    const trimmed =
      evidenceQuote.length > 160
        ? `${evidenceQuote.slice(0, 157)}…`
        : evidenceQuote;
    return trimmed;
  }

  if (pattern.example?.trim()) {
    return pattern.example.trim();
  }

  return pattern.oneliner || pattern.explanation;
}
