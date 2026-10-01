# Agent UX Patterns

Seventeen interaction patterns for designing trustworthy human–agent systems, grounded in practitioner research.

| # | Pattern | Status |
|---|---------|--------|
| 01 | [Presence Boundary](#01--presence-boundary) | Modeled |
| 02 | [Signal-to-Intent Handshake](#02--signal-to-intent-handshake) | Planned |
| 03 | [Background Work Ledger](#03--background-work-ledger) | Planned |
| 04 | [Assumption Surface](#04--assumption-surface) | Planned |
| 05 | [Memory Commitment Review](#05--memory-commitment-review) | Ready |
| 06 | [Concurrent Workspace Awareness](#06--concurrent-workspace-awareness) | Planned |
| 07 | [Review as Dialogue](#07--review-as-dialogue) | Planned |
| 08 | [Dependency and Lineage View](#08--dependency-and-lineage-view) | Planned |
| 09 | [Authority Gradient](#09--authority-gradient) | Planned |
| 10 | [Shared Cognitive State](#10--shared-cognitive-state) | Modeled |
| 11 | [Credential Boundary](#11--credential-boundary) | Grounded |
| 12 | [Disclosure Gradient](#12--disclosure-gradient) | Grounded |
| 13 | [Decision Ledger](#13--decision-ledger) | Grounded |
| 14 | [Proposed Commits](#14--proposed-commits) | None |
| 15 | [Deferred Detail](#15--deferred-detail) | Grounded |
| 16 | [Convergence Point](#16--convergence-point) | Hypothesis |
| 17 | [Certainty Boundary](#17--certainty-boundary) | Hypothesis |

---

### 01 · Presence Boundary

**Status:** Modeled · **Slug:** `presence-boundary`

Shows at a glance whether an agent is idle, observing, working, waiting, or acting, what it is currently scoped to touch, and gives one place to pause it or narrow its reach.

Operators lose trust when agent activity is invisible or overly exposed. Presence Boundary makes agent state and scope legible without dumping orchestration detail: so people can intervene before autonomy drifts out of bounds.

**Example:** A compact status strip: “Observing · 3 repos · can open tickets.” One click narrows scope to read-only or pauses the agent mid-run.

**Evidence:**

- “We did notice that when it is transparent that there are multiple agents behind the scenes, it becomes complex enough that people don't have as much trust in the system.” : Everaldo Aguiar, Director of Applied AI, PagerDuty

---

### 02 · Signal-to-Intent Handshake

**Status:** Planned · **Slug:** `signal-to-intent-handshake`

Lets the agent explain what it noticed and what it thinks it means before it acts.

Surprise automation erodes control. This pattern forces a brief human-readable checkpoint: what changed, why it matters, and what the agent proposes: before any irreversible step.

**Example:** Alert fires → agent surfaces: “CPU spike on svc-payments. I interpret this as retry storm. Proposed next step: scale replicas. Proceed?”

**Note:** Sibling pattern to Convergence Point: agent-to-human before acting; Convergence Point is agent-to-agent after converging.

---

### 03 · Background Work Ledger

**Status:** Planned · **Slug:** `background-work-ledger`

Shows what happened while you were away: actions, tools, assumptions, results, open questions.

Async agent work feels like a black box when users return. A ledger reconstructs the narrative so they can approve, undo, or steer without replaying raw logs.

**Example:** Timeline card: 09:14 queried logs · 09:16 assumed cache miss · 09:18 opened PR draft · open question: confirm owner team?

---

### 04 · Assumption Surface

**Status:** Planned · **Slug:** `assumption-surface` · **Pairs with:** [16 · Convergence Point](#16--convergence-point)

Show why agents reached different conclusions: what each could see, what it filled in, what it concluded.

Agents disagree because they hold different context and fill the gaps differently. This surfaces the filling in. Each agent is shown in three layers, context held, assumptions made, interpretation drawn, so a disagreement can be traced back to the specific assumption that caused it.

**Example:** Refund agent assumed the dispute covers one charge. Subscriptions agent assumed the plan renewed on the old card. Same account, opposite conclusions.

**Evidence:**

- "Why do you want your main agent make all the decisions?" : Ali Nahvi, IoC concept sharing study
- "The more consolidation you do, the less conflict." : Ali Nahvi, IoC concept sharing study

---

### 05 · Memory Commitment Review

**Status:** Ready · **Slug:** `memory-commitment-review`

When an agent updates its belief mid-session, prior reasoning becomes stale. A person chooses whether to accept the change, restore the old belief, or exclude it from long-term memory.

Finance Agent opens with an 8% discount off a 12% baseline from recent renewals. When Customer Success validates a 3.4x correlation across the full book, the 12% baseline becomes stale—it was operative, now it's not. The pattern marks it: shows the old belief (dashed, muted) and the new reasoning (solid, full). At the end of the session, when learning goes into Cognitive Fabric, a person reviews: the validated correlation, the recomputed margin, the expansion exposure Salesforce surfaced. Each one: keep it, revert it, or forget it. Their call is recorded, so the next renewal starts with a record of not just what was decided, but what was considered stale and why.

**Example:** Scenario: pricing negotiation with a mid-size customer. Finance Agent: "Baseline churn = 12%, justifies 8% off". Customer Success: "Actually, we have 3.4x correlation across 1,200 accounts. Baseline should be 41% churn". Pattern surfaces: 12% baseline now marked stale; 41% is the operative belief. Later, at commit: Person reviews the stale belief, the new math, and the expansion risk. Acknowledges all three to memory. Next renewal: new agent sees not just the 41% number, but the 12% that was replaced and why.

**Evidence:**

- “The regulator keeps probing us: can you explain how did you come to this outcome?” : Alok Gupta, AI Leader, Global Bank
- “Every time we retrain, we have to keep that audit log, create documentation, make sure the right stakeholders fully understand the change between the previous model and the newly retrained model.” : Alok Gupta, AI Leader, Global Bank

---

### 06 · Concurrent Workspace Awareness

**Status:** Planned · **Slug:** `concurrent-workspace-awareness`

Helps agents read live human edits as feedback, override, or unrelated work.

Humans and agents editing the same artifact need shared situational awareness: otherwise the agent treats every human change as noise or contradiction.

**Example:** Banner: “You edited paragraph 2 while Agent was drafting section 3: treat your edit as override or parallel draft?”

---

### 07 · Review as Dialogue

**Status:** Planned · **Slug:** `review-as-dialogue`

Turns approval into a learning and steering moment, not just a yes/no gate.

Binary approve/reject wastes teaching signal. Dialogue captures why something was rejected and feeds that back into the next iteration.

**Example:** Instead of [Reject], user picks: “Wrong audience” → agent asks one clarifying question → revised draft.

---

### 08 · Dependency and Lineage View

**Status:** Planned · **Slug:** `dependency-and-lineage-view`

Shows what claims, artifacts, and decisions depend on a given agent output.

Downstream decisions stack on upstream agent outputs. Lineage makes blast radius visible before someone acts on stale or disputed conclusions.

**Example:** Graph: RCA summary → remediation plan → change ticket. Highlight: “3 teams still cite this summary.”

---

### 09 · Authority Gradient

**Status:** Planned · **Slug:** `authority-gradient`

Makes autonomy level visible and adjustable by workflow area.

Supervisor/subordinate structures help when intents collide and context must roll up. Authority Gradient exposes who can decide what: and lets operators tighten or loosen autonomy by domain.

**Example:** Slider per domain: “Deploy to staging: autonomous · Deploy to prod: human confirm · Data access: read-only.”

**Evidence:**

- “You know, beyond, you know, for example, this multi-agent has been going around for 2+ years. Even in my startup, it was a multi-agent system with this kind of supervisor, uh, and subordinate kind of approach.” : Dongxue Zhou, Head of Applied AI, Arcade
- “I think supervisor will have the full context and overarching goal of the task.” : Dongxue Zhou, Head of Applied AI, Arcade

---

### 10 · Shared Cognitive State

**Status:** Modeled · **Slug:** `shared-cognitive-state`

A common view of goals, assumptions, conflicts, and open questions across humans and agents.

When organizations can’t share data or intent across boundaries, agents need a negotiated shared state: not a fantasy single database.

**Example:** Shared board: goals · assumptions · open conflicts · owners. Human and agent both write; conflicts flagged before execution.

**Evidence:**

- “You are inherently assuming that in a bank we have a single database, but the reality is not.” : Alok Gupta, AI Leader, Global Bank
- “In Oman, we are not allowed to share financial crime data with the people who are making a credit decision. The China wall between these two functions, we can't share the data.” : Alok Gupta, AI Leader, Global Bank

---

### 11 · Credential Boundary

**Status:** Grounded · **Slug:** `credential-boundary` · **Pairs with:** [10 · Shared Cognitive State](#10--shared-cognitive-state)

Multi-agent value is strongest where no single agent can legally, technically, or organizationally hold all required access.

Multi-agent isn’t about more models: it’s about crossing access walls. Design for federated credentials and purpose-bound agents instead of one super-agent with every key.

**Example:** Fraud agent (AML scope) + credit agent (lending scope) coordinate via policy broker: neither holds the other’s raw data.

**Evidence:**

- “In Oman, we are not allowed to share financial crime data with the people who are making a credit decision. The China wall between these two functions, we can't share the data.” : Alok Gupta, AI Leader, Global Bank
- “You are inherently assuming that in a bank we have a single database, but the reality is not.” : Alok Gupta, AI Leader, Global Bank

---

### 12 · Disclosure Gradient

**Status:** Grounded · **Slug:** `disclosure-gradient` · **Pairs with:** [01 · Presence Boundary](#01--presence-boundary)

Surfacing all complexity at once drives cognitive overload. Reveal outcomes first, reasoning and coordination only on demand.

Transparency of every sub-agent erodes trust and usability. Progressive disclosure keeps the default path simple while preserving depth for skeptics and auditors.

**Example:** Default: “Incident mitigated.” Expand: routing decision → agent graph → full trace (postmortem mode).

**Evidence:**

- “We did notice that when it is transparent that there are multiple agents behind the scenes, it becomes complex enough that people don't have as much trust in the system.” : Everaldo Aguiar, Director of Applied AI, PagerDuty
- “We had iterations where the user would have to specify which agent they wanted to interact with. That very quickly became complex enough that folks were just defaulting to how they used to operate beforehand.” : Everaldo Aguiar, Director of Applied AI, PagerDuty

---

### 13 · Decision Ledger

**Status:** Grounded · **Slug:** `decision-ledger` · **Pairs with:** [05 · Memory Commitment Review](#05--memory-commitment-review)

In regulated environments, every agent decision comes with a documentation obligation. Auditability can't be retrofitted.

Regulators and internal risk teams ask “how did you get here?” The ledger captures decision rationale at commit time: not after an incident.

**Example:** Each automated decision logs: inputs · policy version · model · approver · exportable audit packet.

**Evidence:**

- “The regulator keeps probing us: can you explain how did you come to this outcome?” : Alok Gupta, AI Leader, Global Bank
- “Every time we retrain, we have to keep that audit log, create documentation, make sure the right stakeholders fully understand the change between the previous model and the newly retrained model.” : Alok Gupta, AI Leader, Global Bank

---

### 14 · Proposed Commits

**Status:** None · **Slug:** `proposed-commits` · **Pairs with:** [13 · Decision Ledger](#13--decision-ledger)

The action waiting to commit: agent reason, optional operator context, and the controls to seal or decline.

Before anything enters the ledger, the agent presents what it proposes to do and why. The operator can commit with the agent reason as written, add context the agent could not know, or decline with a reason. Each exit writes a sealed record into Decision Ledger. Nothing in this surface is read-only history.

**Example:** Restart svc-payments, CHG-2231: agent reason cites memory at 91 percent of limit. Operator adds that the vendor engineer is on site today, then commits. The sealed record moves to Decision Ledger.

**Note:** Split from Decision Ledger; not yet validated as a separate pattern name.

---

### 15 · Deferred Detail

**Status:** Grounded · **Slug:** `deferred-detail` · **Pairs with:** [12 · Disclosure Gradient](#12--disclosure-gradient)

The agent holds detail back while you are fixing things, then opens it up afterwards so you can see what keeps going wrong.

The same detail lands differently depending on when it appears. While the work is still in progress, the agent shows a short status and keeps the rest back, with a count of what it is holding so nothing looks missing. Once the work is done, the detail opens: the sequence of steps, the tool calls, and the points where the agent's reading of the situation changed. Nothing is discarded in either mode, only shown at different times.

**Example:** While it is running: one line, plus a count of 17 steps recorded and held. After: the steps open up, with the moment the agent's reading changed marked on the timeline.

**Evidence:**

- “If the idea is to have this be something used in practice mid-incident, folks really want to focus on just resolving the incident. The less information you provide and the more abstraction you build in, the better.” : Everaldo Aguiar, Director of Applied AI, PagerDuty
- “This I can see as something that would be very informative in retrospect, when you are doing a postmortem, learning from previous incidents, finding patterns.” : Everaldo Aguiar, Director of Applied AI, PagerDuty

---

### 16 · Convergence Point

**Status:** Hypothesis · **Slug:** `convergence-point` · **Pairs with:** [02 · Signal-to-Intent Handshake](#02--signal-to-intent-handshake)

Practitioners expect clear explanation of how multiple agents converged on an adopted answer, not just what was decided.

When sub-agents disagree, users need to see convergence mechanics: what was adopted, what was flagged as impasse, and why: not a opaque final string.

**Example:** Panel: Agent A (logs) vs Agent B (code) → conflict resolver scores sources → “Adopted: rollback” · “Impasse: root cause unsettled.”

**Evidence:**

- “Yeah, think of it as the convergence, right, that you have here. So all of these different agents would feed into that convergence point, which was a conflict resolution agent, which would further feed in, which would further output the adopted answer versus the flag impasse. So that's how we would structure it.” : Aman Chadra, Senior Staff Tech Lead, Google DeepMind

---

### 17 · Certainty Boundary

**Status:** Hypothesis · **Slug:** `certainty-boundary`

Practitioners separate deterministic/API-driven work from dynamic generation, tying the latter to hallucination risk.

Not every step should be LLM-improvised. Bound deterministic tool paths from open-ended planning so teams know where outputs are repeatable vs generative.

**Example:** Workflow map: green = fixed API steps · amber = planner chooses tools · red = dynamic generation (requires review).

**Evidence:**

- “How to choose a tool to do a specific task is a non-deterministic thing.” : Anshu Tiwari, Director of Engineering, Blue Yonder
- “So I would say, like, first thing is, like, identification of, like, identification or designing of it in a well mix of deterministic versus non-deterministic thing.” : Anshu Tiwari, Director of Engineering, Blue Yonder
