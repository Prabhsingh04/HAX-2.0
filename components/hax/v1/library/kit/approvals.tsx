import { Check, ChevronDown, FileText, ShieldCheck, Terminal, X } from "./icons";
import { AgentHead, Chk, sel, st, tog, type Entry, type Props } from "./ui";
import { Btn, Progress, Tag, TextLink } from "./parts";

/* Approval card — ChatGPT agent "confirm before purchase / send", Claude Code plan
   approval, Copilot "Confirm" cards, Manus: what will happen, cost, undo window. */
function ApprovalCard({ o }: { o: Props }) {
  const risk = o.risk as string;
  const decided = o.state === "Approved" ? <><Tag tone="ok">Approved</Tag>Dana approved this 2 min ago. The emails are sending.</>
    : o.state === "Rejected" ? <><Tag tone="bad">Rejected</Tag>Dana rejected this: &quot;Wrong list, use the EMEA one.&quot;</>
    : o.state === "Expired" ? <><Tag tone="warn">Expired</Tag>No answer in 30 min. Nothing was sent.</> : null;
  return (
    <div className="hk-panel w-[500px] overflow-hidden">
      <div className="p-[16px] hk-col gap-[12px]">
        <div className="hk-row justify-between"><AgentHead note="wants to" />{risk !== "Low" && <Tag tone={risk === "High" ? "bad" : "warn"}>{risk === "High" ? "Can't be undone" : "Sends outside the team"}</Tag>}</div>
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
        {decided ? <span className="hk-row gap-[8px] hk-s">{decided}</span> : <span className="hk-row gap-[8px]"><Btn kind="ghost">Reject</Btn><Btn>Edit</Btn><Btn kind={risk === "High" ? "danger" : "main"} icon={<Check size={14} strokeWidth={2.5} />}>Approve and send</Btn></span>}
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
      {o.state === "Allowed" || o.state === "Denied" ? (
        <div className="hk-row justify-end gap-[8px] hk-s">{o.state === "Allowed" ? <><Tag tone="ok">Allowed</Tag>Atlas is running it. See the activity log.</> : <><Tag tone="bad">Denied</Tag>Atlas carries on without it.</>}</div>
      ) : (
        <div className="hk-row justify-end gap-[8px]">
          <Btn kind="ghost">Deny</Btn>
          {o.scope === "Once / always" ? <><Btn>Always allow</Btn><Btn kind="main">Allow once</Btn></> : <Btn kind="main" trailing={<ChevronDown size={13} />}>Allow</Btn>}
        </div>
      )}
    </div>
  );
}

/* Preview before run — Zapier / Make test step, Clay "run 10 rows", Copilot "try on
   one", Gmail bulk send sample. */
