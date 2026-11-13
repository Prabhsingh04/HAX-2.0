import { Check, ChevronDown, FileText, ShieldCheck, Terminal, X } from "./icons";
import { AgentHead, Chk, sel, tog, type Entry, type Props } from "./ui";

/* Approval card — ChatGPT agent "confirm before purchase / send", Claude Code plan
   approval, Copilot "Confirm" cards, Manus: what will happen, cost, undo window. */
function ApprovalCard({ o }: { o: Props }) {
  const risk = o.risk as string;
  return (
    <div className="hk-panel w-[500px] overflow-hidden">
      <div className="p-[16px] hk-col gap-[12px]">
        <div className="hk-row justify-between"><AgentHead note="wants to" />{risk !== "Low" && <span className={`hk-tag ${risk === "High" ? "hk-tag--bad" : "hk-tag--warn"}`}>{risk === "High" ? "Can't be undone" : "Sends outside the team"}</span>}</div>
        <p className="hk-h">Send 3 renewal emails</p>
        <div className="grid grid-cols-[84px_1fr] gap-y-[8px] text-[13.5px]">
          <span className="hk-mute">To</span><span>Acme, Globex and Initech billing</span>
          {o.cost && <><span className="hk-mute">Cost</span><span>About 2 credits</span></>}
          <span className="hk-mute">Undo</span><span>{risk === "High" ? "Not possible once sent" : "Up to 5 minutes after sending"}</span>
        </div>
        {o.remember && <label className="hk-row gap-[8px] hk-s"><Chk />Don&apos;t ask again for emails</label>}
        {o.preview && <div className="hk-well px-[12px] py-[10px] hk-col gap-[2px]"><span className="hk-s font-semibold text-[color:var(--text-primary)]">Your Acme plan renews on 1 Dec</span><span className="hk-s hk-trunc">Hi Dana, a quick note that your Team plan renews at $12 a seat…</span></div>}
      </div>
      <div className="hk-row justify-end px-[16px] py-[12px] border-t border-[var(--k-edge)] bg-[var(--k-soft)]">
        <span className="hk-row gap-[8px]"><span className="hk-btn hk-btn--ghost">Reject</span><span className="hk-btn">Edit</span><span className={`hk-btn ${risk === "High" ? "hk-btn--danger" : "hk-btn--main"}`}><Check size={14} strokeWidth={2.5} />Approve and send</span></span>
      </div>
    </div>
  );
}

/* Permission request — Claude Code / Codex "Allow this command?", ChatGPT connector
   access, Claude MCP tool allow, OS-style once / always / deny. */
function PermissionRequest({ o }: { o: Props }) {
  const tool = o.kind === "Command";
  return (
    <div className="hk-panel w-[500px] p-[16px] hk-col gap-[12px]">
      <div className="hk-row gap-[10px]"><ShieldCheck size={18} className="hk-blue shrink-0 self-start mt-[1px]" /><span className="hk-col"><span className="hk-t">{tool ? "Allow Atlas to run this command?" : "Allow Atlas to read your Slack?"}</span><span className="hk-s">{tool ? "In acme/atlas-web, on this computer" : "Only the #launch and #pricing channels"}</span></span></div>
      {tool ? (
        <div className="hk-code"><span className="hk-row gap-[8px] !text-[color:var(--text-code)]"><Terminal size={13} />npm run test -- --grep &quot;login&quot;</span></div>
      ) : (
        <div className="hk-well p-[12px] hk-col gap-[6px] text-[13px]">
          {["Read messages and threads", "See channel members"].map((t) => <span key={t} className="hk-row gap-[8px]"><Check size={14} strokeWidth={2.5} className="hk-okc" />{t}</span>)}
          <span className="hk-row gap-[8px] hk-mute"><X size={14} strokeWidth={2.5} className="hk-badc" />Post or delete messages</span>
        </div>
      )}
      {o.data && <span className="hk-s">Sent to the tool: <span className="hk-mono">{tool ? "the command above" : "channel ids, date range"}</span></span>}
      <div className="hk-row justify-end gap-[8px]">
        <span className="hk-btn hk-btn--ghost">Deny</span>
        {o.scope === "Once / always" ? <><span className="hk-btn">Always allow</span><span className="hk-btn hk-btn--main">Allow once</span></> : <span className="hk-btn hk-btn--main">Allow<ChevronDown size={13} /></span>}
      </div>
    </div>
  );
}

/* Preview before run — Zapier / Make test step, Clay "run 10 rows", Copilot "try on
   one", Gmail bulk send sample. */
