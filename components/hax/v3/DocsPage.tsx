"use client";
import { useEffect, useState } from "react";
import { CodeBlock } from "@/components/hax/v1/CodeBlock";
import { H1, Lede, SkyTag, WorldHero } from "./ui";

// Figma: HAX v3 · Docs 106:7454 (hero 106:7455, body 106:7566). Code and copy are v1's
// (components/hax/v1/DocsPage.tsx keeps them unexported).
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
const SECTIONS = [["install", "Install"], ["theming", "Set up theming"], ["quick-start", "Quick start: an agent chat"], ["packages", "Packages"]];

// section side nav: a 3px marker per link; the one you're reading turns cyan (106:7571)
export function SideNav({ items, active, label = "On this page" }: { items: string[][]; active: string; label?: string }) {
  return (
    <nav aria-label={label} className="sticky top-[104px] hidden w-[240px] shrink-0 flex-col gap-[4px] self-start lg:flex">
      {items.map(([id, t]) => {
        const on = active === id;
        return (
          <a key={id} href={`#${id}`} aria-current={on ? "location" : undefined} className={`h3-side flex items-center gap-[12px] py-[8px] leading-[20px] text-[14px] ${on ? "font-semibold text-white" : "font-medium text-[color:var(--text-2)]"}`}>
            <span className={`h-[20px] w-[3px] shrink-0 rounded-[2px] transition-colors duration-300 ${on ? "bg-[var(--cyan)]" : "bg-[rgba(255,255,255,.08)]"}`} />
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
    ? <div className="h3-glow w-full"><div className="h3-neon w-full rounded-[16px] p-[8px]">{inner}</div></div>
    : <div className="w-full rounded-[16px] border border-[var(--edge)] bg-[var(--panel)] p-[8px] shadow-[0_8px_12px_rgba(0,0,0,.4)]">{inner}</div>;
}

const h2 = "font-light leading-[40px] text-[36px] tracking-[-0.36px] text-white";
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
          <section id="install" className="h3-reveal flex scroll-mt-[96px] flex-col gap-[16px]">
            <h2 className={h2}>Install</h2>
            <p className={sub}>The umbrella package re-exports every component; you can also install any sub-package on its own.</p>
            <CodePanel code={INSTALL} featured />
          </section>
          <section id="theming" className="h3-reveal flex scroll-mt-[96px] flex-col gap-[16px]">
            <h2 className={h2}>Set up theming</h2>
            <p className={sub}>Components are styled with Tailwind utilities bound to design tokens in @hax/tokens. Add the preset, scan the compiled components, and import the token stylesheet.</p>
            <CodePanel code={TW} label="tailwind.config.js" />
            <CodePanel code={CSS} label="index.css" />
            <p className={sub}>Toggle dark mode with a .dark class on a parent element. Tokens cover colour, radius, and the keyframes for caret blink, typing dots and fade in.</p>
          </section>
          <section id="quick-start" className="h3-reveal flex scroll-mt-[96px] flex-col gap-[16px]">
            <h2 className={h2}>Quick start: an agent chat</h2>
            <p className={sub}>A scrolling transcript with auto-pin, streamed assistant messages, and a composer that submits on Enter.</p>
            <CodePanel code={CHAT} label="Chat.jsx" />
          </section>
          <section id="packages" className="h3-reveal flex scroll-mt-[96px] flex-col gap-[16px]">
            <h2 className={h2}>Packages</h2>
            <p className={sub}>About 50 sub-packages under the @hax/* scope. Import from the umbrella (@hax/react) or per package. Every export is typed.</p>
            <div className="overflow-clip rounded-[16px] border border-[var(--edge)] bg-[var(--panel)] shadow-[0_8px_24px_rgba(0,0,0,.4)]">
              {PACKAGES.map(([t, d, pk], i) => (
                <div key={t} className={`flex flex-wrap gap-[32px] p-[24px] ${i ? "border-t border-[var(--edge)]" : ""}`}>
                  <div className="flex w-[240px] flex-col gap-[4px]">
                    <h3 className="font-semibold leading-[24px] text-[16px] text-[color:var(--text)]">{t}</h3>
                    <p className="leading-[20px] text-[14px] text-[color:var(--text-2)]">{d}</p>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-wrap content-start gap-[6px]">
                    {pk.map((p) => <code key={p} className="rounded-[6px] bg-[var(--panel-2)] px-[8px] py-[4px] font-[family-name:var(--font-mono)] leading-[16px] text-[12px] text-[color:var(--text)]">{p}</code>)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
