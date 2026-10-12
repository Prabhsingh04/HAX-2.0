import type {
  CommunicationMode,
  PatternChannel,
  PatternLevel,
} from "@/lib/patterns/behavior";
import { resolvePatternSlug } from "@/lib/patterns/aliases";

export type PatternStatus = "Grounded" | "Unverified";

// Backing strength from the Combined Research + Design Synthesis crosswalk.
// Strong: multiple participants and/or direct verbatim support.
// Moderate: one participant, or supported indirectly / by adjacent themes.
// Thin: tangential or single-mention support; largely inferred.
// None: design hypothesis with no interview support yet — validate.
export type BackingStrength = "Strong" | "Moderate" | "Thin" | "None";

export type EvidenceItem = {
  quote: string;
  attribution: string;
};

export type Pattern = {
  slug: string;
  title: string;
  oneliner: string;
  explanation: string;
  example: string;
  hasReferenceDesign?: boolean;
  evidenceStatus?: "pending";
  evidence?: EvidenceItem[];
  pairsWith?: string;
  note?: string;
  // Structured detail-page copy. When present, the About tab renders these
  // instead of the thin example-only fallback.
  whatItSolves?: string;
  interactionModel?: string;
  whereItEmbeds?: string;
  factChips?: string[];
  // Fields below are from the Combined Research + Design Synthesis workbook.
  backingStrength?: BackingStrength;
  participants?: string;
  researchNote?: string;
  // Behavior-spec fields (HAX 2026-10 reframe). Optional while the 23-pattern
  // catalog is authored on the design side; populated per-pattern from the data
  // once finalized. See lib/patterns/behavior.ts for the taxonomy.
  mode?: CommunicationMode; // primary communication mode
  level?: PatternLevel; // primary participant level (L1–L4)
  alsoReaches?: PatternLevel[]; // levels the behavior also shifts into
  channel?: PatternChannel[]; // viewports this surfaces in
  responses?: string[]; // what the receiver can do back
  variants?: PatternVariant[]; // level/context-specific manifestations
};

/** A level- or context-specific manifestation of a pattern. Shape kept minimal
 *  until the design side finalizes what a variant carries. */
export type PatternVariant = {
  id: string;
  label: string;
  level?: PatternLevel;
  note?: string;
};

// A GTM / positioning finding from the synthesis that is not itself a UI
// component: handled in messaging and sales motion, not in the pattern set.
export type PositioningFinding = {
  id: string;
  title: string;
  statement: string;
  strength: BackingStrength;
  participants: string;
  recommendation: string;
};

