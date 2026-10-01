/**
 * Gate for extraction-flow answers.
 *
 * The scripted interview used to accept ANY input as the answer to the
 * current question ("whatv ?" became the agent roster and rendered into the
 * design preview). The gate decides whether a message is a genuine attempt
 * to answer before it is merged into the workspace.
 *
 * Two layers:
 *  - heuristicAnswerCheck — deterministic, runs anywhere (client-safe, used
 *    by static builds and as the offline fallback).
 *  - POST /api/extract — model judgment via the gateway (server route).
 */

export type AnswerVerdict = {
  isAnswer: boolean;
  /** Shown to the user when isAnswer is false (or as a custom ack). */
  reply?: string;
};

export function heuristicAnswerCheck(
  question: string,
  text: string,
): AnswerVerdict {
  const trimmed = text.trim();

  // A trailing "?" means the user is asking us something, not answering.
  if (/\?\s*$/.test(trimmed)) {
    return {
      isAnswer: false,
      reply: `Happy to clarify — I'm collecting details to fill in the design preview. Right now I need: ${question}`,
    };
  }

  // Too short to carry any answer content.
  if (trimmed.length < 3) {
    return {
      isAnswer: false,
      reply: `I didn't catch enough there to fill anything in. ${question}`,
    };
  }

  // Expressions of uncertainty ("not sure", "no sure", "idk", "no idea") are
  // not answers — merging them puts literal "Not sure" into the design.
  if (
    /^(i'?m\s+|i\s+am\s+)?(no|not)\s*sure\b/i.test(trimmed) ||
    /^(i\s+)?(don'?t|do\s+not)\s+know\b/i.test(trimmed) ||
    /^(idk|dunno|no\s+idea|no\s+clue)\b/i.test(trimmed)
  ) {
    return {
      isAnswer: false,
      reply: `No problem — a rough answer is fine, and you can refine it later in Customise. ${question}`,
    };
  }

  // Protests / meta-statements ("but I never gave the roles", "you tell me")
  // are about the interview, not answers to it.
  if (/^but\b/i.test(trimmed) || /^you\s+tell\s+me\b/i.test(trimmed)) {
    return {
      isAnswer: false,
      reply: `Fair — I only fill in what you give me, nothing is assumed. When you're ready: ${question}`,
    };
  }

  return { isAnswer: true };
}
