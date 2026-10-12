/**
 * SEED catalog data — provisional, to be replaced/filled by the design side's
 * canonical data files (brief sections 6, 9: "the repo's typed data files are
 * the canonical source"). Srishti authors these via repo access.
 *
 * What's filled here is the structural scaffold from the brief: the nine modes
 * (fully specified, brief section 5 + the modes table) and the 23 patterns'
 * identity/level/mode/source/evidence/merged_from (brief section 6). The
 * design-owned prose — triggers, audience, channels, the filled `spec`
 * sentence, level notes, variants, composes/conflicts — is left empty on
 * purpose; the validators report it as "missing" until the real data lands.
 *
 * Do NOT hard-code pattern ids elsewhere — they may still be renamed (brief
 * section 10); the alias table covers any moves.
 */
import type { CatalogPattern, ModeDef } from "@/lib/patterns/behavior";

export const modeDefs: ModeDef[] = [
  {
    id: "declare",
    family: "presenting",
    definition: "The agent states what it is, what it can do, and what it is permitted to do.",
    opens_with: "Here is what I am, can do, and may do",
    responses: ["calibrate trust", "set scope"],
    not_to_confuse_with: { mode: "signal", distinction: "Declare is standing (true until changed); Signal describes a moment in time." },
  },
  {
    id: "signal",
    family: "presenting",
    definition: "The agent conveys its current or past state: what it is doing, has done, or is waiting on.",
    opens_with: "Here is what I'm doing, or did",
    responses: ["monitor", "step in"],
    not_to_confuse_with: { mode: "explain", distinction: "Signal says what happened; Explain says why." },
  },
  {
    id: "explain",
    family: "presenting",
    definition: "The agent conveys the reasons, evidence, or confidence behind an output or decision.",
    opens_with: "Here is why, and on what basis",
    responses: ["evaluate", "verify"],
    not_to_confuse_with: { mode: "propose", distinction: "Explain justifies what is already done or concluded; Propose justifies what is not yet done and asks for consent." },
  },
  {
    id: "request",
    family: "engaging",
    definition: "The agent asks a receiver to supply information, access, or help, while keeping ownership of the task.",
    opens_with: "Can you get me X, or help with X?",
    responses: ["fulfil", "refuse"],
    not_to_confuse_with: { mode: "delegate", distinction: "Request keeps ownership with the asker; Delegate hands it over." },
  },
  {
    id: "propose",
    family: "engaging",
    definition: "The agent states an action it intends to take and waits for consent before any irreversible step.",
    opens_with: "I plan to do X",
    responses: ["consent", "correct", "decline", "defer"],
    not_to_confuse_with: { mode: "commit", distinction: "Propose happens before the action and is open to change; Commit happens after and is binding." },
  },
  {
    id: "delegate",
    family: "engaging",
    definition: "The agent transfers ownership of a task, with its context, to another agent or a human.",
    opens_with: "Take over X",
    responses: ["accept", "refuse", "escalate", "report back"],
    not_to_confuse_with: { mode: "coordinate", distinction: "Delegate moves responsibility; Coordinate shares it." },
  },
  {
    id: "coordinate",
    family: "engaging",
    definition: "The agent works with others on a shared artifact or state, adjusting to their contributions as they happen.",
    opens_with: "Let's work on X together",
    responses: ["act jointly"],
    not_to_confuse_with: { mode: "resolve", distinction: "Coordinate assumes the parties are aligned; Resolve starts from a disagreement." },
  },
  {
    id: "resolve",
    family: "engaging",
    definition: "The agent reconciles conflicting conclusions into an adopted answer, or flags an impasse for someone else.",
    opens_with: "We disagree on X",
    responses: ["adopt", "flag impasse"],
    not_to_confuse_with: { mode: "explain", distinction: "Resolve ends in a decision; Explain only accounts for one." },
  },
  {
    id: "commit",
    family: "engaging",
    definition: "The agent makes a decision or belief binding and durable, so others can rely on it later.",
    opens_with: "X is now binding",
    responses: ["rely on it", "amend before sealing"],
    not_to_confuse_with: { mode: "signal", distinction: "Commit changes what is true going forward; Signal only reports what happened." },
  },
];

/** Shorthand builder — keeps the 23 rows readable. Prose fields default empty
 *  (filled from the canonical data). */
