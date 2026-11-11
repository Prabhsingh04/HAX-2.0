import { patterns as v2Patterns } from "@/lib/v2/catalog";
import type { Channel, Level, Mode, Pattern } from "@/lib/v2/types";
import { NEW_AGENTIC_DETAILS } from "./new-agentic-details";

/**
 * The v3 catalog mirrors the broader AI-UX pattern map from Nucleux so we do
 * not lose that knowledge, while keeping HAX's own agentic patterns as the
 * identity of the library.
 *
 * Two kinds of entries:
 *   agentic   HAX's own agent-coordination patterns. The 23 existing v2
 *             patterns stay unchanged and are referenced here by id. Seven
 *             additional agent-side patterns (Stream of Thought, Follow Up,
 *             Memory, and the four Task patterns) are declared inline.
 *             Agentic entries carry the HAX behavior spec and 4 dimensions of
 *             participation, which the Agentic view's filters use.
 *   general   The rest of the broader AI-UX map. The index keeps a lighter
 *             card schema; detail pages resolve authored descriptions, usage
 *             guidance, code, and examples from the source catalog.
 *
 * Nothing here changes any v2 file.
 */

export type PatternCategory = "agentic" | "general";

export type NucleuxStage =
  | "onboarding"
  | "initially"
  | "during-interaction"
  | "over-time";

export const NUCLEUX_STAGE_ORDER: NucleuxStage[] = [
  "onboarding",
  "initially",
  "during-interaction",
  "over-time",
];

export const NUCLEUX_STAGE_LABEL: Record<NucleuxStage, string> = {
  onboarding: "Onboarding",
  initially: "Initially",
  "during-interaction": "During interaction",
  "over-time": "Over time",
};

export const NUCLEUX_STAGE_SUMMARY: Record<NucleuxStage, string> = {
  onboarding:
    "What a person first sees: how the agent introduces itself, discloses what it is, and shows what it can do.",
  initially:
    "How the exchange starts: how the person tells the agent what they need and what the agent reaches for context.",
  "during-interaction":
    "How the work unfolds: how the agent proposes, acts, explains, and recovers while a person stays in the loop.",
  "over-time":
    "What persists: memory, preferences, privacy, and the ways the relationship changes session to session.",
};

export type NucleuxCluster =
  // onboarding
  | "trust-disclosure"
  | "identity"
  | "capability-discovery"
  // initially
  | "entry-points"
  | "expressive-input"
  | "prompt-scaffolds"
  | "context-expansion"
  // during-interaction
  | "output-processing"
  | "task-agent-management"
  | "collaboration-canvas"
  | "refinement"
  | "explainability"
  | "recovery"
  | "power-controls"
  // over-time
  | "memory-continuity"
  | "privacy-control"
  | "adaptation"
  | "change-management";

export const NUCLEUX_CLUSTER_LABEL: Record<NucleuxCluster, string> = {
  "trust-disclosure": "Trust and disclosure",
  identity: "Identity",
  "capability-discovery": "Capability discovery",
  "entry-points": "Entry points",
  "expressive-input": "Expressive input",
  "prompt-scaffolds": "Prompt scaffolds",
  "context-expansion": "Context expansion",
  "output-processing": "Output and processing",
  "task-agent-management": "Task and agent management",
  "collaboration-canvas": "Collaboration canvas",
  refinement: "Refinement",
  explainability: "Explainability",
  recovery: "Recovery",
  "power-controls": "Power controls",
  "memory-continuity": "Memory and continuity",
  "privacy-control": "Privacy and control",
  adaptation: "Adaptation",
  "change-management": "Change management",
};

export const NUCLEUX_CLUSTER_STAGE: Record<NucleuxCluster, NucleuxStage> = {
  "trust-disclosure": "onboarding",
  identity: "onboarding",
  "capability-discovery": "onboarding",
  "entry-points": "initially",
  "expressive-input": "initially",
  "prompt-scaffolds": "initially",
  "context-expansion": "initially",
  "output-processing": "during-interaction",
  "task-agent-management": "during-interaction",
  "collaboration-canvas": "during-interaction",
  refinement: "during-interaction",
  explainability: "during-interaction",
  recovery: "during-interaction",
  "power-controls": "during-interaction",
  "memory-continuity": "over-time",
  "privacy-control": "over-time",
  adaptation: "over-time",
  "change-management": "over-time",
};

