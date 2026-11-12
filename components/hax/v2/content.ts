// Content shared with v1. These strings are copied VERBATIM from v1 (components/hax/v1/*), which keeps them
// inline and unexported. Every version must say exactly the same thing: if v1 changes, change these too,
// or switch to imports once v1 exports them.

// v1 DocsPage.tsx
export const INSTALL = `# everything (recommended)
npm install @hax/react

# or just what you need
npm install @hax/message @hax/agent-composer @hax/button

# peer deps
npm install react react-dom`;
export const TW = `// tailwind.config.js
import hax from '@hax/tokens/preset'

export default {
  presets: [hax],
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './node_modules/@hax/**/dist/*.js', // generate component classes
  ],
}`;
export const CSS = `/* index.css */
@import '@hax/tokens/styles.css'; /* tokens, light + .dark */
@tailwind components;
@tailwind utilities;`;
export const CHAT = `import { Thread, Message, AgentComposer, Badge } from '@hax/react'


function Chat({ messages, input, setInput, onSend, busy }) {
  return (
    <Thread autoScrollKey={messages.length}>
      {messages.map((m) => (
        <Message key={m.id} role={m.role} content={m.text} streaming={m.streaming} />
      ))}
      <AgentComposer
        value={input}
        onValueChange={setInput}
        onSubmit={onSend}
        loading={busy}
        placeholder="Ask anything…"
      />
    </Thread>
  )
}`;
export const PACKAGES: [string, string, string[]][] = [
  ["Agentic & chat", "The building blocks for assistant UIs.", ["agent-composer", "input-bar", "message", "thread", "reasoning", "streaming-text", "typing-indicator", "tool-call", "suggestions", "follow-up"]],
  ["Actions & inputs", "Buttons and form controls.", ["button", "icon-button", "link-button", "checkbox", "checklist", "radio-group", "rich-checkbox-group", "switch", "select", "search-input"]],
  ["Layout & navigation", "Shells, surfaces, and overlays.", ["sidebar", "nav-panel", "global-nav", "right-sidebar", "page-header", "breadcrumb", "tabs", "separator", "card", "media-card", "sheet", "dialog", "popover", "menu"]],
  ["Feedback & status", "Signals, badges, and progress.", ["alert", "toast", "badge", "chip", "progress", "avatar", "tooltip"]],
  ["Content & data", "Rich content and structured display.", ["code-block", "table", "accordion", "action-tile", "getting-started-pill", "modular-consent", "related-patterns-grid"]],
  ["Foundations", "Tokens, hooks, and utilities.", ["tokens", "tokens/preset", "tokens/styles.css", "hooks", "utils"]],
];

// v1 BlogPage.tsx
export const TOPICS = ["Research", "AI", "AI Ethics", "Product Design", "Design", "Workflow", "Agents", "Case Study"];
export const POSTS = [
  { slug: "human-agent-hermeneutics", title: "Human-agent hermeneutics: designing for understanding, not instruction.", body: "Why the unit of design is the evolving interpretation between a person and an agent, not the prompt or the action.", author: "Marc Scibelli", date: "August 2026", kind: "16 min read", tags: ["Design", "AI", "Agents", "Research"] },
  { slug: "button-is-no-longer-the-point", title: "The Button Is No Longer the Point", body: "As AI systems begin to reason, adapt, and act, design shifts from perfecting interfaces to shaping behavior and the human–AI relationship — putting HAX principles like Control, Clarity, Recovery, Collaboration, and Traceability at the center of the craft.", author: "Krystelle Gonzalez Papaux", date: "June 2026", kind: "6 min read", tags: ["Design", "AI", "Product Design", "AI Ethics"] },
  { slug: "navigating-multi-agent-future", title: "Navigating the Multi-Agent Future: Expert Perspectives on Human-Agent Interaction", body: "The shifting landscape of work and interaction. This report presents key findings and actionable insights drawn from leading industry and academic experts on the future of human agent interaction.", author: "Krystelle Gonzalez Papaux", date: "April 2026", kind: "Whitepaper", tags: ["Research", "AI", "Agents"] },
  { slug: "making-room-agents", title: "Making Room for Agents in Expert Tools", body: "How agents need to map onto the grammar of expert tools — not just add a chat panel, but participate in the work without displacing the structure that makes expert fluency possible.", author: "Marc Scibelli", date: "May 2026", kind: "Article", tags: ["Design", "AI", "Agents"] },
  { slug: "augmented-designer", title: "The Augmented Designer: How Agents are Reshaping the Design Workflow", body: "Reflections on AI-augmented design at Outshift — from the dangers of plausible noise to the CASA project case study and a week of record-breaking fidelity.", author: "Valentina Esposito", date: "June 2026", kind: "8 min read", tags: ["Design", "AI", "Workflow", "Case Study", "Agents"] },
];

// v1 ContactPage.tsx
export const HELP: [string, string][] = [
  ["pattern-library-integration", "Pattern Library Integration"],
  ["ai-experience-design", "AI Experience Design"],
  ["agent-workflow-design", "Agent Workflow Design"],
  ["ai-design-system-audit", "AI Design System Audit"],
  ["custom-pattern-development", "Custom Pattern Development"],
  ["other", "Other"],
];