export const patterns: Pattern[] = [
  {
    slug: "presence-boundary",
    hasReferenceDesign: true,
    title: "Presence Boundary",
    backingStrength: "Moderate",
    participants: "Everaldo",
    researchNote:
      "Users want minimal presence during active work, which supports a calm status/scope indicator. But no participant explicitly asked for a presence widget; treat the state model as design-led.",
    oneliner:
      "Shows at a glance whether an agent is idle, observing, working, waiting, or acting, what it is currently scoped to touch, and gives one place to pause it or narrow its reach. A portable HAX primitive, shown standalone and inside a host surface.",
    explanation:
      "Persistent agents do not start and stop with a chat turn. They linger around shared work. Presence Boundary makes that lingering legible and bounded: you can always see what state an agent is in, what it is allowed to touch, and stop or shrink it without leaving your work.",
    example:
      "One status orb shows the live state with a short activity line. A five-step track places that state on the idle-to-acting spectrum. A scope panel separates watching from can-act-on, with an access level. Pause, Narrow, and Widen steer the boundary.",
    evidence: [
      {
        quote:
          "We did notice that when it is transparent that there are multiple agents behind the scenes, it becomes complex enough that people don't have as much trust in the system.",
        attribution: "Everaldo Aguiar, Director of Applied AI, PagerDuty",
      },
    ],
  },
  {
    slug: "signal-to-intent-handshake",
    pairsWith: "convergence-point",
    title: "Signal-to-Intent Handshake",
    whatItSolves:
      "Surprise automation erodes control. When an agent acts first and explains later, people lose trust even when the action was right. The risk is highest for irreversible steps taken on a guess about what an alert means.",
    interactionModel:
      "Before acting, the agent posts a short checkpoint in three parts: what it noticed, what it thinks that means with a confidence level, and what it proposes to do next. You can confirm, correct the interpretation, or defer. Nothing irreversible happens until you respond.",
    whereItEmbeds:
      "Agent inbox (shown), an alert thread, or inline in chat as a generative-UI message the agent posts into the conversation. Pairs with Convergence Point, the agent-to-agent version after multiple agents converge.",
    factChips: [
      "Noticed · interpreted · proposed",
      "Confidence shown",
      "Confirm · correct · defer",
    ],
    backingStrength: "Moderate",
    participants: "Minh, Sahil, Aman",
    researchNote:
      "Trust themes support explaining intent before acting, but the explicit handshake step is inferred, not requested. Strong candidate for the inline generative-message pattern.",
    oneliner:
      "Lets the agent explain what it noticed and what it thinks it means before it acts.",
    explanation:
      "Surprise automation erodes control. This pattern forces a brief human-readable checkpoint: what changed, why it matters, and what the agent proposes before any irreversible step.",
    example:
      "Alert fires → agent surfaces: “CPU spike on svc-payments. I interpret this as retry storm. Proposed next step: scale replicas. Proceed?”",
    evidence: [
      {
        quote:
          "I do think that there's some communication layer there that is interesting problem to solve.",
        attribution: "Minh Pham, AOP study",
      },
    ],
    note: "Sibling pattern to Convergence Point: agent-to-human before acting; Convergence Point is agent-to-agent after converging.",
  },
  {
    slug: "background-work-ledger",
    evidenceStatus: "pending",
    title: "Background Work Ledger",
    whatItSolves:
      "Async agent work feels like a black box when you return. Without a narrative, the only way to check what an agent did while you were away is to replay raw logs, so people either rubber-stamp the work or redo it by hand.",
    interactionModel:
      "A single timeline reconstructs the session. Each step is tagged as something the agent queried, assumed, did, or produced, with the tool or artifact it touched. Assumptions are called out separately from actions, and anything unresolved surfaces as an open question. From the card you can approve everything, undo one step, or answer the question without opening the logs.",
    whereItEmbeds:
      "Agent inbox (shown), an incident timeline, or a returning-user banner in any surface where an agent runs work in the background. Pairs with Presence Boundary, which shows the live state, and feeds Decision Ledger when a step is committed.",
    factChips: [
      "Queried · assumed · acted · result",
      "Assumptions flagged apart from actions",
      "Approve · undo · answer",
    ],
    backingStrength: "Strong",
    participants: "Everaldo, Alok",
    researchNote:
      "Best-supported component: the ledger is exactly the retrospective trace plus audit log users described. Keep the live view minimal (see Presence Boundary).",
    oneliner:
      "Shows what happened while you were away: actions, tools, assumptions, results, open questions.",
    explanation:
      "Async agent work feels like a black box when users return. A ledger reconstructs the narrative so they can approve, undo, or steer without replaying raw logs.",
    example:
      "Timeline card: 09:14 queried logs · 09:16 assumed cache miss · 09:18 opened PR draft · open question: confirm owner team?",
  },
  {
    slug: "assumption-surface",
    pairsWith: "convergence-point",
    title: "Assumption Surface",
    whatItSolves:
      "Most tools display disagreement and leave the person to work out where it came from. Reading two conclusions side by side tells you they differ, not why. The cause is usually an assumption made where context ran out, and assumptions are invisible in almost every agent interface. They are also the cheapest thing for a person to fix. Correcting an agent's context is rarely possible. Correcting a wrong assumption takes one action, and everything built on it can be re-derived.",
    interactionModel:
      "Retrospective and read mostly. Agents are shown side by side, each with context held, assumptions made, and interpretation drawn. Assumptions are the only actionable layer: a person can correct one, and the interpretation resting on it is marked as stale rather than silently rewritten. No approve or reject. Approval belongs to Signal-to-Intent Handshake and Authority Gradient, and adding it here would collide with both.",
    whereItEmbeds:
      "Opens when agents have already reached different answers and someone needs to know why before deciding anything. Sits upstream of Convergence Point, which handles what gets adopted. Works inside a case or incident surface where the chrome already carries the account, the ticket, and who is working it.",
    factChips: [
      "Retrospective",
      "Two agents",
      "Assumptions correctable",
      "No approve or reject",
    ],
    backingStrength: "Thin",
    participants: "Ali Nahvi",
    researchNote:
      "Single participant. The evidence supports the pattern as framed here, agents holding different vantage points rather than one agent deciding everything. The earlier framing as a context curation control was not supported and has been replaced. Sample size remains the limit, not fit.",
    oneliner:
      "Show why agents reached different conclusions: what each could see, what it filled in, what it concluded.",
    explanation:
      "A record of how two agents reached different conclusions from the same case. Each agent is shown in three layers: the context it held, the assumptions it made where that context ran out, and the interpretation it drew. Read across them and the disagreement resolves to a specific assumption, which is the one layer a person can correct.",
    example:
      "Refund agent assumed the dispute covers one charge. Subscriptions agent assumed the plan renewed on the old card. Same account, opposite conclusions.",
    evidence: [
      {
        quote: "Why do you want your main agent make all the decisions?",
        attribution: "Ali Nahvi, IoC concept sharing study",
      },
      {
        quote: "The more consolidation you do, the less conflict.",
        attribution: "Ali Nahvi, IoC concept sharing study",
      },
    ],
  },
  {
    slug: "memory-commitment-review",
    hasReferenceDesign: true,
    title: "Memory Commitment Review",
    whatItSolves:
      "In a multi-agent session, beliefs accumulate and shift as new evidence arrives. When an agent updates its reasoning, prior positions don't disappear—they linger in the record as operative assumptions, even though they've been superseded. This leaves two gaps: (1) nobody explicitly marks which beliefs are stale and what displaced them, and (2) when the session's reasoning gets committed to long-term memory, there's no moment for a person to review what's being kept. The pattern surfaces both.",
    interactionModel:
      "Staleness shows inline as beliefs are displaced. A superseded belief appears with its superseding belief and a note on what caused the shift. Attribution is preserved: a person sees which agent held which belief and which agent changed it. At the commitment boundary (when session reasoning becomes durable memory), a person reviews each belief and chooses: acknowledge it, restore it (if the update was wrong), or revoke it (exclude from long-term memory). Their choice is logged as part of the commitment record.",
    whereItEmbeds:
      "At two points: (1) in real-time reasoning, when agents update positions and prior beliefs become stale, and (2) at the memory boundary, when a person gates what gets committed to long-term memory. Both are load-bearing moments in multi-agent handoff.",
    factChips: [
      "Attribution on stale beliefs (which agent held it, which agent displaced it)",
      "Three options per belief at commitment (acknowledge, restore, revoke)",
      "Reasoning for each choice logged as part of the record",
      "Boundaries preserved: staleness surfaces belief shifts; commitment gates memory promotion",
    ],
    backingStrength: "Thin",
    participants: "Alok (indirect), Anshu",
    researchNote:
      "The saw-vs-believes distinction is a compelling design invention but not voiced by participants. High-value if validated; test the mental model first.",
    oneliner:
      "When an agent updates its belief mid-session, prior reasoning becomes stale. A person chooses whether to accept the change, restore the old belief, or exclude it from long-term memory.",
    explanation:
      "Finance Agent opens with an 8% discount off a 12% baseline from recent renewals. When Customer Success validates a 3.4x correlation across the full book, the 12% baseline becomes stale—it was operative, now it's not. The pattern marks it: shows the old belief (dashed, muted) and the new reasoning (solid, full). At the end of the session, when learning goes into Cognitive Fabric, a person reviews: the validated correlation, the recomputed margin, the expansion exposure Salesforce surfaced. Each one: keep it, revert it, or forget it. Their call is recorded, so the next renewal starts with a record of not just what was decided, but what was considered stale and why.",
    example:
      "Scenario: pricing negotiation with a mid-size customer. Finance Agent: \"Baseline churn = 12%, justifies 8% off\". Customer Success: \"Actually, we have 3.4x correlation across 1,200 accounts. Baseline should be 41% churn\". Pattern surfaces: 12% baseline now marked stale; 41% is the operative belief. Later, at commit: Person reviews the stale belief, the new math, and the expansion risk. Acknowledges all three to memory. Next renewal: new agent sees not just the 41% number, but the 12% that was replaced and why.",
    evidence: [
      {
        quote:
          "The regulator keeps probing us: can you explain how did you come to this outcome?",
        attribution: "Alok Gupta, AI Leader, Global Bank",
      },
      {
        quote:
          "Every time we retrain, we have to keep that audit log, create documentation, make sure the right stakeholders fully understand the change between the previous model and the newly retrained model.",
        attribution: "Alok Gupta, AI Leader, Global Bank",
      },
    ],
  },
  {
    slug: "concurrent-workspace-awareness",
    evidenceStatus: "pending",
    title: "Concurrent Workspace Awareness",
    backingStrength: "None",
    participants: "Sahil (tangential)",
    researchNote:
      "No interview evidence for interpreting live human edits. Pure design hypothesis, and the highest validation priority of the ten components.",
    oneliner:
      "Helps agents read live human edits as feedback, override, or unrelated work.",
    explanation:
      "Humans and agents editing the same artifact need shared situational awareness. Otherwise the agent treats every human change as noise or contradiction.",
    example:
      "Banner: “You edited paragraph 2 while Agent was drafting section 3. Treat your edit as override or parallel draft?”",
  },
  {
    slug: "review-as-dialogue",
    evidenceStatus: "pending",
    title: "Review as Dialogue",
    backingStrength: "Moderate",
    participants: "Sahil, Alok",
    researchNote:
      "Human-as-steerer is well supported (\"don't make humans the bottleneck\"). Review-as-a-learning-moment is the design extension; the steering/approval core is solid.",
    oneliner:
      "Turns approval into a learning and steering moment, not just a yes/no gate.",
    explanation:
      "Binary approve/reject wastes teaching signal. Dialogue captures why something was rejected and feeds that back into the next iteration.",
    example:
      "Instead of [Reject], user picks: “Wrong audience” → agent asks one clarifying question → revised draft.",
  },
  {
    slug: "dependency-and-lineage-view",
    evidenceStatus: "pending",
    title: "Dependency and Lineage View",
    whatItSolves:
      "Downstream decisions quietly stack on top of an agent's output. When that output turns out to be stale or disputed, no one can see how far the reliance reaches, so a wrong root-cause summary can ship to prod because three teams already built on it.",
    interactionModel:
      "The output sits at the root of a citation chain, and everything that depends on it is drawn downstream with the reason it cites the source. A disputed or stale root is flagged, and a blast-radius line counts how many teams still rely on it and how many decisions need rework if it changes.",
    whereItEmbeds:
      "Incident review, a change-approval flow, or a postmortem console. Pairs with Incident Replay View for the full trace and with Decision Ledger, which records the rationale each node was committed with.",
    factChips: ["Citation graph", "Blast radius", "Disputed-root flag"],
    backingStrength: "Strong",
    participants: "Alok",
    researchNote:
      "Directly answers the explainability demand (\"the regulator keeps probing us: can you explain how you came to this outcome?\"). Single participant but a sharp, high-stakes need; likely most valuable in regulated verticals.",
    oneliner:
      "Shows what claims, artifacts, and decisions depend on a given agent output.",
    explanation:
      "Downstream decisions stack on upstream agent outputs. Lineage makes blast radius visible before someone acts on stale or disputed conclusions.",
    example:
      "Graph: RCA summary → remediation plan → change ticket. Highlight: “3 teams still cite this summary.”",
  },
  {
    slug: "authority-gradient",
    hasReferenceDesign: true,
    title: "Authority Gradient",
    whatItSolves:
      "A single on/off autonomy switch is too blunt. Teams will happily let an agent act alone in low-stakes areas but want a human in the loop on production or sensitive workflows. Without per-area control, operators end up setting the whole agent to its most cautious level and lose most of the value.",
    interactionModel:
      "Each workflow area gets its own autonomy level on a four-step scale: Suggest, Ask first, Act + review, Act alone. Each level is sized to how much risk that area can absorb, shown as a risk tone (Low, Mid, or High). Levels can be tightened or loosened independently without pausing the agent. Operators see the current level per row and can adjust it in place.",
    whereItEmbeds:
      "Primary: Agent settings or an orchestration console, a governance surface where levels are set before work starts. Secondary: Inline in the inbox when an agent reaches the edge of its authority mid-task and needs immediate clarification. Pairs with Presence Boundary, which shows how far acting can go, and Review as Dialogue for areas set to act-with-review.",
    factChips: [
      "Per-area autonomy",
      "Suggest to act alone",
      "Risk-appetite sizing",
    ],
    backingStrength: "Moderate",
    participants: "Alok, Ali",
    researchNote:
      "Mistakes within my appetite maps cleanly to per-area adjustable autonomy. Strong conceptual fit across two participants.",
    oneliner:
      "Makes autonomy level visible and adjustable by workflow area.",
    explanation:
      "Supervisor and subordinate structures work when intents collide and context must roll up. Authority Gradient exposes who can decide what and lets operators tighten or loosen autonomy by domain without a global pause. Origin attribution per row shows who set the level, making the authority negotiation visible. Grouping by agent clarifies which workflows each agent owns.",
    example:
      "Acme Renewal: Finance Agent — approve discount (act + review), escalate to Director (ask first). Customer Success — validate churn signals (act + review). Each row shows risk tone and who set the level.",
    evidence: [
      {
        quote: "Mistakes within my appetite",
        attribution:
          "Alok Gupta, AI Leader, global bank — accepting mistakes within acceptable bounds while keeping a human in the loop for high-stakes decisions.",
      },
    ],
  },
  {
    slug: "shared-cognitive-state",
    hasReferenceDesign: true,
    title: "Shared Cognitive State",
    backingStrength: "Moderate",
    participants: "Minh, Ali, Sahil",
    researchNote:
      "Tension with Trust Through Abstraction: exposing full shared cognitive state to end users can reduce trust. Position as an operator/builder console, not an end-user surface.",
    oneliner:
      "A common view of goals, assumptions, conflicts, and open questions across humans and agents.",
    explanation:
      "When organizations can’t share data or intent across boundaries, agents need a negotiated shared state, not a fantasy single database.",
    example:
      "Shared board: goals · assumptions · open conflicts · owners. Human and agent both write; conflicts flagged before execution.",
    evidence: [
      {
        quote:
          "You are inherently assuming that in a bank we have a single database, but the reality is not.",
        attribution: "Alok Gupta, AI Leader, Global Bank",
      },
      {
        quote:
          "In Oman, we are not allowed to share financial crime data with the people who are making a credit decision. The China wall between these two functions, we can't share the data.",
        attribution: "Alok Gupta, AI Leader, Global Bank",
      },
      {
        quote:
          "I do think that there's some communication layer there that is interesting problem to solve.",
        attribution: "Minh Pham, AOP study",
      },
    ],
  },
  {
    slug: "credential-boundary",
    hasReferenceDesign: true,
    pairsWith: "shared-cognitive-state",
    title: "Credential Boundary",
    backingStrength: "Strong",
    participants: "Alok, Everaldo",
    researchNote:
      "Maps to Value at the Boundary (U04), the sharpest \"why multi-agent\" argument in the research. Value peaks where no single agent can legally, technically, or organizationally hold all required access. Note: this is a positioning finding as much as a UI pattern.",
    oneliner:
      "Multi-agent value is strongest where no single agent can legally, technically, or organizationally hold all required access.",
    explanation:
      "Multi-agent isn’t about more models: it’s about crossing access walls. Design for federated credentials and purpose-bound agents instead of one super-agent with every key.",
    example:
      "Fraud agent (AML scope) + credit agent (lending scope) coordinate via policy broker; neither holds the other’s raw data.",
    evidence: [
      {
        quote:
          "In Oman, we are not allowed to share financial crime data with the people who are making a credit decision. The China wall between these two functions, we can't share the data.",
        attribution: "Alok Gupta, AI Leader, Global Bank",
      },
      {
        quote:
          "You are inherently assuming that in a bank we have a single database, but the reality is not.",
        attribution: "Alok Gupta, AI Leader, Global Bank",
      },
    ],
  },
  {
    slug: "disclosure-gradient",
    pairsWith: "presence-boundary",
    title: "Disclosure Gradient",
    backingStrength: "Strong",
    participants: "Everaldo, Dongxue",
    researchNote:
      "Maps to Trust Through Abstraction (U01): when multiple agents are made visible during active work, trust decreases even when they perform correctly. Reveal outcomes first, reasoning and coordination only on demand.",
    oneliner:
      "Surfacing all complexity at once drives cognitive overload. Reveal outcomes first, reasoning and coordination only on demand.",
    explanation:
      "Transparency of every sub-agent erodes trust and usability. Progressive disclosure keeps the default path simple while preserving depth for skeptics and auditors.",
    example:
      "Default: “Incident mitigated.” Expand: routing decision → agent graph → full trace (postmortem mode).",
    evidence: [
      {
        quote:
          "We did notice that when it is transparent that there are multiple agents behind the scenes, it becomes complex enough that people don't have as much trust in the system.",
        attribution: "Everaldo Aguiar, Director of Applied AI, PagerDuty",
      },
      {
        quote:
          "We had iterations where the user would have to specify which agent they wanted to interact with. That very quickly became complex enough that folks were just defaulting to how they used to operate beforehand.",
        attribution: "Everaldo Aguiar, Director of Applied AI, PagerDuty",
      },
    ],
  },
  {
    slug: "decision-ledger",
    pairsWith: "proposed-commits",
    title: "Decision Ledger",
    whatItSolves:
      "When a risk reviewer asks how a decision was reached, the inputs are still on file but the judgement is not. Systems capture what the agent did and what data it saw. They do not capture which alternatives it weighed, or why the operator let it proceed. That reasoning decays within days, and by the time the question arrives the people involved are inferring from artifacts rather than recalling.",
    interactionModel:
      "Before an action commits, the agent presents the action with its stated reason, the alternatives it considered, and the policy version in force. The operator can accept the reason as written or amend it. An amendment does not overwrite: the agent's reason and the operator's revision are both stored, which makes visible the cases where the operator proceeded for a different reason than the agent proposed. On commit the record seals. Later readers query it, they do not add to it.",
    whereItEmbeds:
      "The approval step of a change record, not a separate audit tool. The ledger is written where the decision is already being made, which is the only place the rationale exists. Compliance export reads the sealed records and reformats them. It never asks anyone to supply reasoning after the fact.",
    factChips: [
      "Captured at commit",
      "Agent drafts, operator amends",
      "Sealed once written",
      "Export reads, never asks",
    ],
    backingStrength: "Moderate",
    participants: "Alok",
    researchNote:
      "Maps to Audit as First-Class Concern (U03): in regulated settings every autonomous decision creates documentation and explainability debt. Capture rationale at commit time; audit can't be retrofitted.",
    oneliner:
      "The agent states why it chose an action at the moment it commits, so the reasoning survives without anyone reconstructing it later.",
    explanation:
      "Rationale becomes part of the commit rather than a record written about it. The agent drafts its own reason for the action it is proposing. The operator confirms it or corrects it, and the correction is kept alongside the original. Nothing commits without both.",
    example:
      "The agent proposes firmware 4.12 on edge-router-7 under CHG-2231, stating that 4.11 has an open memory leak affecting svc-payments. The operator amends the reason: the upgrade is going ahead now because the rollback window closes at month end. Commit stores the agent's reason, the operator's revision, and the policy version that permitted an unattended push.",
    evidence: [
      {
        quote:
          "The regulator keeps probing us: can you explain how did you come to this outcome?",
        attribution: "Alok Gupta, AI Leader, Global Bank",
      },
      {
        quote:
          "Every time we retrain, we have to keep that audit log, create documentation, make sure the right stakeholders fully understand the change between the previous model and the newly retrained model.",
        attribution: "Alok Gupta, AI Leader, Global Bank",
      },
    ],
  },
  {
    slug: "proposed-commits",
    pairsWith: "decision-ledger",
    title: "Proposed Commits",
    backingStrength: "None",
    researchNote:
      "Split from Decision Ledger: the open record where an agent drafts a reason and the operator commits, declines, or adds context. Not yet validated as a separate pattern name.",
    oneliner:
      "The action waiting to commit: agent reason, optional operator context, and the controls to seal or decline.",
    explanation:
      "Before anything enters the ledger, the agent presents what it proposes to do and why. The operator can commit with the agent reason as written, add context the agent could not know, or decline with a reason. Each exit writes a sealed record into Decision Ledger. Nothing in this surface is read-only history.",
    example:
      "Restart svc-payments, CHG-2231: agent reason cites memory at 91 percent of limit. Operator adds that the vendor engineer is on site today, then commits. The sealed record moves to Decision Ledger.",
  },
  {
    slug: "deferred-detail",
    pairsWith: "disclosure-gradient",
    title: "Deferred Detail",
    whatItSolves:
      "The same person wants opposite things at different moments. Mid-task they want less to read so they can keep working. In review they want all of it, because the detail is the only thing that explains what happened. Most tools pick one level and keep it there.",
    interactionModel:
      "The interaction is the switch between the two modes. While the task is live, the agent shows a status line, the next step, and a count of what it has recorded but is not showing, so nothing looks hidden by accident. When the task closes, that count becomes the way in. The record opens to a timeline of what the agent did, which tools it called, and the points where its read of the situation changed. Both modes hold the same data. Only the amount shown moves.",
    whereItEmbeds:
      "The component belongs wherever the work is being watched while it happens, which is usually an incident console or an on-call inbox, and then again wherever that work is reviewed afterwards, usually the incident page or a weekly review. It pairs with Disclosure Gradient, which solves the same problem from the other side: that one holds detail back until someone asks, this one holds it back until the work is done.",
    factChips: [
      "Live: one line",
      "After: the full picture",
      "Nothing discarded",
    ],
    backingStrength: "Strong",
    participants: "Everaldo",
    researchNote:
      "Maps to Retrospective Over Live (U02): full traces are valuable in postmortems but cause cognitive overload during live execution. Design two modes: minimal live, rich retrospective.",
    oneliner:
      "The agent holds detail back while you are fixing things, then opens it up afterwards so you can see what keeps going wrong.",
    explanation:
      "The record opens when the work changes phase, not when someone asks for it. While a task runs, the agent shows a status line and a count of what it has recorded and is holding. When the task closes, that same record opens in full. Nothing is filtered, only delayed.",
    example:
      "While it is running: one line, plus a count of 17 steps recorded and held. After: the steps open up, with the moment the agent's reading changed marked on the timeline.",
    evidence: [
      {
        quote:
          "If the idea is to have this be something used in practice mid-incident, folks really want to focus on just resolving the incident. The less information you provide and the more abstraction you build in, the better.",
        attribution: "Everaldo Aguiar, Director of Applied AI, PagerDuty",
      },
      {
        quote:
          "This I can see as something that would be very informative in retrospect, when you are doing a postmortem, learning from previous incidents, finding patterns.",
        attribution: "Everaldo Aguiar, Director of Applied AI, PagerDuty",
      },
    ],
  },
  {
    slug: "convergence-point",
    pairsWith: "signal-to-intent-handshake",
    title: "Convergence Point",
    backingStrength: "Moderate",
    participants: "Aman, Sahil",
    researchNote:
      "Maps to Conflict Resolution as an Explicit Step (U08): users expect a defined convergence point that produces an adopted answer or flags an impasse for a human.",
    oneliner:
      "Practitioners expect clear explanation of how multiple agents converged on an adopted answer, not just what was decided.",
    explanation:
      "When sub-agents disagree, users need to see convergence mechanics: what was adopted, what was flagged as impasse, and why, not a opaque final string.",
    example:
      "Panel: Agent A (logs) vs Agent B (code) → conflict resolver scores sources → “Adopted: rollback” · “Impasse: root cause unsettled.”",
    evidence: [
      {
        quote:
          "Think of it as the convergence, right, that you have here. So all of these different agents would feed into that convergence point, which was a conflict resolution agent, which would further feed in, which would further output the adopted answer versus the flag impasse.",
        attribution: "Aman Chadra, IoC concept sharing study",
      },
    ],
  },
  {
    slug: "certainty-boundary",
    evidenceStatus: "pending",
    title: "Certainty Boundary",
    backingStrength: "Thin",
    participants: "Anshu",
    researchNote:
      "Practitioners separate deterministic/API-driven work from dynamic generation, tying the latter to hallucination risk. Single-participant, engineering-framed; validate as an end-user concept.",
    oneliner:
      "Practitioners separate deterministic/API-driven work from dynamic generation, tying the latter to hallucination risk.",
    explanation:
      "Not every step should be LLM-improvised. Bound deterministic tool paths from open-ended planning so teams know where outputs are repeatable vs generative.",
    example:
      "Workflow map: green = fixed API steps · amber = planner chooses tools · red = dynamic generation (requires review).",
  },
];