/** Flat shape used by the /v3/patterns index. */
export type V3PatternCard = {
  id: string;
  name: string;
  summary: string;
  category: PatternCategory;
  nucleuxStage: NucleuxStage;
  nucleuxCluster: NucleuxCluster;
  /** Agentic only. For v2-backed entries this reads through to the v2 pattern. */
  mode?: Mode;
  level?: Level;
  /** Every participant dimension for which an authored pattern has a note. */
  dimensions?: Level[];
  channels?: Channel[];
  contentReady?: boolean;
  /** Where the card links. Agentic v2-backed entries link to their v2 page. */
  href?: string;
};

/** Nucleux cluster assignment for each v2 pattern (does not change v2). */
const V2_PATTERN_CLUSTER: Record<string, NucleuxCluster> = {
  "presence-boundary": "recovery",
  "activity-record": "explainability",
  "inline-rationale": "explainability",
  "structured-finding": "output-processing",
  "source-attribution": "explainability",
  "deferred-detail": "recovery",
  "certainty-boundary": "explainability",
  "details-dashboard": "output-processing",
  "capability-manifest": "capability-discovery",
  "credential-boundary": "trust-disclosure",
  "convergence-point": "recovery",
  "pre-action-handshake": "recovery",
  "assumption-surface": "explainability",
  "decision-record": "explainability",
  "review-as-dialogue": "collaboration-canvas",
  "memory-commitment-review": "memory-continuity",
  "disclosure-gradient": "explainability",
  "co-editing-surface": "collaboration-canvas",
  "concurrent-workspace-awareness": "collaboration-canvas",
  "authority-gradient": "capability-discovery",
  "lineage-view": "explainability",
  "shared-cognitive-state": "collaboration-canvas",
  "workshop-card": "task-agent-management",
};

/** Agentic patterns that come from the Nucleux map and do not yet have v2 pages. */
type NewAgenticEntry = Omit<V3PatternCard, "category" | "nucleuxStage"> & {
  nucleuxCluster: NucleuxCluster;
};

const NEW_AGENTIC_ENTRIES: NewAgenticEntry[] = [
  {
    id: "stream-of-thought",
    name: "Stream of Thought",
    summary:
      "The agent shows its reasoning as it unfolds, so a person can follow or interrupt before a conclusion lands.",
    nucleuxCluster: "output-processing",
    mode: "signal",
    level: "L3",
    channels: ["chat_ui"],
  },
  {
    id: "follow-up",
    name: "Follow Up",
    summary:
      "The agent asks one focused clarifying question when the request is ambiguous, rather than guessing.",
    nucleuxCluster: "recovery",
    mode: "request",
    level: "L3",
    channels: ["chat_ui"],
  },
  {
    id: "agent-memory",
    name: "Memory",
    summary:
      "The agent keeps relevant facts across turns and sessions, with the person able to see and change what it remembers.",
    nucleuxCluster: "memory-continuity",
    mode: "declare",
    level: "L3",
    channels: ["settings_panel", "chat_ui"],
  },
  {
    id: "task-creation",
    name: "Task Creation",
    summary:
      "The agent turns a request into a named task with an owner and an expected result.",
    nucleuxCluster: "task-agent-management",
    mode: "propose",
    level: "L3",
    channels: ["chat_ui", "shared_ui"],
  },
  {
    id: "task-assignment",
    name: "Task Assignment",
    summary:
      "The agent assigns a task to a peer agent whose capabilities match, and shows who owns what.",
    nucleuxCluster: "task-agent-management",
    mode: "delegate",
    level: "L2",
    channels: ["agent_message", "shared_ui"],
  },
  {
    id: "priority-ranking",
    name: "Priority Ranking",
    summary:
      "The agent orders tasks by weight and lets a person see and adjust the ranking.",
    nucleuxCluster: "task-agent-management",
    mode: "declare",
    level: "L3",
    channels: ["shared_ui"],
  },
  {
    id: "subtask-generation",
    name: "Subtask Generation",
    summary:
      "The agent breaks a complex task into subtasks and shows how they combine into the overall result.",
    nucleuxCluster: "task-agent-management",
    mode: "propose",
    level: "L3",
    channels: ["shared_ui"],
  },
];

