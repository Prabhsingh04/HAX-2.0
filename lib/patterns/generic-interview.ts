/**
 * Client-side state for the generic, model-driven interview.
 *
 * Patterns without a hand-scripted extraction flow (11 of 17) use this: the
 * questions come from /api/interview (model-generated from the pattern's
 * definition), and the collected answers live in the instance workspace under
 * `_interview`, so they persist and can be rendered as a "Your scenario" card.
 */
export type InterviewAnswer = { question: string; answer: string };

export type GenericInterview = {
  questions: string[];
  step: number;
  answers: InterviewAnswer[];
};

export const INTERVIEW_WORKSPACE_KEY = "_interview";

export function getGenericInterview(
  workspace: Record<string, unknown> | undefined | null,
): GenericInterview | null {
  const iv = workspace?.[INTERVIEW_WORKSPACE_KEY];
  if (
    iv &&
    typeof iv === "object" &&
    Array.isArray((iv as GenericInterview).questions)
  ) {
    return iv as GenericInterview;
  }
  return null;
}

export function currentInterviewQuestion(iv: GenericInterview): string | null {
  return iv.step < iv.questions.length ? iv.questions[iv.step]! : null;
}

export function recordInterviewAnswer(
  iv: GenericInterview,
  question: string,
  answer: string,
): GenericInterview {
  return {
    ...iv,
    step: iv.step + 1,
    answers: [...iv.answers, { question, answer }],
  };
}

/** Fetch model-generated questions for a pattern. Returns [] on any failure. */
export async function fetchInterviewQuestions(slug: string): Promise<string[]> {
  try {
    const res = await fetch("/api/interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as { questions?: unknown };
    return Array.isArray(data.questions)
      ? data.questions.filter((q): q is string => typeof q === "string")
      : [];
  } catch {
    return [];
  }
}
