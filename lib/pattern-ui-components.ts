/**
 * Structural render spec for a pattern.
 *
 * `ui.text.sections` documents a pattern. `ui.component` gives a consuming app
 * the pattern's *layout skeleton and vocabulary* so the app can render it with
 * its own data, copy, and affordances (see the dashboard's PatternView).
 *
 *  - `layout`      which renderer to use
 *  - `stepKinds`   canonical kind → label map (e.g. queried → "Queried")
 *  - `statusKinds` canonical status → label map (e.g. missed → "MISSED")
 *  - `actions`     affordances the pattern's handlers support, per item
 */

export type PatternUiLayout = "ledger" | "itemcards" | "commitments";

export type PatternUiComponent = {
  layout: PatternUiLayout;
  stepKinds?: Record<string, string>;
  statusKinds?: Record<string, string>;
  actions?: string[];
  /** Per-item-kind action lists; falls back to `actions`. */
  actionsByKind?: Record<string, string[]>;
};

export const PATTERN_UI_COMPONENTS: Record<string, PatternUiComponent> = {
  "background-work-ledger": {
    layout: "ledger",
    stepKinds: {
      queried: "Queried",
      assumed: "Assumed",
      acted: "Acted",
      result: "Result",
    },
    statusKinds: { missed: "MISSED", "at-risk": "AT-RISK", active: "ACTIVE" },
    actions: ["Approve", "Snooze", "Delegate"],
    actionsByKind: {
      urgent: ["Approve", "Reply", "Delegate", "Snooze"],
      blocked: ["Unblock", "Ping owner", "Reassign", "Snooze"],
      commitment: ["Mark done", "Renegotiate", "Nudge", "Snooze"],
      fyi: ["Acknowledge", "Archive"],
    },
  },
  "deferred-detail": {
    layout: "itemcards",
    statusKinds: { missed: "MISSED", "at-risk": "AT-RISK", active: "ACTIVE" },
    actions: ["Open detail", "Correct assumption"],
  },
  "memory-commitment-review": {
    layout: "commitments",
    statusKinds: { missed: "MISSED", "at-risk": "AT-RISK", active: "ON TRACK" },
    actions: ["Mark done", "Renegotiate"],
  },
};
