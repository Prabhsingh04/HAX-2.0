// ============================================================
// HAX · global.js
// Universal search + persona-aware agentic assistant + immersive
// sandbox. Loaded on every page after patterns.js.
// Self-contained: injects its own DOM, no markup changes needed.
// ============================================================
(function () {
  const ready = (fn) => document.readyState !== "loading"
    ? fn()
    : document.addEventListener("DOMContentLoaded", fn);

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));

  // ───────────────────────────────────────────────────────
  // Lumen, the discovery agent.
  // Opens with intent paths (not a persona form). Identifies
  // role naturally when relevant. Can recommend patterns,
  // surface real Intelligaia work, or set up a chat.
  // ───────────────────────────────────────────────────────

  // Top-level intents the prospect can pick on first open.
  const DISCOVERY_INTENTS = [
    { id:"tour-library",     icon:"🧭", label:"Walk me through your library",       desc:"84 agentic UX patterns across 4 stages" },
    { id:"building-product", icon:"🏗",  label:"I'm building an agentic product",    desc:"I'll help you find the right patterns" },
    { id:"case-studies",     icon:"📂", label:"Show me your case studies",          desc:"Real work for enterprise teams" },
    { id:"contact-team",     icon:"✉️", label:"Connect me with the team",           desc:"Quick intro to the right person" }
  ];

  // Curated representative Intelligaia engagements. Each links out to the public site
  // and can be swapped for real case-study URLs as they come online.
  const CASE_STUDIES = [
    { id:"ai-eam",            tag:"AI agents · enterprise", title:"AI-assisted enterprise asset management", desc:"A field copilot for inspectors and operators across global utilities.",        href:"https://www.intelligaia.com/work" },
    { id:"subscription-billing", tag:"Enterprise SaaS",     title:"Subscription billing UX",                   desc:"Rebuilt the quote-to-cash flow for a complex catalogue.",                       href:"https://www.intelligaia.com/work" },
    { id:"enterprise-ds",     tag:"Design system",          title:"Enterprise design system",                  desc:"A native component kit serving a Fortune-500 product portfolio.",               href:"https://www.intelligaia.com/work" },
    { id:"agentic-devtools",  tag:"Agentic UX",             title:"Agentic developer tools",                   desc:"A multi-step coding agent surfaced inside the IDE and the review loop.",        href:"https://www.intelligaia.com/work" }
  ];

  // Six persona chips matching the playbook ICP. Offered only when the user
  // signals they're building something — never as a forced opener.
  const PERSONAS = [
    { id:"ai-platform-lead",   label:"AI Platform Lead",                desc:"Shipping agents to production",       icon:"🏗" },
    { id:"ai-experience-lead", label:"AI Experience Lead",              desc:"Designing AI across surfaces",        icon:"🎨" },
    { id:"ai-strategy-lead",   label:"AI Strategy Lead",                desc:"Driving enterprise transformation",   icon:"🎯" },
    { id:"enterprise-cto",     label:"Enterprise CTO",                  desc:"Governing AI at scale",               icon:"🏛" },
    { id:"designer",           label:"Senior Designer",                 desc:"Picking patterns for a project",       icon:"✏️" },
    { id:"browser",            label:"Just exploring",                  desc:"Take me on a quick tour",              icon:"👋" }
  ];

  // Verbatim opening lines per persona — sourced from the playbook scenarios.
  const STARTER_PROMPTS = {
    "ai-platform-lead": [
      "How do you handle tool-call transparency in production?",
      "Show me your patterns for streaming and cost control",
      "I'm shipping in 6 weeks — what can't I miss?",
      "What's your stance on action plans vs autonomous execution?"
    ],
    "ai-experience-lead": [
      "How do I build a consistent AI design system across products?",
      "Show me identity patterns for the agent",
      "Our agent feels different in chat than in the IDE",
      "I'm bringing two designers onto an AI feature — where do I start them?"
    ],
    "ai-strategy-lead": [
      "What should we ship first?",
      "I'm building our AI roadmap for next year",
      "I'm presenting agentic UX to our board next month",
      "Different business units keep building one-off agents"
    ],
    "enterprise-cto": [
      "How do you handle data ownership at enterprise scale?",
      "Compliance keeps blocking us — what patterns help?",
      "We have 12 product teams — how do I roll one library across them?",
      "Where does HAX sit in our architecture?"
    ],
    "designer": [
      "I need a disclosure pattern for chat",
      "Show me the best variants for empty states",
      "What in-context placement should I pick?",
      "Help me handle confidence and uncertainty"
    ],
    "browser": [
      "What is HAX?",
      "Show me the four stages",
      "Take me to the most important patterns",
      "Where do I start?"
    ]
  };

  // Scripted responses: prompt → curated patterns + suggested follow-ups.
  // Each response can optionally enable an immersive sandbox preset.
  const RESPONSES = {
    "How do I design a trustworthy AI experience?": {
      body: "Trust starts before the first prompt. Three foundational patterns: a visible <b>Disclosure</b> that this is AI; a <b>Consent</b> flow before data leaves the device; and a persistent <b>Caveat</b> that output can be wrong.",
      patterns: ["disclosure", "consent", "caveat"],
      followups: ["Show me identity patterns", "How do I handle errors gracefully?"],
      sandbox: { templates: ["chat", "rightrail"], patterns: ["disclosure", "caveat"], title: "Trust foundations" }
    },
    "What patterns prevent over-reliance on AI?": {
      body: "Three signals keep users grounded. The <b>Caveat</b> reminds them output may be wrong, <b>Confidence Indicators</b> tag how sure the agent is, and <b>Citations</b> let them verify any factual claim.",
      patterns: ["caveat", "confidence", "citations"],
      followups: ["What error patterns should I plan for?", "Show me trust scaffolding for chat"],
      sandbox: { templates: ["chat"], patterns: ["caveat", "confidence", "citations"], title: "Anti over-reliance" }
    },
    "I'm about to ship — what are the must-haves?": {
      body: "A minimum trustworthy agentic UI ships these five: <b>Disclosure</b>, <b>Consent</b>, <b>Stop / Pause Controls</b>, <b>Verification</b> before destructive actions, and graceful <b>Error & Empty States</b>. Anything less and the first bad output sinks adoption.",
      patterns: ["disclosure", "consent", "controls", "verification", "error-empty"],
      followups: ["Show me an action plan pattern", "What about feedback collection?"],
      sandbox: { templates: ["chat", "code"], patterns: ["disclosure", "controls", "verification"], title: "Ship-ready essentials" }
    },
    "Show me onboarding flows for AI features": {
      body: "Onboarding is its own stage. The four anchors: <b>Disclosure</b> and <b>Consent</b> for trust, <b>Avatar</b> and <b>Name</b> for identity, <b>Example Gallery</b> to kill the blank canvas, and a soft <b>Disclaimer</b> setting capability expectations.",
      patterns: ["disclosure", "avatar", "example-gallery", "disclaimer"],
      followups: ["What about progressive disclosure?", "Show me the full Onboarding stage"],
      sandbox: { templates: ["chat", "rightrail"], patterns: ["disclosure", "avatar", "example-gallery"], title: "First-run experience" }
    },
    "How do I show tool calls transparently?": {
      body: "Three layers of transparency, by trust budget. <b>Action Plan</b> lets the user approve a multi-step task before it runs. <b>Stream of Thought</b> shows the agent's reasoning. <b>Footprints</b> log every call after the fact for audit.",
      patterns: ["action-plan", "stream-of-thought", "footprints", "mcp"],
      followups: ["Show me permission UI for tools", "How do I handle errors mid-action?"],
      sandbox: { templates: ["code", "rightrail"], patterns: ["action-plan", "stream-of-thought"], title: "Transparent tool use" }
    },
    "What patterns help with streaming and cost?": {
      body: "Pair them. <b>Streaming</b> reveals output as it generates so users don't stare at a spinner; <b>Processing Steps</b> show what the agent is doing; <b>Cost Estimates</b> shows the bill before the run, and a <b>Stop Button</b> always-reachable.",
      patterns: ["streaming", "processing-steps", "cost-estimates", "controls"],
      followups: ["What about model selection?", "Show me draft mode"],
      sandbox: { templates: ["chat", "code"], patterns: ["streaming", "cost-estimates"], title: "Streaming + cost" }
    },
    "How should we handle agent permissions?": {
      body: "Three patterns make agent permissions feel safe. <b>MCP Permission Toggle</b> for per-tool consent. <b>Verification</b> for destructive actions. <b>Connector Scope Picker</b> so the agent reads only what it should — least-privilege by default.",
      patterns: ["mcp", "verification", "connectors"],
      followups: ["How do I show citations from connectors?", "Error recovery patterns?"],
      sandbox: { templates: ["code", "rightrail"], patterns: ["mcp", "verification"], title: "Permission UX" }
    },
    "What recovery patterns should we plan for?": {
      body: "Four recovery patterns cover the failure cases: <b>Stop Controls</b> for runaway tasks, <b>Verification</b> for destructive actions, <b>Follow-up</b> when intent is ambiguous, and explained <b>Error States</b> with one concrete next step.",
      patterns: ["controls", "verification", "follow-up", "error-empty"],
      followups: ["Show me trust patterns", "What about confidence?"],
      sandbox: { templates: ["chat", "rightrail"], patterns: ["controls", "follow-up", "error-empty"], title: "Recovery" }
    },
    "How do I build a consistent AI design system?": {
      body: "Pick one of each from the Identity subcategory and lock them. <b>Avatar</b> + <b>Name</b> + <b>Personality</b> + <b>Iconography</b> + <b>Color</b>. Every AI-touched surface uses the same five. Inconsistency is what makes a product feel like five different agents in a trench coat.",
      patterns: ["avatar", "name", "personality", "iconography", "color"],
      followups: ["Take me to the full Identity subcategory", "Cross-surface placements"],
      sandbox: { templates: ["chat", "rightrail", "creative", "code", "email"], patterns: ["avatar", "color"], title: "Identity across surfaces" }
    },
    "Identity patterns for the agent": {
      body: "The five-pattern identity bundle: <b>Avatar</b> (the mark), <b>Name</b> (so the agent is referable), <b>Personality</b> (voice and tone), <b>Iconography</b> (which actions are AI), and <b>Color</b> (which regions are AI-active).",
      patterns: ["avatar", "name", "personality", "iconography", "color"],
      followups: ["Show me cross-surface examples", "How does this work across tools?"],
      sandbox: { templates: ["chat", "creative", "code"], patterns: ["avatar", "name", "color"], title: "Identity bundle" }
    },
    "Cross-surface patterns we should standardise": {
      body: "Standardise these because they're seen on every surface: <b>Disclosure</b>, <b>Avatar</b>, <b>Iconography</b>, <b>Streaming</b>, <b>Stop Controls</b>. If those five are inconsistent, users feel it everywhere.",
      patterns: ["disclosure", "avatar", "iconography", "streaming", "controls"],
      followups: ["Show me Identity in detail", "How do I roll this out to the team?"],
      sandbox: { templates: ["chat", "rightrail", "creative", "code"], patterns: ["disclosure", "avatar"], title: "Standardise these" }
    },
    "Help me brief my team on agentic UX": {
      body: "Run the team through the four stages — <b>Onboarding</b>, <b>Initially</b>, <b>During Interaction</b>, <b>Over Time</b>. Each stage has 10-37 patterns. Start with the 12 Onboarding patterns: they set the trust contract and recur in every later phase.",
      patterns: ["disclosure", "consent", "caveat", "avatar", "name", "example-gallery"],
      followups: ["Take me on the four-stage tour", "Show me must-ship patterns"],
      sandbox: null
    },
    "I need a disclosure pattern for chat": {
      body: "Four variants of <b>Disclosure</b> are common: a header AI badge, a footer attribution line, a persistent input-area chip, or a first-run banner. For chat specifically, the header badge is the lightest touch — visible on every turn without overwhelming.",
      patterns: ["disclosure"],
      followups: ["Show me Disclosure in other tools", "What about Caveat?"],
      sandbox: { templates: ["chat"], patterns: ["disclosure"], title: "Disclosure in chat" }
    },
    "Show me the best variants for empty states": {
      body: "Three empty-state moves: an <b>Example Gallery</b> so the user sees what's possible, <b>Templates</b> to kill the blank prompt, and an <b>Initial CTA</b> that anchors the surface. The combination converts more first-time users than any single one alone.",
      patterns: ["example-gallery", "templates", "initial-cta", "error-empty"],
      followups: ["What about prompt enhancement?", "Show me onboarding patterns"],
      sandbox: { templates: ["chat", "creative"], patterns: ["example-gallery", "templates"], title: "Empty-state combo" }
    },
    "What in-context placement should I pick?": {
      body: "Match the surface to the user's attention. Chat threads call for inline patterns; right-rail panels for top-of-panel anchors; canvas tools for selection-tied affordances; code editors for gutter/inline. Open any pattern to see all six placements at full size.",
      patterns: ["disclosure", "caveat", "iconography"],
      followups: ["Take me to Disclosure placements", "Show me code-editor patterns"],
      sandbox: { templates: ["chat", "rightrail", "creative", "code", "email"], patterns: ["disclosure"], title: "Same pattern, six surfaces" }
    },
    "Help me handle confidence and uncertainty": {
      body: "Three honest patterns: <b>Confidence Indicators</b> tag each claim with how sure the agent is; <b>Citations</b> let the user verify; <b>Hedge Language</b> writes the uncertainty into the prose so 'roughly' and 'likely' do their job.",
      patterns: ["confidence", "citations", "caveat", "references"],
      followups: ["What about error handling?", "Show me trust patterns"],
      sandbox: { templates: ["chat", "rightrail"], patterns: ["confidence", "citations"], title: "Honest uncertainty" }
    },
    "What should I ship first?": {
      body: "Ship trust before features. Week one: <b>Disclosure</b>, <b>Consent</b>, <b>Caveat</b>. Week two: <b>Stop Controls</b>, <b>Verification</b>, <b>Error States</b>. Everything else compounds on top — and ships better when the trust scaffolding is already there.",
      patterns: ["disclosure", "consent", "caveat", "controls", "verification", "error-empty"],
      followups: ["Show me ship-ready essentials", "What about feedback?"],
      sandbox: { templates: ["chat", "code"], patterns: ["disclosure", "controls"], title: "Week-one ship list" }
    },
    "Walk me through the framework": {
      body: "Four stages anchor the journey. <b>Onboarding</b> sets the rules before real use. <b>Initially</b> covers entry — how users start a conversation. <b>During Interaction</b> covers the bulk: output, refinement, recovery, transparency. <b>Over Time</b> covers memory, personalisation, privacy. 84 patterns total.",
      patterns: ["disclosure", "open-input", "streaming", "memory"],
      followups: ["Take me to the library", "What's in Stage 3?"],
      sandbox: null
    },
    "Show me agentic UX examples": {
      body: "Five archetypes cover most agentic surfaces today: <b>Conversational chat</b>, <b>Sidebar assistant</b>, <b>Canvas tool</b>, <b>Code editor</b>, and <b>Productivity surface</b>. Open the immersive sandbox to see foundational patterns rendered inside each.",
      patterns: ["disclosure", "streaming", "action-plan", "controls"],
      followups: ["Show me the four stages", "What patterns matter most?"],
      sandbox: { templates: ["chat", "rightrail", "creative", "code", "email"], patterns: ["disclosure", "streaming"], title: "Agentic UX archetypes" }
    },
    "How do I position an AI feature?": {
      body: "Lead with the trust contract, not the cleverness. <b>Disclosure</b> at the top, <b>Disclaimer</b> setting capability, and a small <b>Example Gallery</b> showing the shape of what's possible. The shipping order: trust, capability, surprise.",
      patterns: ["disclosure", "disclaimer", "example-gallery"],
      followups: ["What should I ship first?", "Show me onboarding"],
      sandbox: { templates: ["chat", "rightrail"], patterns: ["disclosure", "disclaimer", "example-gallery"], title: "First-impression positioning" }
    },
    "What is HAX?": {
      body: "HAX is Outshift's pattern library for agentic AI products. 84 patterns across 4 stages, 14 subcategories, each documented with variants and templatized in-context placements across six tool archetypes. The goal: a shared vocabulary for teams shipping AI-native software.",
      patterns: ["disclosure", "streaming", "memory"],
      followups: ["Show me the four stages", "Where do I start?"],
      sandbox: null
    },
    "Show me the four stages": {
      body: "<b>01 Onboarding</b> — Orientation before real use (12 patterns).<br/><b>02 Initially</b> — First touch, first prompt (24 patterns).<br/><b>03 During Interaction</b> — Working with the AI, recovering when it slips (37 patterns).<br/><b>04 Over Time</b> — The long-term relationship (11 patterns).",
      patterns: ["disclosure", "open-input", "streaming", "memory"],
      followups: ["Take me to the library", "What should I ship first?"],
      sandbox: null
    },
    "Take me to the most important patterns": {
      body: "These eight are the load-bearing patterns: <b>Disclosure</b>, <b>Consent</b>, <b>Caveat</b>, <b>Streaming</b>, <b>Stop Controls</b>, <b>Verification</b>, <b>Citations</b>, <b>Error States</b>. They appear in every well-designed agentic product.",
      patterns: ["disclosure", "consent", "caveat", "streaming", "controls", "verification", "citations", "error-empty"],
      followups: ["What should I ship first?", "Show me identity patterns"],
      sandbox: { templates: ["chat", "rightrail"], patterns: ["disclosure", "streaming", "controls"], title: "The load-bearing eight" }
    },
    "Where do I start?": {
      body: "Three steps. Open the <a href='library.html'>Library</a> to see all 84 patterns. Click any pattern to see its variants and in-context placements. Or stay in this assistant — pick a starter prompt above and I'll curate a path for you.",
      patterns: ["disclosure", "avatar", "example-gallery"],
      followups: ["What is HAX?", "Walk me through the framework"],
      sandbox: null
    },

    // ── Playbook scenarios — AI Platform Lead ─────────────
    "I'm shipping in 6 weeks — what can't I miss?": {
      body: "Ship trust before features. Five patterns must be live by the time you ship: <b>Disclosure</b>, <b>Consent</b>, <b>Stop Controls</b>, <b>Verification</b> on destructive actions, and explained <b>Error States</b>. Together they're the trust contract — every feature you build stacks on top.",
      patterns: ["disclosure", "consent", "controls", "verification", "error-empty"],
      video: { title: "Ship-ready trust scaffolding", desc: "All five must-haves in a production chat surface", archetype: "chat", pattern: "controls", duration: "1:24" },
      followups: ["Show me action plans", "What about feedback?", "Take this to the sandbox"],
      sandbox: { templates: ["chat", "code"], patterns: ["disclosure", "controls", "verification"], title: "Ship-ready essentials", usecase: "code-agent" },
      contact: true
    },
    "What's your stance on action plans vs autonomous execution?": {
      body: "Default to action plans for anything that touches external systems. <b>Action Plan</b> shows the user what'll happen before it runs; the user approves once, then the agent executes the batch. Pure autonomous execution is reserved for read-only actions or steps explicitly inside a previously-approved plan.",
      patterns: ["action-plan", "verification", "controls", "footprints"],
      video: { title: "Action plan vs autonomous run", desc: "Same task, two trust models, side-by-side", archetype: "code", pattern: "action-plan", duration: "0:52" },
      followups: ["Show me tool-call transparency", "How do we handle errors mid-action?"],
      sandbox: { templates: ["code", "rightrail"], patterns: ["action-plan", "verification"], title: "Action plan vs autonomous", usecase: "code-agent" }
    },

    // ── AI Experience Lead ────────────────────────────────
    "Our agent feels different in chat than in the IDE": {
      body: "That's the most common consistency complaint we hear. Lock the <b>Identity</b> bundle first — Avatar, Name, Personality, Iconography, Color — these should be byte-identical across surfaces. What adapts is the <b>placement</b> of the patterns, not the patterns themselves. Let me show you the same Disclosure rendered across all six tool archetypes.",
      patterns: ["avatar", "name", "iconography", "color", "disclosure"],
      video: { title: "Same pattern, six surfaces", desc: "Identity bundle held constant across chat, IDE, canvas, and email", archetype: "rightrail", pattern: "avatar", duration: "1:18" },
      followups: ["Identity patterns for the agent", "Cross-surface patterns we should standardise"],
      sandbox: { templates: ["chat", "rightrail", "creative", "code", "email"], patterns: ["disclosure", "avatar"], title: "Cross-surface consistency", usecase: "design-system" }
    },
    "I'm bringing two designers onto an AI feature — where do I start them?": {
      body: "Run them through Stage 1. Twelve patterns, three subcategories — Trust, Identity, Capability. Two-day curriculum: day one walks the patterns, day two opens the sandbox so they can compose them. By the end they have shared vocabulary with engineering and a working understanding of every onboarding pattern.",
      patterns: ["disclosure", "avatar", "example-gallery", "disclaimer"],
      video: { title: "Designer onboarding to agentic UX", desc: "Two-day curriculum at a glance — patterns + sandbox + brief", archetype: "rightrail", pattern: "example-gallery", duration: "1:05" },
      followups: ["Briefing senior leadership", "Cross-surface consistency"],
      sandbox: { templates: ["chat", "rightrail"], patterns: ["disclosure", "avatar", "example-gallery"], title: "Designer onboarding", usecase: "design-system" }
    },

    // ── AI Strategy / Transformation Lead ─────────────────
    "I'm building our AI roadmap for next year": {
      body: "The four stages map onto a maturity model. Quarter 1: trust foundations (Disclosure, Consent, Caveat) — without these, nothing else lands. Quarter 2: identity and entry (Avatar, Initial CTA, Example Gallery). Quarter 3: production patterns (Streaming, Action Plan, Citations, Recovery). Quarter 4: long-term relationship (Memory, Feedback, Privacy controls).",
      patterns: ["disclosure", "consent", "caveat", "streaming", "memory", "feedback"],
      video: { title: "AI roadmap walkthrough", desc: "Four quarters, four stages, four bundles", archetype: "rightrail", pattern: "memory", duration: "1:32" },
      followups: ["What should we ship first?", "How do I get exec sponsorship?"],
      sandbox: { templates: ["rightrail", "email"], patterns: ["disclosure", "memory"], title: "Roadmap walkthrough", usecase: "research-agent" },
      contact: true
    },
    "I'm presenting agentic UX to our board next month": {
      body: "Two artefacts win board rooms: the framework overview (four stages, 84 patterns, one design language) and two concrete case studies that mirror your context. Plus one live sandbox demo — boards remember moving pictures, not slides. I can put together a slide-ready package and our team can co-present if useful.",
      patterns: ["disclosure", "streaming", "controls", "memory"],
      video: { title: "Board-ready demo arc", desc: "From framework to case study to live sandbox in 6 minutes", archetype: "rightrail", pattern: "streaming", duration: "0:58" },
      followups: ["Show me case studies", "What does AI design system unlock?"],
      sandbox: { templates: ["chat", "rightrail"], patterns: ["disclosure", "streaming"], title: "Board-ready demo", usecase: "research-agent" },
      contact: true
    },
    "Different business units keep building one-off agents": {
      body: "Classic fragmentation. The lock-in lever is the Identity bundle plus shared Disclosure / Caveat / Citations behaviour — adopt those across BUs and the agents start feeling like one product. Then layer cross-BU governance (Data Ownership, MCP permissions, Footprints). Most enterprises ship this as a six-month standardisation program.",
      patterns: ["avatar", "disclosure", "data-ownership", "mcp", "footprints"],
      video: { title: "Cross-BU standardisation arc", desc: "How three product teams converged on one pattern library", archetype: "rightrail", pattern: "avatar", duration: "1:14" },
      followups: ["How does this work for compliance?", "Talk to our team"],
      sandbox: { templates: ["rightrail", "email", "creative"], patterns: ["avatar", "disclosure"], title: "Standardisation arc", usecase: "sales-copilot" },
      contact: true
    },

    // ── Enterprise CTO ────────────────────────────────────
    "How do you handle data ownership at enterprise scale?": {
      body: "Three patterns hold the line. <b>Data Ownership</b> gives users a clear training opt-out toggle and a 'delete all my data' control — both required for GDPR and most SOC2 audits. <b>Connector Scope Picker</b> enforces least-privilege on what the agent can read. <b>Footprints</b> writes an audit trail your compliance team can export to CSV.",
      patterns: ["data-ownership", "connectors", "footprints", "mcp", "watermark"],
      video: { title: "Enterprise data governance", desc: "Data ownership + scope + audit trail in one production flow", archetype: "code", pattern: "data-ownership", duration: "1:46" },
      followups: ["Compliance patterns", "Where does HAX sit in our architecture?"],
      sandbox: { templates: ["code", "email"], patterns: ["data-ownership", "footprints"], title: "Data governance", usecase: "code-agent" },
      contact: true
    },
    "Compliance keeps blocking us — what patterns help?": {
      body: "The compliance team's three usual asks map cleanly to patterns. <b>Audit trail</b> → Footprints. <b>Explicit consent + training opt-out</b> → Consent + Data Ownership. <b>Verification on destructive actions</b> → Verification with type-to-confirm. Bring these three to your next compliance review with concrete examples — they almost always unblock the ship.",
      patterns: ["footprints", "consent", "data-ownership", "verification", "watermark"],
      video: { title: "Unblocking compliance review", desc: "The five patterns that close the most-asked compliance gaps", archetype: "code", pattern: "verification", duration: "1:02" },
      followups: ["Show me data ownership", "Cross-team rollout"],
      sandbox: { templates: ["code", "email"], patterns: ["consent", "verification", "footprints"], title: "Compliance-friendly stack", usecase: "code-agent" },
      contact: true
    },
    "We have 12 product teams — how do I roll one library across them?": {
      body: "Three-phase rollout we've seen work. Phase one: pilot with two willing teams, locked Identity bundle + core Trust patterns. Phase two: publish internal docs and the SDK; opt-in for next six teams. Phase three: mandate for new agents, governance review for existing ones. Plan four to six months; budget for one design-systems-style enablement lead.",
      patterns: ["avatar", "iconography", "color", "disclosure", "controls"],
      video: { title: "Multi-team rollout playbook", desc: "How a 12-team org converged on one HAX instance", archetype: "rightrail", pattern: "avatar", duration: "1:24" },
      followups: ["Architecture deep-dive", "Talk to our team about rollout"],
      sandbox: { templates: ["rightrail", "code"], patterns: ["avatar", "disclosure"], title: "Multi-team rollout", usecase: "design-system" },
      contact: true
    },
    "Where does HAX sit in our architecture?": {
      body: "HAX is the <b>pattern + experience layer</b>. It sits on top of your model gateway and identity provider; it integrates with your tool / MCP layer; it talks to your audit + observability stack. The patterns themselves are framework-agnostic — they're not a runtime, they're the contract every AI surface in your stack should honour.",
      patterns: ["mcp", "connectors", "data-ownership", "footprints", "controls"],
      video: { title: "HAX in your architecture", desc: "Layered view: model gateway, identity, MCP, audit — and where HAX fits", archetype: "code", pattern: "mcp", duration: "1:38" },
      followups: ["Show me MCP patterns", "How do permissions wire to our IdP?"],
      sandbox: { templates: ["code"], patterns: ["mcp", "footprints"], title: "Architecture sandbox", usecase: "code-agent" },
      contact: true
    }
  };

  // Enrich a few existing high-value responses with video metadata and contact CTAs.
  const ENRICH = {
    "How do I design a trustworthy AI experience?": {
      video: { title: "The trust contract — three patterns", desc: "Disclosure, Consent, Caveat composed in a real chat surface", archetype: "chat", pattern: "disclosure", duration: "1:08" }
    },
    "How do you show tool calls transparently?": {
      video: { title: "Tool-call transparency — three approaches", desc: "Action Plan vs Stream of Thought vs Footprints, A/B/C", archetype: "code", pattern: "action-plan", duration: "1:22" }
    },
    "How do I show tool calls transparently?": {
      video: { title: "Tool-call transparency — three approaches", desc: "Action Plan vs Stream of Thought vs Footprints, A/B/C", archetype: "code", pattern: "action-plan", duration: "1:22" }
    },
    "How do you handle tool-call transparency in production?": {
      body: "Three patterns by trust budget. <b>Action Plan</b> — the agent shows what it'll do before doing it; users approve once. <b>Stream of Thought</b> — reasoning is visible during work. <b>Footprints</b> — every call is logged after the fact for audit. More transparency = more trust = more cognitive load. Pick by stakes.",
      patterns: ["action-plan", "stream-of-thought", "footprints", "mcp"],
      video: { title: "Tool-call transparency — three approaches", desc: "Action Plan vs Stream of Thought vs Footprints in a coding agent", archetype: "code", pattern: "action-plan", duration: "1:22" },
      followups: ["Show me permissions UI", "How do I handle errors mid-action?"],
      sandbox: { templates: ["code", "rightrail"], patterns: ["action-plan", "stream-of-thought"], title: "Transparent tool use", usecase: "code-agent" },
      contact: true
    },
    "Show me your patterns for streaming and cost control": {
      body: "Four patterns pair up. <b>Streaming</b> reveals output as it generates so users don't stare at a spinner. <b>Processing Steps</b> show what the agent is doing at each stage. <b>Cost Estimates</b> shows the bill before the run. <b>Stop Controls</b> always-reachable for runaway tasks. Together they're the production triad.",
      patterns: ["streaming", "processing-steps", "cost-estimates", "controls"],
      video: { title: "Streaming + cost — production triad", desc: "Live token meter, progress steps, stop control, all on one surface", archetype: "chat", pattern: "streaming", duration: "0:54" },
      followups: ["What about model selection?", "Show me draft mode"],
      sandbox: { templates: ["chat", "code"], patterns: ["streaming", "cost-estimates", "controls"], title: "Streaming + cost", usecase: "code-agent" }
    },
    "What should I ship first?": {
      video: { title: "Week-one ship list", desc: "Five patterns that earn user trust in the first 30 seconds", archetype: "chat", pattern: "disclosure", duration: "0:48" },
      contact: true
    },
    "What should we ship first?": {
      body: "Trust before features. Week one: <b>Disclosure</b>, <b>Consent</b>, <b>Caveat</b>. Week two: <b>Stop Controls</b>, <b>Verification</b>, <b>Error States</b>. Everything else compounds on top — and ships better when the trust scaffolding is already there.",
      patterns: ["disclosure", "consent", "caveat", "controls", "verification", "error-empty"],
      video: { title: "Week-one ship list", desc: "Five patterns that earn user trust in the first 30 seconds", archetype: "chat", pattern: "disclosure", duration: "0:48" },
      followups: ["Show me ship-ready essentials", "What about feedback?"],
      sandbox: { templates: ["chat", "code"], patterns: ["disclosure", "controls"], title: "Week-one ship list", usecase: "code-agent" },
      contact: true
    },
    "How do I build a consistent AI design system?": {
      video: { title: "One agent, every surface", desc: "Locking identity across chat, sidebar, canvas, IDE, email", archetype: "rightrail", pattern: "avatar", duration: "1:30" }
    },
    "How do I build a consistent AI design system across products?": {
      body: "Lock the Identity bundle: <b>Avatar</b> + <b>Name</b> + <b>Personality</b> + <b>Iconography</b> + <b>Color</b>. Every AI-touched surface uses the same five. Inconsistency is what makes a product feel like five different agents in a trench coat.",
      patterns: ["avatar", "name", "personality", "iconography", "color"],
      video: { title: "One agent, every surface", desc: "Locking identity across chat, sidebar, canvas, IDE, email", archetype: "rightrail", pattern: "avatar", duration: "1:30" },
      followups: ["Take me to the full Identity subcategory", "Cross-surface placements"],
      sandbox: { templates: ["chat", "rightrail", "creative", "code", "email"], patterns: ["avatar", "color"], title: "Identity across surfaces", usecase: "design-system" }
    }
  };
  Object.keys(ENRICH).forEach(k => {
    if (RESPONSES[k]) Object.assign(RESPONSES[k], ENRICH[k]);
    else RESPONSES[k] = ENRICH[k];
  });

  // Fallback: keyword-match against pattern names/onelines when a free-text prompt
  // doesn't match any scripted response.
  function freeTextResponse(query) {
    const L = window.LIBRARY;
    if (!L) return null;
    const q = query.toLowerCase().trim();
    const tokens = q.split(/\s+/).filter(t => t.length > 2);
    if (!tokens.length) return null;
    const scored = [];
    L.stages.forEach(s => s.subcats.forEach(sub => sub.patterns.forEach(p => {
      const blob = [p.name, p.oneline, sub.title, s.label].join(" ").toLowerCase();
      let score = 0;
      tokens.forEach(t => { if (blob.includes(t)) score += t.length; });
      if (score > 0) scored.push({ p, sub, stage: s, score });
    })));
    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, 4).map(x => x.p.id);
    if (!top.length) return null;
    return {
      body: `Closest matches I found across the library for <i>"${esc(query)}"</i>:`,
      patterns: top,
      followups: ["Show me ship-ready essentials", "Take me to the most important patterns"],
      sandbox: null
    };
  }

  // ───────────────────────────────────────────────────────
  // Tool-shell templates (duplicated from pattern.js so the
  // immersive sandbox can render them outside that page).
  // Minimal version: just the shells; variants come from LIBRARY.
  // ───────────────────────────────────────────────────────
  const SHELL_META = {
    chat:      { label: "Chat interface" },
    rightrail: { label: "Sidebar assistant" },
    creative:  { label: "Canvas tool" },
    video:     { label: "Timeline editor" },
    code:      { label: "Code editor" },
    email:     { label: "Productivity surface" }
  };
  const winBar = `<div class="tshell__winbar"><span class="tshell__dot" style="background:#ff6058"></span><span class="tshell__dot" style="background:#ffbe2f"></span><span class="tshell__dot" style="background:#2bc940"></span><span class="tshell__urlbar"></span></div>`;
  const SHELLS = {
    chat: (slot) => `<div class="tshell tshell--chat">${winBar}<div class="tshell__body tshell__body--chat"><aside class="tshell__nav"><div class="tshell__nav-row tshell__nav-row--active"></div><div class="tshell__nav-row"></div><div class="tshell__nav-row"></div><div class="tshell__nav-row tshell__nav-row--short"></div></aside><main class="tshell__main"><div class="tshell__msg tshell__msg--user"><div class="tshell__msg-bubble tshell__msg-bubble--user"><span class="tshell__skel" style="width:140px"></span><span class="tshell__skel" style="width:90px"></span></div></div><div class="tshell__msg tshell__msg--ai"><div class="tshell__msg-bubble tshell__msg-bubble--ai tshell__slot">${slot}</div></div><div class="tshell__composer"><span class="tshell__composer-placeholder">Message Aria…</span><span class="tshell__composer-send"></span></div></main></div></div>`,
    rightrail: (slot) => `<div class="tshell tshell--rightrail">${winBar}<div class="tshell__body tshell__body--rightrail"><main class="tshell__workspace"><div class="tshell__toolbar"><span class="tshell__skel" style="width:80px"></span><span class="tshell__skel" style="width:50px;margin-left:auto"></span><span class="tshell__skel" style="width:50px"></span></div><div class="tshell__doc"><span class="tshell__skel" style="width:60%;height:14px"></span><span class="tshell__skel" style="width:85%"></span><span class="tshell__skel" style="width:78%"></span><span class="tshell__skel" style="width:90%"></span><span class="tshell__skel" style="width:72%"></span></div></main><aside class="tshell__panel"><div class="tshell__panel-head"><span class="tshell__panel-title">Assistant</span><span class="tshell__panel-close"></span></div><div class="tshell__slot">${slot}</div><div class="tshell__panel-composer">Ask about this doc…</div></aside></div></div>`,
    creative: (slot) => `<div class="tshell tshell--creative">${winBar}<div class="tshell__body tshell__body--creative"><aside class="tshell__tools"><span class="tshell__tool"></span><span class="tshell__tool tshell__tool--active"></span><span class="tshell__tool"></span><span class="tshell__tool"></span></aside><main class="tshell__canvas"><div class="tshell__asset"><div class="tshell__asset-frame"><span class="tshell__asset-label">AI-generated</span></div><div class="tshell__slot tshell__slot--under-asset">${slot}</div></div></main><aside class="tshell__props"><div class="tshell__prop-head">Properties</div><span class="tshell__skel" style="width:90%"></span><span class="tshell__skel" style="width:70%"></span></aside></div></div>`,
    video: (slot) => `<div class="tshell tshell--video">${winBar}<div class="tshell__body tshell__body--video"><div class="tshell__preview"><div class="tshell__preview-frame"><span class="tshell__play"></span></div></div><div class="tshell__timeline"><div class="tshell__track"><div class="tshell__clip tshell__clip--user" style="width:18%"></div><div class="tshell__clip tshell__clip--ai" style="width:28%;margin-left:4%"><div class="tshell__slot tshell__slot--clip">${slot}</div></div><div class="tshell__clip tshell__clip--user" style="width:20%;margin-left:4%"></div></div><div class="tshell__track tshell__track--audio"><div class="tshell__clip tshell__clip--audio" style="width:64%"></div></div></div></div></div>`,
    code: (slot) => `<div class="tshell tshell--code">${winBar}<div class="tshell__body tshell__body--code"><aside class="tshell__filetree"><span class="tshell__file"></span><span class="tshell__file tshell__file--active"></span><span class="tshell__file"></span><span class="tshell__file tshell__file--short"></span></aside><main class="tshell__editor"><div class="tshell__codeline"><span class="tshell__gutter">1</span><span class="tshell__tok tshell__tok--kw">function</span> <span class="tshell__tok tshell__tok--fn">renderMessage</span>(<span class="tshell__tok tshell__tok--arg">m</span>) {</div><div class="tshell__codeline"><span class="tshell__gutter">2</span>  <span class="tshell__tok tshell__tok--kw">return</span> <span class="tshell__tok tshell__tok--str">\`&lt;div&gt;\${m.body}&lt;/div&gt;\`</span>;</div><div class="tshell__codeline"><span class="tshell__gutter">3</span>}</div><div class="tshell__codeline tshell__codeline--prompt"><span class="tshell__gutter">4</span><div class="tshell__slot tshell__slot--prompt">${slot}</div></div></main></div></div>`,
    email: (slot) => `<div class="tshell tshell--email">${winBar}<div class="tshell__body tshell__body--email"><aside class="tshell__inbox"><div class="tshell__inbox-row tshell__inbox-row--active"></div><div class="tshell__inbox-row"></div><div class="tshell__inbox-row"></div></aside><main class="tshell__mail"><div class="tshell__mail-head"><span class="tshell__skel" style="width:50%;height:14px"></span><span class="tshell__skel" style="width:28%;margin-top:8px"></span></div><div class="tshell__slot tshell__slot--draft">${slot}</div><div class="tshell__mail-body"><span class="tshell__skel" style="width:92%"></span><span class="tshell__skel" style="width:84%"></span></div><div class="tshell__mail-actions"><span class="tshell__send">Send</span></div></main></div></div>`
  };

  // ───────────────────────────────────────────────────────
  // DOM injection
  // ───────────────────────────────────────────────────────
  function injectChrome() {
    // Search trigger inside the gnav
    const actions = $(".gnav__actions");
    if (actions && !$(".gnav__search")) {
      const search = document.createElement("button");
      search.className = "gnav__search";
      search.type = "button";
      search.setAttribute("data-search-open", "");
      search.setAttribute("aria-label", "Search the library");
      search.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="M21 21l-4.3-4.3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        <span class="gnav__search-label">Search patterns</span>
        <span class="gnav__search-kbd">⌘K</span>
      `;
      actions.insertBefore(search, actions.firstChild);
    }

    // Search modal
    if (!$("#hax-search")) {
      const m = document.createElement("div");
      m.id = "hax-search";
      m.className = "hax-search";
      m.setAttribute("hidden", "");
      m.innerHTML = `
        <div class="hax-search__backdrop" data-search-close></div>
        <div class="hax-search__panel" role="dialog" aria-label="Search patterns">
          <div class="hax-search__inputrow">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="M21 21l-4.3-4.3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            <input type="text" placeholder="Search 84 patterns by name, intent, surface…" class="hax-search__input" autocomplete="off" />
            <span class="hax-search__esc" data-search-close role="button" aria-label="Close search">esc</span>
          </div>
          <div class="hax-search__results" id="hax-search-results"></div>
          <div class="hax-search__footer">
            <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
            <span><kbd>↵</kbd> open</span>
            <span><kbd>esc</kbd> close</span>
          </div>
        </div>
      `;
      document.body.appendChild(m);
    }

    // Assistant launcher (floating button)
    if (!$("#hax-launcher")) {
      const l = document.createElement("button");
      l.id = "hax-launcher";
      l.className = "hax-launcher";
      l.type = "button";
      l.setAttribute("data-asst-open", "");
      l.setAttribute("aria-label", "Talk to Lumen, Outshift's discovery guide");
      l.innerHTML = `
        <span class="hax-launcher__orb"></span>
        <span class="hax-launcher__label">Ask Lumen</span>
      `;
      document.body.appendChild(l);
    }

    // Assistant panel
    if (!$("#hax-asst")) {
      const a = document.createElement("aside");
      a.id = "hax-asst";
      a.className = "hax-asst";
      a.setAttribute("hidden", "");
      a.innerHTML = `
        <aside class="hax-asst__sidebar" aria-label="Conversation history">
          <button class="hax-asst__sb-new" type="button" data-asst-restart>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            New conversation
          </button>
          <div class="hax-asst__sb-section">
            <div class="hax-asst__sb-eyebrow">Recent</div>
            <button class="hax-asst__sb-recent" type="button" data-prompt="Compliance keeps blocking us — what patterns help?">
              <span class="hax-asst__sb-recent-name">Compliance review</span>
              <span class="hax-asst__sb-recent-meta">Enterprise CTO · today</span>
            </button>
            <button class="hax-asst__sb-recent" type="button" data-prompt="I'm shipping in 6 weeks — what can't I miss?">
              <span class="hax-asst__sb-recent-name">Ship-ready essentials</span>
              <span class="hax-asst__sb-recent-meta">AI Platform Lead · yesterday</span>
            </button>
            <button class="hax-asst__sb-recent" type="button" data-prompt="How do I build a consistent AI design system across products?">
              <span class="hax-asst__sb-recent-name">Cross-surface system</span>
              <span class="hax-asst__sb-recent-meta">AI Experience Lead · 2d ago</span>
            </button>
          </div>
          <div class="hax-asst__sb-section">
            <div class="hax-asst__sb-eyebrow">Pinned</div>
            <a class="hax-asst__sb-recent" href="library.html">
              <span class="hax-asst__sb-recent-name">Browse library</span>
              <span class="hax-asst__sb-recent-meta">84 patterns</span>
            </a>
          </div>
          <footer class="hax-asst__sb-foot">
            <span class="hax-asst__avatar"></span>
            <div>
              <div class="hax-asst__sb-foot-name">Lumen</div>
              <div class="hax-asst__sb-foot-meta">Discovery agent · Outshift</div>
            </div>
          </footer>
        </aside>
        <header class="hax-asst__head">
          <div class="hax-asst__brand">
            <span class="hax-asst__avatar"></span>
            <div class="hax-asst__heads">
              <div class="hax-asst__title">Lumen</div>
              <div class="hax-asst__sub" data-asst-sub>Discovery guide · Outshift</div>
            </div>
          </div>
          <div class="hax-asst__head-actions">
            <button class="hax-asst__btn hax-asst__btn--fs" type="button" data-asst-fullscreen aria-label="Fullscreen">
              <svg class="hax-asst__icon-expand" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <svg class="hax-asst__icon-collapse" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <button class="hax-asst__btn" type="button" data-asst-expand aria-label="Toggle immersive sandbox">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 14v6h6M20 10V4h-6M20 4L13 11M4 20l7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <button class="hax-asst__btn" type="button" data-asst-restart aria-label="Restart">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <button class="hax-asst__btn" type="button" data-asst-close aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
          </div>
        </header>
        <div class="hax-asst__body" id="hax-asst-body"></div>
        <div class="hax-asst__sandbox" id="hax-asst-sandbox" hidden></div>
        <footer class="hax-asst__composer">
          <input type="text" placeholder="Ask anything about the library…" id="hax-asst-input" autocomplete="off" />
          <button type="button" id="hax-asst-send" aria-label="Send">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 19V5m0 0l-6 6m6-6l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </footer>
      `;
      document.body.appendChild(a);
    }
  }

  // ───────────────────────────────────────────────────────
  // Pattern lookup
  // ───────────────────────────────────────────────────────
  function flatPatterns() {
    if (!window.LIBRARY) return [];
    const out = [];
    window.LIBRARY.stages.forEach(s => s.subcats.forEach(sub => sub.patterns.forEach(p => out.push({ p, stage: s, sub }))));
    return out;
  }
  function lookup(id) { return flatPatterns().find(x => x.p.id === id) || null; }

  // ───────────────────────────────────────────────────────
  // Search
  // ───────────────────────────────────────────────────────
  let searchActiveIdx = 0;
  function openSearch() {
    const m = $("#hax-search");
    if (!m) return;
    m.removeAttribute("hidden");
    document.body.classList.add("is-hax-search");
    requestAnimationFrame(() => m.classList.add("is-open"));
    const input = $(".hax-search__input");
    input.value = "";
    runSearch("");
    setTimeout(() => input.focus(), 60);
  }
  function closeSearch() {
    const m = $("#hax-search");
    if (!m || m.hasAttribute("hidden")) return;
    m.classList.remove("is-open");
    document.body.classList.remove("is-hax-search");
    setTimeout(() => m.setAttribute("hidden", ""), 180);
  }
  function runSearch(q) {
    const results = $("#hax-search-results");
    if (!results) return;
    const items = flatPatterns();
    const ql = q.trim().toLowerCase();
    const filtered = ql ? items.filter(({ p, sub, stage }) => {
      const blob = [p.name, p.oneline, sub.title, stage.label].join(" ").toLowerCase();
      return blob.includes(ql);
    }) : items.slice(0, 12);
    searchActiveIdx = 0;
    results.innerHTML = filtered.length ? filtered.slice(0, 30).map(({ p, sub, stage }, i) => `
      <a class="hax-search__row ${i === 0 ? 'is-active' : ''}" href="pattern.html?id=${encodeURIComponent(p.id)}" data-row="${i}">
        <span class="hax-search__row-name">${esc(p.name)}</span>
        <span class="hax-search__row-meta">${esc(stage.label)} · ${esc(sub.title)}</span>
        <span class="hax-search__row-oneline">${esc(p.oneline)}</span>
      </a>
    `).join("") : `<div class="hax-search__empty">No matches. Try "disclosure", "streaming", or "consent".</div>`;
  }
  function moveSearch(delta) {
    const rows = $$(".hax-search__row");
    if (!rows.length) return;
    rows[searchActiveIdx]?.classList.remove("is-active");
    searchActiveIdx = (searchActiveIdx + delta + rows.length) % rows.length;
    rows[searchActiveIdx].classList.add("is-active");
    rows[searchActiveIdx].scrollIntoView({ block: "nearest" });
  }
  function openActiveSearch() {
    const row = $$(".hax-search__row")[searchActiveIdx];
    if (row) location.href = (window.haxFileURL ? window.haxFileURL(row.getAttribute("href")) : null) || row.getAttribute("href");
  }

  // ───────────────────────────────────────────────────────
  // Assistant: state + render
  // ───────────────────────────────────────────────────────
  const asst = { persona: null, history: [], sandbox: null, expanded: false, fullscreen: false };

  function openAsst() {
    const a = $("#hax-asst");
    if (!a) return;
    a.removeAttribute("hidden");
    document.body.classList.add("is-hax-asst");
    requestAnimationFrame(() => a.classList.add("is-open"));
    if (asst.history.length === 0 && !asst.persona) renderDiscoveryIntro();
  }
  function closeAsst() {
    const a = $("#hax-asst");
    if (!a || a.hasAttribute("hidden")) return;
    a.classList.remove("is-open", "is-expanded", "is-fullscreen");
    document.body.classList.remove("is-hax-asst", "is-hax-asst-expanded", "is-hax-asst-fullscreen");
    asst.expanded = false;
    asst.fullscreen = false;
    setTimeout(() => a.setAttribute("hidden", ""), 220);
  }
  function restartAsst() {
    asst.persona = null;
    asst.history = [];
    asst.sandbox = null;
    asst.expanded = false;
    $("#hax-asst")?.classList.remove("is-expanded", "has-sandbox");
    document.body.classList.remove("is-hax-asst-expanded");
    $("#hax-asst-sandbox").setAttribute("hidden", "");
    $("[data-asst-sub]").textContent = "Discovery guide · Outshift";
    renderDiscoveryIntro();
  }
  function toggleExpand() {
    if (!asst.sandbox) return; // nothing to expand into
    asst.expanded = !asst.expanded;
    const a = $("#hax-asst");
    if (!a) return;
    a.classList.toggle("is-expanded", asst.expanded);
    document.body.classList.toggle("is-hax-asst-expanded", asst.expanded);
    $("#hax-asst-sandbox").toggleAttribute("hidden", !asst.expanded);
    if (asst.expanded) renderSandbox();
  }

  // Bot → expanded → fullscreen. Three sizes with smooth transitions.
  function toggleFullscreen() {
    asst.fullscreen = !asst.fullscreen;
    const a = $("#hax-asst");
    if (!a) return;
    a.classList.toggle("is-fullscreen", asst.fullscreen);
    document.body.classList.toggle("is-hax-asst-fullscreen", asst.fullscreen);
    // Fullscreen also implies expanded view when there's a sandbox to show.
    if (asst.fullscreen && asst.sandbox && !asst.expanded) {
      asst.expanded = true;
      a.classList.add("is-expanded");
      document.body.classList.add("is-hax-asst-expanded");
      $("#hax-asst-sandbox").removeAttribute("hidden");
      renderSandbox();
    }
  }

  // ── Lumen's discovery intro — a real opening message ───
  // No menu, no buttons. Lumen greets the user and asks an open
  // question. The composer below is the only obvious affordance.
  // A few italic example asks sit underneath as soft hints.
  function renderDiscoveryIntro() {
    const body = $("#hax-asst-body");
    if (!body) return;
    body.innerHTML = `
      <div class="hax-asst__msg hax-asst__msg--ai hax-asst__msg--first">
        <div class="hax-asst__bubble">
          <div class="hax-asst__greet-line">Hi, I'm <b>Lumen</b> — Outshift's discovery guide.</div>
          <div class="hax-asst__greet-body">I can help you explore the agentic UX patterns we've built, share real case studies that match what you're working on, or set up a quick call with our team.</div>
          <div class="hax-asst__greet-ask">So, what brings you here today?</div>
        </div>
      </div>
      <div class="hax-asst__hints">
        <span class="hax-asst__hints-label">Or try…</span>
        <button class="hax-asst__hint" type="button" data-prompt="I'm building an agentic product">"I'm building an agentic product"</button>
        <button class="hax-asst__hint" type="button" data-prompt="Show me some case studies">"Show me your work"</button>
        <button class="hax-asst__hint" type="button" data-prompt="Can I talk to your team?">"Can I talk to your team?"</button>
      </div>
    `;
    // Focus the composer so the user can just start typing.
    setTimeout(() => { $("#hax-asst-input")?.focus(); }, 80);
  }

  // Route the user's intent click into the right conversation.
  function pickIntent(id) {
    const intent = DISCOVERY_INTENTS.find(x => x.id === id);
    if (!intent) return;
    pushUserBubble(intent.label);
    showTyping();
    setTimeout(() => {
      hideTyping();
      if (id === "tour-library")     return startLibraryTour();
      if (id === "building-product") return startBuildingFlow();
      if (id === "case-studies")     return showCaseStudies();
      if (id === "contact-team")     return showContactForm();
    }, 420);
  }

  // ── Path A: walk the library ──────────────────────────
  function startLibraryTour() {
    pushAgentBubble(`HAX is organised in four stages — <b>Onboarding</b> sets the trust contract, <b>Initially</b> covers entry, <b>During Interaction</b> covers output and recovery, and <b>Over Time</b> covers memory and adaptation. Where would you like to start?`, {
      patternBundle: ["disclosure", "open-input", "streaming", "memory"],
      followups: ["Start with the must-haves", "Show me identity patterns", "Take me into the immersive sandbox"]
    });
    // Offer the most-popular jumping-off prompts
    pushQuickPicks([
      "Start with the must-haves",
      "Show me trust patterns",
      "Identity patterns for the agent",
      "Take me to the most important patterns"
    ]);
  }

  // ── Path B: building a product — ask one warm follow-up ──
  function startBuildingFlow() {
    pushAgentBubble(`Happy to help. Quick context — what's your role on this project? I'll tailor what I show you.`, {});
    pushPersonaChips();
  }

  function pushPersonaChips() {
    const body = $("#hax-asst-body");
    const wrap = document.createElement("div");
    wrap.className = "hax-asst__msg hax-asst__msg--ai";
    wrap.innerHTML = `
      <div class="hax-asst__bubble hax-asst__bubble--plain">
        <div class="hax-asst__chips">
          ${PERSONAS.map(p => `
            <button class="hax-asst__chip" type="button" data-persona="${p.id}">
              <span>${p.icon}</span>${esc(p.label)}
            </button>
          `).join("")}
        </div>
      </div>
    `;
    body.appendChild(wrap);
    body.scrollTop = body.scrollHeight;
  }

  function setPersona(id) {
    const p = PERSONAS.find(x => x.id === id);
    if (!p) return;
    asst.persona = p;
    $("[data-asst-sub]").textContent = `Guiding · ${p.label}`;
    pushUserBubble(p.label);
    showTyping();
    setTimeout(() => {
      hideTyping();
      pushAgentBubble(`Got it. Here are the most useful starting points for a <b>${esc(p.label)}</b>:`, {});
      pushQuickPicks(STARTER_PROMPTS[id]);
    }, 380);
  }

  // ── Path C: case studies ──────────────────────────────
  function showCaseStudies() {
    pushAgentBubble(`Here are a few representative pieces of our work. Each one links out to the full case study.`, {});
    const body = $("#hax-asst-body");
    const wrap = document.createElement("div");
    wrap.className = "hax-asst__msg hax-asst__msg--ai";
    wrap.innerHTML = `
      <div class="hax-asst__bubble hax-asst__bubble--plain">
        <div class="hax-asst__cases">
          ${CASE_STUDIES.map(c => `
            <a class="hax-asst__case" href="${esc(c.href)}" target="_blank" rel="noopener">
              <span class="hax-asst__case-tag">${esc(c.tag)}</span>
              <span class="hax-asst__case-title">${esc(c.title)}</span>
              <span class="hax-asst__case-desc">${esc(c.desc)}</span>
              <span class="hax-asst__case-arrow">↗</span>
            </a>
          `).join("")}
        </div>
        <div class="hax-asst__starters hax-asst__starters--small" style="margin-top:10px">
          <button class="hax-asst__starter hax-asst__starter--small" type="button" data-intent="contact-team">Talk to someone about a project</button>
          <button class="hax-asst__starter hax-asst__starter--small" type="button" data-intent="tour-library">Show me the library</button>
        </div>
      </div>
    `;
    body.appendChild(wrap);
    body.scrollTop = body.scrollHeight;
  }

  // ── Path D: contact the team ──────────────────────────
  function showContactForm() {
    pushAgentBubble(`Tell me a bit about your project and I'll route this to the right person. None of this leaves your browser — when you submit, it opens an email to the team with the details prefilled.`, {});
    const body = $("#hax-asst-body");
    const wrap = document.createElement("div");
    wrap.className = "hax-asst__msg hax-asst__msg--ai";
    wrap.innerHTML = `
      <div class="hax-asst__bubble hax-asst__bubble--plain">
        <form class="hax-asst__form" data-form="contact">
          <label class="hax-asst__field">
            <span>Your name</span>
            <input name="name" type="text" required autocomplete="name" />
          </label>
          <label class="hax-asst__field">
            <span>Email</span>
            <input name="email" type="email" required autocomplete="email" />
          </label>
          <label class="hax-asst__field">
            <span>Company / role <em>(optional)</em></span>
            <input name="company" type="text" autocomplete="organization" />
          </label>
          <label class="hax-asst__field">
            <span>What are you building?</span>
            <textarea name="project" rows="3" required placeholder="A line or two about your product, the surface, and where AI fits in…"></textarea>
          </label>
          <button class="hax-asst__form-submit" type="submit">Send to the team</button>
          <a class="hax-asst__form-alt" href="https://www.intelligaia.com/contact" target="_blank" rel="noopener">or contact us directly ↗</a>
        </form>
      </div>
    `;
    body.appendChild(wrap);
    body.scrollTop = body.scrollHeight;
  }

  function handleContactSubmit(form) {
    const fd = new FormData(form);
    const name = (fd.get("name") || "").toString().trim();
    const email = (fd.get("email") || "").toString().trim();
    const company = (fd.get("company") || "").toString().trim();
    const project = (fd.get("project") || "").toString().trim();
    if (!name || !email || !project) return;
    const subject = encodeURIComponent(`HAX · introduction from ${name}`);
    const body = encodeURIComponent(
      `Hello team,\n\n${name} reached out via Lumen on the HAX library.\n\nEmail: ${email}\nCompany/role: ${company || "—"}\n\nProject:\n${project}\n\n— Sent from the Lumen discovery agent`
    );
    window.open(`mailto:hello@intelligaia.com?subject=${subject}&body=${body}`, "_blank");
    // Replace the form with a thank-you
    const wrap = form.closest(".hax-asst__msg");
    if (wrap) {
      wrap.querySelector(".hax-asst__bubble").innerHTML = `
        <div>Thanks ${esc(name)} — your draft email is open in your mail client. Hit send and the team will reach out within one working day.</div>
        <div class="hax-asst__starters hax-asst__starters--small">
          <button class="hax-asst__starter hax-asst__starter--small" type="button" data-intent="tour-library">Browse the library while you wait</button>
          <button class="hax-asst__starter hax-asst__starter--small" type="button" data-intent="case-studies">See more case studies</button>
        </div>
      `;
    }
  }

  // ── Conversation primitives ───────────────────────────
  function pushUserBubble(text) {
    const body = $("#hax-asst-body");
    const m = document.createElement("div");
    m.className = "hax-asst__msg hax-asst__msg--user";
    m.innerHTML = `<div class="hax-asst__bubble">${esc(text)}</div>`;
    body.appendChild(m);
    body.scrollTop = body.scrollHeight;
  }

  function pushAgentBubble(html, opts = {}) {
    const body = $("#hax-asst-body");
    const m = document.createElement("div");
    m.className = "hax-asst__msg hax-asst__msg--ai";
    const patterns = (opts.patternBundle || []).map(id => {
      const x = lookup(id);
      if (!x) return "";
      return `<a class="hax-asst__pcard" href="pattern.html?id=${encodeURIComponent(id)}">
        <span class="hax-asst__pcard-name">${esc(x.p.name)}</span>
        <span class="hax-asst__pcard-meta">${esc(x.stage.label)} · ${esc(x.sub.title)}</span>
      </a>`;
    }).join("");
    m.innerHTML = `
      <div class="hax-asst__bubble">
        <div>${html}</div>
        ${patterns ? `<div class="hax-asst__pcards">${patterns}</div>` : ""}
      </div>
    `;
    body.appendChild(m);
    body.scrollTop = body.scrollHeight;
  }

  function pushQuickPicks(prompts) {
    const body = $("#hax-asst-body");
    const m = document.createElement("div");
    m.className = "hax-asst__msg hax-asst__msg--ai";
    m.innerHTML = `
      <div class="hax-asst__bubble hax-asst__bubble--plain">
        <div class="hax-asst__starters">
          ${prompts.map(s => `<button class="hax-asst__starter" type="button" data-prompt="${esc(s)}">${esc(s)}</button>`).join("")}
        </div>
      </div>
    `;
    body.appendChild(m);
    body.scrollTop = body.scrollHeight;
  }

  let _typingNode = null;
  function showTyping() {
    const body = $("#hax-asst-body");
    if (!body || _typingNode) return;
    const m = document.createElement("div");
    m.className = "hax-asst__msg hax-asst__msg--ai";
    m.innerHTML = `<div class="hax-asst__bubble hax-asst__bubble--typing"><span></span><span></span><span></span></div>`;
    body.appendChild(m);
    _typingNode = m;
    body.scrollTop = body.scrollHeight;
  }
  function hideTyping() {
    if (_typingNode) { _typingNode.remove(); _typingNode = null; }
  }

  // ── Intent + role detection ───────────────────────────
  // Light keyword routing so Lumen feels responsive without an LLM in the loop.
  function detectIntent(text) {
    const t = text.toLowerCase();
    if (/\b(contact|reach (out|to)|schedule|book|set up|set-up|setup a (call|chat|meeting)|talk to (your|the|someone)|chat with (your|the)|speak (to|with)|connect (me|with)|introduce me|call your)\b/.test(t)) return "contact";
    if (/\b(case stud(y|ies)|portfolio|your work|previous work|examples? of (your|work)|show me (your )?work|what have you (built|done|made|shipped)|see (your|some) work)\b/.test(t)) return "case-studies";
    if (/\b(walk me through|tour|library|components?|all the patterns?|what'?s in (the|your)|browse (the|your))\b/.test(t) && !/build|design|ship/.test(t)) return "library-tour";
    // "I'm a", "I am a", "we're", "we are", building/designing/shipping vocabulary
    if (/\b((i'?m|i am|we'?re|we are)\s+(a |an |the |building|designing|working|developing|shipping)|i (need|want) to build|we (need|want) to build|building (a|an|the)|designing (a|an|the)|my team is|our team is|we have a|as (a |an |the )?(cto|cio|cmo|coo|ceo|founder|designer|architect|engineer|lead|director))\b/.test(t)) return "building";
    return null;
  }

  // Soft match against scripted RESPONSES: if the user's message contains enough
  // distinctive tokens from a scripted prompt, route to that scripted answer.
  // This makes natural variations like "I am the CTO and compliance keeps blocking us
  // — what patterns help?" still land on the curated "Compliance keeps blocking us…"
  // response instead of falling through to fuzzy catalog matching.
  function softMatchResponse(text) {
    const t = text.toLowerCase();
    let best = null, bestScore = 0;
    Object.keys(RESPONSES).forEach(key => {
      const kl = key.toLowerCase();
      const tokens = kl.split(/\s+/).filter(x => x.length > 3 && !["what","with","that","your","this","does","they","them","when","where","into","also","just","like","need","want","show","take","help"].includes(x));
      if (!tokens.length) return;
      let hit = 0;
      tokens.forEach(tok => { if (t.includes(tok)) hit++; });
      const score = hit / tokens.length;
      if (score >= 0.55 && score > bestScore) { best = key; bestScore = score; }
    });
    return best ? RESPONSES[best] : null;
  }

  function detectRole(text) {
    const t = text.toLowerCase();
    // Enterprise CTO — architecture / governance / platform vocabulary
    if (/\b(cto|chief technology|chief architect|svp.*(architecture|cloud)|head of (platform|architecture)|enterprise architect|principal architect)\b/.test(t)) return PERSONAS.find(p => p.id === "enterprise-cto");
    // AI Strategy / Transformation Leader
    if (/\b(svp.*strategy|chief ai officer|caio|head of (ai transformation|ai strategy|ai adoption)|vp.*(ai adoption|ai transformation)|ai strategy lead|transformation (leader|lead))\b/.test(t)) return PERSONAS.find(p => p.id === "ai-strategy-lead");
    // AI Experience Lead — design system / UX leadership
    if (/\b(ai experience lead|ux engineer|design director|head of design|senior director.*(product )?design|design lead for ai|head of (ux|design) for ai|vp of design)\b/.test(t)) return PERSONAS.find(p => p.id === "ai-experience-lead");
    // AI Platform Lead — AI engineer/architect, build-side product
    if (/\b(ai (engineer|architect|platform (lead|engineer))|director.*build.*ai|head of ai (platform|engineering)|principal ai|staff ai|ml platform)\b/.test(t)) return PERSONAS.find(p => p.id === "ai-platform-lead");
    // Senior Designer (IC) — fallback for "designer" / "design IC"
    if (/\b(ui designer|ux designer|product designer|senior designer|design ic|designer)\b/.test(t)) return PERSONAS.find(p => p.id === "designer");
    // Broad fallbacks that lean strategy/founder
    if (/\b(founder|ceo|co-founder|exec|executive|owner|gm|chief executive)\b/.test(t)) return PERSONAS.find(p => p.id === "ai-strategy-lead");
    return null;
  }

  // ── Route any user message (typed or button) ──────────
  // 1) High-confidence intent → dedicated path (contact, case studies, etc.)
  // 2) Scripted response match → curated answer with pattern cards
  // 3) Free-text fuzzy match against the catalog
  // 4) Clarifying ask, with a few suggestions
  function routeUserMessage(text) {
    const trimmed = (text || "").trim();
    if (!trimmed) return;
    pushUserBubble(trimmed);
    showTyping();

    setTimeout(() => {
      hideTyping();
      const intent = detectIntent(trimmed);

      if (intent === "contact")       return showContactForm();
      if (intent === "case-studies")  return showCaseStudies();
      if (intent === "library-tour")  return startLibraryTour();

      if (intent === "building") {
        // Detect role inline. Capture for tailoring the rest of the conversation.
        const role = detectRole(trimmed);
        if (role) {
          asst.persona = role;
          $("[data-asst-sub]").textContent = `Guiding · ${role.label}`;
        }
        // If the message also names a specific scripted scenario, jump straight to
        // that scripted response — don't make the user click again.
        const direct = RESPONSES[trimmed] || softMatchResponse(trimmed);
        if (direct) {
          renderResponse(direct);
          asst.history.push({ q: trimmed, route: "building+scripted" });
          return;
        }
        if (role) {
          pushAgentBubble(`Got it. For a <b>${esc(role.label)}</b> shipping agentic UX, the most useful starting points are:`, {});
          pushQuickPicks(STARTER_PROMPTS[role.id]);
          asst.history.push({ q: trimmed, route: "building+role:" + role.id });
          return;
        }
        startBuildingFlow();
        asst.history.push({ q: trimmed, route: "building" });
        return;
      }

      // Even when no "building" intent fired, the user may have disclosed a role —
      // detect and set the persona so subsequent responses still get tailored.
      const standaloneRole = detectRole(trimmed);
      if (standaloneRole && !asst.persona) {
        asst.persona = standaloneRole;
        $("[data-asst-sub]").textContent = `Guiding · ${standaloneRole.label}`;
      }

      // Routing chain: exact scripted → soft-match scripted → free-text → clarify.
      const scripted = RESPONSES[trimmed] || softMatchResponse(trimmed);
      const fuzzy = scripted ? null : freeTextResponse(trimmed);
      const resp = scripted || fuzzy || {
        body: `I'm not quite sure I caught that. Tell me a bit more about what you're working on — even one line about your product or role helps me recommend the right patterns or surface relevant case studies.`,
        patterns: [],
        followups: ["I'm building an agentic product", "Show me your case studies", "What is HAX?"],
        sandbox: null
      };
      renderResponse(resp);
      asst.history.push({ q: trimmed, r: resp });
    }, 420);
  }

  // Back-compat alias: prior code (data-prompt buttons) called ask() directly.
  const ask = routeUserMessage;

  function renderResponse(resp) {
    const body = $("#hax-asst-body");
    const wrap = document.createElement("div");
    wrap.className = "hax-asst__msg hax-asst__msg--ai";

    // Pattern cards
    const patternCards = (resp.patterns || []).map(id => {
      const m = lookup(id);
      if (!m) return "";
      return `<a class="hax-asst__pcard" href="pattern.html?id=${encodeURIComponent(id)}">
        <span class="hax-asst__pcard-name">${esc(m.p.name)}</span>
        <span class="hax-asst__pcard-meta">${esc(m.stage.label)} · ${esc(m.sub.title)}</span>
      </a>`;
    }).join("");

    // Video POC card — a recorded walkthrough for this scenario.
    // Thumbnail = the tool shell with the variant slotted in (animated by existing CSS).
    let videoCard = "";
    if (resp.video) {
      const v = resp.video;
      const m = v.pattern ? lookup(v.pattern) : null;
      const variants = m && Array.isArray(m.p.variants) ? m.p.variants : [];
      const variant = variants[0];
      const slot = variant ? `<div class="placement__variant-inner">${variant.mock}</div>` : `<div class="t-muted" style="padding:14px;font-size:11px;text-align:center">Recording the scenario…</div>`;
      const shellHTML = SHELLS[v.archetype] ? SHELLS[v.archetype](slot) : "";
      const vid = "vid-" + Math.random().toString(36).slice(2, 9);
      videoCard = `
        <div class="hax-asst__video" data-video-id="${vid}" data-archetype="${esc(v.archetype||'')}" data-pattern="${esc(v.pattern||'')}">
          <button class="hax-asst__video-thumb" type="button" data-video-play="${vid}">
            <div class="hax-asst__video-shell">${shellHTML}</div>
            <div class="hax-asst__video-overlay">
              <span class="hax-asst__video-rec">● REC</span>
              <span class="hax-asst__video-play"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span>
              <span class="hax-asst__video-duration">${esc(v.duration || '0:45')}</span>
            </div>
          </button>
          <div class="hax-asst__video-meta">
            <div class="hax-asst__video-eyebrow">Video POC</div>
            <div class="hax-asst__video-title">${esc(v.title)}</div>
            <div class="hax-asst__video-desc">${esc(v.desc)}</div>
          </div>
        </div>
      `;
    }

    // Sandbox CTA — expands the assistant to show the demo in place.
    let sandboxBtn = "";
    if (resp.sandbox) {
      sandboxBtn = `
        <button class="hax-asst__cta hax-asst__cta--ghost" type="button" data-open-sandbox>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M4 14v6h6M20 10V4h-6M20 4L13 11M4 20l7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          See it here
        </button>
      `;
    }

    // Schedule-a-call CTA — only when the scenario is qualified.
    const contactBtn = resp.contact ? `
      <button class="hax-asst__cta hax-asst__cta--accent" type="button" data-intent="contact-team">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M3 5l9 7 9-7M3 5v14h18V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Schedule a call with the team
      </button>
    ` : "";

    const followups = (resp.followups || []).map(f => `<button class="hax-asst__starter hax-asst__starter--small" type="button" data-prompt="${esc(f)}">${esc(f)}</button>`).join("");

    wrap.innerHTML = `
      <div class="hax-asst__bubble">
        <div class="hax-asst__body-text">${resp.body}</div>
        ${patternCards ? `<div class="hax-asst__pcards">${patternCards}</div>` : ""}
        ${videoCard}
        ${(sandboxBtn || contactBtn) ? `<div class="hax-asst__ctas">${sandboxBtn}${contactBtn}</div>` : ""}
        ${followups ? `<div class="hax-asst__starters hax-asst__starters--small">${followups}</div>` : ""}
      </div>
    `;
    body.appendChild(wrap);

    if (resp.sandbox) {
      asst.sandbox = resp.sandbox;
      $("#hax-asst")?.classList.add("has-sandbox");
    }
  }

  // Inline video "player" — expand the thumbnail to a larger view of the same
  // tool-shell + variant, with a recording badge and progress animation.
  function playVideo(vid) {
    const card = document.querySelector(`[data-video-id="${vid}"]`);
    if (!card || card.classList.contains("is-playing")) return;
    card.classList.add("is-playing");
    // Add a progress bar that animates across once.
    const progress = document.createElement("div");
    progress.className = "hax-asst__video-progress";
    progress.innerHTML = `<div class="hax-asst__video-progress-bar"></div>`;
    card.appendChild(progress);
    // Remove the play overlay
    const overlay = card.querySelector(".hax-asst__video-overlay");
    if (overlay) overlay.classList.add("is-hidden");
  }

  // ───────────────────────────────────────────────────────
  // Immersive sandbox — renders the agent's recommendation
  // across multiple tool archetypes the prospect can flip between.
  // ───────────────────────────────────────────────────────
  function renderSandbox() {
    const root = $("#hax-asst-sandbox");
    if (!root || !asst.sandbox) return;
    const { templates, patterns, title } = asst.sandbox;
    const tplList = templates.filter(t => SHELLS[t]);
    const initialTpl = tplList[0];
    const initialPatternId = patterns[0];

    root.innerHTML = `
      <div class="hax-sbx">
        <header class="hax-sbx__head">
          <div>
            <div class="hax-sbx__eyebrow">Immersive sandbox</div>
            <div class="hax-sbx__title">${esc(title || "Walkthrough")}</div>
          </div>
          <div class="hax-sbx__pickers">
            <select class="hax-sbx__select" id="hax-sbx-tpl">
              ${tplList.map(t => `<option value="${t}">${SHELL_META[t].label}</option>`).join("")}
            </select>
            <select class="hax-sbx__select" id="hax-sbx-pat">
              ${patterns.map(id => { const m = lookup(id); return m ? `<option value="${id}">${esc(m.p.name)}</option>` : ""; }).join("")}
            </select>
          </div>
        </header>
        <div class="hax-sbx__stage" id="hax-sbx-stage"></div>
        <div class="hax-sbx__variants" id="hax-sbx-variants"></div>
        <footer class="hax-sbx__foot">
          <span class="hax-sbx__hint">Switch tool archetypes and pattern variants to see how the recommendation fits each surface.</span>
        </footer>
      </div>
    `;
    updateSandboxStage(initialTpl, initialPatternId);

    $("#hax-sbx-tpl").addEventListener("change", e => {
      updateSandboxStage(e.target.value, $("#hax-sbx-pat").value);
    });
    $("#hax-sbx-pat").addEventListener("change", e => {
      updateSandboxStage($("#hax-sbx-tpl").value, e.target.value);
    });
  }

  function updateSandboxStage(tplId, patternId, variantId) {
    const stage = $("#hax-sbx-stage");
    const variantsEl = $("#hax-sbx-variants");
    const m = lookup(patternId);
    if (!m || !stage) return;
    const variants = Array.isArray(m.p.variants) ? m.p.variants : [];
    const v = variantId ? variants.find(x => x.id === variantId) : variants[0];
    const slot = v ? `<div class="placement__variant-inner">${v.mock}</div>` : `<div class="t-muted" style="padding:14px;font-size:12px">No variant available</div>`;
    stage.innerHTML = SHELLS[tplId](slot);
    if (variantsEl) {
      variantsEl.innerHTML = variants.map(vr => `
        <button class="hax-sbx__variant ${v && vr.id === v.id ? 'is-active' : ''}" type="button" data-vid="${vr.id}">${esc(vr.name)}</button>
      `).join("");
      variantsEl.querySelectorAll("[data-vid]").forEach(btn => {
        btn.addEventListener("click", () => updateSandboxStage(tplId, patternId, btn.getAttribute("data-vid")));
      });
    }
  }

  // ───────────────────────────────────────────────────────
  // Wiring
  // ───────────────────────────────────────────────────────
  function wire() {
    document.addEventListener("click", (e) => {
      if (e.target.closest("[data-search-open]")) { openSearch(); return; }
      if (e.target.closest("[data-search-close]")) { closeSearch(); return; }
      if (e.target.closest("[data-asst-open]")) { openAsst(); return; }
      if (e.target.closest("[data-asst-close]")) { closeAsst(); return; }
      if (e.target.closest("[data-asst-restart]")) { restartAsst(); return; }
      if (e.target.closest("[data-asst-expand]")) { toggleExpand(); return; }
      if (e.target.closest("[data-asst-fullscreen]")) { toggleFullscreen(); return; }

      const intent = e.target.closest("[data-intent]");
      if (intent) { pickIntent(intent.getAttribute("data-intent")); return; }

      const persona = e.target.closest("[data-persona]");
      if (persona) { setPersona(persona.getAttribute("data-persona")); return; }

      const prompt = e.target.closest("[data-prompt]");
      if (prompt) { ask(prompt.getAttribute("data-prompt")); return; }

      if (e.target.closest("[data-open-sandbox]")) {
        if (!asst.expanded) toggleExpand();
        return;
      }
      const vplay = e.target.closest("[data-video-play]");
      if (vplay) { playVideo(vplay.getAttribute("data-video-play")); return; }
    });

    // Contact form submission — intercepts the inline form inside the assistant.
    document.addEventListener("submit", (e) => {
      const f = e.target.closest("[data-form='contact']");
      if (f) { e.preventDefault(); handleContactSubmit(f); }
    });

    document.addEventListener("keydown", (e) => {
      // Cmd/Ctrl + K → open search
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openSearch();
        return;
      }
      // ESC → unwind whichever is open in priority order
      if (e.key === "Escape") {
        if (!$("#hax-search")?.hasAttribute("hidden")) closeSearch();
        else if (!$("#hax-asst")?.hasAttribute("hidden")) {
          if (asst.fullscreen) toggleFullscreen();
          else if (asst.expanded) toggleExpand();
          else closeAsst();
        }
      }
      // Search nav
      const searchOpen = !$("#hax-search")?.hasAttribute("hidden");
      if (searchOpen) {
        if (e.key === "ArrowDown") { e.preventDefault(); moveSearch(+1); }
        if (e.key === "ArrowUp")   { e.preventDefault(); moveSearch(-1); }
        if (e.key === "Enter")     { e.preventDefault(); openActiveSearch(); }
      }
    });

    const input = $(".hax-search__input");
    if (input) input.addEventListener("input", e => runSearch(e.target.value));

    const composer = $("#hax-asst-input");
    if (composer) {
      composer.addEventListener("keydown", e => {
        if (e.key === "Enter") { e.preventDefault(); const v = composer.value.trim(); if (v) { ask(v); composer.value = ""; } }
      });
    }
    const send = $("#hax-asst-send");
    if (send) send.addEventListener("click", () => {
      const v = composer.value.trim();
      if (v) { ask(v); composer.value = ""; }
    });
  }

  /* The chrome is injected NOW, not on DOMContentLoaded.

     This script is the last thing before </body>, so the elements it
     adds — the search control in the nav's action cluster above all —
     are in the tree before the browser's first paint. Deferring it
     meant the header painted once without the search button and again
     with it, and because the cluster is right-aligned, adding an item
     shifted every button in it. That was the flicker on refresh.

     Behaviour still waits for the document: wiring listeners early
     would be binding against a page that is not finished yet. */
  injectChrome();
  ready(wire);
})();

