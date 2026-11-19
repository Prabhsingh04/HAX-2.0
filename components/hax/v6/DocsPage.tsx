"use client";
import { useEffect, useState } from "react";
import { CodeBlock } from "@/components/hax/v6/vendor/components/hax/v1/CodeBlock";
import { BY_COMP } from "@/components/hax/v1/library/catalog";
import { H1, Lede, SkyTag, WorldHero } from "@/components/hax/v6/ui";

// v3's Docs (Figma HAX v3 · Docs 106:7454; hero 106:7455, body 106:7566) on white. Code and copy
// are v1's latest (components/hax/v1/DocsPage.tsx keeps them unexported).
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
// For product managers: v1's words (components/hax/v1/DocsPage.tsx, kept unexported there). Each row
// links to the component in v1's library that carries that call (names from library/catalog).
const CALLS: [string, string, string, string][] = [
  ["Read the CRM and draft a reply", "Acts alone", "Every step lands in the activity log, and people can stop it at any point.", "activity-log"],
  ["Send email outside the team", "Asks first", "An approval card says who gets it, what it costs and how long the undo lasts.", "approval-card"],
  ["Use a new tool or read new data", "Asks once", "A permission request shows what will be sent. People allow it once or always.", "permission-request"],
  ["Change 240 records at once", "Tries one first", "A sample shows the before and after, then people choose to run it on the rest.", "preview-before-run"],
  ["Refund a double charge", "Hands off", "A named person picks it up, with what the agent found passed along.", "hand-off"],
  ["Delete files or send payments", "Never", "It sits on the list of what the agent can use as a hard limit.", "capabilities"],
];
const NAME = new Map([...BY_COMP].map(([id, x]) => [id, x.c.name] as const));
const th = "px-[20px] py-[12px] text-left align-bottom font-[family-name:var(--font-mono)] font-medium leading-[16px] text-[12px] tracking-[0.96px] uppercase text-[color:var(--text-2)]";
const SECTIONS = [["install", "Install"], ["theming", "Set up theming"], ["quick-start", "Quick start: an agent chat"], ["packages", "Packages"], ["product-managers", "For product managers"]];

// section side nav: a 3px marker per link; the one you're reading turns cyan (106:7571)
export function SideNav({ items, active, label = "On this page" }: { items: string[][]; active: string; label?: string }) {
  return (
    <nav aria-label={label} className="sticky top-[104px] hidden w-[240px] shrink-0 flex-col gap-[4px] self-start lg:flex">
      {items.map(([id, t]) => {
        const on = active === id;
        return (
          <a key={id} href={`#${id}`} aria-current={on ? "location" : undefined} className={`h6-side flex items-center gap-[12px] py-[8px] leading-[20px] text-[14px] ${on ? "font-semibold text-[color:var(--text)]" : "font-medium text-[color:var(--text-2)]"}`}>
            <span className={`h-[20px] w-[3px] shrink-0 rounded-[2px] transition-colors duration-300 ${on ? "bg-[var(--cyan)]" : "bg-[var(--edge-2)]"}`} />
            {t}
          </a>
        );
      })}
    </nav>
  );
}
export function useActive(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-120px 0px -65% 0px" });
    ids.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [ids]);
  return active;
}

// Code panel: v1's CodeBlock in a raised frame; the page's first one carries the neon edge
export function CodePanel({ code, label, featured }: { code: string; label?: string; featured?: boolean }) {
  const inner = <CodeBlock code={code} label={label} />;
  return featured
    ? <div className="h6-glow w-full"><div className="h6-neon w-full rounded-[16px] p-[8px]">{inner}</div></div>
    : <div className="w-full rounded-[16px] border border-[var(--edge)] bg-[var(--panel)] p-[8px] shadow-[0_12px_28px_-18px_rgba(15,17,23,.3)]">{inner}</div>;
}

const h2 = "font-light leading-[40px] text-[36px] tracking-[-0.36px] text-[color:var(--text)]";
const sub = "max-w-[640px] leading-[24px] text-[16px] text-[color:var(--text-2)]";
const IDS = SECTIONS.map(([id]) => id);

