import { patterns } from "@/lib/v2/catalog";
import { modes, MODE_LABEL, MODE_PLAIN } from "@/lib/v2/modes";
import { LEVEL_ORDER } from "@/lib/v2/levels";
import type { Level, Pattern } from "@/lib/v2/types";

// The 23 interaction patterns come straight from lib/v2/catalog.ts, the same catalog HAX Studio
// v2 serves (checked field by field against ioc-patterns.intelligaia.com/studio/v2/patterns on
// 13 Nov 2026). The live pattern pages also carry two things the catalog doesn't: the principles
// each pattern serves, and, for ten patterns, their own lines for what the agent does and what
// the receiver can do. Those are copied here word for word (Certainty Boundary drops its last
// sentence, which describes Studio's own preview). The other patterns show the mode's
// definition and its replies, as Studio does. Studio's Ready / Review pending tags stay there.

export type PrincipleId = "control" | "clarity" | "traceability" | "collaboration" | "recovery";
export const PRINCIPLE_LABEL: Record<PrincipleId, string> = {
  control: "Control", clarity: "Clarity", traceability: "Traceability", collaboration: "Collaboration", recovery: "Recovery",
};

type Principle = [PrincipleId, string];
export const PRINCIPLES: Record<string, { primary: Principle; also?: Principle }> = {
  "presence-boundary": { primary: ["control", "The person can pause the agent or change what it may observe and act on."], also: ["clarity", "The current activity and access boundary stay visible as they change."] },
  "activity-record": { primary: ["traceability", "Actions, assumptions, tool calls, and results stay in a time-ordered record."], also: ["clarity", "The person can see what the agent did and what still needs attention."] },
  "inline-rationale": { primary: ["clarity", "The reason for an output appears beside that output, where the person evaluates it."] },
  "structured-finding": { primary: ["clarity", "A finding separates its claim, confidence, and evidence for inspection."], also: ["traceability", "Named sources let the receiver check what supports the conclusion."] },
  "source-attribution": { primary: ["clarity", "The receiver can see which source supports a particular claim."], also: ["traceability", "The claim retains a checkable path back to its source."] },
  "deferred-detail": { primary: ["control", "A decision stays open until the required evidence allows the next phase to begin."], also: ["clarity", "The view names what is pending, why it must wait, and who owns the next gate."] },
  "certainty-boundary": { primary: ["clarity", "The workflow distinguishes fixed rules, agent choice, and generated work."], also: ["control", "A person can inspect or revise the steps that require review."] },
  "details-dashboard": { primary: ["clarity", "The changing state of one entity or process is visible in a single place."] },
  "capability-manifest": { primary: ["control", "A person can use declared capabilities and limits to set the agent's scope."], also: ["clarity", "Connection, availability, and approval requirements are visible before work starts."] },
  "credential-boundary": { primary: ["control", "Access stays scoped instead of being pooled across agents."], also: ["collaboration", "Agents coordinate across the boundary while the operator resolves access gaps."] },
  "convergence-point": { primary: ["collaboration", "Agents bring conflicting answers together for an adopted answer or an impasse."], also: ["traceability", "The operator can review the evidence and reasoning behind that result."] },
  "pre-action-handshake": { primary: ["control", "The agent waits for consent, correction, decline, or deferral before acting."], also: ["clarity", "It states what it noticed, how it interpreted the signal, and what it proposes."] },
  "assumption-surface": { primary: ["clarity", "The exchange shows what each agent saw, assumed, and concluded."], also: ["collaboration", "That shared view gives agents and people a basis for resolving disagreement."] },
  "decision-record": { primary: ["traceability", "The committed action keeps the agent's reason and any operator amendment."], also: ["control", "The operator can amend the reason before the record is sealed."] },
  "review-as-dialogue": { primary: ["recovery", "A declined draft can return as a clarified, marked revision for another decision."], also: ["collaboration", "The person and agent exchange focused feedback instead of ending at rejection."] },
  "memory-commitment-review": { primary: ["recovery", "A person can restore or revoke a changed belief before it becomes durable memory."], also: ["control", "The person decides which beliefs the agent may keep across sessions."] },
  "disclosure-gradient": { primary: ["clarity", "The result leads, while rationale, coordination, and the full trace remain available on request."] },
  "co-editing-surface": { primary: ["collaboration", "A person and several agents revise the same document in one shared workspace."], also: ["traceability", "Each contribution remains attributed to its author."] },
  "authority-gradient": { primary: ["control", "A person sets a separate autonomy level for each workflow area."] },
  "lineage-view": { primary: ["traceability", "Claims, artifacts, and decisions can be traced back through their dependencies."], also: ["clarity", "A questioned source reveals which downstream work needs review."] },
  "workshop-card": { primary: ["collaboration", "A group can see who is attending a session and where each participant stands."] },
};

