"use client";

import Link from "next/link";
import {
  buildRecommendationEvidence,
  buildRecommendationReasons,
} from "@/lib/pattern-recommendation-reasons";
import { CONVERGENCE_RECOMMENDATION_COPY } from "@/lib/convergence-point-instructions";
import { getRecommendationCopy } from "@/lib/patterns/loader";
import type { ChatRecommendation } from "@/lib/pattern-advisor";
import "./pattern-chat-cards.css";

export type PatternRecommendationCardProps = {
  recommendation: ChatRecommendation;
  userInput: string;
  isTopRecommendation?: boolean;
  animationDelay?: number;
  onTryThis: () => void;
};

export function PatternRecommendationCard({
  recommendation,
  userInput,
  isTopRecommendation = false,
  animationDelay = 0,
  onTryThis,
}: PatternRecommendationCardProps) {
  const { pattern } = recommendation;
  const instructionCopy = getRecommendationCopy(pattern.slug);
  // Always use pattern-grounded bullets. Instruction-file defaultReasons make
  // claims about the USER's scenario ("Multiple roles needed for one
  // decision") that are stamped on regardless of what was actually described.
  const reasons = buildRecommendationReasons(userInput, recommendation);
  const evidence =
    instructionCopy?.researchQuote ??
    (pattern.slug === "convergence-point"
      ? CONVERGENCE_RECOMMENDATION_COPY.researchQuote
      : buildRecommendationEvidence(pattern.slug));

  return (
    <article
      className={`pattern-rec-card${isTopRecommendation ? " pattern-rec-card--top" : ""}`}
      style={{ animationDelay: `${animationDelay}ms` }}
      aria-label={`Recommended pattern: ${pattern.name}`}
    >
      <header className="pattern-rec-card__header">
        <span className="pattern-rec-card__check" aria-hidden>
          ✓
        </span>
        <div>
          <div className="pattern-rec-card__title">{pattern.name}</div>
          <div className="pattern-rec-card__subtitle">
            Recommended based on your scenario
          </div>
        </div>
      </header>

      <div>
        <div className="pattern-rec-card__section-label">Why this pattern?</div>
        <ul className="pattern-rec-card__reasons">
          {reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      </div>

      <blockquote className="pattern-rec-card__evidence">
        <div className="pattern-rec-card__evidence-label">
          {instructionCopy?.researchLabel ??
            (pattern.slug === "convergence-point"
              ? CONVERGENCE_RECOMMENDATION_COPY.researchLabel
              : "Practitioners use this when:")}
        </div>
        <div className="pattern-rec-card__evidence-text">&ldquo;{evidence}&rdquo;</div>
      </blockquote>

      <footer className="pattern-rec-card__actions">
        <button
          type="button"
          className="pattern-rec-card__btn pattern-rec-card__btn--primary"
          onClick={onTryThis}
        >
          Try this
        </button>
        <Link
          href={`/patterns/${pattern.slug}`}
          className="pattern-rec-card__btn pattern-rec-card__btn--secondary"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn more
        </Link>
      </footer>
    </article>
  );
}
