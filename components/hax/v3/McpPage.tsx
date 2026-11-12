"use client";
import { useEffect, useState, type ReactNode } from "react";
import { CodeBlock } from "@/components/hax/v1/CodeBlock";
import { onTabKeys } from "@/components/hax/v1/tabKeys";
import { Grad, WorldHero } from "./ui";

// Figma: HAX v3 · MCP 106:7864 (hero 106:7865, setup 106:7996). Platform steps are v1's
// (components/hax/v1/McpPage.tsx keeps them unexported).
const URL_MCP = "https://nucleux.in/mcp";
const C = ({ children }: { children: ReactNode }) => <code className="rounded-[6px] border border-[var(--edge-2)] bg-[var(--panel-2)] px-[5px] py-px font-[family-name:var(--font-mono)] text-[13px] text-[color:var(--text)]">{children}</code>;
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
const IDS = PLATFORMS.map((p) => p.id);

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

function Connect({ logo, name, href, onClick }: { logo: string; name: string; href: string; onClick?: () => void }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" onClick={onClick}
      className="h3-card flex w-[400px] max-w-full items-center gap-[16px] rounded-[12px] border border-[var(--edge)] bg-[rgba(22,26,33,.92)] px-[16px] py-[18px] text-left shadow-[0_12px_32px_rgba(0,0,0,.35)] backdrop-blur-[8px]">
      <span className="flex size-[36px] shrink-0 items-center justify-center rounded-[8px] bg-white"><img alt="" src={logo} className="size-[22px]" /></span>
      <span className="flex min-w-0 flex-1 flex-col gap-[2px]">
        <span className="font-medium leading-[24px] text-[16px] text-white">Connect to {name}</span>
        <span className="leading-[20px] text-[14px] text-[color:var(--text-2)] whitespace-nowrap">Opens {name} with setup steps in the prompt</span>
      </span>
      <img alt="" src="/hax/v3/icon-upright-12.svg" className="h3-arrow h3-arrow--up size-[12px] self-start mt-[6px]" />
    </a>
  );
}

