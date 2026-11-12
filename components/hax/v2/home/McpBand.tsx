"use client";
import { useMemo, useRef, useState } from "react";
import { glowAt, neonAt, useStrikeClock } from "../neon";
import { Weave, STRONG, type Lit } from "../Weave";
import { CodeBlock } from "../../v1/CodeBlock";
import { onTabKeys } from "../../v1/tabKeys";
import { AGENT_PROMPT } from "../../v1/home/AgentsAndDevelopers";
import { ArrowRight } from "../icons";

// Figma: HAX v2 · Home · MCP 103:3481, the page's one dark band. The lit tiles top right are Figma's
// "Component tiles · lit" (103:3486), exported as is; the field is the dark weave, half a tile in.
const TABS = {
  agent: { label: "AI agent", head: "Paste into your AI agent", code: AGENT_PROMPT },
  react: { label: "React", head: "Terminal", code: "npm install @hax/react" },
} as const;
type K = keyof typeof TABS;
const KEYS = Object.keys(TABS) as K[];
const SHIFT = { x: -20, y: -20 }, FADE = { top: 0, bottom: 0 };
// MCP lit in the dark weave top right, the way the MCP page writes it (McpPage.tsx), in the logo's colours
const GL = { M: ["10001", "11011", "10101", "10001", "10001"], C: ["01111", "10000", "10000", "10000", "01111"], P: ["11110", "10001", "11110", "10000", "10000"] };
const MCP: Lit = { rows: [0, 1, 2, 3, 4].map((i) => GL.M[i] + "0" + GL.C[i] + "0" + GL.P[i]), q0: 18, r0: 5, trim: 15, stops: STRONG };
// a hard-edged, full-bleed dark block (the user's call): no fade at either edge, for the band or its weave

// M, C and P strike on like neon tubes when the band scrolls into view (tiles 18–22, 24–28, 30–34)
const ON = [.2, .55, .9];
const letterOf = (q: number) => (q < 23 ? 0 : q < 29 ? 1 : 2);

export function McpBand() {
  const band = useRef<HTMLElement>(null);
  const t = useStrikeClock(ON[2], band);
  const neon = useMemo<Lit>(() => ({ ...MCP, alpha: (q: number) => neonAt(t - ON[letterOf(q)]) }), [t]);
  const glow = glowAt(t, ON[2]);
  const [tab, setTab] = useState<K>("agent");
  return (
    <section ref={band} id="developers" className="relative flex flex-col gap-[64px] px-[120px] py-[160px] text-white" data-node-id="103:3481">
      <div aria-hidden className="absolute inset-y-0 left-1/2 w-screen max-w-none -translate-x-1/2" style={{ background: "var(--mcp)" }} />
      {/* the weave runs on into Built by below (row0 + rows here = its row0), only the colour band fades */}
      {/* field, then the tube glow (a blurred copy of the letters), then the tubes */}
      <Weave layer="field" row0={40} color="#2a3446" opacity={0.6} width={2} shift={SHIFT} fade={FADE} lit={neon} />
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ opacity: glow }}><Weave layer="pictures" row0={40} shift={SHIFT} fade={FADE} lit={neon} className="blur-[7px]" /></div>
      <Weave layer="pictures" row0={40} shift={SHIFT} fade={FADE} lit={neon} />
      <div className="hx2-reveal relative flex w-[568px] flex-col gap-[24px]">
        <p className="font-[family-name:var(--font-mono)] text-[12px] font-medium uppercase leading-[16px] tracking-[0.06em] text-white/[.64]">MCP server</p>
        <h2 className="text-[48px] font-semibold leading-[48px] tracking-[-0.02em]">Your AI agent already<br />knows how to use it</h2>
        <p className="text-[18px] leading-[28px] text-white/[.64]">HAX runs an MCP server, so Claude, Cursor, Codex and VS Code can ask it which patterns to use and build them for you. Prefer to write the code? It’s one package.</p>
      </div>
      <div className="hx2-reveal relative flex flex-col gap-[16px]">
        <div role="tablist" aria-label="Ways to use HAX" onKeyDown={onTabKeys(KEYS, tab, setTab)}
          className="flex w-fit items-center gap-[4px] rounded-full border border-white/[.12] bg-white/[.06] p-[4px]">
          {KEYS.map((k) => {
            const sel = tab === k;
            return (
              <button key={k} type="button" role="tab" id={`hx2-use-${k}`} aria-controls="hx2-use-panel" aria-selected={sel} tabIndex={sel ? 0 : -1} onClick={() => setTab(k)}
                className={`hx2-tab flex h-[28px] items-center rounded-full px-[12px] text-[13px] leading-[18px] ${sel ? "bg-[#00bceb] font-semibold text-white" : "font-medium text-white/[.64] hover:bg-white/[.08] hover:text-white"}`}>
                {TABS[k].label}
              </button>
            );
          })}
        </div>
        <div className="grid w-[802px]">
          {KEYS.map((k) => (
            <div key={k} role={k === tab ? "tabpanel" : undefined} id={k === tab ? "hx2-use-panel" : undefined} aria-labelledby={k === tab ? `hx2-use-${k}` : undefined}
              aria-hidden={k !== tab} className={`[grid-area:1/1] rounded-[12px] border border-white/[.16] transition-opacity duration-300 ${k === tab ? "opacity-100" : "invisible opacity-0"}`}>
              <CodeBlock code={TABS[k].code} label={TABS[k].head} className="w-full" />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-[12px] text-[14px] leading-[20px]">
          <p className="text-white/[.64]">Using Claude Code? Add the server first:</p>
          <code className="rounded-[6px] border border-white/[.12] bg-white/[.08] px-[8px] py-[4px] font-[family-name:var(--font-mono)] text-[13px] leading-[20px] text-white/[.88]">claude mcp add --transport http hax https://nucleux.in/mcp</code>
          <span className="w-[12px]" />
          <p className="text-white/[.64]">Cursor, Codex, VS Code and others:</p>
          <a href="/v2/mcp" className="flex items-center gap-[6px] font-semibold">
            <span className="hx2-link">MCP setup</span>
            <ArrowRight className="hx2-arrow size-[14px]" strokeWidth={1.8} />
          </a>
        </div>
      </div>
    </section>
  );
}