export function DocsPage() {
  const active = useActive(IDS);
  return (
    <>
      <WorldHero nodeId="106:7455">
        <SkyTag>Docs / React</SkyTag>
        <H1 line1="The agentic UI library" line2="for React." />
        <Lede className="max-w-[720px]">HAX ships every pattern in this library as a real, installable React component. One umbrella package, about 50 focused sub-packages, Tailwind-native theming, TypeScript throughout. The same components the Meeting Summariser is built from.</Lede>
      </WorldHero>
      <div className="mx-auto flex max-w-[1200px] gap-[64px] px-[24px] pb-[120px] pt-[48px]" data-node-id="106:7566">
        <SideNav items={SECTIONS} active={active} />
        <div className="flex min-w-0 flex-1 flex-col gap-[96px]">
          <section id="install" className="h6-reveal flex scroll-mt-[96px] flex-col gap-[16px]">
            <h2 className={h2}>Install</h2>
            <p className={sub}>The umbrella package re-exports every component; you can also install any sub-package on its own.</p>
            <CodePanel code={INSTALL} featured />
          </section>
          <section id="theming" className="h6-reveal flex scroll-mt-[96px] flex-col gap-[16px]">
            <h2 className={h2}>Set up theming</h2>
            <p className={sub}>Components are styled with Tailwind utilities bound to design tokens in @hax/tokens. Add the preset, scan the compiled components, and import the token stylesheet.</p>
            <CodePanel code={TW} label="tailwind.config.js" />
            <CodePanel code={CSS} label="index.css" />
            <p className={sub}>Toggle dark mode with a .dark class on a parent element. Tokens cover colour, radius, and the keyframes for caret blink, typing dots and fade in.</p>
          </section>
          <section id="quick-start" className="h6-reveal flex scroll-mt-[96px] flex-col gap-[16px]">
            <h2 className={h2}>Quick start: an agent chat</h2>
            <p className={sub}>A scrolling transcript with auto-pin, streamed assistant messages, and a composer that submits on Enter.</p>
            <CodePanel code={CHAT} label="Chat.jsx" />
          </section>
          <section id="packages" className="h6-reveal flex scroll-mt-[96px] flex-col gap-[16px]">
            <h2 className={h2}>Packages</h2>
            <p className={sub}>About 50 sub-packages under the @hax/* scope. Import from the umbrella (@hax/react) or per package. Every export is typed.</p>
            <div className="overflow-clip rounded-[16px] border border-[var(--edge)] bg-[var(--panel)] shadow-[0_12px_28px_-18px_rgba(15,17,23,.3)]">
              {PACKAGES.map(([t, d, pk], i) => (
                <div key={t} className={`flex flex-wrap gap-[32px] p-[24px] ${i ? "border-t border-[var(--edge)]" : ""}`}>
                  <div className="flex w-full flex-col gap-[4px] md:w-[240px]">
                    <h3 className="font-semibold leading-[24px] text-[16px] text-[color:var(--text)]">{t}</h3>
                    <p className="leading-[20px] text-[14px] text-[color:var(--text-2)]">{d}</p>
                  </div>
                  {/* basis 220: on phones the chips wrap under the title instead of squeezing beside it */}
                  <div className="flex min-w-0 flex-1 basis-[220px] flex-wrap content-start gap-[6px]">
                    {pk.map((p) => <code key={p} className="rounded-[6px] bg-[var(--panel-2)] px-[8px] py-[4px] font-[family-name:var(--font-mono)] leading-[16px] text-[12px] text-[color:var(--text)]">{p}</code>)}
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section id="product-managers" className="h6-reveal flex scroll-mt-[96px] flex-col gap-[16px]">
            <h2 className={h2}>For product managers</h2>
            <p className={sub}>Before launch, decide where the agent acts alone, where it asks first, and what it never does. Each call shows up in the product as one HAX component, so your team builds exactly what you decided.</p>
            {/* on phones the three columns don't fit: the table scrolls sideways inside its card */}
            <div className="overflow-x-auto rounded-[16px] border border-[var(--edge)] bg-[var(--panel)] shadow-[0_12px_28px_-18px_rgba(15,17,23,.3)]">
              <table className="w-full min-w-[560px] border-collapse md:min-w-0">
                <caption className="sr-only">What the agent may do on its own, and what people see</caption>
                <colgroup><col className="w-[32%]" /><col className="w-[17%]" /><col /></colgroup>
                <thead className="bg-[var(--panel-2)]">
                  <tr><th scope="col" className={th}>When the agent wants to</th><th scope="col" className={th}>Your call</th><th scope="col" className={th}>What people see</th></tr>
                </thead>
                <tbody>
                  {CALLS.map(([act, call, see, id]) => (
                    <tr key={id} className="border-t border-[var(--edge)] align-top">
                      <td className="px-[20px] py-[16px] leading-[24px] text-[15px] text-[color:var(--text)]">{act}</td>
                      <td className="px-[20px] py-[16px] font-semibold leading-[24px] text-[15px] text-[color:var(--text)] whitespace-nowrap">{call}</td>
                      <td className="px-[20px] py-[16px]">
                        <p className="leading-[24px] text-[15px] text-[color:var(--text-2)] [text-wrap:pretty]">{see}</p>
                        <a href={`/v4/pattern?id=${id}`} className="mt-[6px] inline-flex items-center gap-[6px] font-semibold leading-[20px] text-[14px] text-[color:var(--link)]">
                          <span className="h6-link">{NAME.get(id)}</span>
                          <svg viewBox="0 0 14 14" aria-hidden className="h6-arrow size-[14px]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7h9M8 3.5 11.5 7 8 10.5" /></svg>
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
      </div>
    </>
  );
}