export function McpPage() {
  const [tab, setTab] = useState("claude");
  const [toast, setToast] = useState("");
  const [claudeHref, setClaudeHref] = useState("https://claude.ai/new");
  useEffect(() => {
    setClaudeHref("https://claude.ai/new?q=" + encodeURIComponent(setupMd()));
    try { const s = localStorage.getItem("hax-mcp-platform"); if (s && IDS.includes(s)) setTab(s); } catch {}
  }, []);
  const pick = (id: string) => { setTab(id); try { localStorage.setItem("hax-mcp-platform", id); } catch {} };
  const pl = PLATFORMS.find((p) => p.id === tab)!;
  return (
    <>
      <WorldHero nodeId="106:7865">
        <h1 className="h3-rise font-light text-[clamp(44px,5vw,72px)] leading-[1] tracking-[-0.03em] text-white"><Grad className="font-semibold">MCP</Grad> Server</h1>
        <p className="h3-rise h3-rise--2 max-w-[480px] leading-[28px] text-[18px] text-[rgba(255,255,255,.86)]">Let your AI assistant search HAX patterns, components and tokens for you, straight from a prompt.</p>
        <p className="h3-rise h3-rise--3 max-w-[500px] leading-[24px] text-[16px] text-[rgba(255,255,255,.78)]">
          It works through the HAX MCP server.{" "}
          <a href="https://modelcontextprotocol.io/" target="_blank" rel="noreferrer" className="h3-link font-semibold text-[color:var(--cyan)]">Model Context Protocol</a>{" "}
          is an open standard that lets AI assistants connect to tools and data.
        </p>
        <div className="h3-rise h3-rise--4 flex flex-wrap justify-center gap-[16px]">
          <Connect logo="/hax/v1/logo-claude.svg" name="Claude" href={claudeHref} />
          <Connect logo="/hax/v1/logo-codex.svg" name="Codex" href="https://chatgpt.com/codex"
            onClick={() => { navigator.clipboard?.writeText(setupMd()).then(() => { setToast("Setup guide copied — paste it into Codex"); setTimeout(() => setToast(""), 2600); }); }} />
        </div>
      </WorldHero>

      <section className="px-[24px] pb-[96px] pt-[32px] md:px-[40px]" data-node-id="106:7996">
        <div className="h3-reveal relative mx-auto flex max-w-[1360px] flex-col items-center gap-[40px] overflow-clip rounded-[32px] px-[24px] pb-[80px] pt-[72px] md:px-[80px]"
          style={{ backgroundImage: "linear-gradient(90deg, #0051af 0%, #3b2c9e 55%, #9345e1 100%)" }}>
          <img alt="" aria-hidden src="/hax/v3/aurora-setup.svg" className="pointer-events-none absolute left-[-19%] top-[-35%] h-[185%] w-[140%] max-w-none" />
          <div className="relative flex flex-col items-center gap-[12px] text-center">
            <h2 className="font-light leading-[48px] text-[48px] tracking-[-0.96px] text-white">Setup</h2>
            <p className="leading-[28px] text-[18px] text-[rgba(255,255,255,.82)]">Pick where you work. The steps change to match.</p>
          </div>
          <div role="tablist" aria-label="Platform" onKeyDown={onTabKeys(IDS, tab, pick)}
            className="relative flex flex-wrap justify-center gap-[4px] rounded-[9999px] border border-[rgba(255,255,255,.24)] bg-[rgba(255,255,255,.12)] p-[4px]">
            {PLATFORMS.map((p) => {
              const sel = p.id === tab;
              return (
                <button key={p.id} id={`h3-tab-${p.id}`} role="tab" type="button" aria-selected={sel} aria-controls="h3-steps" tabIndex={sel ? 0 : -1} onClick={() => pick(p.id)}
                  className={`h3-tab rounded-[9999px] px-[16px] py-[8px] leading-[20px] text-[14px] whitespace-nowrap ${sel ? "bg-white font-semibold text-[color:var(--bg)]" : "font-medium text-[rgba(255,255,255,.86)]"}`}>{p.name}</button>
              );
            })}
          </div>
          <ol key={tab} id="h3-steps" role="tabpanel" aria-labelledby={`h3-tab-${tab}`} className="h3-swap relative grid w-full max-w-[1200px] grid-cols-1 gap-[24px] md:grid-cols-3">
            {pl.steps.map((st, i) => (
              <li key={st.title} className="flex min-w-0 flex-col gap-[12px] rounded-[20px] bg-[var(--panel)] p-[28px] shadow-[0_8px_12px_rgba(0,0,0,.4)]">
                <p className="font-light leading-[60px] text-[60px] tracking-[-1.8px] text-[rgba(255,255,255,.92)]">{i + 1}</p>
                <h3 className="font-semibold leading-[28px] text-[20px] text-white">{st.title}</h3>
                <p className="leading-[20px] text-[14px] text-[color:var(--text-2)]">{st.text}</p>
                {st.code && <CodeBlock code={st.code} header={false} />}
                {st.note && <p className="leading-[20px] text-[13px] text-[color:var(--text-2)]">{st.note}</p>}
              </li>
            ))}
          </ol>
        </div>
      </section>
      <div role="status" aria-live="polite" className={`fixed bottom-[32px] left-1/2 z-50 -translate-x-1/2 rounded-[999px] border border-[var(--edge-2)] bg-[var(--panel)] px-[16px] py-[10px] text-[13px] leading-[18px] text-[color:var(--text)] shadow-[0_12px_32px_rgba(0,0,0,.5)] transition-opacity duration-300 ${toast ? "opacity-100" : "pointer-events-none opacity-0"}`}>{toast}</div>
    </>
  );
}