function PreviewBeforeRun({ o }: { o: Props }) {
  return (
    <div className="hk-panel w-[520px] p-[16px] hk-col gap-[12px]">
      <div className="hk-row justify-between"><span className="hk-col"><span className="hk-h">Try it on one first</span><span className="hk-s">Rewrite 240 product descriptions</span></span><span className="hk-tag hk-tag--blue">Sample 1 of 240</span></div>
      <div className={o.compare ? "grid grid-cols-2 gap-[8px]" : ""}>
        {o.compare && <div className="hk-well p-[12px] hk-col gap-[4px]"><span className="hk-xs">Before</span><span className="text-[13px] leading-[19px] hk-mute">Blue mug. 350ml. Ceramic. Dishwasher safe.</span></div>}
        <div className="hk-well p-[12px] hk-col gap-[4px] !border-[var(--k-blue)]"><span className="hk-xs !text-[color:var(--k-blue)]">After</span><span className="text-[13px] leading-[19px]">A deep-blue ceramic mug that holds a full 350 ml and goes straight in the dishwasher.</span></div>
      </div>
      <div className="hk-row justify-between"><span className="hk-btn">Try another</span><span className="hk-row gap-[8px]"><span className="hk-btn hk-btn--ghost">Change the ask</span><span className="hk-btn hk-btn--main">Run on all 240</span></span></div>
    </div>
  );
}

/* Diff view — GitHub Copilot / Cursor / Claude Code inline diffs with accept per hunk,
   Google Docs suggestions for prose. */
function DiffView({ o }: { o: Props }) {
  const prose = o.kind === "Text";
  return (
    <div className="hk-panel w-[540px] overflow-hidden">
      <div className="hk-row justify-between px-[14px] h-[44px] border-b border-[var(--k-edge)]">
        <span className="hk-row gap-[8px]"><FileText size={15} className="hk-faint" /><span className="hk-t !text-[13px]">{prose ? "launch-note.md" : "src/auth/login.ts"}</span><span className="hk-s"><span className="hk-okc">+2</span> <span className="hk-badc">−1</span></span></span>
        <span className="hk-row gap-[6px]"><span className="hk-btn hk-btn--sm hk-btn--ghost">Reject all</span><span className="hk-btn hk-btn--sm hk-btn--main">Accept all</span></span>
      </div>
      {prose ? (
        <p className="hk-b p-[16px]">We are launching <span className="line-through hk-badc bg-[var(--k-bad-bg)] px-[2px]">the new pricing to every single customer at the same time</span><span className="hk-okc bg-[var(--k-ok-bg)] px-[2px]">new pricing for everyone on 18 March</span>. Support will be ready.</p>
      ) : (
        <div className="py-[6px]">
          <div className="hk-dl hk-dl--ctx"><span>12</span><span>const session = await getSession();</span></div>
          <div className="hk-dl hk-dl--del"><span>13</span><span>await retry(login, 3);</span></div>
          <div className="hk-dl hk-dl--add"><span>13</span><span>await retry(login, {"{"} tries: 3, backoff: 200 {"}"});</span></div>
          <div className="hk-dl hk-dl--add"><span>14</span><span>track(&quot;login_retry&quot;);</span></div>
          {o.hunk && <div className="hk-row justify-end gap-[6px] px-[12px] pt-[6px]"><span className="hk-btn hk-btn--sm"><X size={12} />Reject</span><span className="hk-btn hk-btn--sm"><Check size={12} />Accept</span></div>}
          <div className="hk-dl hk-dl--ctx"><span>15</span><span>return session;</span></div>
        </div>
      )}
      {o.why && <div className="px-[14px] py-[10px] border-t border-[var(--k-edge)] hk-s">Why: the test failed when the first retry fired before the cookie was set.</div>}
    </div>
  );
}

export const APPROVALS: Record<string, Entry> = {
  "approval-card": { C: ApprovalCard, opts: [sel("risk", "Risk", ["Medium", "Low", "High"]), tog("cost", "Cost"), tog("preview", "Content preview", false), tog("remember", "Don't ask again", false)], refs: ["ChatGPT agent confirmations", "Claude Code plan approval", "Microsoft Copilot confirm", "Manus"] },
  "permission-request": { C: PermissionRequest, opts: [sel("kind", "Asks for", ["Command", "Data access"]), sel("scope", "Choices", ["Once / always", "Single allow"]), tog("data", "What is sent")], refs: ["Claude Code permissions", "Codex approvals", "ChatGPT connectors", "MCP tool consent"] },
  "preview-before-run": { C: PreviewBeforeRun, opts: [tog("compare", "Before and after")], refs: ["Zapier test step", "Clay run 10 rows", "Copilot try on one"] },
  "diff-view": { C: DiffView, opts: [sel("kind", "Content", ["Code", "Text"]), tog("hunk", "Accept per change"), tog("why", "Why it changed", false)], refs: ["GitHub Copilot", "Cursor", "Claude Code", "Google Docs suggestions"] },
};
