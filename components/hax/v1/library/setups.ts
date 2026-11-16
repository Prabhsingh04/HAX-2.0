import type { Level } from "@/lib/v2/types";

// HAX Studio's four setups (lib/v2/levels.ts), served by our own components:
// L1 one agent · L2 many agents only · L3 many agents and one person · L4 many agents and many people.
// A component belongs to every setup where the exchange it draws happens. Home's four setups strip
// features three per setup and counts the rest; /library?setup=L2 lists them.
export const SETUPS: Record<string, Level[]> = {
  /* Composers: a person gives an agent work */
  "prompt-input": ["L1", "L3", "L4"], "source-picker": ["L1", "L3"], "suggested-prompts": ["L1"], suggestions: ["L1", "L3"],
  "prompt-templates": ["L1", "L4"], "example-gallery": ["L1"],
  /* Artifacts */
  streaming: ["L1"], summary: ["L1", "L4"], table: ["L1"], chart: ["L1"], variations: ["L1", "L3"], media: ["L1"],
  transcript: ["L1", "L4"], canvas: ["L3", "L4"], "form-fill": ["L1"], "refine-menu": ["L1"],
  /* Collectors */
  "clarifying-question": ["L1", "L3"], "choice-picker": ["L1", "L3"], "form-request": ["L1", "L3"], feedback: ["L1"],
  "team-decision": ["L4"],
  /* Controllers */
  "stop-and-pause": ["L1", "L3"], capabilities: ["L1", "L2", "L4"], memory: ["L1"], checkpoints: ["L1", "L3"],
  "agent-access": ["L2", "L4"],
  /* Approvals */
  "approval-card": ["L1", "L3", "L4"], "permission-request": ["L1", "L3"], "preview-before-run": ["L1", "L3"], "diff-view": ["L1", "L3", "L4"],
  /* Workflows */
  plan: ["L1", "L3"], "task-list": ["L3", "L4"], "hand-off": ["L2", "L3", "L4"], "progress-steps": ["L1", "L2"],
  "workflow-canvas": ["L2", "L3"], "shared-status": ["L2", "L4"],
  /* Explorers */
  reasoning: ["L1"], sources: ["L1", "L2"], confidence: ["L1", "L2"], "activity-log": ["L1", "L2", "L4"], "tool-call": ["L1", "L2"],
  rationale: ["L1", "L3"], "usage-meter": ["L1"], "agent-agreement": ["L2", "L3"], "agent-disagreement": ["L2", "L3"], "decision-trail": ["L3", "L4"],
  /* Notifiers */
  "ai-label": ["L1", "L4"], "agent-avatar": ["L1", "L2", "L4"], "proactive-suggestion": ["L1"], "update-notice": ["L1", "L4"], "error-message": ["L1"],
};

// Three per setup on Home, in the order Studio featured its patterns there
// (Presence Boundary, Activity Record, Inline Rationale · Credential Boundary, Convergence Point,
// Certainty Boundary · Pre-Action Handshake, Assumption Surface, Decision Record · Lineage View,
// Workshop Card, Shared Cognitive State).
export const FEATURED: Record<Level, string[]> = {
  L1: ["stop-and-pause", "activity-log", "rationale"],
  L2: ["agent-access", "agent-agreement", "hand-off"],
  L3: ["approval-card", "agent-disagreement", "plan"],
  L4: ["decision-trail", "team-decision", "shared-status"],
};

export const compsIn = (l: Level) => Object.keys(SETUPS).filter((id) => SETUPS[id].includes(l));
export const asLevel = (v?: string | string[]): Level | undefined => (v === "L1" || v === "L2" || v === "L3" || v === "L4" ? v : undefined);
