/**
 * Render contract (render-fidelity guardrails).
 *
 * The MCP server serves behavior specs, and the client LLM draws the UI. That
 * flexibility is also the failure mode: without a contract, an agent reinvents
 * the visual from scratch, so it (a) drifts far from the canonical website UI
 * project-to-project and (b) silently drops layers the pattern requires (the
 * "I don't see reasoning or handoffs" feedback on Disclosure Gradient).
 *
 * This derives a per-pattern contract from the catalog data the design side
 * already authored (interactionSteps, responses, factChips, channels, mode), so
 * it scales to all 23 patterns with no hand-authoring. `instantiate_pattern` and
 * `fetch` return it, and the tool descriptions tell the agent to REPRODUCE it
 * (required elements + layout + explanation), not design something new. The user
 * can still ask the agent to adapt it afterwards — they just start from a
 * faithful baseline instead of a guess.
 */
import {
  LEVEL_LABELS,
  MODE_FAMILY,
  isPresentingMode,
  type CatalogPattern,
  type Channel,
} from "@/lib/patterns/behavior";

/** The rich v2 fields carried at runtime but not declared on CatalogPattern
 *  (catalog-data.ts casts the v2 Pattern through CatalogPattern). Read them
 *  defensively so a pattern that omits them still yields a usable contract. */
interface RichFields {
  interactionModel?: string;
  interactionSteps?: { title: string; description: string }[];
  factChips?: string[];
  example?: string;
  whereItEmbeds?: string;
  whatItSolves?: string;
}

export interface RenderContract {
  /** The identity line that must headline the explanation. */
  pattern: {
    id: string;
    name: string;
    level: string;
    level_label: string;
    mode: string;
  };
  /** The behavior-spec sentence, verbatim. */
  behavior_spec: string;
  /**
   * The UI elements the render MUST contain, in order. Omitting any of these is
   * the primary drift this contract exists to prevent. Derived from the
   * pattern's interactionSteps (each step is a layer) plus, for engaging modes,
   * the valid responses as explicit controls.
   */
  must_include: string[];
  /** How to arrange the elements — the canonical structure, not a redesign. */
  layout: string;
  /**
   * The explanation that MUST render ALONGSIDE the visual (the "should the
   * explanation load with the UI?" ask — the answer is yes, always).
   */
  explanation: {
    required: true;
    must_cover: string[];
    text: string;
  };
  /** Guardrails — the specific ways renders of this shape go wrong. */
  do_not: string[];
  /** The one-line rule for how much the agent may change. */
  fidelity_note: string;
  /** Optional canonical anchors to match against. */
  reference?: {
    fact_chips?: string[];
    example?: string;
    v1_slug?: string;
    where_it_embeds?: string;
  };
}

const CHANNEL_SURFACE: Record<Channel, string> = {
  chat_ui: "inline in the conversation",
  settings_panel: "in a settings panel",
  shared_ui: "on a shared surface both the person and agents can see",
  agent_message: "as a structured agent-to-agent message (no human UI)",
  shared_record: "as an append-only shared record",
  state_signal: "as a headless state signal (no human UI)",
};

function primarySurface(channels: Channel[]): string {
  const human = channels.find((c) => CHANNEL_SURFACE[c]);
  return human ? CHANNEL_SURFACE[human] : "inline in the conversation";
}

export function buildRenderContract(
  pattern: CatalogPattern,
  responses: string[],
): RenderContract {
  const rich = pattern as CatalogPattern & RichFields;
  const steps = rich.interactionSteps ?? [];
  const primaryMode = pattern.mode.primary;
  const secondaryMode = pattern.mode.secondary;
  const engaging = MODE_FAMILY[primaryMode] === "engaging";
  const levelLabel = LEVEL_LABELS[pattern.level.primary];
  const surface = primarySurface(pattern.channels);

  // Required elements: one per interaction step (each step is a visible layer),
  // then the response controls when the pattern asks the receiver to act.
  const mustInclude: string[] = [];
  for (const s of steps) {
    mustInclude.push(`${s.title} — ${s.description}`);
  }
  if (steps.length === 0) {
    // No authored steps: fall back to the spec as the single required element.
    mustInclude.push(`A view that enacts the behavior: ${pattern.summary}`);
  }
  if (engaging && responses.length > 0) {
    mustInclude.push(
      `Response controls — render all ${responses.length} as distinct choices, not collapsed into one: ${responses.join(", ")}.`,
    );
  }

  // Layout: progressive disclosure for presenting patterns that reveal in
  // layers; a direct surface otherwise.
  const isDisclosure =
    isPresentingMode(primaryMode) && steps.length > 1;
  const layout = isDisclosure
    ? `Progressive disclosure, rendered ${surface}. The default view shows only the first element; each later element is revealed on request, in the order above. Keep a breadcrumb or expander so the person can see how far the gradient goes.`
    : `Render ${surface}. Lay the required elements out in the order above as one coherent surface.`;

  // The explanation that ships with the visual.
  const modeLine = secondaryMode
    ? `${primaryMode} → ${secondaryMode}`
    : primaryMode;
  const stepMap =
    steps.length > 0
      ? steps.map((s) => s.title).join(" → ")
      : pattern.summary;
  const explanationText =
    `This is ${pattern.name} (${pattern.id}) — a ${pattern.level.primary} pattern (${levelLabel}), mode ${modeLine}. ` +
    `${pattern.summary} ` +
    `It maps to your request through: ${stepMap}.`;

  const doNot: string[] = [
    "Do not omit any element in must_include — dropping a required layer (e.g. reasoning or handoffs) is the main way this render goes wrong.",
    "Do not invent a different structure or visual language; reproduce the layout above and restyle only to match the host app.",
    "Do not add elements the pattern does not define.",
  ];
  if (isDisclosure) {
    doNot.push(
      "Do not lead with the full detail (the whole roster, trace, or rationale) in the default view — that defeats the gradient; reveal it on request.",
    );
  }
  if (engaging) {
    doNot.push(
      "Do not collapse the responses into a single yes/no — each response is a distinct move the person can take.",
    );
    doNot.push(
      "Do not treat the action as already done: hold it as pending until the person responds, and if new information changes the proposal while it is pending, re-present it for a fresh decision.",
    );
  }

  return {
    pattern: {
      id: pattern.id,
      name: pattern.name,
      level: pattern.level.primary,
      level_label: levelLabel,
      mode: modeLine,
    },
    behavior_spec: pattern.spec,
    must_include: mustInclude,
    layout,
    explanation: {
      required: true,
      must_cover: [
        "which pattern this is (name + id)",
        "its level and mode",
        "how each required element maps to the user's request",
      ],
      text: explanationText,
    },
    do_not: doNot,
    fidelity_note:
      "Reproduce the required elements and layout above, adapting only the scenario content to the user's situation and restyling to match their app. Present the explanation alongside the visual. Do not redesign, reorder, or omit elements. The user can then ask you to change it to fit their needs.",
    reference: {
      fact_chips: rich.factChips,
      example: rich.example,
      v1_slug: (pattern as CatalogPattern & { v1_slugs?: string[] }).v1_slugs?.[0],
      where_it_embeds: rich.whereItEmbeds,
    },
  };
}
