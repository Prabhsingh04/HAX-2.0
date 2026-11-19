import { Fragment } from "react";
import { Bot, Brain, ChevronDown, ChevronLeft, ChevronRight, GitBranch, GitFork, HardDrive, History, Lock, Mail, MessageSquare, Pause, Pencil, Play, Plus, RotateCcw, Square, Ticket, Trash2 } from "@/components/hax/v6/vendor/components/hax/v1/library/kit/icons";
import { Ag, Spin, sel, st as stt, tog, type Entry, type Props } from "@/components/hax/v6/vendor/components/hax/v1/library/kit/ui";
import { Btn, IconBtn, Kbd, Pick, Progress, Switch, Tag, TextLink } from "@/components/hax/v6/vendor/components/hax/v1/library/kit/parts";

/* Stop and pause — ChatGPT Agent "Take over" + pause, Claude Code Esc to interrupt,
   Operator / Manus live view, Codex cloud task stop. */
function StopAndPause({ o }: { o: Props }) {
  const st = o.state as string;
  return (
    <div className="hk-panel w-[520px] p-[16px] hk-col gap-[12px]">
      <div className="hk-row gap-[10px]">
        <Ag dot={st === "Running" ? "var(--k-ok)" : st === "Paused" ? "var(--k-warn)" : "var(--text-tertiary)"} />
        <span className="hk-col hk-grow"><span className="hk-t">Updating 48 customer records</span><span className="hk-s">{st === "Running" ? "Step 3 of 5 · 2 min left" : st === "Paused" ? "Paused by you at step 3" : "Stopped · 21 of 48 updated"}</span></span>
        {st === "Running" && <Spin />}
      </div>
      <Progress value={st === "Stopped" ? 44 : 56} tone={st === "Paused" ? "warn" : undefined} label="Records updated" />
      {o.live && st !== "Stopped" && <div className="hk-well px-[12px] py-[8px] hk-s hk-row gap-[8px]"><span className="hk-mono">crm.update</span>Northwind Traders · plan → Team</div>}
      <div className="hk-row justify-between">
        <span className="hk-s">{st === "Stopped" ? "Nothing after record 21 was changed." : <>Press <Kbd>Esc</Kbd> to stop</>}</span>
        <span className="hk-row gap-[8px]">
          {st === "Running" && <><Btn size="sm" icon={<Pause size={12} fill="currentColor" strokeWidth={0} />}>Pause</Btn>{o.takeover && <Btn size="sm">Take over</Btn>}<Btn size="sm" icon={<Square size={10} fill="currentColor" strokeWidth={0} />}>Stop</Btn></>}
          {st === "Paused" && <><Btn size="sm">Stop</Btn><Btn size="sm" kind="main" icon={<Play size={12} fill="currentColor" strokeWidth={0} />}>Resume</Btn></>}
          {st === "Stopped" && <><Btn size="sm">Undo 21 changes</Btn><Btn size="sm" kind="main">Continue</Btn></>}
        </span>
      </div>
    </div>
  );
}

/* Capabilities and connections — ChatGPT connectors + GPT capabilities, Claude
   integrations and tool permissions, Cursor / Claude Code allow-lists, MCP settings. */
function Capabilities({ o }: { o: Props }) {
  const f = o.state as string;
  const all: [typeof Mail, string, string][] = [[HardDrive, "Google Drive", "Read"], [MessageSquare, "Slack", "Read and post"], [Ticket, "Linear", "Ask first"], [Mail, "Gmail", "Off"]];
  const rows = all.filter(([, , a]) => f === "Connected" ? a === "Read" || a === "Read and post" : f === "Ask first" ? a === "Ask first" : f === "Off" ? a === "Off" : true);
  return (
    <div className="hk-panel w-[520px] p-[16px] hk-col gap-[10px]">
      <div className="hk-row justify-between"><span className="hk-col"><span className="hk-h">What Atlas can use</span><span className="hk-s">Applies to every chat in this workspace</span></span><Btn size="sm" icon={<Plus size={13} />}>Connect</Btn></div>
      <div className="hk-col">
        {rows.map(([I, t, a]) => (
          <div key={t} className={`hk-row gap-[10px] py-[8px] border-t border-[var(--k-edge)] ${a === "Off" ? "opacity-60" : ""}`}>
            <span className="hk-app"><I size={16} /></span><span className="hk-t hk-grow">{t}</span>
            {o.style === "Switches" ? <Switch on={a !== "Off"} label={`${t} access`} /> : (
              <Pick variant="box" chevron className={a === "Ask first" ? "!text-[color:var(--k-warn)]" : a === "Off" ? "!text-[color:var(--text-tertiary)]" : ""}>{a}</Pick>
            )}
          </div>
        ))}
      </div>
      {o.limits && <div className="hk-well px-[12px] py-[8px] hk-row gap-[8px] hk-s"><Lock size={14} />Atlas can&apos;t delete files or send payments.</div>}
    </div>
  );
}