function PreviewBeforeRun({ o }: { o: Props }) {
  const another = o.state === "Another";
  const running = o.state === "Running";
  return (
    <div className="hk-panel w-[520px] p-[16px] hk-col gap-[12px]">
      <div className="hk-row justify-between"><span className="hk-col"><span className="hk-h">Try it on one first</span><span className="hk-s">Rewrite 240 product descriptions</span></span><Tag tone="blue">{o.state === "Another" ? "Sample 2 of 240" : o.state === "Running" ? "Running 96 of 240" : "Sample 1 of 240"}</Tag></div>
      <div className={o.compare ? "grid grid-cols-2 gap-[8px]" : ""}>
        {o.compare && <div className="hk-well p-[12px] hk-col gap-[4px]"><span className="hk-xs">Before</span><span className="text-[13px] leading-[19px] hk-mute">{another ? "Steel bottle. 750ml. Insulated. BPA free." : "Blue mug. 350ml. Ceramic. Dishwasher safe."}</span></div>}
        <div className="hk-well p-[12px] hk-col gap-[4px] !border-[var(--k-blue)]"><span className="hk-xs !text-[color:var(--k-blue)]">After</span><span className="text-[13px] leading-[19px]">{another ? "A 750 ml insulated steel bottle that keeps drinks cold for a day and is free of BPA." : "A deep-blue ceramic mug that holds a full 350 ml and goes straight in the dishwasher."}</span></div>
      </div>
      {running ? (
        <div className="hk-row gap-[12px]"><span className="hk-grow"><Progress value={40} label="96 of 240 done" /></span><span className="hk-s">96 of 240</span><Btn>Stop</Btn></div>
      ) : (
        <div className="hk-row justify-between"><Btn>Try another</Btn><span className="hk-row gap-[8px]"><Btn kind="ghost">Change the ask</Btn><Btn kind="main">Run on all 240</Btn></span></div>
      )}
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
        <span className="hk-row gap-[8px]"><FileText size={15} className="hk-faint" /><span className="hk-t !text-[13px]">{prose ? "launch-note.md" : "src/auth/login.ts"}</span><span className="hk-s"><span className="hk-okc">+2</span> <span className="hk-badc">−1</span>{o.state === "Partly accepted" && " · 1 of 3 accepted"}</span></span>
        {o.state === "Applied" ? <span className="hk-row gap-[8px] hk-s"><Tag tone="ok">Saved</Tag><TextLink>Undo</TextLink></span> : <span className="hk-row gap-[6px]"><Btn size="sm" kind="ghost">Reject all</Btn><Btn size="sm" kind="main">Accept all</Btn></span>}
      </div>
      {prose ? (
        <p className="hk-b p-[16px]">We are launching <span className="line-through hk-badc bg-[var(--k-bad-bg)] px-[2px]">the new pricing to every single customer at the same time</span><span className="hk-okc bg-[var(--k-ok-bg)] px-[2px]">new pricing for everyone on 18 March</span>. Support will be ready.</p>
      ) : (
        <div className="py-[6px]">
          <div className="hk-dl hk-dl--ctx"><span>12</span><span>const session = await getSession();</span></div>
          <div className="hk-dl hk-dl--del"><span>13</span><span>await retry(login, 3);</span></div>
          <div className="hk-dl hk-dl--add"><span>13</span><span>await retry(login, {"{"} tries: 3, backoff: 200 {"}"});</span></div>
          <div className="hk-dl hk-dl--add"><span>14</span><span>track(&quot;login_retry&quot;);</span></div>
          {(o.hunk || o.state === "Partly accepted") && o.state !== "Applied" && <div className="hk-row justify-end gap-[6px] px-[12px] pt-[6px]"><Btn size="sm" icon={<X size={12} />}>Reject</Btn><Btn size="sm" icon={<Check size={12} />}>Accept</Btn></div>}
          <div className="hk-dl hk-dl--ctx"><span>15</span><span>return session;</span></div>
        </div>
      )}
      {o.why && <div className="px-[14px] py-[10px] border-t border-[var(--k-edge)] hk-s">Why: the test failed when the first retry fired before the cookie was set.</div>}
    </div>
  );
}

export const APPROVALS: Record<string, Entry> = {
  "approval-card": { C: ApprovalCard, opts: [sel("risk", "Risk", ["Medium", "Low", "High"]), tog("cost", "Cost"), tog("preview", "Content preview", false), tog("remember", "Don't ask again", false), sel("state", "State", ["Waiting", "Approved", "Rejected", "Expired"])], refs: ["ChatGPT agent confirmations", "Claude Code plan approval", "Microsoft Copilot confirm", "Manus"], states: ["Waiting", "Approved", "Rejected", "Expired"].map((n) => st(n, { state: n })) },
  "permission-request": { C: PermissionRequest, opts: [sel("kind", "Asks for", ["Command", "Data access"]), sel("scope", "Choices", ["Once / always", "Single allow"]), tog("data", "What is sent"), sel("state", "State", ["Asking", "Allowed", "Denied"])], refs: ["Claude Code permissions", "Codex approvals", "ChatGPT connectors", "MCP tool consent"], states: ["Asking", "Allowed", "Denied"].map((n) => st(n, { state: n })) },
  "preview-before-run": { C: PreviewBeforeRun, opts: [tog("compare", "Before and after"), sel("state", "State", ["Sample", "Another", "Running"])], refs: ["Zapier test step", "Clay run 10 rows", "Copilot try on one"], states: ["Sample", "Another", "Running"].map((n) => st(n, { state: n })) },
  "diff-view": { C: DiffView, opts: [sel("kind", "Content", ["Code", "Text"]), tog("hunk", "Accept per change"), tog("why", "Why it changed", false), sel("state", "State", ["Proposed", "Partly accepted", "Applied"])], refs: ["GitHub Copilot", "Cursor", "Claude Code", "Google Docs suggestions"], states: ["Proposed", "Partly accepted", "Applied"].map((n) => st(n, { state: n })) },
};
