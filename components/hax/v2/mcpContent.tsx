import type { ReactNode } from "react";

// MCP setup content, copied VERBATIM from v1 (components/hax/v1/McpPage.tsx, where it is inline and unexported).
// Same steps and the same setup prompt in every version; if v1 changes, change this too.
export const URL_MCP = "https://nucleux.in/mcp";
const C = ({ children }: { children: ReactNode }) => <code className="rounded-[6px] border border-[color:var(--line)] bg-[color:var(--fill)] px-[5px] py-px font-[family-name:var(--font-mono)] text-[13px]">{children}</code>;
type Step = { title: string; text: ReactNode; md: string; code?: string; note?: ReactNode };
export const PLATFORMS: { id: string; name: string; steps: Step[] }[] = [
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

export function setupMd() {
  const md = ["Read the HAX documentation below, then help me apply it. Ask which platform I use, then walk me through its setup.", "", "# MCP Server", "",
    `It works through the HAX MCP server at \`${URL_MCP}\`.`, "", "## Setup", ""];
  PLATFORMS.forEach((pl) => {
    md.push(`### ${pl.name}`, "");
    pl.steps.forEach((st, i) => { md.push(`${i + 1}. **${st.title}** — ${st.md}`); if (st.code) md.push("", "   ```", st.code.replace(/^/gm, "   "), "   ```"); });
    md.push("");
  });
  return md.join("\n").trim();
}

