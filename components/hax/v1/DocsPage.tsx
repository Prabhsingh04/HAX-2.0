import { CodeBlock } from "./CodeBlock";

// Figma: HAX · Docs 101:1999 (hero 101:2669, body 101:2681)
const INSTALL = `# everything (recommended)
npm install @hax/react

# or just what you need
npm install @hax/message @hax/agent-composer @hax/button

# peer deps
npm install react react-dom`;
const TW = `// tailwind.config.js
import hax from '@hax/tokens/preset'

export default {
  presets: [hax],
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './node_modules/@hax/**/dist/*.js', // generate component classes
  ],
}`;
const CSS = `/* index.css */
@import '@hax/tokens/styles.css'; /* tokens, light + .dark */
@tailwind components;
@tailwind utilities;`;
const CHAT = `import { Thread, Message, AgentComposer, Badge } from '@hax/react'


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
const PACKAGES: [string, string, string[]][] = [
  ["Agentic & chat", "The building blocks for assistant UIs.", ["agent-composer", "input-bar", "message", "thread", "reasoning", "streaming-text", "typing-indicator", "tool-call", "suggestions", "follow-up"]],
  ["Actions & inputs", "Buttons and form controls.", ["button", "icon-button", "link-button", "checkbox", "checklist", "radio-group", "rich-checkbox-group", "switch", "select", "search-input"]],
  ["Layout & navigation", "Shells, surfaces, and overlays.", ["sidebar", "nav-panel", "global-nav", "right-sidebar", "page-header", "breadcrumb", "tabs", "separator", "card", "media-card", "sheet", "dialog", "popover", "menu"]],
  ["Feedback & status", "Signals, badges, and progress.", ["alert", "toast", "badge", "chip", "progress", "avatar", "tooltip"]],
  ["Content & data", "Rich content and structured display.", ["code-block", "table", "accordion", "action-tile", "getting-started-pill", "modular-consent", "related-patterns-grid"]],
  ["Foundations", "Tokens, hooks, and utilities.", ["tokens", "tokens/preset", "tokens/styles.css", "hooks", "utils"]],
];
const h2 = "font-semibold leading-[36px] text-[29px] tracking-[-0.2px] whitespace-nowrap";
const sub = "leading-[22px] text-[14px] text-[color:var(--text-secondary)] w-[720px]";

export function DocsPage() {
  return (
    <>
      <section className="flex flex-col gap-[16px] items-start pb-[56px] pt-[72px] px-[144px] relative w-full overflow-hidden" data-node-id="101:2669">
        <img alt="" aria-hidden src="/hax/v1/wash-peach-314.svg" className="hx-wash absolute h-[314px] left-0 top-0 w-[760px] max-w-none pointer-events-none" />
        <img alt="" aria-hidden src="/hax/v1/wash-sky-314.svg" className="hx-wash hx-wash--2 absolute h-[314px] left-[740px] top-0 w-[700px] max-w-none pointer-events-none" />
        <nav aria-label="Breadcrumb" className="relative flex gap-[8px] leading-[18px] text-[12px]">
          <a href="/hax-docs" className="hx-link text-[color:var(--text-link)]">Docs</a>
          <span className="text-[color:var(--text-tertiary)]">/</span>
          <span>React</span>
        </nav>
        <h1 className="hx-rise relative font-semibold leading-[58px] text-[50px] tracking-[-0.6px] whitespace-nowrap">The agentic UI library for React.</h1>
        <p className="hx-rise hx-rise--2 relative leading-[26px] text-[16px] text-[color:var(--text-secondary)] w-[760px]">
          HAX ships every pattern in this library as a real, installable React component. One umbrella package, about 50 focused sub-packages, Tailwind-native theming, TypeScript throughout. The same components the Meeting Summariser is built from.
        </p>
      </section>
      <div className="flex flex-col gap-[56px] items-start pb-[96px] pt-[16px] px-[144px] w-full" data-node-id="101:2681">
        <section id="install" className="hx-reveal flex flex-col gap-[14px] items-start w-full">
          <h2 className={h2}>Install</h2>
          <p className={sub}>The umbrella package re-exports every component; you can also install any sub-package on its own.</p>
          <CodeBlock code={INSTALL} className="w-[880px]" />
        </section>
        <section id="theming" className="hx-reveal flex flex-col gap-[14px] items-start w-full">
          <h2 className={h2}>Set up theming</h2>
          <p className={sub}>Components are styled with Tailwind utilities bound to design tokens in @hax/tokens. Add the preset, scan the compiled components, and import the token stylesheet.</p>
          <CodeBlock code={TW} label="tailwind.config.js" className="w-[880px]" />
          <CodeBlock code={CSS} label="index.css" className="w-[880px]" />
          <p className={sub}>Toggle dark mode with a .dark class on a parent element. Tokens cover colour, radius, and the keyframes for caret blink, typing dots and fade in.</p>
        </section>
        <section id="quick-start" className="hx-reveal flex flex-col gap-[14px] items-start w-full">
          <h2 className={h2}>Quick start: an agent chat</h2>
          <p className={sub}>A scrolling transcript with auto-pin, streamed assistant messages, and a composer that submits on Enter.</p>
          <CodeBlock code={CHAT} label="Chat.jsx" className="w-[880px]" />
        </section>
        <section id="packages" className="hx-reveal flex flex-col gap-[14px] items-start w-full">
          <h2 className={h2}>Packages</h2>
          <p className={sub}>About 50 sub-packages under the @hax/* scope. Import from the umbrella (@hax/react) or per package. Every export is typed.</p>
          <div className="flex flex-wrap gap-[16px] items-start w-full">
            {PACKAGES.map(([t, d, pk]) => (
              <div key={t} className="bg-[var(--surface-tint)] border border-[var(--stroke-subtle)] flex flex-col gap-[10px] items-start px-[22px] py-[20px] rounded-[var(--radius-xl)] w-[368px]">
                <h3 className="font-semibold leading-[24px] text-[16px]">{t}</h3>
                <p className="leading-[20px] text-[13px] text-[color:var(--text-secondary)]">{d}</p>
                <div className="flex flex-wrap gap-[6px]">
                  {pk.map((p) => (
                    <code key={p} className="bg-[var(--surface-tint)] border border-[var(--stroke-subtle)] px-[6px] py-[2px] rounded-[6px] font-[family-name:var(--font-code)] leading-[18px] text-[12px] tracking-[0.2px] whitespace-nowrap">{p}</code>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
