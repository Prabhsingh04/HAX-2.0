// HAX 2.0 component library: 45 components in 8 families, grouped by the job each one does
// between a person and an agent. Replaces the 89-entry stage list in ./data (Onboarding,
// Initially…), which grouped by principle. `covers` lists the old entries a component takes
// over (ids from ./data), so old /pattern links land on the component that absorbed them.
export type Comp = { id: string; name: string; line: string; covers: string[] };
// `lead` is the component whose preview stands for the family on Home.
export type Family = { id: string; name: string; job: string; lede: string; lead: string; comps: Comp[] };

export const FAMILIES: Family[] = [
  {
    id: "composers", name: "Composers", job: "Where a person gives the agent work.",
    lede: "Where a person gives the agent work: the input, what goes into it, and the starting points that get people past an empty box.",
    lead: "prompt-input",
    comps: [
      { id: "prompt-input", name: "Prompt input", line: "The box where people type, talk or attach files, with the mode and model right there.",
        covers: ["open-input", "attachments", "voice-input", "visual-input", "handwriting", "gesture", "structured-input", "modes", "model-selection", "model-mgmt", "prompt-enhancer", "reply"] },
      { id: "source-picker", name: "Source picker", line: "Lets people choose where the agent looks: the web, a shared drive, a wiki or a repo.", covers: [] },
      { id: "suggested-prompts", name: "Suggested prompts", line: "Ready-made asks that get people past the empty box.", covers: ["suggested-prompts"] },
      { id: "suggestions", name: "Suggestions", line: "Next steps the agent offers inside the input, based on what is open right now.", covers: ["suggestions"] },
      { id: "prompt-templates", name: "Prompt templates", line: "A sentence with blanks to fill, so a good ask takes seconds.", covers: ["templates", "madlibs"] },
      { id: "example-gallery", name: "Example gallery", line: "Finished examples people can start from, so they see what is possible.", covers: ["example-gallery"] },
    ],
  },
  {
    id: "artifacts", name: "Artifacts", job: "What the agent makes from your data, beyond plain text.",
    lede: "What the agent makes from your data, beyond plain text: summaries, tables, charts, documents and media that people can read, edit and reuse.",
    lead: "chart",
    comps: [
      { id: "streaming", name: "Streaming", line: "The answer appears as it is written, with a way to stop it.", covers: ["streaming"] },
      { id: "summary", name: "Summary", line: "Long material cut down to the points and decisions that matter.", covers: ["summary", "synthesis"] },
      { id: "table", name: "Table", line: "Data the agent pulled together, laid out to compare and edit.", covers: ["structured-output"] },
      { id: "chart", name: "Chart", line: "Numbers the agent found, drawn as a chart with the key change called out.", covers: [] },
      { id: "variations", name: "Variations", line: "A few versions side by side, so people pick instead of asking again.", covers: ["variations"] },
      { id: "media", name: "Media", line: "Audio, slides and video in the answer, not only text.", covers: ["multimodal"] },
      { id: "transcript", name: "Transcript", line: "Who said what and when, with the action items pulled out.", covers: ["transcript"] },
      { id: "canvas", name: "Canvas", line: "The work sits beside the chat, and the person and the agent both edit it.", covers: ["shared-vision", "visual-editing"] },
      { id: "form-fill", name: "Form fill", line: "The agent fills in a form, and every field shows what it filled.", covers: ["auto-fill"] },
      { id: "refine-menu", name: "Refine menu", line: "Select any part of a result and fix just that part.",
        covers: ["inline-action", "transform", "expand", "restructure", "restyle", "regenerate", "inpainting"] },
    ],
  },
  {
    id: "collectors", name: "Collectors", job: "Where the agent stops and asks the person for something.",
    lede: "Where the agent stops and asks. It needs a choice, a missing detail or a reaction before it can carry on, or do better next time.",
    lead: "clarifying-question",
    comps: [
      { id: "clarifying-question", name: "Clarifying question", line: "When the ask is unclear, the agent asks instead of guessing.", covers: ["follow-up"] },
      { id: "choice-picker", name: "Choice picker", line: "The agent offers a few options and waits for the person to pick one.", covers: [] },
      { id: "form-request", name: "Form request", line: "The agent asks for the details it is missing, in a short form.", covers: [] },
      { id: "feedback", name: "Feedback", line: "Thumbs up or down with a reason, on any answer.", covers: ["feedback"] },
    ],
  },
  {
    id: "controllers", name: "Controllers", job: "Where a person steers or limits the agent, at any time.",
    lede: "Where a person steers or limits the agent at any time: stop it, set what it can touch, decide what it remembers, go back.",
    lead: "capabilities",
    comps: [
      { id: "stop-and-pause", name: "Stop and pause", line: "Stop or pause the agent mid-task, and see how far it got.", covers: ["controls"] },
      { id: "capabilities", name: "Capabilities and connections", line: "What the agent can do, which apps it can use, and when it has to ask.",
        covers: ["disclaimer", "connectors", "mcp", "knowledge-base"] },
      { id: "memory", name: "Memory", line: "What the agent remembers about a person, which they can see, edit or switch off.",
        covers: ["memory", "incognito", "personalization"] },
      { id: "checkpoints", name: "Checkpoints and branches", line: "Go back to any earlier point, or try another path without losing this one.", covers: ["branches"] },
    ],
  },
  {
    id: "approvals", name: "Approvals", job: "Where the agent waits for a yes before something happens.",
    lede: "Where the agent waits for a yes. Before anything risky, costly or permanent happens, the person sees it and decides.",
    lead: "approval-card",
    comps: [
      { id: "approval-card", name: "Approval card", line: "Before a big step, the agent shows what it will do and what it will cost.", covers: ["verification", "cost-estimates"] },
      { id: "permission-request", name: "Permission request", line: "The agent asks to use a tool or read data, and shows exactly what it will send.", covers: ["consent"] },
      { id: "preview-before-run", name: "Preview before run", line: "The agent runs one sample first, so the person can check it before it runs on everything.",
        covers: ["preview", "sample-response", "draft-mode"] },
      { id: "diff-view", name: "Diff view", line: "Before and after of what the agent changed, accepted or rejected change by change.", covers: [] },
    ],
  },
  {
    id: "workflows", name: "Workflows", job: "The shape and progress of work that takes many steps.",
    lede: "The shape and progress of work that takes many steps: the plan, the tasks, the hand-offs, and where everything stands.",
    lead: "workflow-canvas",
    comps: [
      { id: "plan", name: "Plan", line: "The steps the agent will take, which the person can edit before it starts.",
        covers: ["action-plan", "subtask-generation", "priority-ranking"] },
      { id: "task-list", name: "Task list", line: "Tasks the agent created, with owners and due dates, ready to send to a tracker.", covers: ["task-creation"] },
      { id: "hand-off", name: "Hand-off", line: "Work moving between agents and people, and who has it now.", covers: ["task-assignment"] },
      { id: "progress-steps", name: "Progress steps", line: "What the agent is doing right now, step by step, in real words.", covers: ["processing-steps"] },
      { id: "workflow-canvas", name: "Workflow canvas", line: "A multi-step automation drawn as connected steps, with the human checks marked.", covers: ["chained-action"] },
    ],
  },
  {
    id: "explorers", name: "Explorers", job: "Where a person looks into what the agent did and why.",
    lede: "Where a person looks into what the agent did and why: its thinking, its sources, the tools it used and how sure it is.",
    lead: "tool-call",
    comps: [
      { id: "reasoning", name: "Reasoning", line: "The agent's thinking, folded away until someone opens it.", covers: ["stream-of-thought"] },
      { id: "sources", name: "Sources", line: "Numbered citations in the answer, with the source list beneath.", covers: ["citations", "references"] },
      { id: "confidence", name: "Confidence", line: "How sure the agent is about each claim it makes.", covers: ["confidence"] },
      { id: "activity-log", name: "Activity log", line: "Everything the agent did, in order, with a recap at the top.", covers: ["footprints"] },
      { id: "tool-call", name: "Tool call", line: "Each tool the agent used: what it sent, what came back and how long it took.", covers: [] },
      { id: "rationale", name: "Rationale", line: "A verdict and the reason behind it, right next to the result.", covers: [] },
      { id: "usage-meter", name: "Usage meter", line: "How much context, time and credit the agent has used, and what is left.", covers: [] },
    ],
  },
  {
    id: "notifiers", name: "Notifiers", job: "Where the agent tells a person something without being asked.",
    lede: "Where the agent speaks up without being asked: what it made, who is acting, what it noticed, what changed and what went wrong.",
    lead: "proactive-suggestion",
    comps: [
      { id: "ai-label", name: "AI label", line: "Marks what the agent made, with a reminder to check it.", covers: ["disclosure", "caveat", "watermark"] },
      { id: "agent-avatar", name: "Agent avatar", line: "Shows which agent is acting, and whether it is working, waiting or idle.", covers: ["avatar"] },
      { id: "proactive-suggestion", name: "Proactive suggestion", line: "The agent spots something and offers to help, once, and it is easy to dismiss.", covers: ["proactive"] },
      { id: "update-notice", name: "Update notice", line: "Tells people when the agent, its model or its rules have changed.", covers: ["update-notice"] },
      { id: "error-message", name: "Error message", line: "What went wrong, why, and the one button that fixes it.", covers: ["error-empty"] },
    ],
  },
];

export const COMPS = FAMILIES.flatMap((f) => f.comps.map((c) => ({ c, f })));
export const BY_COMP = new Map(COMPS.map((x) => [x.c.id, x]));
// Old /pattern ids: an absorbed entry opens the component that took it over.
export const FROM_OLD = new Map(COMPS.flatMap((x) => x.c.covers.map((old) => [old, x.c.id] as const)));
// Components with nothing to take over are new in HAX 2.0, except Rationale, carried over from HAX 1.0.
export const ORIGIN: Record<string, string> = { rationale: "Carried over from HAX 1.0, where it was called Inline Rationale." };
