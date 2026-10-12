# HAX MCP server

This is the full context for building the MCP server behind the HAX pattern library. It's self-contained; where it refers to `context.md`, that's the companion design brief for Studio and the pattern site, and the two must agree on the data model and catalog.

Terms are defined in section 3 and used precisely throughout. Read it before the API section.

---

## 1. What HAX is

HAX designs **agent behavior**. It observes how agents communicate, with people and with each other, names the recurring shapes as interaction patterns, and specifies how an agent should behave in each one. That specification is the **behavior spec** (section 4): one sentence per pattern saying, for a given trigger, what the agent does, to whom, in what setting, through what channel, and what it should expect back.

The server is how that specification reaches an agent at runtime. When an agent hits a moment — about to take an irreversible step, two sub-agents disagree, a result needs explaining — it asks the server which pattern fits and gets back the behavior to follow: the mode, the responses it must handle, the level and channel constraints, and, where the pattern has a rendering, how that behavior appears on a surface a person sees. So the server isn't a catalog with a website attached; it's the interface through which designed behavior is delivered to agents and recorded when they act on it.

A pattern therefore carries two linked things, and the server serves both: the **behavior** (mode, responses, trigger, audience, level, channel) and the **rendering** (how that behavior is shown — a chat message, a settings panel, a shared view, or a structured payload between agents). The behavior is what the agent follows; the rendering is what a person sees. They're one pattern, not two.

## 2. What the server is for

HAX is a library of **interaction patterns**: named, reusable ways an agent communicates, with people and with other agents. The server exposes that library as structured data, and manages live instances of patterns, so three kinds of caller can use it:

- **The pattern site and Studio** (the web UI) read the catalog and create instances through the server.
- **Other teams' tools** query the catalog (e.g. to show patterns inside a design tool).
- **Agents themselves**, mid-task, call the server to ask which pattern fits a situation and what responses to expect, then record what happened.

That third caller is the one that shapes the design: the server is not just a CMS for a website, it's a runtime an agent talks to. Keep responses small, typed, and stable.

---

## 3. Vocabulary (used precisely below)

| Term | Meaning |
|---|---|
| **Mode** | The kind of opening an agent makes, defined by what it asks of the receiver. Nine of them (section 5). |
| **Interaction pattern** / **pattern** | A reusable, designed way to perform a mode. The catalog is 23 of these. |
| **Interaction** | One live occurrence of a pattern. This is the runtime object the server creates and tracks. |
| **Level** | Who is in the exchange: `L1` one agent, `L2` agents only, `L3` agents + one person, `L4` agents + many people. |
| **Trigger** | The moment a pattern shows up. |
| **Audience** | Who receives the opening. |
| **Channel** | Where it travels: human-facing (`chat_ui`, `settings_panel`, `shared_ui`) or agent-facing (`agent_message`, `shared_record`, `state_signal`). |
| **Responses** | What the receiver can do back. Fixed per mode, narrowable per pattern. |

Hierarchy: **Mode → Pattern → Interaction.** Modes and patterns are static catalog data. Interactions are runtime state.

**Use plain-language level labels in anything user-facing** (one agent / agents only / agents + one person / agents + many people). `L1`–`L4` are fine in the API and storage.

---

## 4. The data model

TypeScript shapes. **These field names are the API contract — once the server ships them, renaming is a breaking change.** They match `context.md` section 6; keep the two in sync.