/** General (non-agentic) entries drawn from the Nucleux map, kept lighter. */
type GeneralEntry = {
  id: string;
  name: string;
  summary: string;
  nucleuxCluster: NucleuxCluster;
};

const GENERAL_ENTRIES: GeneralEntry[] = [
  // Onboarding / trust & disclosure
  { id: "nx-disclosure", name: "Disclosure", summary: "The agent discloses that it is an AI and the nature of its outputs.", nucleuxCluster: "trust-disclosure" },
  { id: "nx-consent", name: "Consent", summary: "The person agrees to how the agent will use their data and content.", nucleuxCluster: "trust-disclosure" },
  { id: "nx-caveat", name: "Caveat", summary: "The agent names a known limitation of its outputs so a person can read them with that in mind.", nucleuxCluster: "trust-disclosure" },
  // Onboarding / identity
  { id: "nx-avatar", name: "Avatar", summary: "A visual mark that identifies the agent across the interface.", nucleuxCluster: "identity" },
  { id: "nx-name", name: "Name", summary: "A consistent name that lets a person refer to the agent and separate it from others.", nucleuxCluster: "identity" },
  { id: "nx-personality", name: "Personality", summary: "A consistent voice and manner that shapes how the agent speaks and responds.", nucleuxCluster: "identity" },
  { id: "nx-iconography", name: "Iconography", summary: "Icons that distinguish agent actions from a person's actions at a glance.", nucleuxCluster: "identity" },
  { id: "nx-color", name: "Color", summary: "A color system that marks agent-generated content without overpowering the interface.", nucleuxCluster: "identity" },
  // Onboarding / capability discovery
  { id: "nx-example-gallery", name: "Example Gallery", summary: "A curated set of worked examples that show what the agent can do.", nucleuxCluster: "capability-discovery" },
  { id: "nx-templates", name: "Templates", summary: "Starting points for common tasks that lower the cost of a first prompt.", nucleuxCluster: "capability-discovery" },
  { id: "nx-nudges", name: "Nudges", summary: "Short in-context tips that teach a feature at the moment it becomes useful.", nucleuxCluster: "capability-discovery" },
  { id: "nx-disclaimer", name: "Disclaimer", summary: "A clear note about what the agent is not responsible for.", nucleuxCluster: "capability-discovery" },

  // Initially / entry points
  { id: "nx-initial-cta", name: "Initial CTA", summary: "A single primary action that starts the exchange.", nucleuxCluster: "entry-points" },
  { id: "nx-open-input", name: "Open Input", summary: "A free-form field that invites a person to say what they want in their own words.", nucleuxCluster: "entry-points" },
  { id: "nx-suggested-prompts", name: "Suggested Prompts", summary: "Ready-made prompts that show the shape of a useful request.", nucleuxCluster: "entry-points" },
  { id: "nx-icons", name: "Icons", summary: "Icon-led entry points that signal capabilities without reading.", nucleuxCluster: "entry-points" },
  { id: "nx-searching-filtering", name: "Searching and Filtering", summary: "Search and filter controls that let a person narrow a long list of options.", nucleuxCluster: "entry-points" },
  { id: "nx-autocomplete", name: "Autocomplete", summary: "The input predicts and completes what a person is likely to type next.", nucleuxCluster: "entry-points" },
  { id: "nx-proactive-suggestions", name: "Proactive Suggestions", summary: "The agent offers a next step based on what the person just did.", nucleuxCluster: "entry-points" },
  { id: "nx-randomize", name: "Randomize", summary: "A control that shows a random example or variation when a person is unsure what to ask for.", nucleuxCluster: "entry-points" },
  // Initially / expressive input
  { id: "nx-voice-input", name: "Voice Input", summary: "A person speaks their request instead of typing it.", nucleuxCluster: "expressive-input" },
  { id: "nx-visual-input", name: "Visual Input", summary: "A person provides an image, screenshot, or sketch as the request.", nucleuxCluster: "expressive-input" },
  { id: "nx-handwriting-input", name: "Handwriting Input", summary: "A person writes by hand and the agent reads it.", nucleuxCluster: "expressive-input" },
  { id: "nx-gesture-input", name: "Gesture Input", summary: "A touch or pointer gesture expresses the request without words.", nucleuxCluster: "expressive-input" },
  { id: "nx-structured-input", name: "Structured Input", summary: "A form-shaped input gathers the fields the agent needs before it starts.", nucleuxCluster: "expressive-input" },
  // Initially / prompt scaffolds
  { id: "nx-suggestions", name: "Suggestions", summary: "The agent offers ways to complete or improve the current prompt.", nucleuxCluster: "prompt-scaffolds" },
  { id: "nx-madlibs", name: "Madlibs", summary: "A fill-in-the-blanks prompt frame that keeps the person focused on choices.", nucleuxCluster: "prompt-scaffolds" },
  { id: "nx-prompt-enhancer", name: "Prompt Enhancer", summary: "A control that expands a terse prompt into a fuller one before running it.", nucleuxCluster: "prompt-scaffolds" },
  { id: "nx-modes", name: "Modes", summary: "Named modes that shift how the agent reads and answers the same prompt.", nucleuxCluster: "prompt-scaffolds" },
  { id: "nx-voice-and-tone", name: "Voice and Tone", summary: "A control that sets the register of the agent's reply.", nucleuxCluster: "prompt-scaffolds" },
  { id: "nx-preset-styles", name: "Preset Styles", summary: "Saved styles that apply to the output without rewriting the prompt.", nucleuxCluster: "prompt-scaffolds" },
  // Initially / context expansion
  { id: "nx-attachments", name: "Attachments", summary: "A person attaches files that the agent can read as part of the task.", nucleuxCluster: "context-expansion" },
  { id: "nx-connectors", name: "Connectors", summary: "Integrations that give the agent access to a connected service's data.", nucleuxCluster: "context-expansion" },
  { id: "nx-mcp-connectors", name: "MCP Connectors", summary: "A Model Context Protocol connection that exposes external tools and data to the agent.", nucleuxCluster: "context-expansion" },
  { id: "nx-knowledge-bases", name: "Knowledge Bases", summary: "A curated corpus the agent reads for grounded answers.", nucleuxCluster: "context-expansion" },
  { id: "nx-model-selection", name: "Model Selection", summary: "A control that picks the model used for this task.", nucleuxCluster: "context-expansion" },

  // During interaction / output and processing (non-agentic ones)
  { id: "nx-streaming", name: "Streaming", summary: "The agent's output appears as it is generated, rather than all at once.", nucleuxCluster: "output-processing" },
  { id: "nx-preview-output", name: "Preview Output", summary: "A low-fidelity preview of the result before the full output is committed.", nucleuxCluster: "output-processing" },
  { id: "nx-structured-output", name: "Structured Output", summary: "The agent returns its answer in a structured form the interface can lay out.", nucleuxCluster: "output-processing" },
  { id: "nx-variations", name: "Variations", summary: "Several candidate outputs from the same prompt, side by side.", nucleuxCluster: "output-processing" },
  { id: "nx-summary", name: "Summary", summary: "A short summary that leads the fuller output.", nucleuxCluster: "output-processing" },
  { id: "nx-multimodal-output", name: "Multi-modal Output", summary: "The agent returns text, image, and audio together when they belong together.", nucleuxCluster: "output-processing" },
  { id: "nx-transcript", name: "Transcript", summary: "A full record of what the agent said and did during the task.", nucleuxCluster: "output-processing" },
  { id: "nx-processing-steps", name: "Processing Steps", summary: "A visible step list that shows where the agent is in its work.", nucleuxCluster: "output-processing" },
  { id: "nx-action-plan", name: "Action Plan", summary: "A plan the agent will follow, shown before the work begins.", nucleuxCluster: "output-processing" },

  // During interaction / collaboration canvas
  { id: "nx-draft-mode", name: "Draft Mode", summary: "A shared draft the person and the agent can edit together before anything is published.", nucleuxCluster: "collaboration-canvas" },
  { id: "nx-inline-action", name: "Inline Action", summary: "A control attached to a specific passage that triggers an edit or follow-up there.", nucleuxCluster: "collaboration-canvas" },
  { id: "nx-inpainting", name: "Inpainting", summary: "A person marks a region of an output and the agent revises only that region.", nucleuxCluster: "collaboration-canvas" },
  { id: "nx-visual-editing", name: "Visual Editing", summary: "Direct manipulation controls on the output, rather than re-prompting.", nucleuxCluster: "collaboration-canvas" },
  { id: "nx-shared-vision", name: "Shared Vision", summary: "A shared canvas that both the person and the agent see, so they discuss what is there.", nucleuxCluster: "collaboration-canvas" },

  // During interaction / refinement
  { id: "nx-regenerate", name: "Regenerate", summary: "Ask the agent to try again with no further instruction.", nucleuxCluster: "refinement" },
  { id: "nx-reply", name: "Reply", summary: "A short follow-up that refines the previous output.", nucleuxCluster: "refinement" },
  { id: "nx-transform", name: "Transform", summary: "Convert the output into a different form without changing its meaning.", nucleuxCluster: "refinement" },
  { id: "nx-expand", name: "Expand", summary: "Ask the agent to go deeper on a specific part.", nucleuxCluster: "refinement" },
  { id: "nx-restructure", name: "Restructure", summary: "Reorder the output to fit a different shape.", nucleuxCluster: "refinement" },
  { id: "nx-restyle", name: "Restyle", summary: "Keep the content and change its style.", nucleuxCluster: "refinement" },
  { id: "nx-synthesis", name: "Synthesis", summary: "Combine several outputs into one.", nucleuxCluster: "refinement" },

  // During interaction / explainability
  { id: "nx-citations", name: "Citations", summary: "Named sources attached to claims in the output.", nucleuxCluster: "explainability" },
  { id: "nx-confidence-indicators", name: "Confidence Indicators", summary: "A signal of how certain the agent is about a given part of its output.", nucleuxCluster: "explainability" },
  { id: "nx-references", name: "References", summary: "Links to the material the agent relied on.", nucleuxCluster: "explainability" },
  { id: "nx-sample-response", name: "Sample Response", summary: "An example of what the agent's response should look like, shown ahead of time.", nucleuxCluster: "explainability" },
  { id: "nx-prompt-details", name: "Prompt Details", summary: "The full prompt the agent received, including any hidden parts.", nucleuxCluster: "explainability" },
  { id: "nx-footprints", name: "Footprints", summary: "A visible trail of the agent's recent actions and decisions.", nucleuxCluster: "explainability" },

  // During interaction / recovery (non-agentic)
  { id: "nx-controls", name: "Controls", summary: "Stop, pause, and reset controls for work in progress.", nucleuxCluster: "recovery" },
  { id: "nx-verification", name: "Verification", summary: "A step that checks the agent's result against a known-good reference.", nucleuxCluster: "recovery" },
  { id: "nx-error-empty-states", name: "Error and Empty States", summary: "Helpful messages when the agent cannot do the task or has nothing to show.", nucleuxCluster: "recovery" },

  // During interaction / power controls
  { id: "nx-filters", name: "Filters", summary: "Controls that narrow a long output to the subset a person needs.", nucleuxCluster: "power-controls" },
  { id: "nx-parameters", name: "Parameters", summary: "Expert-level dials that shape how the agent runs.", nucleuxCluster: "power-controls" },
  { id: "nx-chained-action", name: "Chained Action", summary: "Run several agent steps in sequence without intervening prompts.", nucleuxCluster: "power-controls" },
  { id: "nx-cost-estimates", name: "Cost Estimates", summary: "An estimate of the time or token cost of a run before the person commits to it.", nucleuxCluster: "power-controls" },
  { id: "nx-describe", name: "Describe", summary: "The agent explains a selection on the canvas in natural language.", nucleuxCluster: "power-controls" },
  { id: "nx-auto-fill", name: "Auto-fill", summary: "The agent fills predictable fields so the person only edits the exceptions.", nucleuxCluster: "power-controls" },

  // Over time / memory and continuity
  { id: "nx-saved-styles", name: "Saved Styles", summary: "The person saves a style and the agent applies it on future runs.", nucleuxCluster: "memory-continuity" },
  { id: "nx-branches", name: "Branches", summary: "Alternative histories a person can keep and compare without losing earlier work.", nucleuxCluster: "memory-continuity" },
  { id: "nx-personalization", name: "Personalization", summary: "The agent adapts to what it has learned about this person over time.", nucleuxCluster: "memory-continuity" },

  // Over time / privacy and control
  { id: "nx-data-ownership", name: "Data Ownership", summary: "The person can see, export, and delete the data the agent holds about them.", nucleuxCluster: "privacy-control" },
  { id: "nx-incognito-mode", name: "Incognito Mode", summary: "A session that is not kept in memory after it ends.", nucleuxCluster: "privacy-control" },
  { id: "nx-watermark", name: "Watermark", summary: "A marker on generated content that identifies it as such.", nucleuxCluster: "privacy-control" },

  // Over time / adaptation
  { id: "nx-collecting-feedback", name: "Collecting Feedback", summary: "Lightweight controls that let a person rate or correct the agent's output.", nucleuxCluster: "adaptation" },
  { id: "nx-model-management", name: "Model Management", summary: "Controls that let a person or team pick, switch, or constrain the model.", nucleuxCluster: "adaptation" },

  // Over time / change management
  { id: "nx-update-notifications", name: "Update Notifications", summary: "A clear note when the agent's capabilities or behavior change.", nucleuxCluster: "change-management" },
  { id: "nx-contextual-resize", name: "Contextual Resize", summary: "The agent resizes its surface to the amount of work currently in flight.", nucleuxCluster: "change-management" },
];

