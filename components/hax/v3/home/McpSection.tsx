"use client";
import { useState } from "react";
import { AGENT_PROMPT } from "@/components/hax/v1/home/AgentsAndDevelopers";
import { CodeBlock } from "@/components/hax/v1/CodeBlock";
import { onTabKeys } from "@/components/hax/v1/tabKeys";
import TextType from "@/components/reactbits/TextType";
import { Eyebrow, H2, Sub } from "../ui";

// Figma: MCP 106:7270. The Claude Code command types itself out with a block cursor once it scrolls
// into view (React Bits TextType). Phones keep the heading and the setup link; the prompt panel and
// the command are for desktops, where an agent is open to paste into.
const TABS = {
  agent: { label: "AI agent", head: "Paste into your AI agent", code: AGENT_PROMPT },
  react: { label: "React", head: "Terminal", code: "npm install @hax/react" },
} as const;
type K = keyof typeof TABS;
const KEYS = Object.keys(TABS) as K[];

export function Tabs<T extends string>({ keys, cur, pick, labels, idPrefix, ariaLabel }: { keys: readonly T[]; cur: T; pick: (k: T) => void; labels: Record<T, string>; idPrefix: string; ariaLabel: string }) {
  return (
    <div role="tablist" aria-label={ariaLabel} onKeyDown={onTabKeys(keys, cur, pick)} className="flex flex-wrap items-center gap-[4px] rounded-[999px] border border-[var(--edge)] bg-[rgba(255,255,255,.04)] p-[4px]">
      {keys.map((k) => {
        const sel = k === cur;
        return (
          <button key={k} type="button" role="tab" id={`${idPrefix}-${k}`} aria-controls={`${idPrefix}-panel`} aria-selected={sel} tabIndex={sel ? 0 : -1} onClick={() => pick(k)}
            className={`h3-tab flex h-[28px] items-center rounded-[999px] px-[12px] leading-[18px] text-[13px] whitespace-nowrap ${sel ? "bg-[var(--cyan)] font-semibold text-[color:var(--bg)]" : "font-medium text-[color:var(--text-2)]"}`}>
            {labels[k]}
          </button>
        );
      })}
    </div>
  );
}

export function McpSection() {
  const [tab, setTab] = useState<K>("agent");
  const cur = TABS[tab];
  return (
    <section id="developers" className="flex flex-col items-center gap-[24px] px-[24px] py-[64px] md:gap-[32px] md:py-[96px]" data-node-id="106:7270">
      <div className="h3-reveal flex max-w-[680px] flex-col items-center gap-[16px] text-center">
        <Eyebrow>MCP server</Eyebrow>
        <H2>Your AI agent already<br />knows how to use it</H2>
        <Sub className="max-md:text-[16px] max-md:leading-[24px]">HAX runs an MCP server, so Claude, Cursor, Codex and VS Code can ask it which patterns to use and build them for you. Prefer to write the code? It’s one package.</Sub>
      </div>
      <div className="flex w-full flex-col items-center gap-[32px] max-md:hidden">
        <Tabs keys={KEYS} cur={tab} pick={setTab} labels={{ agent: TABS.agent.label, react: TABS.react.label }} idPrefix="h3-use" ariaLabel="Ways to use HAX" />
        <div role="tabpanel" id="h3-use-panel" aria-labelledby={`h3-use-${tab}`} className="w-full max-w-[800px] overflow-clip rounded-[12px] border border-[var(--edge-2)]">
          <div key={tab} className="h3-swap"><CodeBlock code={cur.code} label={cur.head} /></div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-[12px] leading-[20px] text-[14px] text-[color:var(--text-2)]">
        <p className="max-md:hidden">Using Claude Code? Add the server first:</p>
        <TextType as="code" text="claude mcp add --transport http hax https://nucleux.in/mcp" typingSpeed={26} initialDelay={250} loop={false} startOnVisible
          showCursor cursorStyle="block" cursorColor="var(--cyan)"
          className="min-w-[57ch] rounded-[6px] border border-[var(--edge-2)] bg-[var(--panel-2)] px-[8px] py-[4px] text-left font-[family-name:var(--font-mono)] text-[13px] text-[color:var(--text)] max-md:hidden" />
        <span className="w-[12px] max-md:hidden" />
        <p className="max-md:hidden">Cursor, Codex, VS Code and others:</p>
        <a href="/v3/mcp" className="flex items-center gap-[6px] font-semibold text-[color:var(--cyan)]">
          <span className="h3-link">MCP setup</span>
          <img alt="" src="/hax/v3/icon-right-14-cyan.svg" className="h3-arrow size-[14px]" />
        </a>
      </div>
    </section>
  );
}
