/**
 * Public privacy policy for the HAX IoC Patterns connector (required for the
 * Claude Connectors Directory). Interim policy issued by Intelligaia as the
 * operator; Cisco legal may replace it if Cisco takes over the listing.
 * Self-contained HTML for the same reason as /docs: the site's /_next assets
 * sit behind the shared password.
 *
 * Keep the statements here true to the code: what the state store keeps
 * (access_tokens, oauth_codes, oauth_clients, instances) and what is logged
 * ([llm-usage] lines carry no request content).
 */

const CONTACT = "rishikesh@intelligaia.com";
const UPDATED = "6 November 2026";

const HTML = `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>HAX IoC Patterns · Privacy policy</title>
<meta name="description" content="Privacy policy for the HAX IoC Patterns MCP connector." />
<link rel="icon" href="/favicon.ico" sizes="any" />
<link rel="icon" href="/icon.svg" type="image/svg+xml" />
<style>
  :root { color-scheme: light dark; --bg:#f6f7f9; --card:#fff; --ink:#1d2433; --muted:#5b6475;
    --line:#e3e6ec; --accent:#0a7ea4; --code:#f1f3f6; }
  @media (prefers-color-scheme: dark) { :root { --bg:#0d1117; --card:#151b24; --ink:#e8ecf2;
    --muted:#9aa4b4; --line:#273041; --accent:#3cc4ef; --code:#0f141c; } }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--bg); color:var(--ink);
    font:15px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; }
  main { max-width:780px; margin:0 auto; padding:48px 16px 80px; }
  header { display:flex; gap:16px; align-items:center; margin-bottom:6px; }
  header img { border-radius:12px; }
  h1 { font-size:26px; line-height:1.25; margin:0; }
  h2 { font-size:18px; margin:32px 0 10px; }
  p { margin:0 0 12px; }
  ul { padding-left:22px; margin:0 0 12px; }
  li { margin:5px 0; }
  .muted { color:var(--muted); }
  .card { background:var(--card); border:1px solid var(--line); border-radius:14px; padding:20px; }
  .table-wrap { overflow-x:auto; }
  table { width:100%; border-collapse:collapse; font-size:14px; }
  th, td { text-align:left; vertical-align:top; padding:10px 8px; border-bottom:1px solid var(--line); }
  th { font-size:12px; text-transform:uppercase; letter-spacing:.04em; color:var(--muted); }
  code { font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:13px; background:var(--code);
    padding:2px 6px; border-radius:6px; word-break:break-all; }
  a { color:var(--accent); }
</style></head>
<body><main>
  <header>
    <img src="/brand/hax-icon.svg" alt="" width="48" height="48" />
    <h1>Privacy policy</h1>
  </header>
  <p class="muted">HAX IoC Patterns connector · Last updated ${UPDATED}</p>

  <h2>1. Who we are</h2>
  <p>The HAX IoC Patterns connector (“the connector”) is an MCP server that lets AI assistants such as Claude
    look up and use the HAX interaction-pattern library, created by Outshift by Cisco. The connector is built and
    operated by <strong>Intelligaia</strong> (<a href="https://intelligaia.com">intelligaia.com</a>), referred
    to here as “we” or “us”.</p>
  <p>This policy covers the connector at <code>https://ioc-patterns.intelligaia.com/api/mcp</code>, its sign-in
    page, and its <a href="/docs">documentation page</a>. It does not cover the AI assistant you use with it
    (for example Claude, ChatGPT or Cursor); those products have their own privacy policies.</p>

  <h2>2. What we collect</h2>
  <div class="card table-wrap">
    <table>
      <thead><tr><th>Data</th><th>When</th><th>Why</th></tr></thead>
      <tbody>
        <tr><td><strong>Email address</strong> (optional)</td><td>Only if you type one on the HAX sign-in page</td>
          <td>To attribute access to a person and let us revoke it</td></tr>
        <tr><td><strong>Access token</strong>, stored only as a one-way hash</td><td>When you connect</td>
          <td>To recognise your assistant on later requests. We never store the token itself.</td></tr>
        <tr><td><strong>Token timestamps</strong></td><td>When the token is created and each time it is used</td>
          <td>To see whether access is in use</td></tr>
        <tr><td><strong>Sign-in code</strong>, stored only as a hash</td><td>During connection</td>
          <td>Completes sign-in. Single-use, expires within 10 minutes.</td></tr>
        <tr><td><strong>App registration</strong></td><td>When an AI app first connects</td>
          <td>The app's name and return address, supplied by the app (not by you), to complete sign-in securely</td></tr>
        <tr><td><strong>Pattern instances</strong></td><td>When your assistant uses the instantiate, update or handoff tools</td>
          <td>Stores the pattern state your assistant sends so it can be read back and updated. It contains whatever the assistant puts in it.</td></tr>
        <tr><td><strong>Technical data</strong></td><td>Every request</td>
          <td>IP address and request metadata, processed by our network provider for security and delivery. Server logs record timings and errors.</td></tr>
      </tbody>
    </table>
  </div>
  <p style="margin-top:14px"><strong>We do not collect</strong> your conversations with your AI assistant. The
    connector only receives the tool calls the assistant makes to it, such as a search phrase or the content of a
    pattern instance. Search phrases are used in memory to rank results and are not stored. We do not collect
    passwords, payment details, or data from your other accounts.</p>

  <h2>3. How we use it</h2>
  <p>Only to run the connector (sign-in, answering tool calls, storing and returning pattern instances), to keep it
    secure (detecting abuse, revoking access), and to fix problems. We do <strong>not</strong> sell personal data,
    use it for advertising, or use it to train AI models.</p>

  <h2>4. Where it is stored and who else processes it</h2>
  <ul>
    <li><strong>Hosting:</strong> on a server operated by Intelligaia in <strong>India</strong>. The data is stored
      in a database on that server. The AI model the connector uses to rank search results also runs on that
      server; no data is sent to an external AI provider.</li>
    <li><strong>Network:</strong> traffic reaches the server through <strong>Cloudflare</strong>, which processes IP
      addresses and request metadata to deliver and protect traffic.</li>
  </ul>
  <p>We do not share personal data with anyone else, except where required by law.</p>

  <h2>5. How long we keep it</h2>
  <ul>
    <li><strong>Sign-in codes:</strong> at most 10 minutes; deleted when used.</li>
    <li><strong>Access tokens and any linked email:</strong> until access is revoked, or until you ask us to delete them.</li>
    <li><strong>Pattern instances:</strong> until you ask us to delete them.</li>
    <li><strong>Server logs:</strong> kept on the server for operating and troubleshooting the service.</li>
  </ul>

  <h2>6. Your choices and rights</h2>
  <ul>
    <li><strong>Disconnect</strong> at any time in your AI assistant's connector settings. This stops all further access.</li>
    <li><strong>Ask us to delete</strong> your token, linked email and pattern instances by emailing
      <a href="mailto:${CONTACT}">${CONTACT}</a>.</li>
    <li>Depending on where you live, you may have rights to access, correct or delete your data, or to object to its
      processing. Email us and we will respond within 30 days.</li>
  </ul>

  <h2>7. Security</h2>
  <p>All traffic uses HTTPS. Sign-in uses OAuth 2.1 with PKCE. Access tokens and sign-in codes are stored only as
    one-way hashes, and server access is limited to authorised operators.</p>

  <h2>8. Children</h2>
  <p>The connector is a professional design tool and is not directed at children under 16.</p>

  <h2>9. Changes</h2>
  <p>We will post any changes on this page and update the date at the top.</p>

  <h2>10. Contact</h2>
  <p>Intelligaia · <a href="mailto:${CONTACT}">${CONTACT}</a></p>
</main></body></html>`;

export function GET() {
  return new Response(HTML, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
}