// GTM / positioning findings from the synthesis with no corresponding UI
// component. Handled in messaging and sales, not in the pattern set above.
export const positioningFindings: PositioningFinding[] = [
  {
    id: "U10",
    title: "Multi-Agent Fatigue",
    statement:
      "Users skeptical from past multi-agent disappointment resist new approaches unless a clear, differentiated angle is shown.",
    strength: "Moderate",
    participants: "Dongxue",
    recommendation:
      "Name the prior failure modes and lead with the differentiated angle; don't assume 'multi-agent' is itself a selling point.",
  },
  {
    id: "U11",
    title: "Use-Case-Led Value, Not Framework-Led",
    statement:
      "Users engage when a concrete, industry-relevant use case is mapped to the system; abstract framework-first pitches lose them.",
    strength: "Moderate",
    participants: "Everaldo, Mehrad",
    recommendation:
      "Open with problems mapped to the user's domain; make 'why not one agent' concrete per use case.",
  },
  {
    id: "U12",
    title: "Data-Boundary Trust Drives Vendor Choice",
    statement:
      "Where a user's data already lives shapes which agent vendor they trust; same-platform solutions have an adoption edge.",
    strength: "Moderate",
    participants: "Alok",
    recommendation:
      "Address data residency and privacy explicitly; anticipate the 'my data's on X so I'll buy X's agent' objection.",
  },
];

