"use client";
import { useEffect, useState, type ReactNode } from "react";
import { CodeBlock } from "./CodeBlock";

// Figma: HAX · MCP 101:3054 (hero 101:3128, setup 101:3191). Platform steps from the old v1 mcp.html.
const URL_MCP = "https://nucleux.in/mcp";
const C = ({ children }: { children: ReactNode }) => <code className="font-[family-name:var(--font-code)] text-[13px] bg-[var(--surface-tint)] border border-[var(--stroke-subtle)] rounded-[6px] px-[5px] py-px">{children}</code>;
type Step = { title: string; text: ReactNode; md: string; code?: string; note?: ReactNode };
const PLATFORMS: { id: string; name: string; steps: Step[] }[] = [
  { id: "claude", name: "Claude", steps: [
    { title: "Add a custom connector", text: <>In claude.ai or Claude Desktop, open Settings → Connectors and choose Add custom connector.</>, md: "In claude.ai or Claude Desktop, open **Settings → Connectors** and choose **Add custom connector**." },
    { title: "Enter the server URL", text: <>Paste this as the URL, then click Add.</>, md: "Paste this as the URL, then click **Add**.", code: URL_MCP },
    { title: "Connect and sign in", text: <>Click Connect next to HAX and sign in with the same Google account. Turn it on from the Search and tools menu in any chat.</>, md: "Click **Connect** next to HAX and sign in with the same Google account. Turn it on from the **Search and tools** menu in any chat." },
  ] },
  { id: "claude-code", name: "Claude Code", steps: [
    { title: "Add the server", text: <>Run this in your terminal:</>, md: "Run this in your terminal:", code: `claude mcp add --transport http hax ${URL_MCP}`, note: <>Add <C>--scope project</C> to share it with your team through <C>.mcp.json</C>.</> },
    { title: "Sign in", text: <>Restart Claude Code, run <C>/mcp</C>, pick hax and choose Authenticate. If it doesn’t show up, <C>/mcp</C> also shows why.</>, md: "Restart Claude Code, run `/mcp`, pick **hax** and choose **Authenticate**." },
  ] },
  { id: "codex", name: "Codex", steps: [
    { title: "Add the server", text: <>Add this to <C>~/.codex/config.toml</C>:</>, md: "Add this to `~/.codex/config.toml`:", code: `[mcp_servers.hax]\nurl = "${URL_MCP}"` },
    { title: "Sign in", text: <>Run <C>codex mcp login hax</C>, finish sign-in in the browser, then restart Codex.</>, md: "Run `codex mcp login hax`, finish sign-in in the browser, then restart Codex." },
  ] },
  { id: "cursor", name: "Cursor", steps: [
    { title: "Add the server", text: <>Add this to <C>~/.cursor/mcp.json</C> (or <C>.cursor/mcp.json</C> in your project):</>, md: "Add this to `~/.cursor/mcp.json`:", code: `{\n  "mcpServers": {\n    "hax": {\n      "url": "${URL_MCP}"\n    }\n  }\n}` },
    { title: "Enable it", text: <>Open Cursor Settings → MCP, turn on hax and click Needs login to sign in.</>, md: "Open **Cursor Settings → MCP**, turn on **hax** and click **Needs login**." },
  ] },
  { id: "vscode", name: "VS Code", steps: [
    { title: "Add the server", text: <>Add this to <C>.vscode/mcp.json</C> in your project:</>, md: "Add this to `.vscode/mcp.json`:", code: `{\n  "servers": {\n    "hax": {\n      "type": "http",\n      "url": "${URL_MCP}"\n    }\n  }\n}` },
    { title: "Start it", text: <>Click Start above the hax entry in <C>mcp.json</C> and sign in when asked. Use it from Copilot Chat in Agent mode.</>, md: "Click **Start** above the hax entry and sign in. Use it from Copilot Chat in **Agent** mode." },
  ] },
  { id: "windsurf", name: "Windsurf", steps: [
    { title: "Add the server", text: <>Add this to <C>~/.codeium/windsurf/mcp_config.json</C>:</>, md: "Add this to `~/.codeium/windsurf/mcp_config.json`:", code: `{\n  "mcpServers": {\n    "hax": {\n      "serverUrl": "${URL_MCP}"\n    }\n  }\n}` },
    { title: "Refresh", text: <>Open the Cascade MCP panel, click Refresh and sign in when asked.</>, md: "Open the **Cascade** MCP panel, click **Refresh** and sign in." },
  ] },
];

