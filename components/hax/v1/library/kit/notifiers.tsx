import { ArrowRight, BellRing, Bot, Check, CircleAlert, FileText, Sparkle, WifiOff, X } from "./icons";
import { Ag, Bullets, sel, tog, type Entry, type Props } from "./ui";

/* AI label — Adobe Content Credentials "cr" pin, Google SynthID notice, Meta "AI info",
   Notion / Copilot "AI generated, check for mistakes" footers. */
function AILabel({ o }: { o: Props }) {
  const v = o.on as string;
  if (v === "Image")
    return (
      <div className="w-[360px] h-[260px] rounded-[var(--hk-r-xl)] relative overflow-hidden" style={{ background: "linear-gradient(160deg,#dfe7ef,#9fb5cb 55%,#6b84a0)" }}>
        <span className="hk-ai absolute left-[12px] top-[12px]"><Sparkle size={12} className="hk-blue" />Made with AI</span>
        {o.details && <div className="hk-pop absolute left-[12px] top-[44px] w-[230px] !p-[12px] hk-col gap-[4px]"><span className="hk-t !text-[13px]">Content credentials</span><span className="hk-s">Made with Atlas Image 4 on 12 Nov. Edited in Photoshop.</span></div>}
      </div>
    );
  return (
    <div className="hk-panel w-[500px] p-[16px] hk-col gap-[12px]">
      <div className="hk-row justify-between"><span className="hk-h">Q3 board update</span><span className="hk-ai"><Sparkle size={12} className="hk-blue" />Drafted by Atlas</span></div>
      <p className="hk-b">Revenue grew 18% this quarter, led by the Team plan. Churn in EMEA is the main risk going into Q4.</p>
      <div className="hk-row justify-between border-t border-[var(--k-edge)] pt-[10px]"><span className="hk-s">AI can make mistakes. Check the numbers before you send.</span>{o.details && <span className="hk-s hk-link">How it was made</span>}</div>
    </div>
  );
}

/* Agent avatar — Copilot / Claude / Gemini presence marks, Slack bot badge, Devin and
   Linear agent assignees: which agent, and whether it is working, waiting or idle. */
function AgentAvatar({ o }: { o: Props }) {
  const st: [string, string, string][] = [["Working", "var(--k-ok)", "Drafting the reply"], ["Needs you", "var(--k-warn)", "Waiting for approval"], ["Idle", "var(--text-tertiary)", "Last ran 2 h ago"]];
  return (
    <div className="w-[480px] hk-col gap-[10px]">
      {st.map(([s, c, d], i) => (
        <div key={s} className="hk-panel !shadow-none hk-row gap-[12px] px-[14px] h-[60px]">
          <Ag size="lg" icon={i === 2 ? Bot : Sparkle} dot={c} />
          <span className="hk-col hk-grow"><span className="hk-row gap-[6px]"><span className="hk-t">{["Atlas", "Billing agent", "Research agent"][i]}</span>{o.badge && <span className="hk-tag !h-[20px] !text-[11px]">Agent</span>}</span><span className="hk-s">{d}</span></span>
          <span className="hk-s font-medium" style={{ color: c }}>{s}</span>
        </div>
      ))}
    </div>
  );
}

/* Proactive suggestion — Copilot in Outlook "Draft a reply?", Gemini in Gmail nudges,
   Superhuman, Notion AI "noticed": once, specific, easy to dismiss. */
function ProactiveSuggestion({ o }: { o: Props }) {
  const inline = o.style === "Inline";
  const body = (
    <>
      <div className="hk-row !items-start gap-[10px]"><Ag size="sm" /><span className="hk-col hk-grow"><span className="hk-t !text-[13.5px]">3 invoices are over 30 days late</span><span className="hk-s">Want me to draft polite reminders?</span></span><span className="hk-ib hk-ib--bare"><X size={15} /></span></div>
      <div className="hk-row justify-end gap-[8px]">{o.never && <span className="hk-btn hk-btn--sm hk-btn--ghost">Don&apos;t suggest this</span>}<span className="hk-btn hk-btn--sm">Not now</span><span className="hk-btn hk-btn--sm hk-btn--main">Draft reminders</span></div>
    </>
  );
  return (
    <div className="w-[520px] hk-col gap-[10px]">
      <div className="hk-panel !shadow-none p-[14px] hk-col">
        <span className="hk-xs pb-[6px]">Invoices</span>
        {[["INV-2041", "Acme", "34 days late"], ["INV-2038", "Globex", "41 days late"], ["INV-2032", "Initech", "33 days late"]].map(([a, b, c]) => <div key={a} className="hk-row gap-[12px] py-[7px] border-t border-[var(--k-edge)] text-[13px]"><span className="hk-mono w-[80px]">{a}</span><span className="hk-grow">{b}</span><span className="hk-badc font-medium">{c}</span></div>)}
        {/* inline: part of the page, right under what it is about (Gemini in Gmail, Notion AI) */}
        {inline && <div className="hk-well mt-[8px] p-[12px] hk-col gap-[10px]">{body}</div>}
      </div>
      {/* floating: a card on top of the app, in the corner, easy to dismiss (Copilot in Outlook) */}
      {!inline && <div className="hk-pop !p-[14px] hk-col gap-[10px] w-[340px] self-end">{body}</div>}
    </div>
  );
}

