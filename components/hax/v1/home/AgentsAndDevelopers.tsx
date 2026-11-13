"use client";
import { useState } from "react";
import { onTabKeys } from "../tabKeys";

// Figma: Agents and developers 98:19846
export const AGENT_PROMPT = `Use HAX for the AI screens in this project.

1. Connect the HAX MCP server: https://nucleux.in/mcp
2. Before you build any AI screen, ask HAX which patterns fit it,
   and follow each pattern's "when not to use" guidance.
3. Build with @hax/react components and our existing theme.
4. Show me the plan before you change any files.`;

const TABS = {
  agent: { label: "AI agent", head: "Paste into your AI agent", code: AGENT_PROMPT },
  react: { label: "React", head: "Terminal", code: "npm install @hax/react" },
} as const;
type K = keyof typeof TABS;

export function AgentsAndDevelopers() {
  const [tab, setTab] = useState<K>("agent");
  const [copied, setCopied] = useState(false);
  const cur = TABS[tab];
  const copy = () => {
    navigator.clipboard?.writeText(cur.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    }, () => {});
  };
  const keys = Object.keys(TABS) as K[];
  return (
    <section id="developers" className="flex flex-col gap-[28px] items-center px-[144px] py-[96px] relative w-full overflow-hidden" data-node-id="98:19846">
      <h2 className="hx-reveal relative font-extralight leading-[60px] text-[50px] text-center whitespace-nowrap">
        Your AI agent already{" "}
        <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg, rgb(217, 119, 6) 0%, rgb(217, 119, 6) 50.883%, rgb(225, 29, 72) 80.353%, rgb(190, 24, 93) 100%)" }}>
          knows how to use it
        </span>
      </h2>
      <p className="relative leading-[26px] text-[16px] text-[color:var(--text-secondary)] text-center whitespace-nowrap">
        HAX runs an MCP server, so Claude, Cursor, Codex and VS Code can ask it which patterns to use
        <br />
        and build them for you. Prefer to write the code? It’s one package.
      </p>
      <div role="tablist" aria-label="Ways to use HAX" onKeyDown={onTabKeys(keys, tab, setTab)} className="relative bg-[var(--surface-tint)] border border-[var(--stroke-subtle)] flex gap-[4px] items-center p-[4px] rounded-[var(--radius-pill)]">
        {keys.map((k) => {
          const sel = tab === k;
          return (
            <button key={k} type="button" role="tab" id={`hx-use-${k}`} aria-controls="hx-use-panel" aria-selected={sel} tabIndex={sel ? 0 : -1} onClick={() => setTab(k)}
              className={`hx-tab flex h-[28px] items-center px-[12px] rounded-[var(--radius-pill)] text-[13px] leading-[18px] whitespace-nowrap ${sel ? "bg-[var(--surface-accent)] font-semibold text-[color:var(--text-on-accent)]" : "font-medium text-[color:var(--text-secondary)]"}`}>
              {TABS[k].label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" id="hx-use-panel" aria-labelledby={`hx-use-${tab}`} className="relative bg-[var(--surface-code)] flex flex-col gap-[12px] items-start pb-[22px] pt-[18px] px-[24px] rounded-[var(--radius-xl)] w-[800px]">
        <div className="flex items-center justify-between w-full">
          <p className="font-semibold leading-[16px] text-[11px] text-[color:var(--text-tertiary)] tracking-[1.2px] uppercase">{cur.head}</p>
          <button type="button" onClick={copy} aria-label={copied ? "Copied" : "Copy code"} className="relative size-[14px] hx-copy">
            <img alt="" src="/hax/v1/icon-copy-tertiary.svg" className={`absolute inset-0 size-[14px] transition-all duration-200 ${copied ? "opacity-0 scale-50" : ""}`} />
            <svg viewBox="0 0 24 24" className={`absolute inset-0 size-[14px] text-[#00bceb] transition-all duration-300 ${copied ? "opacity-100 scale-100" : "opacity-0 scale-50"}`} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
          </button>
        </div>
        <pre key={tab} className="hx-swap m-0 font-[family-name:var(--font-code)] leading-[22px] text-[13px] text-[color:var(--text-code)] tracking-[0.2px] whitespace-pre">{cur.code}</pre>
      </div>
      <div className="relative flex gap-[6px] items-center">
        <p className="leading-[20px] text-[13px] text-[color:var(--text-secondary)] whitespace-nowrap">Using Claude Code? Add the server first:</p>
        <code className="bg-[var(--surface-tint)] border border-[var(--stroke-subtle)] px-[6px] py-[2px] rounded-[6px] font-[family-name:var(--font-code)] leading-[18px] text-[12px] tracking-[0.2px] whitespace-nowrap">claude mcp add --transport http hax https://nucleux.in/mcp</code>
        <p className="leading-[20px] text-[13px] text-[color:var(--text-secondary)] whitespace-nowrap">Cursor, Codex, VS Code and others:</p>
        <a href="/mcp" className="flex gap-[4px] items-center px-[2px] py-px rounded-[4px] font-medium leading-[18px] text-[13px] text-[color:var(--text-link)] whitespace-nowrap">
          <span className="hx-link">MCP setup</span>
          <img alt="" src="/hax/v1/icon-arrow-right-link-12.svg" className="hx-arrow size-[12px]" />
        </a>
      </div>
    </section>
  );
}