function seed(
  id: string,
  name: string,
  primaryLevel: CatalogPattern["level"]["primary"],
  primaryMode: CatalogPattern["mode"]["primary"],
  source: CatalogPattern["source"],
  evidence: CatalogPattern["evidence"],
  opts: {
    secondaryMode?: CatalogPattern["mode"]["secondary"];
    mergedFrom?: string[];
  } = {},
): CatalogPattern {
  return {
    id,
    name,
    summary: "",
    mode: { primary: primaryMode, ...(opts.secondaryMode ? { secondary: opts.secondaryMode } : {}) },
    level: { primary: primaryLevel, notes: { [primaryLevel]: "" } },
    triggers: [],
    audience: [],
    channels: [],
    spec: "",
    source,
    merged_from: opts.mergedFrom ?? [],
    evidence,
    composes_with: [],
    conflicts_with: [],
  };
}

export const catalogPatterns: CatalogPattern[] = [
  // L1 — one agent
  seed("presence-boundary", "Presence Boundary", "L1", "signal", "ioc", "moderate", { secondaryMode: "declare" }),
  seed("activity-record", "Activity Record", "L1", "signal", "sdk+ioc", "strong", { secondaryMode: "explain", mergedFrom: ["Timeline", "Thinking Process", "Background Work Ledger"] }),
  seed("inline-rationale", "Inline Rationale", "L1", "explain", "sdk+ioc", "not_rated", { mergedFrom: ["Inline Rationale", "Contextual Explanation"] }),
  seed("structured-finding", "Structured Finding", "L1", "explain", "sdk", "not_rated", { secondaryMode: "propose", mergedFrom: ["Findings", "Diagnostic Report"] }),
  seed("source-attribution", "Source Attribution", "L1", "explain", "sdk", "not_rated"),
  seed("deferred-detail", "Deferred Detail", "L1", "signal", "ioc", "strong"),
  seed("certainty-boundary", "Certainty Boundary", "L1", "declare", "ioc", "thin"),
  seed("details-dashboard", "Details Dashboard", "L1", "signal", "sdk", "not_rated"),
  // L2 — agents only
  seed("capability-manifest", "Capability Manifest", "L2", "declare", "sdk", "not_rated"),
  seed("credential-boundary", "Credential Boundary", "L2", "coordinate", "ioc", "strong", { secondaryMode: "declare" }),
  seed("convergence-point", "Convergence Point", "L2", "resolve", "ioc", "moderate", { secondaryMode: "explain" }),
  // L3 — agents + one person
  seed("pre-action-handshake", "Pre-Action Handshake", "L3", "propose", "ioc", "moderate", { secondaryMode: "explain" }),
  seed("assumption-surface", "Assumption Surface", "L3", "resolve", "ioc", "thin", { secondaryMode: "explain" }),
  seed("decision-record", "Decision Record", "L3", "commit", "ioc", "moderate", { secondaryMode: "propose", mergedFrom: ["Decision Ledger", "Proposed Commits"] }),
  seed("review-as-dialogue", "Review as Dialogue", "L3", "propose", "ioc", "moderate"),
  seed("memory-commitment-review", "Memory Commitment Review", "L3", "commit", "ioc", "thin"),
  seed("disclosure-gradient", "Disclosure Gradient", "L3", "signal", "ioc", "strong", { secondaryMode: "explain" }),
  seed("co-editing-surface", "Co-Editing Surface", "L3", "coordinate", "sdk", "not_rated", { mergedFrom: ["Form", "Code Editor", "Mindmap", "Data Visualizer"] }),
  seed("concurrent-workspace-awareness", "Concurrent Workspace Awareness", "L3", "coordinate", "ioc", "none"),
  seed("authority-gradient", "Authority Gradient", "L3", "declare", "ioc", "moderate", { secondaryMode: "delegate" }),
  // L4 — agents + many people
  seed("lineage-view", "Lineage View", "L4", "explain", "ioc", "strong"),
  seed("shared-cognitive-state", "Shared Cognitive State", "L4", "coordinate", "ioc", "moderate", { secondaryMode: "resolve" }),
  seed("workshop-card", "Workshop Card", "L4", "coordinate", "sdk", "not_rated"),
];
