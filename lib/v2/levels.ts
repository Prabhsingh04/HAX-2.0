import type { Audience, Channel, Level } from "./types";

/**
 * Participant dimensions, channels and audiences, from `context.md` sections 3 and 6.
 *
 * Dimensions describe who is in the exchange, not seniority. Each dimension
 * adds participants and their coordination needs. In user-facing UI, show the
 * label, never "L1-L4". The codes stay internal and in the schema.
 */

export const LEVEL_ORDER: Level[] = ["L1", "L2", "L3", "L4"];

export const LEVEL_LABEL: Record<Level, string> = {
  L1: "One agent",
  L2: "Many agents only",
  L3: "Many agents + one person",
  L4: "Many agents + many people",
};

/**
 * The long form, for use inside a behavior-spec sentence. The "in" is a
 * literal part of the template, not part of the `level` field, so that an
 * unfilled participant-dimension slot reads "… to audience in [dimension], through …".
 */
export const LEVEL_LONG: Record<Level, string> = {
  L1: "a single-agent setup",
  L2: "a system with many agents and no person in the loop",
  L3: "a system with many agents and one person in the loop",
  L4: "a system with many agents shared by several people or teams",
};

/** What first appears at this participant dimension and not before it. */
export const LEVEL_NEW: Record<Level, string> = {
  L1: "Self-representation",
  L2: "Peer coordination, headless",
  L3: "Legibility to a watcher; approval",
  L4: "Mediating between people; attribution",
};

/** How many participants to draw in the small dimension diagram. */
export const LEVEL_SHAPE: Record<Level, { agents: number; people: number }> = {
  L1: { agents: 1, people: 0 },
  L2: { agents: 3, people: 0 },
  L3: { agents: 3, people: 1 },
  L4: { agents: 3, people: 3 },
};

export const CHANNEL_ORDER: Channel[] = [
  "chat_ui",
  "settings_panel",
  "shared_ui",
  "agent_message",
  "shared_record",
  "state_signal",
];

export const CHANNEL_LABEL: Record<Channel, string> = {
  chat_ui: "Chat",
  settings_panel: "Settings panel",
  shared_ui: "Shared UI",
  agent_message: "Agent message",
  shared_record: "Shared record",
  state_signal: "State signal",
};

/** The channel as it appears inside a behavior-spec sentence. */
export const CHANNEL_PHRASE: Record<Channel, string> = {
  chat_ui: "chat",
  settings_panel: "the settings panel",
  shared_ui: "a shared UI",
  agent_message: "a message to another agent",
  shared_record: "a shared record",
  state_signal: "a state signal",
};

export const CHANNEL_FACING: Record<Channel, "human" | "agent"> = {
  chat_ui: "human",
  settings_panel: "human",
  shared_ui: "human",
  agent_message: "agent",
  shared_record: "agent",
  state_signal: "agent",
};

export const AUDIENCE_ORDER: Audience[] = [
  "self",
  "peer_agent",
  "orchestrator",
  "operator",
  "team",
];

export const AUDIENCE_LABEL: Record<Audience, string> = {
  self: "Itself",
  peer_agent: "A peer agent",
  orchestrator: "The orchestrator",
  operator: "The person operating it",
  team: "A team",
};

/** The audience as it appears inside a behavior-spec sentence. */
export const AUDIENCE_PHRASE: Record<Audience, string> = {
  self: "its own record",
  peer_agent: "its peer agents",
  orchestrator: "the orchestrator",
  operator: "the person operating it",
  team: "the teams involved",
};

export const AUDIENCE_FACING: Record<Audience, "human" | "agent"> = {
  self: "agent",
  peer_agent: "agent",
  orchestrator: "agent",
  operator: "human",
  team: "human",
};

/**
 * Picking a participant dimension narrows the channels and audiences that make sense.
 *
 * Only one constraint here is stated in `context.md`: an agents-only exchange
 * has no person in it, so it removes the human-facing channels (section 10,
 * point 1). The rest is the same rule read the other way round, a dimension with
 * a person in it keeps every channel, because an agent at L3 still exchanges
 * messages with its peers.
 */
export function channelsForLevel(level: Level): Channel[] {
  if (level === "L2") {
    return CHANNEL_ORDER.filter((c) => CHANNEL_FACING[c] === "agent");
  }
  if (level === "L1") {
    return CHANNEL_ORDER.filter((c) => CHANNEL_FACING[c] === "human");
  }
  return CHANNEL_ORDER;
}

export function audiencesForLevel(level: Level): Audience[] {
  if (level === "L1") return ["self", "operator"];
  if (level === "L2") return ["self", "peer_agent", "orchestrator"];
  if (level === "L3") return ["peer_agent", "orchestrator", "operator"];
  return ["peer_agent", "orchestrator", "operator", "team"];
}
