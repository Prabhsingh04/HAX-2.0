/**
 * Behavior taxonomy for the HAX reframe (2026-10). A pattern is now described
 * by the one-sentence behavior spec:
 *
 *   When [trigger], the agent [mode]s to [audience] in [level],
 *   through [channel], and expects [responses].
 *
 * The enums below (levels, the 9 modes, channels) come straight from the
 * published behavior-spec slides and are stable. What is still being finalized
 * is the *assignment* of these values to each of the 23 patterns — that data
 * is authored in the pattern files (owned by the design side), not here.
 */

/** Participant structure. L1 is single-agent (ceded to the AIUX Playbook); the
 *  multi-agent levels L2–L4 are HAX's differentiator. */
export type PatternLevel = "L1" | "L2" | "L3" | "L4";

export const LEVEL_LABELS: Record<PatternLevel, string> = {
  L1: "one agent",
  L2: "multi-agent, no humans",
  L3: "multi-agent + 1 human",
  L4: "multi-agent + multiple humans",
};

/** How an agent opens an exchange. Presenting modes need no reply; engaging
 *  modes ask for something back. */
export type CommunicationMode =
  | "declare"
  | "signal"
  | "explain"
  | "request"
  | "propose"
  | "delegate"
  | "coordinate"
  | "resolve"
  | "commit";

export type ModeFamily = "presenting" | "engaging";

export const PRESENTING_MODES = ["declare", "signal", "explain"] as const;
export const ENGAGING_MODES = [
  "request",
  "propose",
  "delegate",
  "coordinate",
  "resolve",
  "commit",
] as const;

export const MODE_FAMILY: Record<CommunicationMode, ModeFamily> = {
  declare: "presenting",
  signal: "presenting",
  explain: "presenting",
  request: "engaging",
  propose: "engaging",
  delegate: "engaging",
  coordinate: "engaging",
  resolve: "engaging",
  commit: "engaging",
};

/** Where the exchange surfaces. Per the spec: chat, settings, a shared UI, or a
 *  message between agents (no human-facing surface). */
export type PatternChannel = "chat" | "settings" | "shared-ui" | "agent-message";

export const CHANNEL_LABELS: Record<PatternChannel, string> = {
  chat: "Chat UI",
  settings: "Settings panel",
  "shared-ui": "Shared UI",
  "agent-message": "Agent-to-agent message",
};

/**
 * Definition of a communication mode — the catalog's "modes" table. The actual
 * ModeDef records (opensWith phrasing, the canonical response set, etc.) are
 * authored in the pattern data; this is the shape the server reads.
 */
export type ModeDef = {
  mode: CommunicationMode;
  family: ModeFamily;
  /** One-line definition of what this mode is. */
  definition: string;
  /** The opening phrasing, e.g. "Here is why, and on what basis". */
  opensWith: string;
  /** What the receiver can do back, e.g. ["consent", "correct", "decline"]. */
  responses: string[];
  /** Disambiguation vs a neighbouring mode. */
  notToConfuseWith?: string;
};

export function isPresentingMode(mode: CommunicationMode): boolean {
  return MODE_FAMILY[mode] === "presenting";
}