/* Update notice — ChatGPT "We've updated the model", Claude "New: …" banner, Cursor
   changelog toast, GitHub Copilot model deprecation. */
function UpdateNotice({ o }: { o: Props }) {
  if (o.style === "Banner")
    return (
      <div className="hk-panel w-[540px] hk-row gap-[10px] px-[14px] h-[52px]">
        <span className="hk-tag hk-tag--blue">New</span><span className="hk-b hk-grow">Atlas can now read your team wiki.</span><span className="hk-s hk-link hk-row gap-[4px]">What changed<ArrowRight size={13} /></span><span className="hk-ib hk-ib--bare"><X size={15} /></span>
      </div>
    );
  return (
    <div className="hk-panel w-[460px] p-[16px] hk-col gap-[12px]">
      <div className="hk-row !items-start gap-[12px]"><BellRing size={17} className="hk-blue shrink-0 mt-[1px]" /><span className="hk-col hk-grow"><span className="hk-t">Atlas was updated</span><span className="hk-s">Version 2.4 · today</span></span><span className="hk-ib hk-ib--bare"><X size={15} /></span></div>
      <Bullets items={["Reads the team wiki", "Asks before deleting any file", "Uses Atlas 3 by default"]} />
      {o.model && <div className="hk-well px-[12px] py-[8px] hk-row gap-[8px] hk-s"><CircleAlert size={14} className="hk-warnc" />Atlas 2 retires on 1 Dec. Chats switch to Atlas 3.</div>}
      <span className="hk-s hk-link">See everything that changed</span>
    </div>
  );
}

/* Error message — ChatGPT "Something went wrong · Retry", Claude "overloaded, retrying",
   Copilot connector expired, Gemini "can't help with that": cause + one fix, nothing lost. */
function ErrorMessage({ o }: { o: Props }) {
  const k = o.kind as string;
  const [I, t, d, fix] = k === "Connection" ? [CircleAlert, "Couldn't reach the CRM", "The connection expired 2 hours ago.", "Reconnect"] : k === "Network" ? [WifiOff, "You're offline", "Atlas will send your message when you reconnect.", "Try again"] : [CircleAlert, "Atlas is busy right now", "Lots of people are asking at once. Retrying in 8 s.", "Retry now"];
  return (
    <div className="hk-panel w-[480px] p-[16px] hk-col gap-[12px]">
      <div className="hk-row !items-start gap-[12px]">
        <I size={18} strokeWidth={2.25} className="shrink-0 mt-[1px]" style={{ color: "var(--k-bad)" }} />
        <span className="hk-col"><span className="hk-t">{t}</span><span className="hk-s">{d}</span></span>
      </div>
      {o.saved && <div className="hk-well px-[12px] py-[8px] hk-row gap-[8px] hk-s"><Check size={14} strokeWidth={2.5} className="hk-okc" />Your request and <FileText size={13} />3 files are saved</div>}
      <div className="hk-row justify-end gap-[8px]">{o.details && <span className="hk-btn hk-btn--ghost">Details</span>}<span className="hk-btn hk-btn--main">{fix}</span></div>
    </div>
  );
}

export const NOTIFIERS: Record<string, Entry> = {
  "ai-label": { C: AILabel, opts: [sel("on", "On", ["Document", "Image"]), tog("details", "How it was made")], refs: ["Adobe Content Credentials", "Meta AI info", "Microsoft Copilot", "Notion AI"] },
  "agent-avatar": { C: AgentAvatar, opts: [tog("badge", "Agent badge", false)], refs: ["Microsoft Copilot", "Slack apps", "Linear agents", "Devin"] },
  "proactive-suggestion": { C: ProactiveSuggestion, opts: [sel("style", "Style", ["Floating", "Inline"]), tog("never", "Stop suggesting", false)], refs: ["Copilot in Outlook", "Gemini in Gmail", "Notion AI", "Superhuman"] },
  "update-notice": { C: UpdateNotice, opts: [sel("style", "Style", ["Card", "Banner"]), tog("model", "Model retiring")], refs: ["ChatGPT model updates", "Claude announcements", "Cursor changelog"] },
  "error-message": { C: ErrorMessage, opts: [sel("kind", "Cause", ["Connection", "Busy", "Network"]), tog("saved", "Work saved"), tog("details", "Details", false)], refs: ["ChatGPT", "Claude", "Microsoft Copilot", "Gemini"] },
};
