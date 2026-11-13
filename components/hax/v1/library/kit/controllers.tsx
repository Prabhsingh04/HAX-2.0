import { Fragment } from "react";
import { Bot, Brain, ChevronDown, ChevronLeft, ChevronRight, GitBranch, GitFork, HardDrive, History, Lock, Mail, MessageSquare, Pause, Pencil, Play, Plus, RotateCcw, Square, Ticket, Trash2 } from "./icons";
import { Ag, Spin, sel, tog, type Entry, type Props } from "./ui";

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
      <div className="hk-bar"><i style={{ width: st === "Stopped" ? "44%" : "56%", background: st === "Running" ? undefined : "var(--text-tertiary)" }} /></div>
      {o.live && st !== "Stopped" && <div className="hk-well px-[12px] py-[8px] hk-s hk-row gap-[8px]"><span className="hk-mono">crm.update</span>Northwind Traders · plan → Team</div>}
      <div className="hk-row justify-between">
        <span className="hk-s">{st === "Stopped" ? "Nothing after record 21 was changed." : <>Press <span className="hk-kbd">Esc</span> to stop</>}</span>
        <span className="hk-row gap-[8px]">
          {st === "Running" && <><span className="hk-btn hk-btn--sm"><Pause size={12} fill="currentColor" strokeWidth={0} />Pause</span>{o.takeover && <span className="hk-btn hk-btn--sm">Take over</span>}<span className="hk-btn hk-btn--sm"><Square size={10} fill="currentColor" strokeWidth={0} />Stop</span></>}
          {st === "Paused" && <><span className="hk-btn hk-btn--sm">Stop</span><span className="hk-btn hk-btn--sm hk-btn--main"><Play size={12} fill="currentColor" strokeWidth={0} />Resume</span></>}
          {st === "Stopped" && <><span className="hk-btn hk-btn--sm">Undo 21 changes</span><span className="hk-btn hk-btn--sm hk-btn--main">Continue</span></>}
        </span>
      </div>
    </div>
  );
}

/* Capabilities and connections — ChatGPT connectors + GPT capabilities, Claude
   integrations and tool permissions, Cursor / Claude Code allow-lists, MCP settings. */