/* ============================================================
   MOBILE NAV — hamburger + slide-down panel
   Self-contained. Builds from the existing .gnav on any page,
   so every page gets a working mobile menu with no markup change.
   ============================================================ */
(function () {
  /* Also synchronous: the hamburger is appended to the same
     right-hand cluster, so adding it after paint moved the same
     buttons the search control did. */
  function build() {
    var inner = document.querySelector(".gnav__inner");
    if (!inner || document.querySelector(".gnav__toggle")) return;

    var center  = inner.querySelector(".gnav__center");
    var actions = inner.querySelector(".gnav__actions");

    // Hamburger toggle (append to the actions cluster so it sits at the far right)
    var toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "gnav__toggle";
    toggle.setAttribute("aria-label", "Open menu");
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML =
      '<svg class="gnav__toggle-open" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
      '<svg class="gnav__toggle-close" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    (actions || inner).appendChild(toggle);

    // Slide-down panel (fixed to viewport, lives on <body>)
    var panel = document.createElement("nav");
    panel.className = "gnav__mobile";
    panel.setAttribute("aria-label", "Mobile navigation");

    var html = "";
    if (center) {
      var ARW = '<svg class="gnav__mobile-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      function mlink(href, text, cls, ext) {
        return '<a class="gnav__mobile-link' + (cls ? ' ' + cls : '') + '" href="' + href + '"' + (ext ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + text + ARW + '</a>';
      }
      [].forEach.call(center.children, function (el) {
        if (el.classList.contains("ox-dd")) {
          /* Initiatives / Research: a small heading, then its links */
          var btn = el.querySelector(".ox-dd__btn");
          html += '<p class="gnav__mobile-head">' + btn.textContent.trim() + '</p>';
          el.querySelectorAll(".ox-dd__menu a").forEach(function (a) {
            var sub = a.closest(".ox-dd__sub"), grp = sub && sub.parentNode.querySelector(":scope > span.ox-dd__label");
            /* items under a plain label (ShadCN / Material 3.0) carry it, so
               the two "Agentic Components" can be told apart */
            var txt = (grp ? grp.textContent.trim() + " · " : "") + a.textContent.trim();
            html += mlink(a.getAttribute("href"), txt, sub && !grp ? "gnav__mobile-link--sub" : "", a.target === "_blank");
          });
        } else if (el.classList.contains("gnav__item")) {
          html += mlink("library", "Components");
        } else if (el.matches("a.gnav__link") && el.getAttribute("href")) {
          html += mlink(el.getAttribute("href"), el.textContent.trim(), "", /^https?:/.test(el.getAttribute("href")));
        }
      });
    }
    html += '<div class="gnav__mobile-actions"></div>';
    panel.innerHTML = html;

    // Clone the SDK + Contact actions into the menu (so they stay reachable
    // even where they are hidden from the top bar on small screens)
    var mActions = panel.querySelector(".gnav__mobile-actions");
    if (actions) {
      actions.querySelectorAll(".gnav__sdk, .gnav__cta").forEach(function (a) {
        mActions.appendChild(a.cloneNode(true));
      });
    }
    document.body.appendChild(panel);

    function close() {
      panel.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      document.body.classList.remove("nav-open");
    }
    function open() {
      panel.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close menu");
      document.body.classList.add("nav-open");
    }
    toggle.addEventListener("click", function () {
      panel.classList.contains("is-open") ? close() : open();
    });
    panel.addEventListener("click", function (e) {
      if (e.target.closest("a")) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && panel.classList.contains("is-open")) close();
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 1080) close();
    });
  }

  if (document.querySelector(".gnav__inner")) build();
  else document.addEventListener("DOMContentLoaded", build);
})();