const BEHAVIOUR: Record<string, { does: string; can: string; canLabel?: string }> = {
  "presence-boundary": {
    does: "The agent signals its current activity and declares what it may observe or change. It updates both when its state or access changes.",
    can: "Check the agent's activity and scope, pause or resume it, narrow its reach, or explicitly widen it.",
  },
  "activity-record": {
    does: "The agent signals observable progress by recording tool calls, assumptions, actions, results, and unresolved questions in time order. It explains shifts in its interpretation through the assumptions and outcomes it records; the live view stays brief while the completed record holds more detail.",
    can: "Inspect an entry and its tool or artifact, correct a recorded assumption, or answer an open question. In a connected workflow, the record can also route a review or reversal action to the host system.",
  },
  "deferred-detail": {
    does: "The agent signals what each phase can decide, what remains open and why, and which new evidence makes the next decision possible. It updates the gate and owner when responsibility moves to another phase.",
    can: "See why a decision is still open, inspect the evidence that unlocks it, and decide whether the next phase can begin.",
  },
  "certainty-boundary": {
    does: "The agent declares how each workflow step runs: fixed, agent-selected, or generated. It signals when the path or review gate changes during a run.",
    can: "Inspect a step's input, output, and method; check generated work at its review gate; or revise the workflow configuration.",
  },
  "capability-manifest": {
    does: "The agent declares its capabilities and limits, then signals changes to its connection or availability.",
    can: "Check what is available, seek approval for a pending capability, or adjust the agent's access in settings.",
    canLabel: "What a person can do",
  },
  "pre-action-handshake": {
    does: "Proposes the next consequential action and explains the observation and interpretation behind it. It holds the action until a response arrives; a correction or new evidence updates the handoff and requires a fresh decision.",
    can: "Consent to the proposal, correct the agent's interpretation or plan, decline the action, or defer it while gathering more evidence.",
  },
  "review-as-dialogue": {
    does: "The agent proposes a draft for review. It uses a decline reason to ask a focused question when needed, then returns a revision with changes marked. A revised version waits for a fresh decision.",
    can: "Accept the current draft, correct it, decline with a reason, or defer. Answer the agent's clarification when it asks; review each returned version before using it.",
  },
  "disclosure-gradient": {
    does: "Signals the outcome first, then explains the rationale, agent handoffs, and full event trace as the operator asks for more. If the result or status changes during the incident, the summary updates while the deeper layers remain available for review.",
    can: "Monitor the outcome, open the rationale, inspect which agents contributed and how they handed off work, or open the full trace during a postmortem.",
  },
  "co-editing-surface": {
    does: "One agent drafts the document. Another reads the operator's edits and comments, then adds to that same document while preserving those contributions. Each change remains attributed to its author.",
    can: "Edit the document, comment on a specific part, review the agent's next revision, and decide whether the shared draft is ready to use.",
  },
  "lineage-view": {
    does: "The agent shows why a source is questioned, how decisions and artifacts depend on it, and updates the view when new evidence changes its status.",
    can: "Inspect dependent work, verify the questioned source, and reassess or hold decisions that rely on it with the teams involved.",
  },
};

export const PATTERNS = patterns;
export const BY_PATTERN = new Map(patterns.map((p) => [p.id, p]));
export const modeOf = (p: Pattern) => modes.find((m) => m.id === p.mode.primary)!;
/** The replies the receiver can send: the pattern's own, else its mode's. */
export const repliesOf = (p: Pattern) => p.responses ?? modeOf(p).responses;
/** What the agent does: the pattern's own line where Studio has one, else its mode. */
export const doesOf = (p: Pattern): { mode?: string; text: string } =>
  BEHAVIOUR[p.id] ? { text: BEHAVIOUR[p.id].does } : { mode: MODE_LABEL[p.mode.primary], text: modeOf(p).definition };
export const canOf = (p: Pattern): { label: string; text?: string } =>
  ({ label: BEHAVIOUR[p.id]?.canLabel ?? "What the receiver can do", text: BEHAVIOUR[p.id]?.can });
/** The setups where the pattern applies, in order. */
export const setupsOf = (p: Pattern): Level[] => LEVEL_ORDER.filter((l) => l === p.level.primary || p.level.notes[l] !== undefined);
export const appliesAt = (p: Pattern, l: Level) => setupsOf(p).includes(l);
export const plain = (m: Pattern["mode"]["primary"]) => MODE_PLAIN[m].charAt(0).toUpperCase() + MODE_PLAIN[m].slice(1);
