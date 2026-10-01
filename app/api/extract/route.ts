import { heuristicAnswerCheck, type AnswerVerdict } from "@/lib/patterns/answer-gate";
import { generateText, isGatewayConfigured } from "@/lib/llm/gateway";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const JUDGE_SYSTEM = `You validate one turn of a structured interview that fills \
in a design template about a multi-agent scenario. Decide whether the user's \
message is a genuine attempt to answer the interview question.

Reply ONLY with minified JSON, nothing else: {"is_answer":true|false,"reply":"..."}

- is_answer=false when the message is: a question back to you; confusion; a test \
("testing", "asdf"); an expression of uncertainty ("not sure", "idk", "no idea"); \
a protest or meta-comment about the interview ("but I never gave the roles", \
"you tell me", "why do you ask"); or clearly unrelated to what was asked.
- When is_answer=false: in "reply", briefly help — answer their question if they \
asked one, in one or two sentences — then restate the interview question in your \
own words so they can answer it.
- When is_answer=true: set "reply" to "" (the app supplies the acknowledgement).
- is_answer=true only when the message contains actual content that addresses \
the question, even partially or informally. Filler without content is false.`;

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

  const question = body.question as string | undefined;
  const text = body.text as string | undefined;

  if (!question?.trim() || typeof text !== "string") {
    return NextResponse.json(
      { error: "question and text are required" },
      { status: 400 },
    );
  }

  // Deterministic layer first: cheap, and catches the obvious cases without
  // burning a model call.
  const heuristic = heuristicAnswerCheck(question, text);
  if (!heuristic.isAnswer) {
    return NextResponse.json({ ...heuristic, source: "heuristic" });
  }

  if (!isGatewayConfigured()) {
    return NextResponse.json({ isAnswer: true, source: "heuristic" });
  }

  try {
    const raw = await generateText({
      system: JUDGE_SYSTEM,
      prompt: `Interview question:\n"${question.trim()}"\n\nUser's message:\n"${text.trim()}"`,
      // Reasoning models spend thinking tokens from this budget; 250 caused
      // EMPTY replies -> unparseable -> default-open junk acceptance.
      maxTokens: 800,
      temperature: 0,
      // Interview turns should feel quick; if the gateway is slow or down,
      // fail fast and default-open rather than stalling the conversation.
      timeoutMs: 15_000,
      maxRetries: 0,
    });

    // Models sometimes wrap JSON in prose or fences — extract the object.
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error(`unparseable judge output: ${raw.slice(0, 120)}`);
    const parsed = JSON.parse(match[0]) as {
      is_answer?: boolean;
      reply?: string;
    };

    const verdict: AnswerVerdict = {
      isAnswer: parsed.is_answer !== false,
      reply: parsed.reply?.trim() || undefined,
    };
    return NextResponse.json({ ...verdict, source: "gateway" });
  } catch (error) {
    // Default open: never block the interview because judging failed.
    console.error("Extract judge failed, accepting answer:", error);
    return NextResponse.json({ isAnswer: true, source: "fallback" });
  }
}