/* Memory — ChatGPT "Memory updated" + manage memories, Claude memory and project
   knowledge, Gemini saved info; incognito / temporary chat. */
function Memory({ o }: { o: Props }) {
  const v = o.state as string;
  const off = v === "Off";
  if (v === "Just saved")
    return (
      <div className="w-[480px] hk-col gap-[10px]">
        <p className="hk-b">Got it. I&apos;ll keep reports to one page from now on.</p>
        <div className="hk-row gap-[8px] hk-s"><Brain size={15} className="hk-blue" /><span className="font-medium text-[color:var(--text-primary)]">Memory updated</span>· Prefers one-page reports<TextLink className="ml-[4px]">Manage</TextLink></div>
      </div>
    );
  const mem = ["Leads the growth team at Northwind", "Prefers one-page reports", "Writes in British English", "Weekly review is on Mondays"];
  return (
    <div className="hk-panel w-[500px] p-[16px] hk-col gap-[10px]">
      <div className="hk-row justify-between"><span className="hk-h">Memory</span><span className="hk-row gap-[8px] hk-s">Use memory<Switch on={!off} label="Use memory" /></span></div>
      <span className="hk-s">Atlas remembers these across chats. Edit or delete any of them.</span>
      <div className="hk-col">
        {mem.map((m, i) => (
          <div key={m} className={`hk-row gap-[10px] py-[8px] border-t border-[var(--k-edge)] ${off ? "opacity-50" : ""}`}>
            <span className="hk-b hk-grow">{m}</span>{i === 1 && !off && <Tag tone="blue">New</Tag>}
            <IconBtn size="xs" label="Edit memory" icon={<Pencil size={14} />} /><IconBtn size="xs" label="Delete memory" icon={<Trash2 size={14} />} />
          </div>
        ))}
      </div>
      {(o.temporary || off) && <div className="hk-well px-[12px] py-[8px] hk-row gap-[8px] hk-s"><History size={14} />{off ? "Memory is off: nothing is saved or used." : "Temporary chat: nothing here is saved or remembered."}</div>}
    </div>
  );
}

/* Checkpoints and branches — Cursor restore checkpoint, Claude Code /rewind, ChatGPT
   edit-and-branch with ‹ 2 / 3 ›, Replit / Lovable version history. */
function Checkpoints({ o }: { o: Props }) {
  const restoring = o.state === "Restoring";
  const branches = o.state === "Branches";
  const pts: [string, string, boolean?][] = [["Added the pricing table", "2 files · 4 min ago"], ["Rewrote the intro", "1 file · 9 min ago", true], ["Started from the brief", "12 min ago"]];
  return (
    <div className="w-[520px] hk-col gap-[12px]">
      {(o.branch || branches) && (
        <div className="hk-col gap-[6px] items-end">
          <span className="hk-bubble">Make the pricing table compare three plans</span>
          <span className="hk-row !gap-[2px] hk-s"><IconBtn size="sm" label="Edit message" icon={<Pencil size={14} />} /><IconBtn size="sm" label="Previous version" icon={<ChevronLeft size={14} />} />2 / 3<IconBtn size="sm" label="Next version" icon={<ChevronRight size={14} />} /></span>
        </div>
      )}
      <div className="hk-panel p-[8px] hk-col">
        <div className="hk-row justify-between px-[8px] py-[6px]"><span className="hk-t">Checkpoints</span>
          {branches ? <Pick chevron icon={<GitBranch size={13} />}>pricing-v2</Pick> : <span className="hk-s hk-row gap-[4px]"><GitBranch size={13} />main</span>}
        </div>
        {(branches ? [["Compared three plans", "On pricing-v2 · just now"] as [string, string, boolean?], ...pts.slice(1)] : pts).map(([t, s, hov], i) => (
          <div key={t} className={`hk-mi ${hov ? "hk-mi--on" : ""}`}>
            <span className={`hk-step ${i === 0 ? "hk-step--now" : "hk-step--num"}`} />
            <span className="hk-col hk-grow"><span className="font-medium">{t}</span><span className="hk-s">{s}</span></span>
            {hov && <><Btn size="sm" icon={<RotateCcw size={13} />}>Restore</Btn>{o.fork && <Btn size="sm" icon={<GitFork size={13} />}>Branch</Btn>}</>}
            {i === 0 && <Tag>Now</Tag>}
          </div>
        ))}
        {branches && <div className="hk-row gap-[6px] px-[8px] pt-[6px] pb-[4px] hk-s"><GitFork size={13} />Branched from &quot;Rewrote the intro&quot;. main keeps the original.</div>}
        {restoring && <div className="hk-well mx-[8px] mb-[4px] mt-[4px] px-[12px] py-[10px] hk-col gap-[8px]"><span className="hk-s">Restoring &quot;Rewrote the intro&quot; undoes the pricing table and 2 changed files.</span><span className="hk-row justify-end gap-[8px]"><Btn size="sm" kind="ghost">Cancel</Btn><Btn size="sm" kind="main">Restore</Btn></span></div>}
      </div>
    </div>
  );
}