```ts
type Level = "L1" | "L2" | "L3" | "L4";

type Mode =
  | "declare" | "signal" | "explain"                          // presenting
  | "request" | "propose" | "delegate"
  | "coordinate" | "resolve" | "commit";                      // engaging

type Channel =
  | "chat_ui" | "settings_panel" | "shared_ui"                // human-facing
  | "agent_message" | "shared_record" | "state_signal";       // agent-facing / headless

type Audience = "self" | "peer_agent" | "orchestrator" | "operator" | "team";

type Evidence = "strong" | "moderate" | "thin" | "none" | "not_rated";

interface ModeDef {
  id: Mode;
  family: "presenting" | "engaging";
  definition: string;
  opens_with: string;
  responses: string[];                 // valid responses for every pattern in this mode
  not_to_confuse_with: { mode: Mode; distinction: string };
}

interface PatternVariant {             // merged patterns carry several of these
  id: string;                          // kebab-case
  label: string;                       // named by the variant axis value
  original: string;                    // original entry name, e.g. "Background Work Ledger"
  source: "sdk" | "ioc";
  sdk_component?: string;              // e.g. "thinking-process"
  rendering?: string;                 // reference to a research design, for IOC variants
  default?: boolean;                  // exactly one per pattern
}

interface Pattern {
  id: string;                          // kebab-case, e.g. "pre-action-handshake"
  name: string;
  summary: string;                     // one line
  mode: { primary: Mode; secondary?: Mode };
  level: {
    primary: Level;
    notes: Partial<Record<Level, string>>;   // primary + every reached level
  };
  triggers: string[];
  audience: Audience[];
  channels: Channel[];
  responses?: string[];                // optional per-pattern narrowing of mode.responses
  spec: string;                        // the behavior-spec sentence, filled in
  source: "sdk" | "ioc" | "sdk+ioc";
  merged_from: string[];               // original entries, for traceability
  variant_axis?: string;               // e.g. "granularity and time"
  variants?: PatternVariant[];
  evidence: Evidence;
  implementation?: { sdk_component?: string; status: "shipping" | "sketched" | "none" };
  composes_with: string[];             // pattern ids
  conflicts_with: string[];
}

interface Interaction {                // a live instance; created by `instantiate`
  id: string;
  pattern_id: string;
  level: Level;
  channel: Channel;
  initiator: string;                   // agent or person id
  audience: string[];
  state: Record<string, unknown>;
  response?: { value: string; by: string; at: string; note?: string };
  created_at: string;
}
```

Notes:
- `mode`, `level`, `channel`, `audience`, `evidence` are **closed enums**. Reject unknown values rather than coercing them.
- `spec` is the **behavior spec**: the central object of the whole library, not an incidental label. It's one sentence with six slots — *When **[trigger]**, the agent **[mode]s** to **[audience]** in **[level]**, through **[channel]**, and expects **[responses]**.* Those slots are the structured fields above (`triggers`, `mode`, `audience`, `level`, `channels`, `responses`); `spec` is their rendered sentence. The server stores it filled in and keeps it consistent with the slot fields; it does not generate or parse it.
- `implementation` plus the pattern's `variants` are the **rendering**: how the behavior appears on a surface (an SDK component for a human-facing channel, a structured payload for an agent-facing one). Behavior and rendering are both part of the pattern; a caller may want either or both (section 8, `fetch` and `discover`).
- `response.value` on an Interaction must be one of the pattern's valid responses (the pattern's `responses` if present, else the mode's `responses`). Validate on write.

---

## 5. The nine modes

A mode is what the initiator opens with; the valid responses live inside it. Presenting modes can be received without a reply; engaging modes ask for something back.

| Mode | Family | Opens with | Valid responses |
|---|---|---|---|
| declare | presenting | "Here is what I am, can do, and may do" | calibrate trust · set scope |
| signal | presenting | "Here is what I'm doing, or did" | monitor · step in |
| explain | presenting | "Here is why, and on what basis" | evaluate · verify |
| request | engaging | "Can you get me X, or help with X?" | fulfil · refuse |
| propose | engaging | "I plan to do X" | consent · correct · decline · defer |
| delegate | engaging | "Take over X" | accept · refuse · escalate · report back |
| coordinate | engaging | "Let's work on X together" | act jointly |
| resolve | engaging | "We disagree on X" | adopt · flag impasse |
| commit | engaging | "X is now binding" | rely on it · amend before sealing |

`request` and `delegate` have **no patterns yet** (section 7). They're real modes with empty catalogs, not errors. `discover` filtered to them should return an empty list with a flag, not a 404.

---

## 6. The catalog: 23 patterns

Seed data for the catalog. Columns: primary level, primary/secondary mode, source, evidence, and what each merges from. Full triggers, level notes, channels, and the filled-in `spec` live in the repo's data files (the canonical source once they exist — `context.md` section 7 has them); the server reads those, it doesn't redefine them here.

