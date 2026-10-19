import type { Level, Mode, Pattern } from "./types";

/**
 * The 23 interaction patterns, from `context.md` section 7.
 *
 * 33 originals, 17 IOC patterns and 16 SDK components, deduplicated into 23.
 * A component is the `implementation` of a pattern, not a separate entry, so
 * there is one list here and not two.
 *
 * What is grounded and what is synthesis:
 *
 *   grounded    name, source, merged_from, evidence, level notes, triggers and
 *               channels for the IOC entries, which come from the published
 *               pattern pages. Summaries for IOC entries are their published
 *               one-liners, trimmed.
 *   synthesis   primary and secondary modes, primary level, the spec sentence,
 *               audiences, and channels for the SDK entries. Section 9 of the
 *               document lists the specific calls that need validating, and
 *               `judgment-calls.ts` carries that list into the UI.
 *
 * `composes_with` and `conflicts_with` are empty everywhere. The document
 * defines the fields but supplies no values, and a composition graph invented
 * here would read as a finding. TODO: author these.
 */
export const patterns: Pattern[] = [
  {
    id: "presence-boundary",
    contentReady: true,
    name: "Presence Boundary",
    summary:
      "Shows what an agent is doing now, what it can access, and how a person can pause or change its scope.",
    mode: { primary: "signal", secondary: "declare" },
    level: {
      primary: "L1",
      notes: {
        L1: "The person operating one agent sees its live state and scope.",
        L2: "Peer agents or an orchestrator receive state and scope as structured data so they can coordinate around the boundary.",
        L3: "The person sees one strip per agent and can pause an agent or narrow its reach.",
        L4: "The team sees each agent's boundary and who paused it or changed its scope.",
      },
    },
    triggers: [
      "It starts long-running work",
      "Its activity changes to idle, observing, working, waiting, or acting",
      "Its observation scope, action scope, or review requirement changes",
    ],
    audience: ["operator"],
    channels: ["chat_ui", "shared_ui", "state_signal"],
    spec: "When the agent's activity or access scope changes, the agent signals to the person operating it in a single-agent setup, through chat, and expects them to monitor its boundary or step in.",
    source: "ioc",
    merged_from: ["Presence Boundary (IOC)"],
    evidence: "moderate",
    whatItSolves:
      "A person can follow an agent's work between chat turns and see whether it stays within the scope they set. They can step in when the work or access needs to change.",
    interactionModel:
      "The agent updates its state as it moves between idle, observing, working, waiting, and acting. A short activity line and state track show the change. The boundary separates information it can observe from things it may change, with any review requirement. A person can pause the agent, narrow its scope, or explicitly widen it; the view then shows the new boundary.",
    interactionSteps: [
      { title: "Update activity", description: "Show each move between idle, observing, working, waiting, and acting with a short activity line." },
      { title: "Expose the boundary", description: "Separate what the agent may observe from what it may change, including any review requirement." },
      { title: "Apply a decision", description: "Pause, narrow, or explicitly widen the scope, then show the resulting state and boundary." },
    ],
    whereItEmbeds:
      "A portable primitive: shown on its own, and docked into a host surface wherever the agent already works. With one agent it is a single strip; with several in play, one strip per agent, so a person can pause one or narrow its reach from the same place.",
    example:
      "One status orb shows the live state with a short activity line. A five-step track places that state on the idle-to-acting spectrum. A scope panel separates watching from can-act-on, with an access level. Pause, Narrow, and Widen steer the boundary.",
    factChips: ["Idle → acting, at a glance", "Watching vs can act on", "Pause · narrow · widen"],
    implementation: { status: "none" },
    composes_with: [],
    conflicts_with: [],
    v1_slugs: ["presence-boundary"],
  },
  {
    id: "activity-record",
    contentReady: true,
    name: "Activity Record",
    summary:
      "Keeps a time-ordered account of an agent’s work so a person can review its actions, assumptions, results, and open questions.",
    mode: { primary: "signal", secondary: "explain" },
    level: {
      primary: "L1",
      notes: {
        L1: "The operator follows one agent’s progress in chat and reviews its recorded actions, assumptions, results, and open questions.",
        L3: "The operator reviews a shared timeline across agents, with each event attributed to the agent that produced it.",
      },
    },
    triggers: [
      "The agent starts or advances background work",
      "An action, assumption, tool call, or result is recorded",
      "The operator returns after asynchronous work or opens a completed run for review",
    ],
    audience: ["operator"],
    channels: ["chat_ui", "shared_ui"],
    spec: "When work is underway or a person returns after asynchronous work, the agent signals to the person operating it in a single-agent setup, through chat, and expects them to review the record or step in.",
    responses: ["review the record", "step in"],
    source: "sdk+ioc",
    merged_from: [
      "Timeline (SDK)",
      "Thinking Process (SDK)",
      "Background Work Ledger (IOC)",
    ],
    variant_axis: "When and how much to show",
    variants: [
      {
        id: "live-progress",
        label: "Live progress",
        original: "Thinking Process",
        source: "sdk",
        sdk_component: "thinking-process",
      },
      {
        id: "event-timeline",
        label: "Event timeline",
        original: "Timeline",
        source: "sdk",
        sdk_component: "timeline",
      },
      {
        id: "return-digest",
        label: "Return digest",
        original: "Background Work Ledger",
        source: "ioc",
        rendering: "background-work-ledger",
        default: true,
      },
    ],
    evidence: "strong",
    whatItSolves:
      "When background work changes a system, a person needs enough history to judge what happened and what still needs attention. A concise, ordered record makes that review possible without replaying raw logs.",
    interactionModel:
      "As work progresses, the agent records observable events such as tool calls, assumptions, actions, and results, with time, status, and relevant artifact. During active work it can show a short progress view; when work pauses or the operator returns, the same record opens as a fuller timeline with unresolved questions. The operator inspects entries, corrects an assumption, answers a question, or follows the host workflow to reverse or approve an action.",
    interactionSteps: [
      { title: "Record observable work", description: "Add tool calls, assumptions, actions, and results to one time-ordered history." },
      { title: "Adjust the detail", description: "Keep active progress brief; open the same history into a fuller timeline for later review." },
      { title: "Review and respond", description: "Inspect an entry, correct an assumption, or answer an unresolved question." },
    ],
    whereItEmbeds:
      "In the agent’s conversation while it works, and in a shared run or incident view that keeps the history available after the session.",
    example:
      "On INC-2231, the record shows a 5xx spike at 03:08, the agent’s retry-storm assumption at 03:16, replica scaling from 3 to 6 at 03:40, and a pending owner sign-off at 07:00.",
    factChips: ["Progress and history", "Assumptions kept distinct", "Open questions stay visible"],
    implementation: { sdk_component: "timeline", status: "shipping" },
    composes_with: [],
    conflicts_with: [],
    v1_slugs: ["background-work-ledger"],
  },
  {
    id: "inline-rationale",
    contentReady: true,
    name: "Inline Rationale",
    summary:
      "Says why this particular output came out this way, where the output is, rather than in a separate trace.",
    mode: { primary: "explain" },
    level: {
      primary: "L1",
      notes: {
        L1: "The person sees why one agent produced an output or changed state.",
        L3: "The person sees the rationale beside decisions made by several agents.",
      },
    },
    triggers: [
      "An output is delivered",
      "The system changes state",
      "A person asks why",
    ],
    audience: ["operator"],
    channels: ["chat_ui", "shared_ui"],
    spec: "When it delivers an output or a recommendation, the agent explains to the person using it in a single-agent setup, through chat, and expects them to evaluate the reasoning and verify its sources.",
    source: "sdk+ioc",
    merged_from: [
      "Inline Rationale (SDK)",
      "Contextual Explanation (SDK)",
      "Inline Rationale (IOC sub-pattern)",
    ],
    variant_axis: "what is being explained",
    // The merge map names a third variant from a v1 "Inline Rationale
    // sub-pattern". No such design exists: nothing in components/patterns or
    // lib/patterns.ts mentions it. Left out rather than invented.
    variants: [
      {
        id: "why-this-output",
        label: "Why this output",
        original: "Inline Rationale",
        source: "sdk",
        sdk_component: "inline-rationale",
        default: true,
      },
      {
        id: "why-the-system-changed",
        label: "Why the system changed",
        original: "Contextual Explanation",
        source: "sdk",
        sdk_component: "contextual-explanation",
      },
    ],
    evidence: "not_rated",
    whatItSolves:
      "A person can understand an output at the moment they see it. The explanation sits beside the result or state change it accounts for, where it can inform the next decision.",
    interactionModel:
      "Attached to a specific output or state change: a short title, the reasoning behind it, a confidence level, and a few labelled rationale lines. Two variants by what's being explained, why this output came out this way, and why the system changed state, each giving the reader a way to acknowledge it or open the fuller trace.",
    interactionSteps: [
      { title: "Attach", description: "Place a rationale beside the output or state change it explains." },
      { title: "Explain", description: "Show a short reason, confidence, and labeled rationale lines." },
      { title: "Follow up", description: "Let the reader acknowledge it or open the fuller trace." },
    ],
    whereItEmbeds:
      "Inline in chat, docked to the message it explains, or in a shared UI beside the output or state it accounts for. It travels with its output rather than sitting in a separate reasoning tab.",
    example:
      "Next to triage's restart proposal: 'Why triage wants to restart payments-svc, the 5xx spike matches a retry storm, and a restart clears the stuck queue without a deploy.' Confidence 68%, reversible: yes.",
    factChips: ["Why, where the output is", "Confidence shown", "Acknowledge or open the trace"],
    implementation: { sdk_component: "inline-rationale", status: "shipping" },
    composes_with: ["source-attribution"],
    conflicts_with: [],
    v1_slugs: [],
  },
  {
    id: "structured-finding",
    contentReady: true,
    name: "Structured Finding",
    summary:
      "Delivers a conclusion as a structured object, claim, confidence and sources, rather than as prose.",
    mode: { primary: "explain", secondary: "propose" },
    level: {
      primary: "L1",
      notes: {
        L1: "The person reviews one agent's conclusion with its confidence and sources.",
        L3: "The person compares findings from several agents before acting.",
      },
    },
    triggers: ["An analysis completes", "A diagnosis is handed over"],
    audience: ["operator"],
    channels: ["chat_ui"],
    spec: "When an analysis completes or a diagnosis is handed over, the agent explains to the person operating it in a single-agent setup, through chat, and expects them to evaluate the conclusion and verify its sources.",
    source: "sdk",
    merged_from: ["Findings (SDK)", "Diagnostic Report (SDK)"],
    variant_axis: "how much certainty is shown",
    variants: [
      {
        id: "findings-with-sources",
        label: "Findings with sources",
        original: "Findings",
        source: "sdk",
        sdk_component: "findings",
        default: true,
      },
      {
        id: "findings-with-confidence",
        label: "Findings with confidence",
        original: "Diagnostic Report",
        source: "sdk",
        sdk_component: "diagnostic-report",
      },
      {
        id: "decision-with-criteria",
        label: "Decision with criteria",
        original: "Rationale",
        source: "sdk",
        sdk_component: "rationale",
      },
    ],
    evidence: "not_rated",
    whatItSolves:
      "A reader can scan a conclusion, judge its certainty, and check its basis without extracting those facts from a paragraph. Each finding puts the claim, confidence, and sources together.",
    interactionModel:
      "Each finding is a claim with its supporting sources and, where it applies, a confidence level. Three variants by how much certainty is shown: findings with their sources, a diagnostic report that ranks suspected causes by confidence with a recommended action, and a decision with the criteria it was weighed against. The reader evaluates the claim and follows a source to verify it.",
    interactionSteps: [
      { title: "State", description: "Present each claim with its supporting sources and, where relevant, confidence." },
      { title: "Compare", description: "Rank suspected causes or show the criteria behind a decision when the variant calls for it." },
      { title: "Verify", description: "Let the reader evaluate the conclusion and follow a source." },
    ],
    whereItEmbeds:
      "In chat when an analysis completes, and lined up in a shared view when several agents' findings need review side by side. The structure is what lets a person compare one agent's conclusion against another's.",
    example:
      "The night's diagnostic report: 'Checkout retry storm' at 68% (pause the retry job) and 'Replica saturation' at 90% (keep 6 replicas until traffic falls), each with the evidence it rests on.",
    factChips: ["Claim · confidence · sources", "Scannable, not prose", "Verify by source"],
    implementation: { sdk_component: "findings", status: "shipping" },
    composes_with: ["source-attribution"],
    conflicts_with: [],
    v1_slugs: [],
  },
  {
    id: "source-attribution",
    contentReady: true,
    name: "Source Attribution",
    summary:
      "Names what a claim rests on, so a reader, or a consuming agent, can check it rather than take it.",
    mode: { primary: "explain" },
    level: {
      primary: "L1",
      notes: {
        L1: "The person reading one agent's claim can follow its cited sources.",
        L2: "Peer agents receive provenance with a claim so they can check it before using it.",
        L3: "The person verifies claims and sources contributed by several agents.",
      },
    },
    triggers: [
      "A claim rests on external data",
      "An agent consumes a peer's output",
      "A person verifies",
    ],
    audience: ["operator", "peer_agent"],
    channels: ["chat_ui", "shared_ui", "agent_message"],
    spec: "When a claim rests on external data, the agent explains to the person operating it in a single-agent setup, through chat, and expects them to evaluate the claim and verify its sources.",
    source: "sdk",
    merged_from: ["Source Attribution (SDK)"],
    evidence: "not_rated",
    whatItSolves:
      "A person or another agent can check what a claim rests on before relying on it. Provenance travels with the claim instead of being left to trust.",
    interactionModel:
      "A claim shown with the specific sources behind it, each one followable. The same structure serves two readers: a person checking citations, and an agent consuming a peer's output, where the provenance is how trust is carried between them.",
    interactionSteps: [
      { title: "Make a claim", description: "Show the statement in chat, a shared view, or an agent message." },
      { title: "Attach sources", description: "Name the specific evidence behind it and keep each source followable." },
      { title: "Check", description: "Let a person or downstream agent verify the claim before using it." },
    ],
    whereItEmbeds:
      "In chat and shared UIs for a person reading, and in agent-to-agent messages, where provenance travels with the claim so a downstream agent can verify before it relies on it.",
    example:
      "'The 5xx spike on payments-svc traces to the checkout retry loop, not a capacity ceiling', shown with the error logs from 03:08-03:12, the retry config in deploy 4f2a, and the replica saturation dashboard.",
    factChips: ["Claim with its sources", "Followable, not asserted", "Carries trust between agents"],
    implementation: { sdk_component: "source-attribution", status: "shipping" },
    composes_with: ["structured-finding", "inline-rationale"],
    conflicts_with: [],
    v1_slugs: [],
  },
  {
    id: "deferred-detail",
    contentReady: true,
    name: "Deferred Detail",
    summary:
      "Shows which decisions remain open in each phase, why they must wait, and what evidence allows the next phase to begin.",
    mode: { primary: "signal" },
    level: {
      primary: "L1",
      notes: {
        L1: "One person sees what the agent can decide now, what it has deferred, and the evidence needed to move on.",
        L3: "One person follows open decisions and handoffs across agents as phase ownership changes.",
        L4: "Teams see which group owns each phase and which evidence or decision unlocks the next handoff.",
      },
    },
    triggers: [
      "A new phase begins and the agent names decisions that cannot yet be made",
      "New evidence resolves or changes a deferred decision",
      "A decision gate is reached and ownership passes to the next phase",
    ],
    audience: ["operator", "team"],
    channels: ["chat_ui", "shared_ui"],
    spec: "When a phase begins or evidence makes a deferred decision possible, the agent signals to the person operating it in a single-agent setup, through chat, and expects them to monitor what remains open or decide whether the next phase can begin.",
    source: "ioc",
    merged_from: ["Deferred Detail (IOC)"],
    evidence: "strong",
    whatItSolves:
      "A person can make commitments in stages as evidence arrives. Each phase makes the postponed decisions explicit, explains why they are premature, and shows the condition that will unlock them.",
    interactionModel:
      "The agent names the current phase, its owner and outcome, and the decisions left open because information is missing. When evidence arrives, it updates the affected decision and its reason rather than silently replacing the earlier assumption. At the phase gate, it shows the result, the decision now possible, and who takes ownership next. The process view follows these changes without exposing every tool call or action.",
    interactionSteps: [
      { title: "Name what must wait", description: "At the start of a phase, show the open decision and the information still missing." },
      { title: "Update the decision", description: "When new evidence arrives, show how it changes the earlier assumption and whether the gate is ready." },
      { title: "Pass the phase onward", description: "Record the result, the decision made, and the next owner at the handoff." },
    ],
    whereItEmbeds:
      "In a conversation while one agent moves through phases, and in a shared process view where people follow decision gates and ownership across a longer effort.",
    example:
      "A payments migration leaves production capacity open during evaluation because there is no representative traffic data. A limited pilot finds peak demand three times higher than expected, allowing the team to set the capacity target before rollout.",
    factChips: ["Decision left open", "Reason made visible", "Evidence unlocks the gate"],
    implementation: { status: "none" },
    composes_with: ["activity-record"],
    conflicts_with: [],
    v1_slugs: ["deferred-detail"],
  },
  {
    id: "certainty-boundary",
    name: "Certainty Boundary",
    summary:
      "Separates deterministic, API-driven work from dynamic generation, because practitioners tie the second to hallucination risk.",
    mode: { primary: "declare" },
    level: {
      primary: "L1",
      notes: { L1: "Fixed steps and generative steps are marked apart." },
    },
    triggers: [
      "A workflow is configured",
      "A generative step needs review",
    ],
    audience: ["operator"],
    channels: ["settings_panel"],
    spec: "When a workflow is configured, the agent declares to the person operating it in a single-agent setup, through the settings panel, and expects them to calibrate their trust step by step and set its scope.",
    source: "ioc",
    merged_from: ["Certainty Boundary (IOC)"],
    evidence: "thin",
    implementation: { status: "none" },
    composes_with: [],
    conflicts_with: [],
    v1_slugs: ["certainty-boundary"],
  },
  {
    id: "details-dashboard",
    contentReady: true,
    name: "Details Dashboard",
    summary:
      "One place to read the state of a single entity or process while work is going on around it.",
    mode: { primary: "signal" },
    level: {
      primary: "L1",
      notes: {
        L1: "The person inspects the current state of an entity or process one agent is working on.",
        L3: "The person and agents use the same state view during a review.",
      },
    },
    triggers: ["Someone is inspecting an entity, topic or process"],
    audience: ["operator"],
    channels: ["shared_ui"],
    spec: "When someone is inspecting an entity, topic or process, the agent signals to the person operating it in a single-agent setup, through a shared UI, and expects them to monitor its state or step in.",
    source: "sdk",
    merged_from: ["Details Dashboard (SDK)"],
    evidence: "not_rated",
    whatItSolves:
      "A person inspecting a service or process can see its current state together, without assembling it from logs, metrics, and chat. That shared view supports a timely decision to step in.",
    interactionModel:
      "A titled panel for one entity, its headline stats, a row of secondary stats, and a short description. Read-only and always current: a person inspecting a service, a topic, or a process reads its state here and steps in elsewhere if it's wrong.",
    interactionSteps: [
      { title: "Select", description: "Open the entity or process being inspected." },
      { title: "Read", description: "Show its headline stats, secondary measures, and a short description together." },
      { title: "Respond", description: "Keep the view current while the person monitors it or steps in elsewhere." },
    ],
    whereItEmbeds:
      "In a shared UI, an incident page, a service view, an entity inspector, wherever one thing is under scrutiny while work goes on around it.",
    example:
      "payments-svc during the checkout-latency incident: error rate 0.4%, 6 replicas, p99 820ms, with peak 5xx at 4.1% and recovery logged at 03:48.",
    factChips: ["One entity, one place", "Read-only, always current", "State at a glance"],
    implementation: { sdk_component: "details", status: "shipping" },
    composes_with: [],
    conflicts_with: [],
    v1_slugs: [],
  },
  {
    id: "capability-manifest",
    contentReady: true,
    name: "Capability Manifest",
    summary:
      "Shows an agent's capabilities, limits, alerts, and connection status so people know what it can do before using it.",
    mode: { primary: "declare", secondary: "signal" },
    level: {
      primary: "L1",
      notes: {
        L1: "A person sees one agent's capabilities and whether it is ready.",
        L2: "Peers discover the agent's capabilities and operating limits.",
        L3: "A person can inspect the capabilities of agents working together.",
        L4: "Teams share a view of available agents and their limits.",
      },
    },
    triggers: [
      "An agent initializes or connects",
      "A capability or permission changes",
      "An alert or connection status changes",
    ],
    audience: ["operator", "peer_agent", "orchestrator", "team"],
    channels: ["settings_panel", "chat_ui", "state_signal"],
    spec: "When an agent initializes or its capabilities change, the agent declares to the person operating it in a single-agent setup, through the settings panel, and expects them to calibrate trust and set scope.",
    source: "sdk",
    merged_from: ["Capability Manifest (SDK)"],
    evidence: "not_rated",
    whatItSolves:
      "Before assigning work, a person can see which tasks the agent can handle, which need approval, and which are unavailable. That helps them set the right scope and avoid relying on a capability the agent cannot use.",
    interactionModel:
      "The agent declares its capabilities and their states, shows conditions, alerts, and connection status, then updates the manifest when those facts change.",
    interactionSteps: [
      { title: "Declare", description: "Name the agent and show each capability as available, awaiting approval, restricted, or in error." },
      { title: "Qualify", description: "Show conditions such as read-only access, alerts that affect use, and the live connection state." },
      { title: "Update", description: "Refresh the manifest when availability or permissions change so the person can reassess its scope." },
    ],
    example:
      "A support agent can search tickets and draft replies, but sending a reply awaits approval. Its CRM connection is down, so the manifest shows the affected capability as unavailable before anyone assigns it work.",
    implementation: { sdk_component: "capability-manifest", status: "shipping" },
    composes_with: [],
    conflicts_with: [],
    v1_slugs: [],
  },
  {
    id: "credential-boundary",
    contentReady: true,
    name: "Credential Boundary",
    summary:
      "Multi-agent value is strongest where no single agent can legally, technically or organizationally hold all the access a task needs.",
    mode: { primary: "coordinate", secondary: "declare" },
    level: {
      primary: "L2",
      notes: {
        L2: "Peer agents reason within separate access scopes and exchange conclusions through a broker.",
        L3: "The person grants access or resolves a gap the partitioned agents leave open.",
      },
    },
    triggers: [
      "A task needs data no single agent may hold",
      "Partial conclusions conflict",
    ],
    audience: ["peer_agent", "operator"],
    channels: ["shared_ui", "chat_ui", "shared_record"],
    spec: "When a task needs data no single agent may hold, the agent coordinates with its peer agents in a multi-agent system with no person in the loop, through a shared record, and expects them to act jointly without pooling access.",
    source: "ioc",
    merged_from: ["Credential Boundary (IOC)"],
    evidence: "strong",
    whatItSolves:
      "Agents can complete work that spans restricted data while each stays within its own access. They coordinate on conclusions without pooling the underlying data or expanding any one agent's permissions.",
    interactionModel:
      "Agents are partitioned by scope and reason in parallel, each on only the data it may hold. They coordinate through a policy broker that passes conclusions, never raw data, so no agent sees another's restricted inputs. A person steps in only to grant access or resolve what the partition leaves open.",
    interactionSteps: [
      { title: "Partition", description: "Give each agent only the data and tools within its permitted scope." },
      { title: "Coordinate", description: "Pass conclusions through a policy broker without sharing restricted inputs." },
      { title: "Resolve gaps", description: "Ask a person to grant access or settle what the partition leaves open." },
    ],
    whereItEmbeds:
      "Runs between agents that must stay separated, a shared record or broker surface, surfaced to a person only to grant access or settle a gap. Pairs with Shared Cognitive State, which holds the common picture the partitioned agents still need.",
    example:
      "A fraud agent (AML scope) and a credit agent (lending scope) coordinate via a policy broker; neither holds the other's raw data.",
    factChips: ["Agents only", "Partitioned by scope", "Coordinate via broker"],
    implementation: { status: "none" },
    composes_with: ["shared-cognitive-state"],
    conflicts_with: [],
    v1_slugs: ["credential-boundary"],
  },
  {
    id: "convergence-point",
    contentReady: true,
    name: "Convergence Point",
    summary:
      "Practitioners expect a clear account of how several agents converged on an adopted answer, not just what was decided.",
    mode: { primary: "resolve", secondary: "explain" },
    level: {
      primary: "L2",
      notes: {
        L2: "Peer agents weigh conflicting answers and adopt one or flag an impasse.",
        L3: "The person reviews how the answer was reached and can settle an impasse.",
      },
    },
    triggers: [
      "Sub-agents disagree",
      "An answer is adopted",
      "An impasse is escalated",
    ],
    audience: ["peer_agent", "operator"],
    channels: ["shared_ui", "chat_ui", "shared_record"],
    spec: "When sub-agents reach conflicting answers, the agent resolves with its peer agents in a multi-agent system with no person in the loop, through a shared record, and expects an adopted answer or a flagged impasse.",
    source: "ioc",
    merged_from: ["Convergence Point (IOC)"],
    evidence: "moderate",
    whatItSolves:
      "Agents and people can see how a shared answer was reached, including the evidence weighed and any unresolved conflict. That account makes the adopted answer possible to examine or overturn.",
    interactionModel:
      "The conflicting agents are shown together, their sources scored, and one answer is adopted with its reasoning attached, or, when nothing can be adopted, the conflict is flagged as an impasse. A person reviewing it sees how convergence happened and can settle an impasse.",
    interactionSteps: [
      { title: "Surface conflict", description: "Show the agents' differing answers and the sources behind each." },
      { title: "Weigh", description: "Compare the evidence and attach reasoning to the candidate answer." },
      { title: "Conclude", description: "Adopt an answer or flag an impasse for a person to settle." },
    ],
    whereItEmbeds:
      "Runs where sub-agents disagree and an answer has to be chosen, a shared record between agents, surfaced to a person when the impasse needs settling. Sits downstream of Assumption Surface, which explains why they differ before anything is adopted.",
    example:
      "A panel: agent A (logs) versus agent B (code). The conflict resolver scores the sources, \"Adopted: rollback\", or \"Impasse: root cause unsettled\".",
    factChips: ["Agents only", "Adopt or flag impasse", "Reasoning attached"],
    implementation: { status: "none" },
    composes_with: ["assumption-surface", "pre-action-handshake"],
    conflicts_with: [],
    v1_slugs: ["convergence-point"],
  },
  {
    id: "pre-action-handshake",
    name: "Pre-Action Handshake",
    summary:
      "Lets the agent explain what it noticed and what it thinks it means before it acts.",
    mode: { primary: "propose", secondary: "explain" },
    level: {
      primary: "L3",
      notes: { L3: "Noticed, means, plan, stated before acting." },
    },
    triggers: ["The agent detects a signal", "Before an irreversible step"],
    audience: ["operator"],
    channels: ["chat_ui"],
    spec: "When it detects a signal and before any irreversible step, the agent proposes to the operator in a multi-agent system with one person in the loop, through chat, and expects consent, a correction, a decline, or a deferral.",
    source: "ioc",
    merged_from: ["Signal-to-Intent Handshake (IOC), renamed"],
    evidence: "moderate",
    implementation: { status: "none" },
    composes_with: [],
    conflicts_with: [],
    v1_slugs: ["signal-to-intent-handshake"],
  },
  {
    id: "assumption-surface",
    contentReady: true,
    name: "Assumption Surface",
    summary:
      "Shows why agents reached different conclusions: what each could see, what it filled in, what it concluded.",
    // Mode corrected from the context.md synthesis (Resolve/Explain) to match
    // the vetted v1 page: Assumption Surface explains *why* agents differ and
    // has no approve/reject, adoption belongs to Convergence Point, which it
    // sits upstream of.
    mode: { primary: "explain" },
    level: { primary: "L3", notes: { L3: "The person compares the agents' assumptions and corrects the one behind their disagreement." } },
    triggers: [
      "Two agents reach different answers",
      "Before anyone decides which answer to adopt",
    ],
    audience: ["operator"],
    channels: ["shared_ui"],
    responses: ["correct the assumption"],
    spec: "When two agents reach different answers, and before anyone decides which to adopt, the agent explains to the operator in a multi-agent system with one person in the loop, through a shared UI, and expects them to correct a wrong assumption, after which the interpretation resting on it is marked stale rather than silently rewritten.",
    source: "ioc",
    merged_from: ["Assumption Surface (IOC)"],
    evidence: "thin",
    whatItSolves:
      "A person can locate the assumption behind agents' conflicting conclusions and correct it before an answer is adopted. The affected interpretation is marked stale so the change remains visible.",
    interactionModel:
      "Retrospective, and read mostly. The agents are shown side by side, each with the context it held, the assumption it made, and the interpretation it drew. Assumptions are the only actionable layer: correct one, and the interpretation resting on it is marked stale rather than silently rewritten. There is no approve or reject, approval belongs to Pre-Action Handshake and Authority Gradient.",
    interactionSteps: [
      { title: "Compare", description: "Place each agent's context, assumption, and interpretation side by side." },
      { title: "Correct", description: "Let the person change a wrong assumption without approving either conclusion." },
      { title: "Mark stale", description: "Flag the interpretation built on that assumption instead of silently rewriting it." },
    ],
    whereItEmbeds:
      "Opens once agents have already reached different answers and someone needs to know why before deciding anything. Sits upstream of Convergence Point, which handles what gets adopted. Lives inside a case or incident surface, where the chrome already carries the account, the ticket, and who is working it.",
    example:
      "A refund agent assumed the dispute covers one charge. A subscriptions agent assumed the plan renewed on the old card. Same account, opposite conclusions.",
    factChips: ["Retrospective", "Two agents", "Assumptions correctable", "No approve or reject"],
    implementation: { status: "none" },
    composes_with: ["convergence-point"],
    conflicts_with: [],
    v1_slugs: ["assumption-surface"],
  },
  {
    id: "decision-record",
    contentReady: true,
    name: "Decision Record",
    summary:
      "The agent states why it chose an action at the moment it commits, so the reasoning survives without anyone reconstructing it later.",
    mode: { primary: "commit", secondary: "propose" },
    level: {
      primary: "L3",
      notes: {
        L3: "The agent drafts its reason; the operator adds context or commits the decision.",
        L4: "The team can read who approved the decision and why.",
      },
    },
    triggers: [
      "An action is proposed for commit",
      "The operator commits, amends or declines",
      "An audit asks how it was decided",
    ],
    audience: ["operator", "team"],
    channels: ["chat_ui", "shared_ui"],
    // Narrowed per section 11, step 2: this pattern's existing controls fit the
    // mode and are kept rather than renamed to the generic Commit responses.
    responses: ["commit", "add context", "decline"],
    spec: "When an action is proposed for commit, the agent commits to the operator in a multi-agent system with one person in the loop, through a shared UI, and expects them to commit it, add context, or decline.",
    source: "ioc",
    merged_from: ["Decision Ledger (IOC)", "Proposed Commits (IOC)"],
    variant_axis: "state",
    variants: [
      {
        id: "proposed-open",
        label: "Proposed (open)",
        original: "Proposed Commits",
        source: "ioc",
        rendering: "proposed-commits",
      },
      {
        id: "sealed-read-only",
        label: "Sealed (read-only)",
        original: "Decision Ledger",
        source: "ioc",
        rendering: "decision-ledger",
        default: true,
      },
    ],
    evidence: "moderate",
    whatItSolves:
      "A later reviewer can see why an action was approved, including the alternatives considered and the operator's judgment. The reasoning is captured when the decision is made, while it is still available.",
    interactionModel:
      "Before an action commits, the agent presents it with its stated reason, the alternatives it considered, and the policy version in force. The operator can accept the reason as written or amend it. An amendment does not overwrite: the agent's reason and the operator's revision are both stored, which makes visible the cases where the operator proceeded for a different reason than the agent proposed. On commit the record seals, later readers query it, they do not add to it.",
    interactionSteps: [
      { title: "Propose", description: "Show the action, agent's reason, alternatives, and policy version before commit." },
      { title: "Review", description: "Let the operator commit, add context, or decline while preserving both reasons." },
      { title: "Seal", description: "Make the committed record read-only for later review and export." },
    ],
    whereItEmbeds:
      "The approval step of a change record, not a separate audit tool. The record is written where the decision is already being made, which is the only place the rationale exists. Compliance export reads the sealed records and reformats them; it never asks anyone to supply reasoning after the fact.",
    example:
      "The agent proposes firmware 4.12 on edge-router-7 under CHG-2231, stating that 4.11 has an open memory leak affecting svc-payments. The operator amends the reason: the upgrade is going ahead now because the rollback window closes at month end. Commit stores the agent's reason, the operator's revision, and the policy version that permitted an unattended push.",
    factChips: ["Captured at commit", "Agent drafts, operator amends", "Sealed once written", "Export reads, never asks"],
    implementation: { status: "none" },
    composes_with: [],
    conflicts_with: [],
    v1_slugs: ["decision-ledger", "proposed-commits"],
  },
  {
    id: "review-as-dialogue",
    name: "Review as Dialogue",
    summary:
      "Turns approval into a learning and steering moment, not just a yes/no gate.",
    mode: { primary: "propose" },
    level: { primary: "L3", notes: { L3: "A rejection becomes steering." } },
    triggers: [
      "A person reviews a draft or an output",
      "A person rejects or redirects",
    ],
    audience: ["operator"],
    channels: ["chat_ui"],
    spec: "When a person reviews a draft or an output, the agent proposes to the operator in a multi-agent system with one person in the loop, through chat, and expects consent, a correction, a decline, or a deferral.",
    source: "ioc",
    merged_from: ["Review as Dialogue (IOC)"],
    evidence: "moderate",
    implementation: { status: "none" },
    composes_with: [],
    conflicts_with: [],
    v1_slugs: ["review-as-dialogue"],
  },
  {
    id: "memory-commitment-review",
    contentReady: true,
    name: "Memory Commitment Review",
    summary:
      "When an agent updates its belief mid-session, prior reasoning becomes stale. A person chooses whether to accept the change, restore the old belief, or keep it out of long-term memory.",
    mode: { primary: "commit" },
    level: {
      primary: "L3",
      notes: {
        L3: "The memory owner reviews each belief before it reaches long-term memory.",
        L4: "The memory owner decides whether reviewed beliefs belong in personal, project, or team memory.",
      },
    },
    triggers: [
      "A belief goes stale mid-session",
      "A session ends and its learning is committed",
    ],
    audience: ["operator"],
    channels: ["chat_ui", "settings_panel"],
    responses: ["keep", "restore", "revoke"],
    spec: "When a session ends and its learning is about to become long-term memory, the agent commits to the person who owns that memory in a multi-agent system with one person in the loop, through the settings panel, and expects each belief to be kept, restored, or revoked before it is sealed.",
    source: "ioc",
    merged_from: ["Memory Commitment Review (IOC)"],
    evidence: "thin",
    whatItSolves:
      "A person can see which beliefs were superseded during a session and decide what should become lasting memory. Stale reasoning stays traceable instead of quietly carrying forward.",
    interactionModel:
      "Staleness shows inline as beliefs are displaced: a superseded belief appears with the belief that replaced it and a note on what caused the shift, and attribution is preserved, a person sees which agent held which belief and which agent changed it. At the commitment boundary, when session reasoning becomes durable memory, a person reviews each belief and chooses to keep it, restore it (if the update was wrong), or revoke it (exclude it from long-term memory). Their choice is logged as part of the commitment record.",
    interactionSteps: [
      { title: "Mark change", description: "Show a superseded belief beside its replacement, cause, and agent attribution." },
      { title: "Review memory", description: "At session end, let the person keep, restore, or revoke each belief." },
      { title: "Commit", description: "Log those choices before the reviewed beliefs become long-term memory." },
    ],
    whereItEmbeds:
      "At two points: in real-time reasoning, when agents update positions and prior beliefs become stale, and at the memory boundary, when a person gates what gets committed to long-term memory. Both are load-bearing moments in multi-agent handoff.",
    example:
      "A finance agent priced off a 12% churn baseline. Customer Success validated a 41% baseline across 1,200 accounts, so the 12% is marked stale and shown alongside what replaced it. At session end, the person keeps, restores, or revokes each belief before it reaches long-term memory.",
    factChips: ["Stale beliefs attributed", "Keep · restore · revoke", "Each choice logged", "Session vs long-term memory"],
    implementation: { status: "none" },
    composes_with: [],
    conflicts_with: [],
    v1_slugs: ["memory-commitment-review"],
  },
  {
    id: "disclosure-gradient",
    contentReady: true,
    name: "Disclosure Gradient",
    summary:
      "The agent leads with the result and reveals its reasoning, agent coordination, and full trace as a person asks for more.",
    mode: { primary: "signal", secondary: "explain" },
    level: {
      primary: "L3",
      notes: {
        L3: "The operator sees the incident outcome first, then opens the reasoning and agent coordination when needed.",
        L4: "The incident response team can inspect the same trace during a postmortem without making every agent visible during live work.",
      },
    },
    triggers: [
      "A result is delivered during active work",
      "The result or status changes during the incident",
      "The operator asks why the result was reached or which agents contributed",
      "A postmortem reviewer opens the full trace",
    ],
    audience: ["operator", "team"],
    channels: ["chat_ui", "shared_ui"],
    spec: "When a result is delivered, the agent signals to the operator in a multi-agent system with one person in the loop, through chat, and expects them to monitor the outcome or step in for the trace.",
    source: "ioc",
    merged_from: ["Disclosure Gradient (IOC)"],
    evidence: "strong",
    whatItSolves:
      "An operator can act on a clear result without sorting through every agent and decision behind it. When they need to check the basis or investigate later, the reasoning, coordination, and full trace remain available in layers.",
    interactionModel:
      "The agent presents the outcome and its operational status first. The operator can open the rationale, then inspect which agents contributed and how work moved between them, then open the full trace for a postmortem. New material changes the outcome or status in place; expanded layers remain available to explain the update.",
    interactionSteps: [
      { title: "Lead with outcome", description: "Show the result and current status in the live conversation, with no agent roster or trace in the default view." },
      { title: "Reveal on request", description: "Let the operator open the rationale and agent handoffs when they ask how the result was reached." },
      { title: "Inspect the trace", description: "Keep the full sequence available for a deeper check or postmortem, and update the visible result when the work changes." },
    ],
    example:
      "The incident agent reports, “Incident mitigated.” The operator opens Why to see that a database agent identified a connection pool spike and a remediation agent restarted the affected service, then opens Full trace to inspect the evidence and event order during review.",
    factChips: ["Outcome first", "Reasoning on demand", "Agent handoffs available", "Trace retained for review"],
    implementation: { status: "none" },
    composes_with: [],
    conflicts_with: [],
    v1_slugs: ["disclosure-gradient"],
  },
  {
    id: "co-editing-surface",
    contentReady: true,
    name: "Co-Editing Surface",
    summary:
      "One artifact that a person and one or more agents both edit, with variants by content type rather than six separate patterns.",
    mode: { primary: "coordinate" },
    level: { primary: "L3", notes: { L3: "The person and agents revise the same artifact in a shared surface." } },
    triggers: [
      "An agent produces an editable artifact",
      "A person revises agent output",
    ],
    audience: ["operator"],
    channels: ["shared_ui"],
    spec: "When it produces an editable artifact, the agent coordinates with the operator in a multi-agent system with one person in the loop, through a shared UI, and expects them to act jointly on it.",
    source: "sdk",
    merged_from: [
      "Co-Editing Interface (SDK)",
      "Rich Text Editor (SDK)",
      "Code Editor (SDK)",
      "Form Builder (SDK)",
      "Mindmap (SDK)",
      "Charts / Data Visualizer (SDK)",
    ],
    variant_axis: "content type",
    // Two of the six the merge map lists have no artifact upstream: there is
    // no co-editing-interface and no rich-text-editor in hax/artifacts, so
    // the generic and text variants do not exist and are not listed. The
    // directory names below are the real ones, "form", not "form-builder".
    variants: [
      {
        id: "code",
        label: "Code",
        original: "Code Editor",
        source: "sdk",
        sdk_component: "code-editor",
      },
      {
        id: "form",
        label: "Form",
        original: "Form Builder",
        source: "sdk",
        sdk_component: "form",
        default: true,
      },
      {
        id: "mindmap",
        label: "Mindmap",
        original: "Mindmap",
        source: "sdk",
        sdk_component: "mindmap",
      },
      {
        id: "chart",
        label: "Chart",
        original: "Data Visualizer",
        source: "sdk",
        sdk_component: "data-visualizer",
      },
    ],
    evidence: "not_rated",
    whatItSolves:
      "A person and an agent can revise the same artifact in place. The work stays in one shared surface instead of passing copied versions back and forth.",
    interactionModel:
      "One artifact that a person and one or more agents edit, the surface shaped to the content type: a code editor, a form, a mindmap, or a chart. The agent drafts, the person revises in place, and both act on the same object rather than trading versions.",
    interactionSteps: [
      { title: "Draft", description: "The agent creates an editable artifact in the surface suited to its content." },
      { title: "Revise", description: "The person changes the same code, form, mindmap, or chart in place." },
      { title: "Continue", description: "Both work from the updated artifact rather than exchanging separate versions." },
    ],
    whereItEmbeds:
      "In a shared UI wherever an agent's output is meant to be worked on rather than just read, a code panel, a form to confirm, a mindmap to arrange, a chart to adjust.",
    example:
      "After triage proposes a restart, a form opens to confirm it: pick the service (payments-svc), acknowledge the plan, and log a reason for the team, the agent drafted it, the person completes it in place.",
    factChips: ["One artifact, both edit", "Shaped to the content", "Code · form · mindmap · chart"],
    implementation: { sdk_component: "form", status: "shipping" },
    composes_with: [],
    conflicts_with: [],
    v1_slugs: [],
  },
  {
    id: "concurrent-workspace-awareness",
    name: "Concurrent Workspace Awareness",
    summary:
      "Helps agents read live human edits as feedback, override, or unrelated work.",
    mode: { primary: "coordinate" },
    level: { primary: "L3", notes: { L3: "The agent interprets live human edits." } },
    triggers: ["A person edits while the agent drafts"],
    audience: ["operator"],
    channels: ["shared_ui"],
    spec: "When a person edits while it is drafting, the agent coordinates with the operator in a multi-agent system with one person in the loop, through a shared UI, and expects them to act jointly on the same artifact.",
    source: "ioc",
    merged_from: ["Concurrent Workspace Awareness (IOC)"],
    evidence: "none",
    implementation: { status: "none" },
    composes_with: [],
    conflicts_with: [],
    v1_slugs: ["concurrent-workspace-awareness"],
  },
  {
    id: "authority-gradient",
    contentReady: true,
    name: "Authority Gradient",
    summary: "Sets a separate autonomy level for each workflow area, matching authority to risk.",
    mode: { primary: "declare", secondary: "delegate" },
    level: {
      primary: "L3",
      notes: {
        L3: "The operator sets an autonomy level for each area the agents work in.",
        L4: "The team sees which roles can change authority in each area.",
      },
    },
    triggers: [
      "Setup, before work starts",
      "The agent hits the edge of its authority",
      "The risk level of an area changes",
    ],
    audience: ["operator", "team"],
    channels: ["settings_panel", "chat_ui", "state_signal"],
    responses: ["set the level", "adjust the level", "decide at the boundary"],
    spec: "When work is being set up or the agent reaches its authority boundary, the agent declares to the operator in a multi-agent system with one person in the loop, through the settings panel, and expects them to set or adjust the autonomy level for that workflow area.",
    source: "ioc",
    merged_from: ["Authority Gradient (IOC)"],
    evidence: "moderate",
    whatItSolves:
      "An operator can grant routine work more independence while keeping sensitive work under closer review. Each workflow area gets an autonomy level matched to its risk.",
    interactionModel:
      "For each workflow area, the operator sets one of four levels: Suggest, Ask first, Act + review, or Act alone. Each row shows its risk tone and who set the level. Operators can adjust a level in place as the workflow or its risk changes, without pausing the agent.",
    interactionSteps: [
      { title: "Set levels", description: "Choose Suggest, Ask first, Act + review, or Act alone for each workflow area." },
      { title: "Show boundaries", description: "Display each area's risk tone and who set its current level." },
      { title: "Adjust", description: "Change a level when risk shifts or decide when the agent reaches its boundary." },
    ],
    whereItEmbeds:
      "Primary: agent settings or an orchestration console, where levels are set before work starts. Secondary: inline in the inbox when an agent reaches a boundary mid-task and needs a decision. It pairs with Presence Boundary for action scope and Review as Dialogue for areas set to act-with-review.",
    example:
      "Acme Renewal, Finance Agent: approve discount (Act + review), escalate to Director (Ask first). Customer Success: validate churn signals (Act + review). Each row shows its risk tone and who set the level.",
    factChips: ["Per-area autonomy", "Suggest to act alone", "Risk-appetite sizing"],
    implementation: { status: "none" },
    composes_with: ["presence-boundary", "review-as-dialogue"],
    conflicts_with: [],
    v1_slugs: ["authority-gradient"],
  },
  {
    id: "lineage-view",
    contentReady: true,
    name: "Lineage View",
    summary:
      "Shows what claims, artifacts and decisions depend on a given agent output.",
    mode: { primary: "explain" },
    level: {
      primary: "L4",
      notes: {
        L2: "Peer agents can trace which outputs they cite before passing a dependent result onward.",
        L3: "An operator can inspect dependencies across agents and hold a change that relies on a disputed output.",
        L4: "The incident and service teams see the shared blast radius and can coordinate review of dependent decisions.",
      },
    },
    triggers: [
      "An upstream output is disputed or goes stale",
      "Before signing off a dependent change",
    ],
    audience: ["team"],
    channels: ["shared_ui"],
    responses: ["inspect dependents", "verify the source", "reassess dependent work"],
    spec: "When an upstream output is disputed or goes stale, the agent explains to every team that relies on it in a multi-agent system shared by several teams, through a shared UI, and expects them to verify the blast radius before acting.",
    whatItSolves:
      "Teams can see which claims, artifacts, and decisions rely on a disputed or stale agent output, so they can check the source and coordinate review before dependent work proceeds.",
    interactionModel:
      "The shared incident workspace places the questioned output at the root and draws dependent claims, artifacts, and decisions with their citation links. When the root is disputed or stale, its state and timestamp are shown; the view counts affected teams and decisions so reviewers can trace each dependency and reassess downstream work.",
    interactionSteps: [
      { title: "Flag the source", description: "Mark the upstream output as disputed or stale and show when it was last verified." },
      { title: "Trace reliance", description: "Follow citation links from the source to dependent plans, tickets, and team decisions." },
      { title: "Assess the impact", description: "Count affected teams and decisions so they can verify the source and reassess dependent work." },
    ],
    example:
      "In the INC-2231 incident workspace, the Triage agent's RCA summary for edge-router-7 is under dispute. The Remediation agent's rollback plan leads to a change ticket from the Change agent; a Comms agent's status page draft also cites the RCA. Three teams still rely on the summary.",
    factChips: ["Citation graph", "Disputed source", "Cross-team blast radius"],
    source: "ioc",
    merged_from: ["Dependency and Lineage View (IOC), renamed"],
    evidence: "strong",
    implementation: { status: "none" },
    composes_with: [],
    conflicts_with: [],
    v1_slugs: ["dependency-and-lineage-view"],
  },
  {
    id: "shared-cognitive-state",
    name: "Shared Cognitive State",
    summary:
      "A common view of goals, assumptions, conflicts and open questions across humans and agents.",
    mode: { primary: "coordinate", secondary: "resolve" },
    level: {
      primary: "L4",
      notes: { L4: "Negotiated goals, assumptions and conflicts." },
    },
    triggers: [
      "Work spans teams or org boundaries",
      "A conflict is flagged before execution",
    ],
    audience: ["team"],
    channels: ["shared_ui"],
    spec: "When work spans teams or org boundaries, the agent coordinates with the teams involved in a multi-agent system shared by several teams, through a shared UI, and expects them to act jointly on shared goals, assumptions and conflicts.",
    source: "ioc",
    merged_from: ["Shared Cognitive State (IOC)"],
    evidence: "moderate",
    implementation: { status: "none" },
    composes_with: [],
    conflicts_with: [],
    v1_slugs: ["shared-cognitive-state"],
  },
  {
    id: "workshop-card",
    contentReady: true,
    name: "Workshop Card",
    summary:
      "Coordinates a group around a scheduled session: who is attending, and where each of them stands.",
    mode: { primary: "coordinate" },
    level: { primary: "L4", notes: { L4: "The group sees the session details, attendees, and confirmation status together." } },
    triggers: ["An agent schedules or coordinates a group"],
    audience: ["team"],
    channels: ["chat_ui", "shared_ui"],
    spec: "When it schedules or coordinates a group, the agent coordinates with the teams involved in a multi-agent system shared by several teams, through chat, and expects them to act jointly.",
    source: "sdk",
    merged_from: ["Workshop Card (SDK)"],
    evidence: "not_rated",
    whatItSolves:
      "A group can see the session details, who is attending, and its confirmation state together. Everyone reads the same current plan instead of piecing it together from invites and messages.",
    interactionModel:
      "A card for one scheduled session: its type, time, duration and location, the attendee list with a count, and a confirmation status. It coordinates a group, everyone reads the same card and sees where the others are.",
    interactionSteps: [
      { title: "Schedule", description: "Show the session type, time, duration, and location." },
      { title: "Gather", description: "List attendees and their count on the same shared card." },
      { title: "Confirm", description: "Update the session status so the group can see where it stands." },
    ],
    whereItEmbeds:
      "In chat where the group is already talking, and in a shared UI for a session several people or teams need to track. It opens when an agent schedules or coordinates a group.",
    example:
      "Incident retro for INC-2231: a 45-minute postmortem on Oct 7 at 10:00 in the war room, with the on-call engineer, service owner, and SRE lead among four attendees, status confirmed.",
    factChips: ["One session, one card", "Who's coming, where each stands", "Read by the whole group"],
    implementation: { sdk_component: "workshop-card", status: "shipping" },
    composes_with: [],
    conflicts_with: [],
    v1_slugs: [],
  },
];

