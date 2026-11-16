import { MODE_ORDER } from "@/lib/v2/modes";
import { CHANNEL_ORDER, LEVEL_ORDER } from "@/lib/v2/levels";
import type { Channel, Level, Mode } from "@/lib/v2/types";

// The /patterns filters, shared by the server page (reads the URL) and the list (writes it).
// ?q searches names, summaries and triggers; ?does is the main mode; ?setup is any setup the
// pattern applies in; ?surface is a channel; ?group picks the grouping.
export type GroupBy = "who" | "does" | "family" | "none";
export type Filters = { q: string; does: Mode | ""; setup: Level | ""; surface: Channel | ""; group: GroupBy };

export const GROUPS: [GroupBy, string][] = [
  ["who", "By who's interacting"],
  ["does", "By what it does"],
  ["family", "By interaction family"],
  ["none", "No grouping"],
];

const pick = <T extends string>(v: string | undefined, ok: readonly T[]): T | "" => (ok.includes(v as T) ? (v as T) : "");

/** Anything unknown in the URL falls back to the default. */
export function parseFilters(get: (key: string) => string | undefined): Filters {
  const g = get("group");
  return {
    q: (get("q") ?? "").slice(0, 80),
    does: pick(get("does"), MODE_ORDER),
    setup: pick(get("setup"), LEVEL_ORDER),
    surface: pick(get("surface"), CHANNEL_ORDER),
    group: GROUPS.some(([k]) => k === g) ? (g as GroupBy) : "who",
  };
}

/** The query string for a set of filters, defaults left out. */
export function filterQuery(f: Filters): string {
  const s = new URLSearchParams();
  if (f.q.trim()) s.set("q", f.q.trim());
  if (f.does) s.set("does", f.does);
  if (f.setup) s.set("setup", f.setup);
  if (f.surface) s.set("surface", f.surface);
  if (f.group !== "who") s.set("group", f.group);
  const t = s.toString();
  return t ? `?${t}` : "";
}