/* ============================================================
   CODE BLOCKS — the Copy button stays put while code scrolls
   Docs and MCP place Copy absolutely INSIDE the scrolling code
   block, so on a phone it slid away with the first long line and
   sat on top of the code. Each such block is wrapped once and the
   button moves to the wrapper: same corner, same look on desktop,
   but it no longer scrolls with the text. The button's own click
   handler copies a literal string, so moving it changes nothing
   about what is copied.
   ============================================================ */
(function () {
  function wrapCodeBlocks() {
    var btns = document.querySelectorAll(".dc-code > .dc-code__copy, .mcp-code > .mcp-code__copy");
    Array.prototype.forEach.call(btns, function (btn) {
      var code = btn.parentNode;
      if (code.parentNode && code.parentNode.classList.contains("hax-codewrap")) return;
      var wrap = document.createElement("div");
      wrap.className = "hax-codewrap";
      /* the block's own bottom margin moves to the wrapper, so blocks
         keep the spacing they had between them */
      var mb = getComputedStyle(code).marginBottom;
      code.parentNode.insertBefore(wrap, code);
      wrap.appendChild(code);
      wrap.appendChild(btn);
      if (mb && mb !== "0px") { wrap.style.marginBottom = mb; code.style.marginBottom = "0"; }
      if (!btn.getAttribute("aria-label")) btn.setAttribute("aria-label", "Copy code");
    });
  }
  if (document.readyState !== "loading") wrapCodeBlocks();
  else document.addEventListener("DOMContentLoaded", wrapCodeBlocks);
})();