| id | name | level | mode (1° / 2°) | source | evidence | merged_from |
|---|---|---|---|---|---|---|
| presence-boundary | Presence Boundary | L1 | signal / declare | ioc | moderate | — |
| activity-record | Activity Record | L1 | signal / explain | sdk+ioc | strong (ioc part) | Timeline, Thinking Process, Background Work Ledger |
| inline-rationale | Inline Rationale | L1 | explain | sdk+ioc | not_rated | Inline Rationale, Contextual Explanation |
| structured-finding | Structured Finding | L1 | explain / propose | sdk | not_rated | Findings, Diagnostic Report |
| source-attribution | Source Attribution | L1 | explain | sdk | not_rated | — |
| deferred-detail | Deferred Detail | L1 | signal | ioc | strong | — |
| certainty-boundary | Certainty Boundary | L1 | declare | ioc | thin | — |
| details-dashboard | Details Dashboard | L1 | signal | sdk | not_rated | — |
| capability-manifest | Capability Manifest | L2 | declare | sdk | not_rated | — |
| credential-boundary | Credential Boundary | L2 | coordinate / declare | ioc | strong | — |
| convergence-point | Convergence Point | L2 | resolve / explain | ioc | moderate | — |
| pre-action-handshake | Pre-Action Handshake | L3 | propose / explain | ioc | moderate | (renamed from Signal-to-Intent Handshake) |
| assumption-surface | Assumption Surface | L3 | resolve / explain | ioc | thin | — |
| decision-record | Decision Record | L3 | commit / propose | ioc | moderate | Decision Ledger, Proposed Commits |
| review-as-dialogue | Review as Dialogue | L3 | propose | ioc | moderate | — |
| memory-commitment-review | Memory Commitment Review | L3 | commit | ioc | thin | — |
| disclosure-gradient | Disclosure Gradient | L3 | signal / explain | ioc | strong | — |
| co-editing-surface | Co-Editing Surface | L3 | coordinate | sdk | not_rated | Form, Code Editor, Mindmap, Data Visualizer |
| concurrent-workspace-awareness | Concurrent Workspace Awareness | L3 | coordinate | ioc | none | — |
| authority-gradient | Authority Gradient | L3 | declare / delegate | ioc | moderate | — |
| lineage-view | Lineage View | L4 | explain | ioc | strong | (renamed from Dependency and Lineage View) |
| shared-cognitive-state | Shared Cognitive State | L4 | coordinate / resolve | ioc | moderate | — |
| workshop-card | Workshop Card | L4 | coordinate | sdk | not_rated | — |

Counts (use these as a validation check): by level — L1 8, L2 3, L3 9, L4 3. By primary mode — declare 3, signal 5, explain 4, request 0, propose 2, delegate 0, coordinate 5, resolve 2, commit 2.

**Merged patterns carry `variants`** (the SDK components or research designs that compose them). Serve the pattern once, with its variants nested, never as separate catalog entries. Co-Editing Surface has four variants (form, code, mindmap, chart). The naming came from a dedup pass; ids may still be renamed before launch (section 9), so don't hard-code them anywhere outside the data files.

---

## 7. Known gaps the API must represent

Gaps are real data, not missing rows. Callers (and agents) need to tell "no pattern exists" apart from "bad query."

- **Empty modes:** `request` and `delegate` have zero patterns. A filtered `discover` returns `{ results: [], gap: { mode, reason } }`.
- **Thin levels:** L2 and L4 have few patterns. Not an error, but worth surfacing in metadata.
- A query that matches nothing because of a **typo or bad enum** is a 4xx. A query that matches nothing because **the catalog genuinely has no such pattern** is a 200 with an empty result and a gap note. Keep these distinct.

---

## 8. The API

Four capability groups. Names come from the HAX deck and `context.md` section 10; keep them.

