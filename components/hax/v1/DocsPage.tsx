import { CodeBlock } from "./CodeBlock";
import { BY_COMP } from "./library/catalog";

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
// For product managers: the calls to make before launch. Each one shows up in the product as a
// component in the library, so the row links to it (names from library/catalog).
const CALLS: [string, string, string, string][] = [
  ["Read the CRM and draft a reply", "Acts alone", "Every step lands in the activity log, and people can stop it at any point.", "activity-log"],
  ["Send email outside the team", "Asks first", "An approval card says who gets it, what it costs and how long the undo lasts.", "approval-card"],
  ["Use a new tool or read new data", "Asks once", "A permission request shows what will be sent. People allow it once or always.", "permission-request"],
  ["Change 240 records at once", "Tries one first", "A sample shows the before and after, then people choose to run it on the rest.", "preview-before-run"],
  ["Refund a double charge", "Hands off", "A named person picks it up, with what the agent found passed along.", "hand-off"],
  ["Delete files or send payments", "Never", "It sits on the list of what the agent can use as a hard limit.", "capabilities"],
];
// In-page jumps: tertiary buttons, the label and arrow with no border or fill; a soft fill on hover
// and press (.hx-btn--tertiary in motion.css). The row sits 12px out so the first label lines up
// with the text above.
const jump = "hx-btn hx-btn--tertiary flex gap-[6px] h-[32px] items-center px-[12px] rounded-[var(--radius-pill)] font-semibold leading-[18px] text-[13px] tracking-[0.07px] whitespace-nowrap text-[color:var(--text-primary)]";
const th = "px-[20px] py-[12px] text-left align-bottom font-semibold leading-[16px] text-[11px] text-[color:var(--text-secondary)] tracking-[1.2px] uppercase";
const h2 = "font-semibold leading-[36px] text-[29px] tracking-[-0.2px] whitespace-nowrap";
const sub = "leading-[22px] text-[14px] text-[color:var(--text-secondary)] w-[720px]";

export function DocsPage() {
  return (
    <>
      <section className="flex flex-col gap-[16px] items-start pb-[56px] pt-[72px] px-[144px] relative w-full overflow-hidden" data-node-id="101:2669">
        <nav aria-label="Breadcrumb" className="relative flex gap-[8px] leading-[18px] text-[12px]">
          <a href="/hax-docs" className="hx-link text-[color:var(--text-link)]">Docs</a>
          <span className="text-[color:var(--text-tertiary)]">/</span>
          <span>React</span>
        </nav>
        <h1 className="hx-rise relative font-semibold leading-[58px] text-[50px] tracking-[-0.6px] whitespace-nowrap">The agentic UI library for React.</h1>
        <p className="hx-rise hx-rise--2 relative leading-[26px] text-[16px] text-[color:var(--text-secondary)] w-[760px]">
          HAX ships every pattern in this library as a real, installable React component. One umbrella package, about 50 focused sub-packages, Tailwind-native theming, TypeScript throughout. The same components the Meeting Summariser is built from.
        </p>
        <div className="hx-rise hx-rise--3 relative flex gap-[4px] pt-[8px] -ml-[12px]">
          <a href="#install" className={jump}>For engineers<img alt="" src="/hax/v1/icon-arrow-right-14.svg" className="size-[14px] rotate-90" /></a>
          <a href="#product-managers" className={jump}>For product managers<img alt="" src="/hax/v1/icon-arrow-right-14.svg" className="size-[14px] rotate-90" /></a>
        </div>
      </section>
      <div className="flex flex-col gap-[56px] items-start pb-[96px] pt-[16px] px-[144px] w-full" data-node-id="101:2681">
        <section id="install" className="scroll-mt-[110px] hx-reveal flex flex-col gap-[14px] items-start w-full">
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
        <section id="product-managers" className="scroll-mt-[110px] hx-reveal flex flex-col gap-[14px] items-start w-full">
          <h2 className={h2}>For product managers</h2>
          <p className={sub}>Before launch, decide where the agent acts alone, where it asks first, and what it never does. Each call shows up in the product as one HAX component, so your team builds exactly what you decided.</p>
          <div className="w-[1040px] max-w-full overflow-hidden rounded-[var(--radius-xl)] border border-[var(--stroke-subtle)]">
            <table className="w-full border-collapse">
              <caption className="sr-only">What the agent may do on its own, and what people see</caption>
              <colgroup><col className="w-[32%]" /><col className="w-[17%]" /><col /></colgroup>
              <thead className="bg-[var(--surface-tint)]">
                <tr><th scope="col" className={th}>When the agent wants to</th><th scope="col" className={th}>Your call</th><th scope="col" className={th}>What people see</th></tr>
              </thead>
              <tbody>
                {CALLS.map(([act, call, see, id]) => (
                  <tr key={id} className="border-t border-[var(--stroke-subtle)] align-top">
                    <td className="px-[20px] py-[16px] leading-[22px] text-[14px]">{act}</td>
                    <td className="px-[20px] py-[16px] font-semibold leading-[22px] text-[14px] whitespace-nowrap">{call}</td>
                    <td className="px-[20px] py-[16px]">
                      <p className="leading-[22px] text-[14px] text-[color:var(--text-secondary)] [text-wrap:pretty]">{see}</p>
                      <a href={`/pattern?id=${id}`} className="hx-link mt-[6px] inline-flex items-center gap-[4px] font-semibold leading-[20px] text-[13px] text-[color:var(--text-link)]">
                        {BY_COMP.get(id)?.c.name}<img alt="" src="/hax/v1/icon-arrow-right-link-12.svg" className="hx-arrow size-[12px]" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={sub}>Share this table with your engineers. Every row links to the component, with its states and the data it needs.</p>
        </section>
      </div>
    </>
  );
}
