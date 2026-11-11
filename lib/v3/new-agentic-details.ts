import type { Pattern } from "@/lib/v2/types";

/**
 * Full authored detail for the seven new agentic patterns added in v3 from
 * the Nucleux map. These are Pattern-shaped so the v3 detail page can render
 * them with the same slots and sections as the 23 v2-authored patterns.
 *
 * `merged_from`, `source`, and `evidence` are set as v3-authored so the page
 * does not misattribute them to IOC or the SDK, which did not carry them.
 */

const AUTHORED: Omit<Pattern, "composes_with" | "conflicts_with" | "v1_slugs" | "implementation">[] = [
  {
    id: "stream-of-thought",
    contentReady: true,
    name: "Stream of Thought",
    summary:
      "The agent shows its reasoning as it unfolds, so a person can follow or interrupt before a conclusion lands.",
    mode: { primary: "signal", secondary: "explain" },
    level: {
      primary: "L3",
      notes: {
        L1: "The person following one agent sees its reasoning step by step.",
        L3: "The operator can scroll back, interrupt, or redirect as the reasoning unfolds.",
      },
    },
    triggers: [
      "The agent begins a multi-step task",
      "A reasoning step changes direction mid-task",
      "The agent is about to commit to a conclusion",
    ],
    audience: ["operator"],
    channels: ["chat_ui"],
    responses: ["follow", "interrupt", "redirect"],
    spec: "When it begins or changes direction during a multi-step task, the agent signals to the person operating it in a system with many agents and one person in the loop, through chat, and expects them to follow, interrupt, or redirect.",
    source: "ioc",
    merged_from: ["Stream of Thought (v3, Nucleux)"],
    evidence: "not_rated",
    whatItSolves:
      "A person can follow the agent's reasoning as it happens and interrupt before the wrong conclusion lands. Useful when the task has several steps and the agent's path is not obvious.",
    interactionModel:
      "The agent's reasoning appears progressively in the chat. Each new step is marked and earlier steps stay visible. The person can scroll back or interrupt; the agent acknowledges the interrupt, pauses, and continues from the new point.",
    interactionSteps: [
      { title: "Begin", description: "Open a reasoning stream marked as ongoing when the task starts." },
      { title: "Reveal", description: "Add each step as it is reasoned, keeping earlier steps visible." },
      { title: "Yield", description: "Pause on interrupt or acknowledge a redirect, then continue from the new point." },
    ],
    whereItEmbeds:
      "In the agent's conversation, as a live reasoning stream that sits above the next action. Pairs with Inline Rationale, which attaches a condensed explanation to the final output.",
    example:
      "On INC-2231, the Reliability agent streams: 'Examining 5xx spike around 03:08 → correlates with deploy 4f2a at 03:04 → candidate cause: new retry policy → checking retry count spike…' and the operator interrupts to narrow the check to one service.",
    factChips: ["Reasoning as it unfolds", "Interruptible", "Earlier steps stay visible"],
  },
  {
    id: "follow-up",
    contentReady: true,
    name: "Follow Up",
    summary:
      "The agent asks one focused clarifying question when the request is ambiguous, rather than guessing.",
    mode: { primary: "request" },
    level: {
      primary: "L3",
      notes: {
        L3: "The operator answers the single question or explicitly skips it.",
      },
    },
    triggers: [
      "The request is ambiguous and the agent cannot infer the missing fact",
      "Required context is missing before the agent can act",
    ],
    audience: ["operator"],
    channels: ["chat_ui"],
    responses: ["answer", "skip"],
    spec: "When a request is ambiguous or required context is missing, the agent requests from the person operating it in a system with many agents and one person in the loop, through chat, and expects an answer or an explicit skip.",
    source: "ioc",
    merged_from: ["Follow Up (v3, Nucleux)"],
    evidence: "not_rated",
    whatItSolves:
      "The agent gets the context it needs before acting, with one focused question rather than guessing. The person is not asked for information the agent already has.",
    interactionModel:
      "The agent identifies what it does not know and composes one focused question. It poses the question and waits. The person answers or explicitly skips; the agent proceeds with the answer or with a stated assumption.",
    interactionSteps: [
      { title: "Identify the gap", description: "Name the specific missing fact the agent cannot infer from context." },
      { title: "Ask one question", description: "Pose a focused question rather than a list, and wait for the answer." },
      { title: "Use the answer", description: "Incorporate the answer, or proceed with a stated assumption on skip." },
    ],
    whereItEmbeds:
      "In the agent's conversation at the moment it discovers the gap. Distinct from Pre-Action Handshake, which pauses before a consequential action; Follow Up pauses because the agent cannot proceed without a fact.",
    example:
      "On a draft reply to a billing dispute, the agent asks: 'Does this dispute cover one charge or the whole series?' The operator says 'the whole series', and the agent revises the draft to address all affected transactions.",
    factChips: ["One question, not a form", "Answer or skip", "Assumption stated on skip"],
  },
  {
    id: "agent-memory",
    contentReady: true,
    name: "Memory",
    summary:
      "The agent keeps relevant facts across turns and sessions, with the person able to see and change what it remembers.",
    mode: { primary: "declare", secondary: "signal" },
    level: {
      primary: "L3",
      notes: {
        L1: "The person sees what the agent has learned about them over time.",
        L3: "The operator reviews proposed memory entries and can edit or forget any of them.",
      },
    },
    triggers: [
      "The agent learns a durable fact about the person or their work",
      "The person opens their memory settings",
      "A memory entry would change the agent's behavior",
    ],
    audience: ["operator"],
    channels: ["settings_panel", "chat_ui"],
    responses: ["keep", "edit", "forget"],
    spec: "When the agent learns a durable fact or the person opens their memory, the agent declares to the person operating it in a system with many agents and one person in the loop, through the settings panel, and expects them to keep, edit, or forget the entry.",
    source: "ioc",
    merged_from: ["Memory (v3, Nucleux)"],
    evidence: "not_rated",
    whatItSolves:
      "The agent remembers what matters across sessions, and the person sees exactly what it holds, with the ability to change or remove any entry.",
    interactionModel:
      "The agent proposes a memory entry when it learns something durable, with a quick inline accept in chat. The full memory list is available in settings: each entry shows what the agent remembers, when it was learned, and controls to edit or forget it.",
    interactionSteps: [
      { title: "Propose", description: "When learning a durable fact, show a one-line entry the person can accept inline." },
      { title: "List", description: "Keep the full memory accessible in settings, with each entry traceable to its source." },
      { title: "Change", description: "Let the person edit or forget any entry; the agent adapts from that point on." },
    ],
    whereItEmbeds:
      "Inline in chat as single-line proposals and in settings as the durable memory list. Pairs with Memory Commitment Review for session-end gating of what reaches long-term memory.",
    example:
      "After an operator says 'we rarely restart during business hours', the agent proposes: 'Remembered: prefers to avoid restarts during business hours.' The operator accepts; later, when a restart comes up at 2pm, the agent asks first.",
    factChips: ["Proposed inline", "Listed in settings", "Edit or forget any entry"],
  },
  {
    id: "task-creation",
    contentReady: true,
    name: "Task Creation",
    summary:
      "The agent turns a request into a named task with an owner and an expected result.",
    mode: { primary: "propose" },
    level: {
      primary: "L3",
      notes: {
        L3: "The operator reviews the proposed task, edits any field, and accepts or declines.",
        L4: "Teams see created tasks alongside other work, with the proposing agent attributed.",
      },
    },
    triggers: [
      "A request implies work that spans multiple steps",
      "A person asks the agent to track something",
      "A conversation produces a commitment that should not be lost",
    ],
    audience: ["operator", "team"],
    channels: ["chat_ui", "shared_ui"],
    responses: ["accept", "edit", "decline"],
    spec: "When a request implies multi-step work, the agent proposes to the person operating it in a system with many agents and one person in the loop, through a shared UI, and expects them to accept, edit, or decline the task.",
    source: "ioc",
    merged_from: ["Task Creation (v3, Nucleux)"],
    evidence: "not_rated",
    whatItSolves:
      "A person can turn a request into a tracked task with a clear owner and expected result, instead of having the work disappear into the conversation.",
    interactionModel:
      "The agent proposes a task card with name, expected result, and owner. The person accepts it as-is, edits the fields, or declines. Accepted tasks are tracked where the person can see them alongside other work.",
    interactionSteps: [
      { title: "Propose a task", description: "Suggest a name, expected result, and owner derived from the request." },
      { title: "Edit before accept", description: "Let the person adjust any field before the task is created." },
      { title: "Track", description: "Put accepted tasks where the person can see them alongside other work." },
    ],
    whereItEmbeds:
      "In chat as a card and in a shared task view where accepted tasks accumulate. Pairs with Subtask Generation when the proposed task is itself a container.",
    example:
      "After an operator says 'investigate the checkout retries', the agent proposes a task: 'Investigate checkout retry storm · Expected result: root cause and fix plan · Owner: @triage'. The operator accepts; the task appears in the incident workspace.",
    factChips: ["Named and scoped", "Editable before accept", "Visible after create"],
  },
  {
    id: "task-assignment",
    contentReady: true,
    name: "Task Assignment",
    summary:
      "The agent routes a task to a peer whose declared capability matches, and shows who owns what.",
    mode: { primary: "delegate" },
    level: {
      primary: "L2",
      notes: {
        L2: "Peer agents coordinate assignments against each other's capability manifests, without a person routing every task.",
        L3: "The operator sees the transfer in the shared view and can reassign if needed.",
      },
    },
    triggers: [
      "A task matches another agent's declared capability",
      "The current agent hits its own capability boundary",
      "A peer accepts, declines, or asks for clarification",
    ],
    audience: ["peer_agent", "operator"],
    channels: ["agent_message", "shared_ui"],
    responses: ["accept", "decline", "request clarification"],
    spec: "When a task matches a peer agent's capability, the agent delegates to its peer agents in a system with many agents and no person in the loop, through a message to another agent, and expects an accept, a decline, or a request for clarification.",
    source: "ioc",
    merged_from: ["Task Assignment (v3, Nucleux)"],
    evidence: "not_rated",
    whatItSolves:
      "Work reaches the agent best suited to do it, without a person routing every task. Responsibility is explicit, and the shared view shows who owns what.",
    interactionModel:
      "The assigning agent picks a peer whose declared capability matches and sends the task with enough context for the peer to decide. The peer accepts, declines with a reason, or asks for clarification. Accepted tasks move into the peer's workload and the shared view reflects the transfer.",
    interactionSteps: [
      { title: "Match", description: "Pick a peer whose declared capability matches the task." },
      { title: "Send", description: "Pass the task with enough context for the peer to decide." },
      { title: "Transfer", description: "On accept, move the task to the peer and update the shared view." },
    ],
    whereItEmbeds:
      "Between agents as structured messages and in a shared task view for the operator. Sits downstream of Capability Manifest, which supplies the matching data, and alongside Task Creation, which produces what gets assigned.",
    example:
      "The Triage agent assigns 'produce a 72-hour deploy diff' to the Reliability agent whose capability manifest lists deploy comparison. Reliability accepts; the task moves into its queue and the shared incident view shows the new owner.",
    factChips: ["Routed by capability", "Accept, decline, or ask", "Shared view updates"],
  },
  {
    id: "priority-ranking",
    contentReady: true,
    name: "Priority Ranking",
    summary:
      "The agent orders pending tasks by weight and lets a person see the reasoning and reorder them.",
    mode: { primary: "declare", secondary: "propose" },
    level: {
      primary: "L3",
      notes: {
        L3: "The operator sees the ranking with a reason per task and can reorder it.",
        L4: "Teams see one ranking that reflects the group's priorities, with changes attributed.",
      },
    },
    triggers: [
      "Several tasks are in flight",
      "The person opens the task list",
      "A new task arrives that changes the ranking",
    ],
    audience: ["operator", "team"],
    channels: ["shared_ui"],
    responses: ["accept", "reorder"],
    spec: "When several tasks are in flight, the agent declares to the person operating it in a system with many agents and one person in the loop, through a shared UI, and expects them to accept the ranking or reorder it.",
    source: "ioc",
    merged_from: ["Priority Ranking (v3, Nucleux)"],
    evidence: "not_rated",
    whatItSolves:
      "A person sees which task the agent plans to do next and why, with the ability to override. Work is not implicitly prioritized by order of arrival.",
    interactionModel:
      "The agent ranks pending tasks by its own weighting — deadline, blocker status, impact — and shows the ranking with a short reason per task. The person can accept the order or drag to reorder; the agent updates its own weighting from the overrides.",
    interactionSteps: [
      { title: "Rank", description: "Order pending tasks with a short reason attached to each." },
      { title: "Show", description: "Present the ranking where the person can see and inspect it." },
      { title: "Learn from overrides", description: "Update the agent's own weighting when the person reorders." },
    ],
    whereItEmbeds:
      "In a shared task view, inline with the task list. Pairs with Task Creation and Subtask Generation, which produce the items being ranked, and with Memory when the overrides should carry across sessions.",
    example:
      "Three tasks pending: fix broken build (blocker, one person waiting), update docs (deadline this week), renew certificate (expires in 3 days). The agent ranks: fix build, renew cert, update docs. The operator moves cert above build.",
    factChips: ["Reason per task", "Reorderable", "Learns from overrides"],
  },
  {
    id: "subtask-generation",
    contentReady: true,
    name: "Subtask Generation",
    summary:
      "The agent breaks a complex task into subtasks with expected results, and shows how they fit together.",
    mode: { primary: "propose" },
    level: {
      primary: "L3",
      notes: {
        L3: "The operator reviews the proposed subtasks and can edit, reorder, or remove any of them.",
        L4: "Teams see the breakdown and who owns each subtask once accepted.",
      },
    },
    triggers: [
      "A task is too complex for one step",
      "A person asks to break down a task",
      "A peer agent returns a task as too broad to accept",
    ],
    audience: ["operator", "team"],
    channels: ["shared_ui"],
    responses: ["accept", "edit", "decline"],
    spec: "When a task is too complex for one step, the agent proposes to the person operating it in a system with many agents and one person in the loop, through a shared UI, and expects them to accept the subtasks, edit them, or decline.",
    source: "ioc",
    merged_from: ["Subtask Generation (v3, Nucleux)"],
    evidence: "not_rated",
    whatItSolves:
      "A complex task becomes a small set of defined subtasks a person can review before work begins, instead of being handed off as one opaque job.",
    interactionModel:
      "The agent breaks the task into an ordered set of subtasks with expected results and marks any dependencies. The person reviews, edits any subtask, reorders them, or removes some. On accept, the subtasks become trackable children of the parent task.",
    interactionSteps: [
      { title: "Break down", description: "Propose an ordered set of subtasks with expected results." },
      { title: "Show dependencies", description: "Mark which subtasks depend on which others so review knows the order." },
      { title: "Accept as work", description: "On accept, the subtasks are tracked as children of the parent task." },
    ],
    whereItEmbeds:
      "In a shared task view, nested under the parent task. Pairs with Task Creation, which makes the parent, and Task Assignment, which routes each subtask to a peer when needed.",
    example:
      "For 'reduce checkout p99 latency', the agent proposes: measure current p99 by endpoint, identify the top two slow endpoints, profile them, propose fixes with risk notes, measure after. The operator edits the fixes subtask to require risk notes.",
    factChips: ["Ordered breakdown", "Editable before accept", "Dependencies shown"],
  },
];

export const NEW_AGENTIC_DETAILS: Pattern[] = AUTHORED.map((entry) => ({
  ...entry,
  composes_with: [],
  conflicts_with: [],
  v1_slugs: [],
  implementation: { status: "none" as const },
}));