function setupMd() {
  const md = ["Read the HAX documentation below, then help me apply it. Ask which platform I use, then walk me through its setup.", "", "# MCP Server", "",
    `It works through the HAX MCP server at \`${URL_MCP}\`.`, "", "## Setup", ""];
  PLATFORMS.forEach((pl) => {
    md.push(`### ${pl.name}`, "");
    pl.steps.forEach((st, i) => { md.push(`${i + 1}. **${st.title}** — ${st.md}`); if (st.code) md.push("", "   ```", st.code.replace(/^/gm, "   "), "   ```"); });
    md.push("");
  });
  return md.join("\n").trim();
}

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
  const card = "hx-card bg-[var(--surface-tint)] border border-[var(--stroke-subtle)] flex gap-[14px] items-center px-[22px] py-[20px] rounded-[var(--radius-xl)] w-[380px]";
  const Row = ({ logo, name }: { logo: string; name: string }) => (
    <>
      <span className="bg-white border border-[var(--stroke-subtle)] flex items-center justify-center rounded-[8px] shrink-0 size-[40px]"><img alt="" src={logo} className="size-[22px]" /></span>
      <span className="flex flex-1 flex-col gap-[2px] min-w-px whitespace-nowrap">
        <span className="font-semibold leading-[20px] text-[14px]">Connect to {name}</span>
        <span className="leading-[18px] text-[12px] text-[color:var(--text-secondary)]">Opens {name} with setup steps in the prompt</span>
      </span>
      <img alt="" src="/hax/v1/icon-arrow-up-right-16.svg" className="hx-arrow size-[16px]" />
    </>
  );
  return (
    <>
      <section className="flex flex-col gap-[16px] items-start pb-[56px] pt-[72px] px-[144px] relative w-full overflow-hidden" data-node-id="101:3128">
        <h1 className="hx-rise relative font-semibold leading-[58px] text-[50px] tracking-[-0.6px] whitespace-nowrap">MCP Server</h1>
        <p className="hx-rise hx-rise--2 relative leading-[26px] text-[16px] text-[color:var(--text-secondary)] w-[760px]">Let your AI assistant search HAX patterns, components and tokens for you, straight from a prompt.</p>
        <p className="relative flex flex-wrap gap-[4px] items-center w-[760px] leading-[22px] text-[14px] text-[color:var(--text-secondary)]">
          <span>It works through the HAX MCP server.</span>
          <a href="https://modelcontextprotocol.io/" target="_blank" rel="noreferrer" className="px-[2px] py-px font-medium leading-[20px] text-[color:var(--text-link)]"><span className="hx-link">Model Context Protocol</span></a>
          <span>is an open standard that lets AI assistants connect to tools and data.</span>
        </p>
        <div className="relative flex gap-[16px] items-start pt-[16px]">
          <a href={claudeHref} target="_blank" rel="noreferrer" className={card}><Row logo="/hax/v1/logo-claude.svg" name="Claude" /></a>
          <a href="https://chatgpt.com/codex" target="_blank" rel="noreferrer" className={card}
            onClick={() => { navigator.clipboard?.writeText(setupMd()).then(() => { setToast("Setup guide copied — paste it into Codex"); setTimeout(() => setToast(""), 2600); }); }}>
            <Row logo="/hax/v1/logo-codex.svg" name="Codex" />
          </a>
        </div>
      </section>
      <section className="flex flex-col gap-[20px] items-start pb-[96px] pt-[40px] px-[144px] w-full" data-node-id="101:3191">
        <h2 className="font-semibold leading-[36px] text-[29px] tracking-[-0.2px]">Setup</h2>
        <p className="leading-[22px] text-[14px] text-[color:var(--text-secondary)]">Pick where you work. The steps change to match.</p>
        <div role="tablist" aria-label="Platform" className="bg-[var(--surface-tint)] border border-[var(--stroke-subtle)] flex gap-[4px] items-center p-[4px] rounded-[var(--radius-pill)]"
          onKeyDown={(e) => {
            const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (!d) return;
            const i = PLATFORMS.findIndex((p) => p.id === tab); const n = PLATFORMS[(i + d + PLATFORMS.length) % PLATFORMS.length];
            pick(n.id); (document.getElementById(`tab-${n.id}`) as HTMLElement | null)?.focus();
          }}>
          {PLATFORMS.map((p) => {
            const sel = p.id === tab;
            return (
              <button key={p.id} id={`tab-${p.id}`} role="tab" type="button" aria-selected={sel} tabIndex={sel ? 0 : -1} onClick={() => pick(p.id)}
                className={`hx-tab flex h-[28px] items-center px-[12px] rounded-[var(--radius-pill)] text-[13px] leading-[18px] whitespace-nowrap ${sel ? "bg-[var(--surface-accent)] font-semibold text-[color:var(--text-on-accent)]" : "font-medium text-[color:var(--text-secondary)]"}`}>{p.name}</button>
            );
          })}
        </div>
        <ol key={tab} role="tabpanel" aria-labelledby={`tab-${tab}`} className="hx-swap flex flex-col gap-[24px] items-start pt-[12px]">
          {pl.steps.map((st, i) => (
            <li key={st.title} className="flex gap-[16px] items-start">
              <span className="bg-[var(--surface-accent)] flex items-center justify-center rounded-[var(--radius-pill)] shrink-0 size-[28px] font-semibold leading-[18px] text-[13px] text-[color:var(--text-on-accent)] tracking-[0.07px]">{i + 1}</span>
              <div className="flex flex-col gap-[6px] items-start">
                <h3 className="font-semibold leading-[24px] text-[16px]">{st.title}</h3>
                <p className="leading-[22px] text-[14px] text-[color:var(--text-secondary)] w-[720px]">{st.text}</p>
                {st.code && <CodeBlock code={st.code} header={false} className="w-[480px]" />}
                {st.note && <p className="leading-[20px] text-[13px] text-[color:var(--text-secondary)]">{st.note}</p>}
              </div>
            </li>
          ))}
        </ol>
      </section>
      <div role="status" aria-live="polite" className={`fixed bottom-[88px] left-1/2 -translate-x-1/2 z-50 bg-[var(--surface-inverse)] text-[color:var(--text-on-inverse)] text-[13px] leading-[18px] px-[16px] py-[10px] rounded-[var(--radius-pill)] transition-opacity duration-300 ${toast ? "opacity-100" : "opacity-0 pointer-events-none"}`}>{toast}</div>
    </>
  );
}
