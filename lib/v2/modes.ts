import type { Mode, ModeDef, ModeFamily } from "./types";

/**
 * The nine modes, from `context.md` section 4.
 *
 * A mode is the kind of opening an agent (or person) makes in an exchange,
 * defined by what it asks of the receiver. Responses live inside the mode.
 *
 * Three things keep this list closed. A candidate must be an opening rather
 * than a reply, must change what the receiver is expected to do, and must hold
 * regardless of who is talking. Correct, Refuse and Escalate fail the first
 * test; Report fails the second. Where each rejected candidate went instead is
 * recorded in `REJECTED_CANDIDATES` below.
 */
export const MODE_ORDER: Mode[] = [
  "declare",
  "signal",
  "explain",
  "request",
  "propose",
  "delegate",
  "coordinate",
  "resolve",
  "commit",
];

export const MODE_FAMILY_ORDER: ModeFamily[] = ["presenting", "engaging"];

export const MODE_FAMILY_LABEL: Record<ModeFamily, string> = {
  presenting: "Presenting",
  engaging: "Engaging",
};

export const MODE_FAMILY_DEFINITION: Record<ModeFamily, string> = {
  presenting:
    "The agent shows something. The receiver can take it in without replying.",
  engaging: "The agent asks for something back.",
};

export const MODE_LABEL: Record<Mode, string> = {
  declare: "Declare",
  signal: "Signal",
  explain: "Explain",
  request: "Request",
  propose: "Propose",
  delegate: "Delegate",
  coordinate: "Coordinate",
  resolve: "Resolve",
  commit: "Commit",
};

/**
 * What the mode does, in the fewest plain words. This is for finding a
 * pattern, not for defining a mode, the full definition, its opening line
 * and its responses are on the modes page.
 */
export const MODE_PLAIN: Record<Mode, string> = {
  declare: "say what it is and what it may do",
  signal: "say what it is doing",
  explain: "say why",
  request: "ask for something, and keep the task",
  propose: "ask before acting",
  delegate: "hand the task over",
  coordinate: "work on it together",
  resolve: "settle a disagreement",
  commit: "make it binding",
};

/** The verb as it appears inside a behavior-spec sentence. */
export const MODE_VERB: Record<Mode, string> = {
  declare: "declares",
  signal: "signals",
  explain: "explains",
  request: "requests",
  propose: "proposes",
  delegate: "delegates",
  coordinate: "coordinates",
  resolve: "resolves",
  commit: "commits",
};

/**
 * The connector after the verb. The document allows this to vary for
 * readability: an agent resolves *with* its peers but proposes *to* an operator.
 */
export const MODE_CONNECTOR: Record<Mode, "to" | "with"> = {
  declare: "to",
  signal: "to",
  explain: "to",
  request: "to",
  propose: "to",
  delegate: "to",
  coordinate: "with",
  resolve: "with",
  commit: "to",
};

export const modes: ModeDef[] = [
  {
    id: "declare",
    family: "presenting",
    definition: "States what it is, can do, and is permitted to do.",
    opens_with: "Here is what I am, can do, and may do",
    responses: ["calibrate trust", "set scope"],
    not_to_confuse_with: {
      mode: "signal",
      distinction:
        "Declare is standing, true until changed. Signal is a moment in time.",
    },
  },
  {
    id: "signal",
    family: "presenting",
    definition: "Conveys current or past state: doing, done, or waiting.",
    opens_with: "Here is what I'm doing, or did",
    responses: ["monitor", "step in"],
    not_to_confuse_with: {
      mode: "explain",
      distinction: "Signal says what. Explain says why.",
    },
  },
  {
    id: "explain",
    family: "presenting",
    definition:
      "Conveys reasons, evidence, or confidence behind an output or decision.",
    opens_with: "Here is why, and on what basis",
    responses: ["evaluate", "verify"],
    not_to_confuse_with: {
      mode: "propose",
      distinction:
        "Explain justifies what's done. Propose justifies what's not yet done, and asks consent.",
    },
  },
  {
    id: "request",
    family: "engaging",
    definition:
      "Asks for information, access, or help, keeping ownership of the task.",
    opens_with: "Can you get me X, or help with X?",
    responses: ["fulfil", "refuse"],
    not_to_confuse_with: {
      mode: "delegate",
      distinction: "Request keeps ownership. Delegate hands it over.",
    },
  },
  {
    id: "propose",
    family: "engaging",
    definition:
      "States an intended action and waits for consent before any irreversible step.",
    opens_with: "I plan to do X",
    responses: ["consent", "correct", "decline", "defer"],
    not_to_confuse_with: {
      mode: "commit",
      distinction:
        "Propose is before, and open to change. Commit is after, and binding.",
    },
  },
  {
    id: "delegate",
    family: "engaging",
    definition:
      "Transfers ownership of a task, with context, to another agent or a person.",
    opens_with: "Take over X",
    responses: ["accept", "refuse", "escalate", "report back"],
    not_to_confuse_with: {
      mode: "coordinate",
      distinction: "Delegate moves responsibility. Coordinate shares it.",
    },
  },
  {
    id: "coordinate",
    family: "engaging",
    definition:
      "Works with others on a shared artifact or state, adjusting as they contribute.",
    opens_with: "Let's work on X together",
    responses: ["act jointly"],
    not_to_confuse_with: {
      mode: "resolve",
      distinction:
        "Coordinate assumes alignment. Resolve starts from disagreement.",
    },
  },
  {
    id: "resolve",
    family: "engaging",
    definition:
      "Reconciles conflicting conclusions into an adopted answer, or flags an impasse.",
    opens_with: "We disagree on X",
    responses: ["adopt", "flag impasse"],
    not_to_confuse_with: {
      mode: "explain",
      distinction: "Resolve ends in a decision. Explain only accounts for one.",
    },
  },
  {
    id: "commit",
    family: "engaging",
    definition:
      "Makes a decision or belief binding and durable so others can rely on it.",
    opens_with: "X is now binding",
    responses: ["rely on it", "amend before sealing"],
    not_to_confuse_with: {
      mode: "signal",
      distinction:
        "Commit changes what's true going forward. Signal only reports.",
    },
  },
];

/** Where the four rejected mode candidates ended up instead. */
export const REJECTED_CANDIDATES: Array<{
  name: string;
  lands: string;
}> = [
  { name: "Correct", lands: "a response inside Propose" },
  { name: "Refuse", lands: "a response inside Request and Delegate" },
  {
    name: "Escalate",
    lands: "a response inside Delegate, or a Resolve that ends in impasse",
  },
  {
    name: "Negotiate",
    lands: "a missing pattern inside Resolve, before a conflict, not after",
  },
];

const BY_ID = new Map(modes.map((mode) => [mode.id, mode]));

export function getMode(id: Mode): ModeDef {
  const found = BY_ID.get(id);
  if (!found) throw new Error(`Unknown mode: ${id}`);
  return found;
}

export function modesInFamily(family: ModeFamily): ModeDef[] {
  return MODE_ORDER.map(getMode).filter((mode) => mode.family === family);
}
