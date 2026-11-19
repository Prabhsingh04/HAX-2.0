import raw from "./patterns.json";
import previewSizes from "./previewSizes.json";

// The full HAX pattern library (112 patterns: 30 agentic, 82 general), taken on 19 Nov 2026 from
// Srishti's v3 pattern draft (https://01kxisn2.reviewa.work/v3/patterns.html), which she shared as
// the source for the patterns. The text, categories, participant dimensions, principles and related
// links are hers, word for word. Each pattern's preview is a still of her live preview
// (public/hax/v1/p/<id>.webp) until her source is in a repo we can port from.
// Agentic patterns come from HAX 2.0 (23) and Nucleux (7); general patterns from Nucleux.

export type Dim = "L1" | "L2" | "L3" | "L4";
export type Step = { title: string; description: string };
export type Principle = { role: "Primary" | "Also supports"; id: string; why: string };
export type Placement = { template: string; variantId?: string; note?: string };
export type Related = { id: string; name: string };

type Base = { id: string; name: string; summary: string; category: CategoryId; related: Related[] };
export type Agentic = Base & {
  kind: "agentic";
  mode: { primary: string; secondary?: string };
  level: { primary: Dim; notes: Partial<Record<Dim, string>> };
  triggers?: string[];
  audience?: string[];
  channels: string[];
  spec?: string;
  whatItSolves?: string;
  interactionModel?: string;
  interactionSteps?: Step[];
  whereItEmbeds?: string;
  example?: string;
  factChips?: string[];
  dimensions: Dim[];
  principles: Principle[];
};
export type General = Base & {
  kind: "general";
  what: string; why: string; when: string; how: string;
  stage: string; cluster: string; composed: string[];
  code?: string;
  placements?: Placement[];
};
export type Pattern = Agentic | General;

export const CATEGORIES = [
  { id: "identity-discovery", label: "Identity & discovery" },
  { id: "trust-privacy-provenance", label: "Trust, privacy & provenance" },
  { id: "start-clarify", label: "Start & clarify requests" },
  { id: "context-access", label: "Add context & access" },
  { id: "shape-responses", label: "Shape responses" },
  { id: "track-control-work", label: "Track & control work" },
  { id: "understand-results", label: "Understand results" },
  { id: "plan-coordinate", label: "Plan & coordinate work" },
  { id: "review-approve", label: "Review & approve" },
  { id: "edit-explore", label: "Edit & explore" },
  { id: "remember-adapt", label: "Remember & adapt" },
] as const;
export type CategoryId = (typeof CATEGORIES)[number]["id"];
export const CATEGORY_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label])) as Record<CategoryId, string>;

export const DIMS: Dim[] = ["L1", "L2", "L3", "L4"];
export const DIM_LABEL: Record<Dim, string> = {
  L1: "One agent", L2: "Agent team only", L3: "Agent team + one person", L4: "Agent team + multiple people",
};
// the detail page's "Who is involved" rows use the setup names
export const SETUP_LABEL: Record<Dim, string> = {
  L1: "One agent", L2: "Many agents only", L3: "Many agents + one person", L4: "Many agents + many people",
};
export const CHANNEL_LABEL: Record<string, string> = {
  chat_ui: "Chat", settings_panel: "Settings panel", shared_ui: "Shared UI",
  agent_message: "Agent message", shared_record: "Shared record", state_signal: "State signal",
};
export const TEMPLATE_LABEL: Record<string, string> = {
  chat: "Chat", rightrail: "Side panel", code: "Code editor", creative: "Canvas", email: "Email", video: "Video",
};
export const PRINCIPLE_NAME: Record<string, string> = {
  control: "Control", clarity: "Clarity", recovery: "Recovery", collaboration: "Collaboration", traceability: "Traceability",
};

export const LIBRARY = raw as Pattern[];
export const BY_ID = new Map(LIBRARY.map((p) => [p.id, p]));

/** Where a pattern shows up: channels for agentic patterns, placements for general ones. */
export function appearsIn(p: Pattern): string[] {
  if (p.kind === "agentic") return p.channels.map((c) => CHANNEL_LABEL[c] ?? c);
  return [...new Set((p.placements ?? []).map((x) => TEMPLATE_LABEL[x.template] ?? x.template))];
}
export const previewSrc = (id: string) => `/hax/v1/p/${id}.webp`;
// 19 Nov (v6): the stills were re-captured from her live previews at 2x of the 1200px layout her
// pattern pages use (2400px wide), so they stay sharp at the pattern page's full width on retina,
// without the review site's widget; an 800px copy (<id>-800.webp) serves the gallery cards.
// PREVIEW_SIZE holds each still's pixel size, so pages can reserve its space before it loads.
export const previewSrcSet = (id: string) => `/hax/v1/p/${id}-800.webp 800w, /hax/v1/p/${id}.webp 2400w`;
export const PREVIEW_SIZE: Record<string, number[]> = previewSizes;