/* ── Clean URLs when the site is opened as files ───────────────
   Links are written the way the live site serves them: /library,
   /material-pattern?id=…, / for home. A web server (or serve.py)
   maps those to the .html files; a page opened straight from the
   folder (file://) cannot, so every internal link would point at a
   file that does not exist. Only on file://, this sends those links
   (and the address the pattern pages push into the history) to the
   real file. Over http nothing here runs. */
(function () {
  if (location.protocol !== "file:") return;
  var me = document.currentScript && document.currentScript.src;
  var SITE = me ? me.replace(/[^/]*$/, "").replace(/js\/$/, "") :   /* scripts live in js/ */ location.href.replace(/[?#].*$/, "").replace(/[^/]*$/, "");
  function fix(href) {
    if (href == null) return null;
    var raw = String(href).trim();
    if (!raw || raw.charAt(0) === "#" || /^(mailto|tel|javascript|data|blob):/i.test(raw)) return null;
    var u; try { u = new URL(raw, document.baseURI); } catch (e) { return null; }
    if (u.protocol !== "file:") return null;
    var path = u.pathname;
    if (path === "/" || path === "") path = new URL(SITE).pathname + "index.html";      /* "/" = home */
    else if (path.charAt(path.length - 1) === "/") return null;                             /* a folder */
    else {
      var seg = path.slice(path.lastIndexOf("/") + 1);
      if (seg.indexOf(".") !== -1) return null;                                             /* already a file */
      path += ".html";
    }
    var out = "file://" + path + u.search + u.hash;
    return out === u.href ? null : out;
  }
  window.haxFileURL = fix;
  function link(e) { var a = e.target && e.target.closest && e.target.closest("a[href]"); return a && !a.hasAttribute("download") ? a : null; }
  /* Plain clicks: after the page's own routers have had their turn. */
  window.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = link(e); if (!a) return;
    var to = fix(a.getAttribute("href")); if (!to) return;
    e.preventDefault();
    if (a.target && a.target !== "_self") window.open(to, a.target); else location.href = to;
  });
  /* New tab / new window / copy link: correct the href itself first. */
  function fixAttr(e) {
    var a = link(e); if (!a) return;
    var to = fix(a.getAttribute("href")); if (to) a.setAttribute("href", to);
  }
  document.addEventListener("auxclick", fixAttr, true);
  document.addEventListener("contextmenu", fixAttr, true);
  document.addEventListener("mousedown", function (e) { if (e.button === 1 || e.metaKey || e.ctrlKey || e.shiftKey) fixAttr(e); }, true);
  /* Pattern pages write clean addresses into the history; keep them reloadable. */
  ["pushState", "replaceState"].forEach(function (m) {
    var orig = history[m];
    history[m] = function (state, title, url) {
      if (url != null) { var to = fix(url); if (to) url = to; }
      return orig.call(history, state, title, url);
    };
  });
  /* An address that arrived clean (a bookmark, or a reload before this ran). */
  var here = fix(location.href);
  if (here) location.replace(here);
})();


