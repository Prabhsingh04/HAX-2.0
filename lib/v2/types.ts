/**
 * The v2 model, from `context.md` section 6.
 *
 * Hierarchy: Mode → Pattern → Interaction. Modes and patterns are the catalog.
 * Interactions are runtime instances, created by the MCP server's `instantiate`.
 *
 * Field names are deliberately snake_case to match the document, because the
 * MCP server will expose them and the doc says to keep them stable once chosen.
 * That is why they read differently from the camelCase v1 types in
 * `lib/patterns.ts`, which this does not replace or import.
 */

export type Level = "L1" | "L2" | "L3" | "L4";

export type Mode =
  | "declare"
  | "signal"
  | "explain" // presenting
  | "request"
  | "propose"
  | "delegate"
  | "coordinate"
  | "resolve"
  | "commit"; // engaging

export type ModeFamily = "presenting" | "engaging";

export type Channel =
  | "chat_ui"
  | "settings_panel"
  | "shared_ui" // human-facing
  | "agent_message"
  | "shared_record"
  | "state_signal"; // agent-facing / headless

export type Audience =
  | "self"
  | "peer_agent"
  | "orchestrator"
  | "operator"
  | "team";

export type Evidence = "strong" | "moderate" | "thin" | "none" | "not_rated";

export type Source = "sdk" | "ioc" | "sdk+ioc";

export interface ModeDef {
  id: Mode;
  family: ModeFamily;
  definition: string;
  opens_with: string;
  /** Valid responses for every pattern in this mode. */
  responses: string[];
  not_to_confuse_with: { mode: Mode; distinction: string };
}

/**
 * One presentation of a merged pattern.
 *
 * A merged pattern keeps one page, one spec sentence, one mode and one set
 * of responses, variants differ only in how they are drawn, along a single
 * named axis. A variant needing a different mode or different responses is a
 * sign it does not belong in the merge, and should be flagged rather than
 * forced in.
 *
 * Exposed by the MCP server through `fetch`, so these names are stable.
 */
export interface PatternVariant {
  /** kebab-case, e.g. "while-you-were-away" */
  id: string;
  /** Shown in the UI, named by the axis value, never by the original. */
  label: string;
  /** The original entry it came from, e.g. "Background Work Ledger". */
  original: string;
  source: "sdk" | "ioc";
  /** The SDK artifact's directory name, for variants that came from there. */
  sdk_component?: string;
  /** The v1 slug whose design to render, for variants that came from there. */
  rendering?: string;
  /** Exactly one per pattern. */
  default?: boolean;
}

export interface Pattern {
  /** kebab-case, e.g. "pre-action-handshake" */
  id: string;
  name: string;
  /** one line */
  summary: string;
  mode: { primary: Mode; secondary?: Mode };
  level: {
    primary: Level;
    /** primary + every reached level; absent = doesn't apply */
    notes: Partial<Record<Level, string>>;
  };
  /** the moments it shows up */
  triggers: string[];
  audience: Audience[];
  channels: Channel[];
  /** optional per-pattern narrowing of the mode's responses */
  responses?: string[];
  /** the behavior-spec sentence, filled in */
  spec: string;
  source: Source;
  /** original entries, for traceability */
  merged_from: string[];
  evidence: Evidence;
  implementation?: { sdk_component?: string; status: "shipping" | "sketched" | "none" };
  /** pattern ids */
  composes_with: string[];
  conflicts_with: string[];
  /**
   * Addition beyond context.md: the v1 pattern slugs this entry was built from,
   * so a v2 page can link back to the research page without re-deriving the
   * mapping from `merged_from` prose. Empty for SDK-only entries.
   */
  v1_slugs: string[];
  /**
   * Reader-facing v2 copy, grounded in the IOC research pages or SDK
   * component behavior. Not-yet-written patterns leave it undefined, and the
   * page renders only the sections it has.
   */
  whatItSolves?: string;
  interactionModel?: string;
  /** Optional steps for showing the interaction as a sequence on its page. */
  interactionSteps?: { title: string; description: string }[];
  whereItEmbeds?: string;
  example?: string;
  factChips?: string[];
  /**
   * Marks a pattern whose v2 content + UI pass is finished (the Ready tag).
   * A working progress flag for the redesign, not the v1 research-ready set.
   */
  contentReady?: boolean;
  /** What the variants differ along, e.g. "granularity and time". */
  variant_axis?: string;
  variants?: PatternVariant[];
}

/** A live instance; created by `instantiate`. */
export interface Interaction {
  id: string;
  pattern_id: string;
  level: Level;
  channel: Channel;
  /** agent or person id */
  initiator: string;
  audience: string[];
  state: Record<string, unknown>;
  response?: { value: string; by: string; at: string; note?: string };
  created_at: string;
}

/** The six slots of the behavior-spec sentence (section 5). */
export type SpecSlot =
  | "trigger"
  | "mode"
  | "audience"
  | "level"
  | "channel"
  | "responses";
