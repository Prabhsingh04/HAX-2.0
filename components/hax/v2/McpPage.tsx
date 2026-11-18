"use client";
import { useEffect, useState } from "react";
import { CodeBlock } from "../v1/CodeBlock";
import { Weave, type Lit } from "./Weave";
import { PLATFORMS, setupMd } from "./mcpContent";

// Figma: HAX v2 · MCP 102:2469 (🌐 Website v2). MCP is lit in the weave on the HAX logo's own tiles.
const GL = { M: ["10001", "11011", "10101", "10001", "10001"], C: ["01111", "10000", "10000", "10000", "01111"], P: ["11110", "10001", "11110", "10000", "10000"] };
const MCP_ROWS = [0, 1, 2, 3, 4].map((i) => GL.M[i] + "0" + GL.C[i] + "0" + GL.P[i]);
const MCP_LIT: Lit = { rows: MCP_ROWS, q0: 17, r0: 7, trim: 15 }; // Figma 102:2474 draws the word with 15° gaps
const HERO_FADE = { top: 140, bottom: 140 };

export function McpPage() {
  const [tab, setTab] = useState("claude");
  const [toast, setToast] = useState("");
  const [claudeHref, setClaudeHref] = useState("https://claude.ai/new");
  useEffect(() => {
    setClaudeHref("https://claude.ai/new?q=" + encodeURIComponent(setupMd()));
    try { const s = localStorage.getItem("hax-mcp-platform"); if (s && PLATFORMS.some((p) => p.id === s)) setTab(s); } catch {}
  }, []);
  const pick = (id: string) => { setTab(id); try { localStorage.setItem("hax-mcp-platform", id); } catch {} };
  const pl = PLATFORMS.find((p) => p.id === tab)!;
  const card = "hx2-btn group flex w-[400px] items-center gap-[16px] rounded-[16px] border border-[color:var(--line)] bg-[color:var(--card)] py-[16px] pl-[16px] pr-[20px] hover:border-[color:var(--line-strong)] hover:shadow-[0_8px_24px_rgba(17,17,17,0.06)]";
  const Row = ({ logo, name }: { logo: string; name: string }) => (
    <>
      <span className="flex size-[40px] shrink-0 items-center justify-center rounded-[10px] border border-[color:var(--line)] bg-[color:var(--card)]"><img alt="" src={logo} className="size-[22px]" /></span>
      {/* Figma 102:2469 keeps the description on one line; it runs up to the arrow */}
      <span className="flex min-w-0 flex-1 flex-col gap-[2px]"><span className="text-[16px] font-semibold leading-[24px]">Connect to {name}</span><span className="whitespace-nowrap text-[14px] leading-[20px] text-[color:var(--grey)]">Opens {name} with setup steps in the prompt</span></span>
      <svg viewBox="0 0 24 24" className="size-[16px] text-[color:var(--grey)] transition-transform duration-300 group-hover:-translate-y-[2px] group-hover:translate-x-[2px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7h10v10" /><path d="M7 17 17 7" /></svg>
    </>
  );
  return (
    <>
      <section className="relative h-[720px] px-[120px] pt-[168px]">
        <Weave row0={1} fade={HERO_FADE} lit={MCP_LIT} />
        <div className="relative flex w-[560px] flex-col gap-[24px]">
          <h1 className="hx2-h1 hx2-rise text-[72px] font-semibold leading-[72px] tracking-[-0.03em]">MCP Server</h1>
          <p className="hx2-rise hx2-rise--2 w-[480px] text-[18px] leading-[28px] text-[color:var(--grey)]">Let your AI assistant search HAX patterns, components and tokens for you, straight from a prompt.</p>
          <p className="hx2-rise hx2-rise--2 w-[500px] text-[16px] leading-[24px] text-[color:var(--grey)]">
            It works through the HAX MCP server. <a href="https://modelcontextprotocol.io/" target="_blank" rel="noreferrer" className="hx2-link font-medium text-[color:var(--ink)] underline decoration-[color:var(--line)] underline-offset-4">Model Context Protocol</a> is an open standard that lets AI assistants connect to tools and data.
          </p>
          <div className="hx2-rise hx2-rise--3 flex flex-col gap-[12px]">
            <a href={claudeHref} target="_blank" rel="noreferrer" className={card}><Row logo="/hax/v1/logo-claude.svg" name="Claude" /></a>
            <a href="https://chatgpt.com/codex" target="_blank" rel="noreferrer" className={card}
              onClick={() => { navigator.clipboard?.writeText(setupMd()).then(() => { setToast("Setup guide copied — paste it into Codex"); setTimeout(() => setToast(""), 2600); }); }}>
              <Row logo="/hax/v1/logo-codex.svg" name="Codex" />
            </a>
          </div>
        </div>
      </section>
      <section id="setup" className="hx2-reveal px-[120px]">
        <div className="h-px w-full bg-[color:var(--line)]" />
        <div className="flex gap-[64px] pb-[80px] pt-[56px]">
          <h2 className="w-[256px] shrink-0 text-[36px] font-semibold leading-[40px] tracking-[-0.01em]">Setup</h2>
          <div className="flex w-[880px] flex-col gap-[24px]">
            <p className="text-[16px] leading-[24px] text-[color:var(--grey)]">Pick where you work. The steps change to match.</p>
            <div role="tablist" aria-label="Platform" className="flex w-fit items-center gap-[4px] rounded-full bg-[color:var(--fill)] p-[4px]"
              onKeyDown={(e) => { if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return; const d = e.key === "ArrowRight" ? 1 : -1, i = PLATFORMS.findIndex((p) => p.id === tab), n = PLATFORMS[(i + d + PLATFORMS.length) % PLATFORMS.length]; pick(n.id); (document.getElementById(`tab2-${n.id}`) as HTMLElement | null)?.focus(); }}>
              {PLATFORMS.map((p) => { const sel = p.id === tab; return (
                <button key={p.id} id={`tab2-${p.id}`} role="tab" type="button" aria-selected={sel} tabIndex={sel ? 0 : -1} onClick={() => pick(p.id)}
                  className={`rounded-full px-[16px] py-[8px] text-[14px] font-medium leading-[20px] transition-colors duration-300 ${sel ? "bg-[color:var(--btn)] text-[color:var(--btn-ink)]" : "text-[color:var(--grey)] hover:bg-[color:var(--card)] hover:text-[color:var(--ink)]"}`}>{p.name}</button>
              ); })}
            </div>
            <ol key={tab} role="tabpanel" aria-labelledby={`tab2-${tab}`} className="hx2-rise flex flex-col gap-[32px]">
              {pl.steps.map((st, i) => (
                <li key={st.title} className="flex gap-[20px]">
                  <span className="flex size-[32px] shrink-0 items-center justify-center rounded-full bg-[color:var(--btn)] font-[family-name:var(--font-mono)] text-[14px] font-medium text-[color:var(--btn-ink)]">{i + 1}</span>
                  <div className="flex w-[760px] flex-col gap-[4px]">
                    <h3 className="text-[18px] font-semibold leading-[28px]">{st.title}</h3>
                    <p className="max-w-[720px] text-[16px] leading-[24px] text-[color:var(--grey)] [text-wrap:balance]">{st.text}</p>
                    {st.code && <div className="pt-[8px]"><CodeBlock code={st.code} header={false} className="w-[480px]" /></div>}
                    {st.note && <p className="pt-[8px] text-[14px] leading-[20px] text-[color:var(--grey)]">{st.note}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
      <div role="status" aria-live="polite" className={`fixed bottom-[96px] left-1/2 z-50 -translate-x-1/2 rounded-full bg-[color:var(--btn)] px-[16px] py-[10px] text-[14px] text-[color:var(--btn-ink)] shadow-[0_8px_24px_rgba(17,17,17,0.2)] transition-all duration-300 ${toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"}`}>{toast}</div>
    </>
  );
}
