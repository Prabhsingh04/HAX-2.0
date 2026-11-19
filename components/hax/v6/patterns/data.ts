import raw from "./data.json";

// v6's pattern library follows Srishti's v3 draft (https://01kxisn2.reviewa.work/v3/patterns.html):
// her list, her pattern pages' words and her previews, in v6's look. data.json and the previews in
// public/hax/v6/patterns/ come from scripts/sync-hax-patterns.mjs; run it again when she changes them.

export type Fact = { title: string; items?: string[]; text?: string };
export type Slot = "trigger" | "mode" | "audience" | "level" | "channel" | "responses";
export type AuthoredPreview = {
  type: "authored";
  kits: string[];
  channelLabel: string;
  channels: string[];
  details: ({ label: string; options: string[] } | null)[];
  states: string[]; // "<kit>-<channel>-<detail|x>", one HTML file each
  default: string;
};
export type RefPreview = { type: "ref"; channelLabel: string; templates: { label: string; params: string }[]; default: number; params: string };
export type Page = {
  kind: "agentic" | "general";
  template?: "nucleux";
  eyebrow: string;
  title: string;
  summary: string;
  toc?: [string, string][];
  solves: string[];
  steps?: { n: string; title: string; text: string }[];
  whoIntro?: string;
  who?: { label: string; marker: string; applies: boolean; note: string }[];
  spec?: { t: string; slot?: Slot | null }[];
  specMore?: { summary: string; legend: { slot: Slot; label: string; text: string }[]; facts: Fact[]; open?: boolean } | null;
  principles?: { role: string; name: string; slug?: string; why: string }[];
  related: { id: string; name: string; summary?: string }[];
  questions?: { q: string; a: string }[];
  code?: { intro: string; html: string } | null;
  preview: AuthoredPreview | RefPreview;
};
export type Pattern = {
  id: string;
  category: string;
  categoryId: string;
  name: string;
  summary: string;
  meta: string;
  link: string;
  dims: string[];
  page: Page | null;
};
type Data = {
  source: string;
  synced: string;
  list: { eyebrow: string; title: string; intro: string; labels: string[]; dims: [string, string][]; cats: [string, string][] };
  patterns: Pattern[];
};

export const DATA = raw as unknown as Data;
export const BY_ID = new Map(DATA.patterns.map((p) => [p.id, p]));
export const patternHref = (id: string) => `/v6/interaction-patterns/${id}`;

// What the list needs (the pages' words stay on the server)
export type ListItem = Pick<Pattern, "id" | "category" | "categoryId" | "name" | "summary" | "meta" | "link" | "dims">;
export const LIST_ITEMS: ListItem[] = DATA.patterns.map(({ id, category, categoryId, name, summary, meta, link, dims }) => ({ id, category, categoryId, name, summary, meta, link, dims }));