/**
 * Content-type variants of Co-Editing Surface. The document is explicit that
 * these are one pattern with variants, each pointing at its SDK component,
 * rather than six peers.
 */
export const CO_EDITING_VARIANTS: Array<{ label: string; component: string }> = [
  { label: "Generic", component: "Co-Editing Interface" },
  { label: "Text", component: "Rich Text Editor" },
  { label: "Code", component: "Code Editor" },
  { label: "Form", component: "Form Builder" },
  { label: "Mindmap", component: "Mindmap" },
  { label: "Chart", component: "Charts / Data Visualizer" },
];

const BY_ID = new Map(patterns.map((pattern) => [pattern.id, pattern]));

export function getV2Pattern(id: string): Pattern | undefined {
  return BY_ID.get(id);
}

export function patternsInMode(mode: Mode): Pattern[] {
  return patterns.filter((pattern) => pattern.mode.primary === mode);
}

/** Patterns whose secondary mode is this one, shown as "also reaches". */
export function patternsSecondaryTo(mode: Mode): Pattern[] {
  return patterns.filter((pattern) => pattern.mode.secondary === mode);
}

export function patternsAtLevel(level: Level): Pattern[] {
  return patterns.filter((pattern) => pattern.level.primary === level);
}

/** Patterns that reach this level without being native to it. */
export function patternsReaching(level: Level): Pattern[] {
  return patterns.filter(
    (pattern) =>
      pattern.level.primary !== level && pattern.level.notes[level] !== undefined,
  );
}
