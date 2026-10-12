/**
 * The HAX behavior-spec data model (2026-10 reframe), transcribed EXACTLY from
 * Srishti's MCP server context brief, section 4. These field names are the API
 * contract — once the server ships them, renaming is a breaking change, so they
 * mirror the brief precisely (snake_case included).
 *
 * A pattern carries the behavior spec, one sentence with six slots:
 *   When [trigger], the agent [mode]s to [audience] in [level],
 *   through [channel], and expects [responses].
 *
 * Hierarchy: Mode → Pattern → Interaction. Modes and patterns are static
 * catalog data (authored in the repo's data files); Interactions are runtime
 * state the server creates and tracks.
 */

/** Who is in the exchange. Use the plain-language labels in anything
 *  user-facing; L1–L4 are fine in the API and storage. */
export type Level = "L1" | "L2" | "L3" | "L4";

export const LEVEL_LABELS: Record<Level, string> = {
  L1: "one agent",
  L2: "agents only",
  L3: "agents + one person",
  L4: "agents + many people",
};

/** The kind of opening an agent makes, defined by what it asks of the receiver.
 *  Presenting modes can be received without a reply; engaging modes ask for
 *  something back. */
export type Mode =
  // presenting
  | "declare"
  | "signal"
  | "explain"
  // engaging
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

export const MODE_FAMILY: Record<Mode, ModeFamily> = {
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

export function isPresentingMode(mode: Mode): boolean {
  return MODE_FAMILY[mode] === "presenting";
}

/** Runtime value lists for the closed enums (TS types erase at runtime; the
 *  catalog validators check incoming data against these). */
export const LEVELS: readonly Level[] = ["L1", "L2", "L3", "L4"];
export const MODES: readonly Mode[] = [...PRESENTING_MODES, ...ENGAGING_MODES];
export const CHANNELS: readonly Channel[] = [
  "chat_ui",
  "settings_panel",
  "shared_ui",
  "agent_message",
  "shared_record",
  "state_signal",
];
export const AUDIENCES: readonly Audience[] = [
  "self",
  "peer_agent",
  "orchestrator",
  "operator",
  "team",
];
export const EVIDENCE_VALUES: readonly Evidence[] = [
  "strong",
  "moderate",
  "thin",
  "none",
  "not_rated",
];
export const SOURCES = ["sdk", "ioc", "sdk+ioc"] as const;
export type PatternSource = (typeof SOURCES)[number];

/** Where the opening travels. Human-facing channels render to a surface a
 *  person sees; agent-facing channels are headless (L2). The agent-facing three
 *  are pending confirmation (brief section 10) — keep or drop together. */
export type Channel =
  // human-facing
  | "chat_ui"
  | "settings_panel"
  | "shared_ui"
  // agent-facing / headless
  | "agent_message"
  | "shared_record"
  | "state_signal";

/** Who receives the opening. */
export type Audience = "self" | "peer_agent" | "orchestrator" | "operator" | "team";

/** Research backing. SDK-only patterns are `not_rated`; don't invent ratings. */
export type Evidence = "strong" | "moderate" | "thin" | "none" | "not_rated";

/** A communication mode's definition — the catalog's "modes" table (ModeDef[]).
 *  Authored in the data files; this is the shape the server reads. */
export interface ModeDef {
  id: Mode;
  family: ModeFamily;
  definition: string;
  opens_with: string;
  /** Valid responses for every pattern in this mode. */
  responses: string[];
  not_to_confuse_with: { mode: Mode; distinction: string };
}

/** A level/context-specific manifestation. Merged patterns carry several. */
export interface PatternVariant {
  id: string; // kebab-case
  label: string; // named by the variant-axis value
  original: string; // original entry name, e.g. "Background Work Ledger"
  source: "sdk" | "ioc";
  sdk_component?: string; // e.g. "thinking-process"
  rendering?: string; // reference to a research design, for IOC variants
  default?: boolean; // exactly one per pattern
}

/**
 * A catalog pattern — the brief's `Pattern`. Named `CatalogPattern` here to
 * avoid colliding with the existing site-rendering `Pattern` in lib/patterns.ts;
 * the field names still match the API contract exactly.
 */
export interface CatalogPattern {
  id: string; // kebab-case, e.g. "pre-action-handshake"
  name: string;
  summary: string; // one line
  mode: { primary: Mode; secondary?: Mode };
  level: {
    primary: Level;
    notes: Partial<Record<Level, string>>; // primary + every reached level
  };
  triggers: string[];
  audience: Audience[];
  channels: Channel[];
  responses?: string[]; // optional per-pattern narrowing of the mode's responses
  spec: string; // the behavior-spec sentence, filled in
  source: "sdk" | "ioc" | "sdk+ioc";
  merged_from: string[]; // original entries, for traceability
  variant_axis?: string; // e.g. "granularity and time"
  variants?: PatternVariant[];
  evidence: Evidence;
  implementation?: {
    sdk_component?: string;
    status: "shipping" | "sketched" | "none";
  };
  composes_with: string[]; // pattern ids
  conflicts_with: string[];
}

/** A live occurrence of a pattern — created by `instantiate`, the only mutable
 *  state the server owns. */
export interface Interaction {
  id: string;
  pattern_id: string;
  level: Level;
  channel: Channel;
  initiator: string; // agent or person id
  audience: string[];
  state: Record<string, unknown>;
  response?: { value: string; by: string; at: string; note?: string };
  created_at: string;
}