function Capabilities({ o }: { o: Props }) {
  const rows: [typeof Mail, string, string][] = [[HardDrive, "Google Drive", "Read"], [MessageSquare, "Slack", "Read and post"], [Ticket, "Linear", "Ask first"], [Mail, "Gmail", "Off"]];
  return (
    <div className="hk-panel w-[520px] p-[16px] hk-col gap-[10px]">
      <div className="hk-row justify-between"><span className="hk-col"><span className="hk-h">What Atlas can use</span><span className="hk-s">Applies to every chat in this workspace</span></span><span className="hk-btn hk-btn--sm"><Plus size={13} />Connect</span></div>
      <div className="hk-col">
        {rows.map(([I, t, a]) => (
          <div key={t} className="hk-row gap-[10px] py-[8px] border-t border-[var(--k-edge)]">
            <span className="hk-app"><I size={16} /></span><span className="hk-t hk-grow">{t}</span>
            {o.style === "Switches" ? <span className={`hk-switch ${a !== "Off" ? "hk-switch--on" : ""}`} /> : (
              <span className={`hk-pick hk-pick--box !h-[30px] ${a === "Ask first" ? "!text-[color:var(--k-warn)]" : a === "Off" ? "!text-[color:var(--text-tertiary)]" : ""}`}>{a}<ChevronDown size={13} /></span>
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
  const v = o.view as string;
  if (v === "Saved toast")
    return (
      <div className="w-[480px] hk-col gap-[10px]">
        <p className="hk-b">Got it. I&apos;ll keep reports to one page from now on.</p>
        <div className="hk-row gap-[8px] hk-s"><Brain size={15} className="hk-blue" /><span className="font-medium text-[color:var(--text-primary)]">Memory updated</span>· Prefers one-page reports<span className="hk-link ml-[4px]">Manage</span></div>
      </div>
    );
  const mem = ["Leads the growth team at Northwind", "Prefers one-page reports", "Writes in British English", "Weekly review is on Mondays"];
  return (
    <div className="hk-panel w-[500px] p-[16px] hk-col gap-[10px]">
      <div className="hk-row justify-between"><span className="hk-h">Memory</span><span className="hk-row gap-[8px] hk-s">Use memory<span className={`hk-switch ${o.off ? "" : "hk-switch--on"}`} /></span></div>
      <span className="hk-s">Atlas remembers these across chats. Edit or delete any of them.</span>
      <div className="hk-col">
        {mem.map((m, i) => (
          <div key={m} className={`hk-row gap-[10px] py-[8px] border-t border-[var(--k-edge)] ${o.off ? "opacity-50" : ""}`}>
            <span className="hk-b hk-grow">{m}</span>{i === 1 && <span className="hk-tag hk-tag--blue">New</span>}
            <span className="hk-ib hk-ib--bare"><Pencil size={14} /></span><span className="hk-ib hk-ib--bare"><Trash2 size={14} /></span>
          </div>
        ))}
      </div>
      {o.temporary && <div className="hk-well px-[12px] py-[8px] hk-row gap-[8px] hk-s"><History size={14} />Temporary chat: nothing here is saved or remembered.</div>}
    </div>
  );
}

/* Checkpoints and branches — Cursor restore checkpoint, Claude Code /rewind, ChatGPT
   edit-and-branch with ‹ 2 / 3 ›, Replit / Lovable version history. */
function Checkpoints({ o }: { o: Props }) {
  const pts: [string, string, boolean?][] = [["Added the pricing table", "2 files · 4 min ago"], ["Rewrote the intro", "1 file · 9 min ago", true], ["Started from the brief", "12 min ago"]];
  return (
    <div className="w-[520px] hk-col gap-[12px]">
      {o.branch && (
        <div className="hk-col gap-[6px] items-end">
          <span className="hk-bubble">Make the pricing table compare three plans</span>
          <span className="hk-row !gap-[2px] hk-s"><span className="hk-ib hk-ib--sm"><Pencil size={14} /></span><span className="hk-ib hk-ib--sm"><ChevronLeft size={14} /></span>2 / 3<span className="hk-ib hk-ib--sm"><ChevronRight size={14} /></span></span>
        </div>
      )}
      <div className="hk-panel p-[8px] hk-col">
        <div className="hk-row justify-between px-[8px] py-[6px]"><span className="hk-t">Checkpoints</span><span className="hk-s hk-row gap-[4px]"><GitBranch size={13} />main</span></div>
        {pts.map(([t, s, hov], i) => (
          <div key={t} className={`hk-mi ${hov ? "hk-mi--on" : ""}`}>
            <span className={`hk-step ${i === 0 ? "hk-step--now" : "hk-step--num"}`} />
            <span className="hk-col hk-grow"><span className="font-medium">{t}</span><span className="hk-s">{s}</span></span>
            {hov && <><span className="hk-btn hk-btn--sm"><RotateCcw size={13} />Restore</span>{o.fork && <span className="hk-btn hk-btn--sm"><GitFork size={13} />Branch</span>}</>}
            {i === 0 && <span className="hk-tag">Now</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* Access per agent — which agent may use which system, so no single agent holds all the
   access a task needs (Okta app assignments, GitHub fine-grained tokens, AWS IAM roles,
   Copilot Studio agent permissions). */
function AgentAccess({ o }: { o: Props }) {
  const apps = ["Stripe", "Zendesk", "Gmail"];
  const rows: [string, string[]][] = [["Billing agent", ["Refund", "", ""]], ["Support agent", ["Read", "Reply", ""]], ["Outreach agent", ["", "Read", "Send"]]];
  return (
    <div className="hk-panel w-[520px] p-[16px] hk-col gap-[10px]">
      <div className="hk-row justify-between"><span className="hk-col"><span className="hk-h">Who can use what</span><span className="hk-s">Refunds workflow · 3 agents</span></span>{o.edit && <span className="hk-btn hk-btn--sm">Edit access</span>}</div>
      <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr] items-stretch">
        <span className="hk-s pb-[6px]">Agent</span>
        {apps.map((a) => <span key={a} className="hk-s font-medium pb-[6px] px-[8px]">{a}</span>)}
        {rows.map(([n, cells]) => (
          <Fragment key={n}>
            <span className="hk-row gap-[8px] py-[9px] border-t border-[var(--k-edge)]"><Ag size="sm" icon={Bot} /><span className="hk-t !text-[13.5px] hk-trunc">{n}</span></span>
            {cells.map((c, i) => <span key={i} className="hk-row px-[8px] py-[9px] border-t border-[var(--k-edge)]">{c ? <span className="hk-tag">{c}</span> : <span className="hk-faint text-[13px]">None</span>}</span>)}
          </Fragment>
        ))}
      </div>
      {o.rule && <div className="hk-well px-[12px] py-[8px] hk-row gap-[8px] hk-s"><Lock size={14} className="shrink-0" />No agent can both refund a payment and email the customer.</div>}
    </div>
  );
}

export const CONTROLLERS: Record<string, Entry> = {
  "stop-and-pause": { C: StopAndPause, opts: [sel("state", "State", ["Running", "Paused", "Stopped"]), tog("takeover", "Take over"), tog("live", "Live step")], refs: ["ChatGPT agent", "Claude Code", "Codex cloud", "Manus"] },
  capabilities: { C: Capabilities, opts: [sel("style", "Access control", ["Levels", "Switches"]), tog("limits", "Hard limits")], refs: ["ChatGPT connectors", "Claude integrations", "Cursor allow-list", "MCP clients"] },
  memory: { C: Memory, opts: [sel("view", "View", ["Manage", "Saved toast"]), tog("off", "Memory off", false), tog("temporary", "Temporary chat", false)], refs: ["ChatGPT memory", "Claude memory", "Gemini saved info"] },
  "agent-access": { C: AgentAccess, opts: [tog("rule", "Separation rule"), tog("edit", "Edit access", false)], refs: ["Okta app assignments", "GitHub fine-grained tokens", "AWS IAM roles", "Copilot Studio agents"] },
  checkpoints: { C: Checkpoints, opts: [tog("branch", "Edit and branch"), tog("fork", "Branch from here")], refs: ["Cursor checkpoints", "Claude Code rewind", "ChatGPT branches", "Lovable history"] },
};