export function getV3Patterns(): V3PatternCard[] {
  const fromV2: V3PatternCard[] = v2Patterns.map((pattern: Pattern) => {
    const cluster = V2_PATTERN_CLUSTER[pattern.id];
    if (!cluster) {
      throw new Error(`Missing Nucleux cluster for v2 pattern ${pattern.id}`);
    }
    return {
      id: pattern.id,
      name: pattern.name,
      summary: pattern.summary,
      category: "agentic" as const,
      nucleuxStage: NUCLEUX_CLUSTER_STAGE[cluster],
      nucleuxCluster: cluster,
      mode: pattern.mode.primary,
      level: pattern.level.primary,
      dimensions: Object.keys(pattern.level.notes) as Level[],
      channels: pattern.channels,
      contentReady: pattern.contentReady,
      href: `/v3/patterns/${pattern.id}`,
    };
  });

  const fromNewAgentic: V3PatternCard[] = NEW_AGENTIC_ENTRIES.map((entry) => ({
    ...entry,
    category: "agentic" as const,
    nucleuxStage: NUCLEUX_CLUSTER_STAGE[entry.nucleuxCluster],
    dimensions: Object.keys(NEW_AGENTIC_DETAILS.find((pattern) => pattern.id === entry.id)?.level.notes ?? {}) as Level[],
    href: `/v3/patterns/${entry.id}`,
  }));

  const fromGeneral: V3PatternCard[] = GENERAL_ENTRIES.map((entry) => ({
    id: entry.id,
    name: entry.name,
    summary: entry.summary,
    category: "general" as const,
    nucleuxStage: NUCLEUX_CLUSTER_STAGE[entry.nucleuxCluster],
    nucleuxCluster: entry.nucleuxCluster,
    href: `/v3/patterns/${entry.id}`,
  }));

  return [...fromV2, ...fromNewAgentic, ...fromGeneral];
}

export function getV3PatternsByCategory(
  category: PatternCategory,
): V3PatternCard[] {
  return getV3Patterns().filter((pattern) => pattern.category === category);
}

export function getV3PatternsByStage(
  stage: NucleuxStage,
): V3PatternCard[] {
  return getV3Patterns().filter((pattern) => pattern.nucleuxStage === stage);
}

export function getV3PatternCountsByStage(): Record<NucleuxStage, number> {
  const counts: Record<NucleuxStage, number> = {
    onboarding: 0,
    initially: 0,
    "during-interaction": 0,
    "over-time": 0,
  };
  for (const pattern of getV3Patterns()) counts[pattern.nucleuxStage] += 1;
  return counts;
}

export function getV3AgenticCountsByStage(): Record<NucleuxStage, number> {
  const counts: Record<NucleuxStage, number> = {
    onboarding: 0,
    initially: 0,
    "during-interaction": 0,
    "over-time": 0,
  };
  for (const pattern of getV3Patterns()) {
    if (pattern.category === "agentic") counts[pattern.nucleuxStage] += 1;
  }
  return counts;
}