/* ── Concept home: keep visitors on the new home page ──────────
   index-new-concept.html is a concept of the home page. Once someone
   opens it, every link back to home ("/", index, index-v2 — the logo,
   footer and any other home link on every page) takes them to the
   concept instead, for the rest of that browser tab's visit, so they
   can move between Components, Scenarios, Docs, MCP and Labs and come
   back to the same home. Opening index-v2 (or "/") directly ends it.
   Nothing changes for anyone who never opens the concept page. */
(function () {
  return;   /* HAX: the concept IS the home page now (index.html), so this redirect is retired */
  var KEY = "hax-home", CONCEPT = "index-new-concept";
  var ss; try { ss = window.sessionStorage; ss.getItem(KEY); } catch (e) { ss = null; }
  if (!ss) return;
  function page(p) { return (p || "").replace(/\/+$/, "/").replace(/^.*\//, "").replace(/\.html$/, ""); }
  var here = page(location.pathname);
  if (here === CONCEPT) ss.setItem(KEY, CONCEPT);
  else if (here === "" || here === "index" || here === "index-v2") ss.removeItem(KEY);
  if (ss.getItem(KEY) !== CONCEPT) return;
  function isHome(href) {
    if (href == null) return false;
    var raw = String(href).trim();
    if (!raw || raw.charAt(0) === "#" || /^(mailto|tel|javascript|data|blob):/i.test(raw)) return false;
    var u; try { u = new URL(raw, document.baseURI); } catch (e) { return false; }
    if (u.origin !== location.origin && u.protocol !== "file:") return false;
    if (u.protocol === "file:" && location.protocol !== "file:") return false;
    var p = page(u.pathname);
    if (u.protocol === "file:" && /\/$/.test(u.pathname) && u.pathname !== "/") return false;
    return p === "" || p === "index" || p === "index-v2";
  }
  function to(href) {
    var u = new URL(String(href).trim(), document.baseURI);
    if (location.protocol === "file:") {
      var dir = (document.currentScript && document.currentScript.src || location.href).replace(/[?#].*$/, "").replace(/[^/]*$/, "");
      return dir + CONCEPT + ".html" + u.hash;
    }
    return "/" + CONCEPT + u.hash;
  }
  var me = document.currentScript && document.currentScript.src;
  function fixAll(root) {
    (root || document).querySelectorAll("a[href]").forEach(function (a) {
      if (a.hasAttribute("data-hax-home")) return;
      var h = a.getAttribute("href");
      if (isHome(h)) { a.setAttribute("data-hax-home", h); a.setAttribute("href", to(h)); }
    });
  }
  function start() {
    fixAll();
    if ("MutationObserver" in window) new MutationObserver(function (ms) {
      ms.forEach(function (m) { m.addedNodes.forEach(function (n) { if (n.nodeType === 1) { if (n.matches && n.matches("a[href]")) fixAll(n.parentNode); else fixAll(n); } }); });
    }).observe(document.documentElement, { childList: true, subtree: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
  /* belt and braces: a home link the scan missed is caught on click */
  window.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target && e.target.closest && e.target.closest("a[href]"); if (!a) return;
    if (!isHome(a.getAttribute("href"))) return;
    e.preventDefault(); location.href = to(a.getAttribute("href"));
  }, true);
})();


/* ── Copy buttons ─────────────────────────────────────────────
   Every copy control is the same .hax-copy icon button (css/styles.css).
   haxCopied(btn) shows the check for a moment; haxCopy(btn, text) puts
   the text on the clipboard first, with a fallback for the plain-http
   review server, where navigator.clipboard is missing.
   ============================================================ */
window.haxCopied = function (btn) {
  btn.classList.add("is-done");
  btn.setAttribute("aria-label", "Copied");
  clearTimeout(btn._nxCopyT);
  btn._nxCopyT = setTimeout(function () { btn.classList.remove("is-done"); btn.setAttribute("aria-label", "Copy"); }, 1600);
};
window.haxCopy = function (btn, text) {
  function legacy() {
    var ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta); window.haxCopied(btn);
  }
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { window.haxCopied(btn); }, legacy);
  else legacy();
};


/* ============================================================
   GLOBAL NAV — Initiatives / Research dropdowns (outshift.design)
   Click (or Enter/Space) opens one; clicking elsewhere, Escape, or
   opening the other closes it. Same scale-down-from-top motion.
   ============================================================ */
(function () {
  /* wrap each tab label so it can reserve its heavier width (see CSS .ox-t) */
  function wrapLabels() {
    document.querySelectorAll(".gnav .gnav__center > .gnav__link, .gnav .ox-dd__btn").forEach(function (t) {
      if (t.querySelector(".ox-t")) return;
      for (var n = t.firstChild; n; n = n.nextSibling) {
        if (n.nodeType === 3 && n.textContent.trim()) {
          var sp = document.createElement("span"); sp.className = "ox-t";
          var txt = n.textContent.trim(); sp.textContent = txt; sp.setAttribute("data-t", txt);
          t.replaceChild(sp, n); break;
        }
      }
    });
  }
  /* how far the tabs slide left while search is open: the field's extra
     width, but never into the brand */
  function measureShift() {
    var g = document.querySelector(".gnav"), c = g && g.querySelector(".gnav__center"), br = g && g.querySelector(".gnav__inner > .brand"),
        se = g && g.querySelector(".gnav__search--x");
    if (!c || !br || !se || getComputedStyle(c).display === "none") return;
    var prev = c.style.transition; c.style.transition = "none"; c.style.transform = "none";
    var cr = c.getBoundingClientRect(), right = se.getBoundingClientRect().right, GAP = 24;
    c.style.transform = ""; void c.offsetWidth; c.style.transition = prev;
    /* open the field to 200px; slide the tabs left just enough to keep a
       gap from it, but never into the brand — if there is not that much
       room, the field opens narrower instead */
    var W = 200, need = cr.right + GAP - (right - W), max = Math.max(0, cr.left - br.getBoundingClientRect().right - GAP);
    var shift = Math.max(0, Math.min(need, max));
    if (need > max) W = Math.max(140, right - (cr.right - shift + GAP));
    g.style.setProperty("--ox-shift", shift.toFixed(1) + "px");
    g.style.setProperty("--ox-search-w", W.toFixed(1) + "px");
  }
  function init() {
    wrapLabels();
    measureShift();
    addEventListener("resize", measureShift);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureShift);
    /* measure again right as search opens, so late layout (fonts, the
       search control being built) never leaves a stale distance */
    /* the whole search circle opens the dialog */
    var se = document.querySelector(".gnav .gnav__search");
    if (se) se.setAttribute("data-search-open", "");
    var dds = document.querySelectorAll(".gnav .ox-dd");
    if (!dds.length) return;
    function closeAll(except) {
      dds.forEach(function (d) {
        if (d === except) return;
        d.classList.remove("is-active");
        var b = d.querySelector(".ox-dd__btn"); if (b) b.setAttribute("aria-expanded", "false");
      });
    }
    dds.forEach(function (d) {
      var b = d.querySelector(".ox-dd__btn");
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        var open = !d.classList.contains("is-active");
        closeAll(d);
        d.classList.toggle("is-active", open);
        b.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });
    document.addEventListener("click", function (e) { if (!e.target.closest(".ox-dd")) closeAll(); });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      var open = document.querySelector(".ox-dd.is-active");
      if (open) { closeAll(); open.querySelector(".ox-dd__btn").focus(); }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();


/* Search dialog open: the page behind stays still. Wheel and touch-drag are
   swallowed everywhere except the result list, which scrolls on its own
   (overscroll-behavior keeps it from handing the scroll to the page). No
   overflow:hidden on <html> — that reset the home page to the top. */
(function () {
  function block(e) {
    if (!document.body.classList.contains("is-hax-search")) return;
    var list = e.target.closest && e.target.closest(".hax-search__results");
    if (!list) { e.preventDefault(); return; }
    if (e.type === "wheel") {
      var dy = e.deltaY, atTop = list.scrollTop <= 0, atEnd = list.scrollTop + list.clientHeight >= list.scrollHeight - 1;
      if ((dy < 0 && atTop) || (dy > 0 && atEnd)) e.preventDefault();
    }
  }
  addEventListener("wheel", block, { passive: false, capture: true });
  addEventListener("touchmove", block, { passive: false, capture: true });
  addEventListener("keydown", function (e) {
    if (!document.body.classList.contains("is-hax-search")) return;
    if (["PageUp", "PageDown", "Home", "End", " "].indexOf(e.key) > -1 && !(e.target.matches && e.target.matches("input, textarea"))) e.preventDefault();
  }, true);
})();