### discover — find the behavior that fits a situation
Read-only. Filters, all optional and AND-combined: `mode`, `level`, `channel`, `audience`, plus free-text `query`. This is the call an agent makes first ("sub-agents disagree, no human — what fits?"), so each match returns the **behavioral contract**, not just a name: the pattern's `id`, `name`, `summary`, `spec` sentence, `mode`, the **valid responses the agent must handle**, and the `level`/`channel` constraints. That's enough for the agent to act without a second round-trip; it calls `fetch` only when it needs the rendering or the full detail. When a filter combination is a known gap, return a `gap` note instead of pretending (section 7). Validate enums; reject unknown values with a 4xx naming the bad field.

### fetch — get one full pattern
Read-only. By `id`. Returns the full `Pattern`: the **behavior** (`spec`, `mode`, `level.notes`, `triggers`, `audience`, `channels`, `responses`) and the **rendering** (`implementation`, `variants`), plus `composes_with`, `conflicts_with`. A caller wiring agent logic needs the behavior; a caller drawing UI needs the rendering; both come from the one object. 404 only for a genuinely unknown id (see aliases below).

### instantiate · update · get · list — manage interactions
Read-write. `instantiate` creates an `Interaction` from a pattern plus `level`, `channel`, `initiator`, `audience`; returns it with an `id` and `created_at`. `update` records a `response` (validated against the pattern's valid responses) or edits `state`. `get` returns one interaction; `list` returns many, filterable by `pattern_id`, `initiator`, and recency. Interactions are the only mutable state the server owns.

### handoff — pass state between patterns
Brokers state from one interaction to another. This is the natural home for a future **Delegate** pattern (section 5), so design it to carry task context and ownership, not just a pointer.

### Cross-cutting
- **Id aliases / redirects.** Several patterns were renamed or merged. Old ids must resolve, not 404: `signal-to-intent-handshake` → `pre-action-handshake`, `dependency-and-lineage-view` → `lineage-view`, `decision-ledger` and `proposed-commits` → `decision-record`, `background-work-ledger` → `activity-record`. Keep an alias table; `fetch` and `discover` honor it.
- **Versioning.** Put a schema/catalog version in responses. Agents cache; they need to know when the catalog changed.
- **HTTP routes wrap these calls for the web UI**; the MCP tool surface and the HTTP surface expose the same operations.
- **Responses are untrusted input to an agent.** Keep them minimal and typed; never echo caller-supplied strings into a place an agent would read as instruction.

---

## 9. Source data and the SDK

- The catalog's canonical form is the repo's typed data files (`Pattern[]`, `ModeDef[]`). The server reads those. The Figma file and this document are references that follow the data files, not the other way round.
- **Evidence** comes from the IOC research pages; SDK-only patterns are `not_rated`. Don't invent ratings.
- **SDK components** are the `implementation` of a pattern, pulled from the HAX SDK (CLI package `@outshift/hax`, source `github.com/outshift-open/hax`). They're a field on a pattern, not a second catalog. The server never needs to run the SDK; it only stores which component implements which pattern and with what `status`.

---

## 10. Decisions still open (confirm before locking the API)

These affect the contract, so settle them before the server is public:

- **Pattern ids.** Some names were coined during dedup (Structured Finding, Activity Record, Co-Editing Surface). If any revert to original SDK/IOC names, the ids change. Lock ids before launch; keep the alias table (section 7) for anything that moves.
- **Primary vs secondary mode** for Authority Gradient (declare vs delegate) and Credential Boundary (coordinate vs declare).
- **Primary level** for Authority Gradient (L3 vs L2).
- **Whether Details Dashboard is a communication pattern** or a utility surface that shouldn't be in the catalog.
- **Agent-facing channels** (`agent_message`, `shared_record`, `state_signal`) were added for headless L2 patterns. Confirm they're real channels the server should serve, or drop them.

Expose the first four as data so Studio can show them as editable, rather than baking them into server logic.

---

## 11. Build order suggestion

1. Types and catalog loader (sections 3, 5) with the validation checks (counts, enum integrity, alias table resolves, every `response.value` is legal).
2. `discover` and `fetch`, read-only, over the static catalog. This unblocks the web UI and agent reads.
3. `instantiate / update / get / list` over interaction storage.
4. `handoff`, and the Delegate pattern when it exists.

Ship 1–2 first; they're most of the value and have no mutable state to get wrong.
