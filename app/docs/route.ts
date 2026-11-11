import { NextRequest } from "next/server";
import { publicOrigin } from "@/lib/oauth";

export const dynamic = "force-dynamic";

/**
 * Public connector documentation (the Claude Connectors Directory requires a
 * publicly reachable docs URL). Served as one self-contained HTML document,
 * like the OAuth consent page, because the rest of the site — including its
 * /_next/static assets — sits behind the shared password: a React page here
 * would render unstyled for anyone without it.
 */

/** Set once Cisco publishes them; the sections render only when present. */
const PRIVACY_URL: string | null = "/privacy";
const SUPPORT_EMAIL: string | null = "rishikesh@intelligaia.com";

const TOOLS: { name: string; title: string; access: "Read" | "Write"; what: string }[] = [
  { name: "discover", title: "Discover behavior patterns", access: "Read", what: "Find the pattern that fits a situation, with optional mode, level, channel and audience filters." },
  { name: "discover_patterns", title: "Discover patterns", access: "Read", what: "Free-text search over the catalog, best match first." },
  { name: "list_patterns", title: "List all patterns", access: "Read", what: "The whole 23-pattern catalog, unranked." },
  { name: "fetch", title: "Fetch behavior pattern", access: "Read", what: "One full pattern: behavior, rendering, related patterns, and a render contract with a supporting diagram." },
  { name: "fetch_pattern", title: "Fetch pattern", access: "Read", what: "Alias of fetch, by id or slug." },
  { name: "instantiate_pattern", title: "Instantiate pattern", access: "Write", what: "Create a live instance of a pattern and get its render contract." },
  { name: "update_instance", title: "Update instance state", access: "Write", what: "Merge new fields into an instance's state." },
  { name: "get_instance", title: "Get instance state", access: "Read", what: "Read one instance's current state." },
  { name: "list_installations", title: "List installations", access: "Read", what: "List instances, per agent or for all agents." },
  { name: "handoff", title: "Broker state handoff", access: "Write", what: "Start a new instance on another pattern, carrying context over from an existing one." },
];

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function page(origin: string): string {
  const endpoint = `${origin}/api/mcp`;
  const addToClaude =
    "https://claude.ai/customize/connectors?modal=add-custom-connector" +
    `&connectorName=${encodeURIComponent("HAX IoC Patterns")}` +
    `&connectorUrl=${encodeURIComponent(endpoint)}`;
  const toolRows = TOOLS.map(
    (t) =>
      `<tr><td><strong>${esc(t.title)}</strong><br /><code>${t.name}</code></td>` +
      `<td><span class="tag ${t.access === "Write" ? "write" : ""}">${t.access}</span></td>` +
      `<td>${esc(t.what)}</td></tr>`,
  ).join("");

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>HAX IoC Patterns · Connector docs</title>
<meta name="description" content="Connect the HAX IoC Patterns MCP server to Claude and other AI agents." />
<link rel="icon" href="/favicon.ico" sizes="any" />
<link rel="icon" href="/icon.svg" type="image/svg+xml" />
<style>
  :root { color-scheme: light dark; --bg:#fff; --card:rgba(255,255,255,.82); --ink:#1d2433; --muted:#5b6475;
    --line:#e3e6ec; --accent:#0a7ea4; --code:#f1f3f6; --warn:#a15c00;
    --glow-peach:#ffe4d6; --glow-lilac:#e9e3fc; --glow-cyan:#dcf4f7; --glow-blue:#e2edfb; }
  @media (prefers-color-scheme: dark) { :root { --bg:#0d1117; --card:rgba(21,27,36,.85); --ink:#e8ecf2;
    --muted:#9aa4b4; --line:#273041; --accent:#3cc4ef; --code:#0f141c; --warn:#f0b35a;
    --glow-peach:rgba(255,170,130,.10); --glow-lilac:rgba(160,140,240,.14);
    --glow-cyan:rgba(80,200,225,.12); --glow-blue:rgba(90,140,230,.12); } }
  * { box-sizing:border-box; }
  /* The HAX site's hero wash (v3.css .v3-hero), fixed behind the page. */
  body { margin:0; color:var(--ink); background-color:var(--bg); background-attachment:fixed;
    background-image:
      radial-gradient(ellipse 34% 57% at 13% 78%, var(--glow-peach), transparent 76%),
      radial-gradient(ellipse 39% 61% at 47% 48%, var(--glow-lilac), transparent 78%),
      radial-gradient(ellipse 43% 64% at 83% 32%, var(--glow-cyan), transparent 76%),
      radial-gradient(ellipse 29% 38% at 78% 92%, var(--glow-blue), transparent 80%);
    font:15px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; }
  main { max-width:820px; margin:0 auto; padding:48px 16px 80px; }
  header { display:flex; gap:16px; align-items:center; margin-bottom:8px; }
  header img { border-radius:12px; }
  h1 { font-size:28px; line-height:1.2; margin:0; }
  h2 { font-size:19px; margin:40px 0 12px; }
  h3 { font-size:15px; margin:20px 0 6px; }
  p { margin:0 0 12px; }
  .lede { color:var(--muted); font-size:16px; margin:12px 0 24px; }
  .card { background:var(--card); border:1px solid var(--line); border-radius:14px; padding:20px; margin:0 0 14px; }
  .url { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
  code, pre { font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:13px; }
  code { background:var(--code); padding:2px 6px; border-radius:6px; word-break:break-all; }
  pre { background:var(--code); border:1px solid var(--line); border-radius:10px; padding:12px 14px;
    overflow-x:auto; white-space:pre-wrap; word-break:break-all; margin:6px 0 12px; }
  pre code { background:none; padding:0; }
  td code { word-break:normal; overflow-wrap:anywhere; }
  .btn { display:inline-block; background:var(--accent); color:#fff; text-decoration:none; font-weight:600;
    padding:10px 16px; border-radius:10px; }
  @media (prefers-color-scheme: dark) { .btn { color:#06202b; } }
  ol, ul { padding-left:22px; margin:0 0 12px; }
  li { margin:4px 0; }
  .muted { color:var(--muted); }
  .table-wrap { overflow-x:auto; }
  table { width:100%; border-collapse:collapse; font-size:14px; }
  th, td { text-align:left; vertical-align:top; padding:10px 8px; border-bottom:1px solid var(--line); }
  th { font-size:12px; text-transform:uppercase; letter-spacing:.04em; color:var(--muted); }
  .tag { font-size:12px; font-weight:600; padding:2px 8px; border-radius:999px; background:var(--code); white-space:nowrap; }
  .tag.write { color:var(--warn); }
  a { color:var(--accent); }
</style></head>
<body><main>
  <header>
    <img src="/brand/hax-icon.svg" alt="" width="52" height="52" />
    <h1>HAX IoC Patterns</h1>
  </header>
  <p class="lede">An MCP connector for the HAX interaction-pattern library: 23 patterns for how AI agents
    and people work together, such as asking before acting, handing off work, and settling disagreements.
    Connect it to your AI assistant and it can find the right pattern for a situation, explain it with a
    diagram, and build a version that stays faithful to the pattern's design.</p>

  <div class="card">
    <h3 style="margin-top:0">Server URL</h3>
    <div class="url"><code>${esc(endpoint)}</code></div>
    <p class="muted" style="margin:10px 0 0">Remote MCP over Streamable HTTP. Sign-in uses OAuth;
      no password or API key to copy.</p>
  </div>

  <h2>Connect in Claude</h2>
  <div class="card">
    <p><a class="btn" href="${esc(addToClaude)}" target="_blank" rel="noopener">Add to Claude</a></p>
    <p class="muted">Or add it by hand, on claude.ai or the Claude desktop app:</p>
    <ol>
      <li>Open <strong>Settings → Connectors</strong> and choose <strong>Add custom connector</strong>.</li>
      <li>Name it <strong>HAX IoC Patterns</strong> and paste the server URL above, then <strong>Add</strong>.</li>
      <li>Click <strong>Connect</strong>. A HAX sign-in page opens; click <strong>Allow</strong>
        (the email field is optional).</li>
      <li>You're back in Claude with the 10 tools listed. Turn the connector on in a chat from the tools menu.</li>
    </ol>
    <p class="muted" style="margin:0">Adding custom connectors depends on your Claude plan; on Team and
      Enterprise plans an owner may need to enable it.</p>
  </div>

  <h2>Connect a coding agent</h2>
  <div class="card">
    <p>Add the same URL as a remote (HTTP) MCP server. Clients that support MCP sign-in open the HAX
      sign-in page the first time.</p>
    <h3>Claude Code</h3>
    <pre><code>claude mcp add --transport http hax-ioc-patterns ${esc(endpoint)}</code></pre>
    <p class="muted">Then run <code>/mcp</code> in Claude Code and choose to authenticate.</p>
    <h3>Cursor (<code>.cursor/mcp.json</code>)</h3>
    <pre><code>{ "mcpServers": { "hax-ioc-patterns": { "url": "${esc(endpoint)}" } } }</code></pre>
    <h3>VS Code (<code>.vscode/mcp.json</code>)</h3>
    <pre><code>{ "servers": { "hax-ioc-patterns": { "type": "http", "url": "${esc(endpoint)}" } } }</code></pre>
  </div>

  <h2>Try it</h2>
  <div class="card">
    <ul>
      <li>“Two of my agents keep disagreeing about a deployment. Which HAX pattern fits, and how does it work?”</li>
      <li>“Show me the Pre-Action Handshake pattern with its diagram.”</li>
      <li>“Build a UI for the Disclosure Gradient pattern for my support agent.”</li>
      <li>“List all the HAX patterns where an agent works with a person.”</li>
    </ul>
    <p class="muted" style="margin:0">When Claude explains a pattern, the connector also returns a flow
      diagram of its steps and asks Claude to show it beside the explanation.</p>
  </div>

  <h2>Tools</h2>
  <div class="card table-wrap">
    <table>
      <thead><tr><th>Tool</th><th>Access</th><th>What it does</th></tr></thead>
      <tbody>${toolRows}</tbody>
    </table>
    <p class="muted" style="margin:12px 0 0">“Write” tools only create or update pattern instances in the
      HAX store. Nothing is deleted, and no tool reaches outside this server.</p>
  </div>

  <h2>Sign-in and data</h2>
  <div class="card">
    <ul>
      <li><strong>Sign-in:</strong> OAuth 2.1 with PKCE. On the HAX sign-in page you can enter an email
        so your access is attributed to you; it's optional.</li>
      <li><strong>What's stored:</strong> your access token (as a one-way hash, never the token itself),
        the email if you gave one, when the token was last used, and any pattern instances your assistant
        creates.</li>
      <li><strong>What's not stored:</strong> your conversations with Claude. The connector only sees the
        tool calls Claude makes to it.</li>
      <li><strong>Disconnect:</strong> remove the connector in your AI assistant's settings at any time.</li>
    </ul>
    ${PRIVACY_URL ? `<p style="margin:0">Full details: <a href="${esc(PRIVACY_URL)}">Privacy policy</a>.</p>` : ""}
  </div>

  ${SUPPORT_EMAIL ? `<h2>Support</h2><div class="card"><p style="margin:0">Questions or problems: <a href="mailto:${esc(SUPPORT_EMAIL)}">${esc(SUPPORT_EMAIL)}</a></p></div>` : ""}

  <p class="muted" style="margin-top:40px">HAX, by Outshift by Cisco.</p>
</main></body></html>`;
}

export function GET(request: NextRequest) {
  return new Response(page(publicOrigin(request)), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
}