export function getPattern(slug: string): Pattern | undefined {
  const direct = patterns.find((p) => p.slug === slug);
  if (direct) return direct;
  // Fall back through the rename map (old slug → merged/renamed target).
  const resolved = resolvePatternSlug(slug);
  return resolved !== slug
    ? patterns.find((p) => p.slug === resolved)
    : undefined;
}

export function getPatternStatus(pattern: Pattern): PatternStatus {
  return getEvidenceCount(pattern) > 0 ? "Grounded" : "Unverified";
}

export function getEvidenceCount(pattern: Pattern): number {
  return pattern.evidence?.length ?? 0;
}

export function getFilledBarCount(quoteCount: number): number {
  if (quoteCount <= 0) return 0;
  return Math.min(quoteCount, 4);
}

export function patternsSortedByEvidence(): Pattern[] {
  return [...patterns].sort(
    (a, b) => getEvidenceCount(b) - getEvidenceCount(a),
  );
}

export function getAdjacentPatterns(slug: string): {
  prev: Pattern | null;
  next: Pattern | null;
} {
  const index = patterns.findIndex((p) => p.slug === slug);
  if (index === -1) return { prev: null, next: null };
  return {
    prev: index > 0 ? patterns[index - 1]! : null,
    next: index < patterns.length - 1 ? patterns[index + 1]! : null,
  };
}

export function isEvidencePending(pattern: Pattern): boolean {
  return pattern.evidenceStatus === "pending";
}