/* Access per agent — which agent may use which system, so no single agent holds all the
   access a task needs (Okta app assignments, GitHub fine-grained tokens, AWS IAM roles,
   Copilot Studio agent permissions). */
function AgentAccess({ o }: { o: Props }) {
  const apps = ["Stripe", "Zendesk", "Gmail"];
  const broken = o.state === "Rule broken";
  const waiting = o.state === "Waiting";
  const rows: [string, string[]][] = [["Billing agent", ["Refund", "", broken ? "Send" : ""]], ["Support agent", ["Read", "Reply", ""]], ["Outreach agent", ["", "Read", "Send"]]];
  return (
    <div className="hk-panel w-[520px] p-[16px] hk-col gap-[10px]">
      <div className="hk-row justify-between"><span className="hk-col"><span className="hk-h">Who can use what</span><span className="hk-s">Refunds workflow · 3 agents</span></span>{o.edit && <Btn size="sm">Edit access</Btn>}</div>
      <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr] items-stretch">
        <span className="hk-s pb-[6px]">Agent</span>
        {apps.map((a) => <span key={a} className="hk-s font-medium pb-[6px] px-[8px]">{a}</span>)}
        {rows.map(([n, cells]) => (
          <Fragment key={n}>
            <span className="hk-row gap-[8px] py-[9px] border-t border-[var(--k-edge)]"><Ag size="sm" icon={Bot} /><span className="hk-t !text-[13.5px] hk-trunc">{n}</span></span>
            {cells.map((c, i) => <span key={i} className="hk-row px-[8px] py-[9px] border-t border-[var(--k-edge)]">{c ? <Tag tone={broken && n === "Billing agent" && c === "Send" ? "bad" : "neutral"}>{c}</Tag> : <span className="hk-faint text-[13px]">None</span>}</span>)}
          </Fragment>
        ))}
      </div>
      {broken && <div className="hk-well px-[12px] py-[8px] hk-row gap-[8px] hk-s"><Lock size={14} className="shrink-0 hk-badc" />Not saved. Billing agent would hold Refund and Send. No agent can both refund a payment and email the customer.</div>}
      {waiting && <div className="hk-well px-[12px] py-[8px] hk-row gap-[8px] hk-s"><Ag size="sm" icon={Bot} /><span className="hk-grow">Support agent asked for Gmail · Send. An admin has to approve it.</span><Btn size="sm" kind="ghost">Deny</Btn><Btn size="sm" kind="main">Approve</Btn></div>}
      {!broken && !waiting && o.rule && <div className="hk-well px-[12px] py-[8px] hk-row gap-[8px] hk-s"><Lock size={14} className="shrink-0" />No agent can both refund a payment and email the customer.</div>}
    </div>
  );
}

export const CONTROLLERS: Record<string, Entry> = {
  "stop-and-pause": { C: StopAndPause, opts: [sel("state", "State", ["Running", "Paused", "Stopped"]), tog("takeover", "Take over"), tog("live", "Live step")], refs: ["ChatGPT agent", "Claude Code", "Codex cloud", "Manus"], states: ["Running", "Paused", "Stopped"].map((n) => stt(n, { state: n })) },
  capabilities: { C: Capabilities, opts: [sel("style", "Access control", ["Levels", "Switches"]), tog("limits", "Hard limits"), sel("state", "State", ["All", "Connected", "Ask first", "Off"])], refs: ["ChatGPT connectors", "Claude integrations", "Cursor allow-list", "MCP clients"], states: ["Connected", "Ask first", "Off"].map((n) => stt(n, { state: n })) },
  memory: { C: Memory, opts: [sel("state", "State", ["On", "Just saved", "Off"]), tog("temporary", "Temporary chat", false)], refs: ["ChatGPT memory", "Claude memory", "Gemini saved info"], states: ["On", "Just saved", "Off"].map((n) => stt(n, { state: n })) },
  "agent-access": { C: AgentAccess, opts: [tog("rule", "Separation rule"), tog("edit", "Edit access", false), sel("state", "State", ["Default", "Rule broken", "Waiting"])], refs: ["Okta app assignments", "GitHub fine-grained tokens", "AWS IAM roles", "Copilot Studio agents"], states: ["Default", "Rule broken", "Waiting"].map((n) => stt(n, { state: n })) },
  checkpoints: { C: Checkpoints, opts: [tog("branch", "Edit and branch"), tog("fork", "Branch from here"), sel("state", "State", ["Saved", "Restoring", "Branches"])], refs: ["Cursor checkpoints", "Claude Code rewind", "ChatGPT branches", "Lovable history"], states: ["Saved", "Restoring", "Branches"].map((n) => stt(n, { state: n })) },
};
