import { ArrowRight, BellRing, Bot, Check, CircleAlert, FileText, Sparkle, WifiOff, X } from "./icons";
import { Ag, Bullets, sel, st, tog, Spin, type Entry, type Props } from "./ui";
import { Btn, IconBtn, Tag, TextLink } from "./parts";

// phone: fill the screen and use touch sizes (see .hk-touch in kit.css)
const W = (o: Props, w: string) => (o.device === "mobile" ? "hk-touch w-full" : w);

/* AI label — Adobe Content Credentials "cr" pin, Google SynthID notice, Meta "AI info",
   Notion / Copilot "AI generated, check for mistakes" footers. */
function AILabel({ o }: { o: Props }) {
  const v = o.on as string;
  const m = o.device === "mobile";
  if (v === "Image")
    return (
      <div className={`${m ? "hk-touch w-full aspect-[4/3]" : "w-[360px] h-[260px]"} rounded-[var(--hk-r-xl)] relative overflow-hidden`} style={{ background: "linear-gradient(160deg,#dfe7ef,#9fb5cb 55%,#6b84a0)" }}>
        <span className="hk-ai absolute left-[12px] top-[12px]"><Sparkle size={12} className="hk-blue" />Made with AI</span>
        {o.details && <div className={`hk-pop absolute left-[12px] top-[44px] ${m ? "right-[12px]" : "w-[230px]"} !p-[12px] hk-col gap-[4px]`}><span className="hk-t !text-[13px]">Content credentials</span><span className="hk-s">Made with Atlas Image 4 on 12 Nov. Edited in Photoshop.</span></div>}
      </div>
    );
  return (
    <div className={`hk-panel ${W(o, "w-[500px]")} ${m ? "p-[14px]" : "p-[16px]"} hk-col gap-[12px]`}>
      <div className={m ? "hk-col !items-start gap-[8px]" : "hk-row justify-between"}><span className="hk-h">Q3 board update</span><span className="hk-ai"><Sparkle size={12} className="hk-blue" />{o.state === "Edited" ? "Drafted by Atlas, edited by Maya" : o.state === "Checked" ? "Drafted by Atlas, checked by Maya" : "Drafted by Atlas"}</span></div>
      <p className="hk-b">Revenue grew 18% this quarter, led by the Team plan. Churn in EMEA is the main risk going into Q4.</p>
      <div className={`${m ? "hk-col !items-start gap-[2px]" : "hk-row justify-between"} border-t border-[var(--k-edge)] pt-[10px]`}><span className="hk-s">{o.state === "Checked" ? "Maya confirmed the numbers on 12 Nov." : o.state === "Edited" ? "Maya changed 2 sentences. Check the rest." : "AI can make mistakes. Check the numbers before you send."}</span>{o.details && <TextLink className="hk-s">How it was made</TextLink>}</div>
    </div>
  );
}

/* Agent avatar — Copilot / Claude / Gemini presence marks, Slack bot badge, Devin and
   Linear agent assignees: which agent, and whether it is working, waiting or idle. */
function AgentAvatar({ o }: { o: Props }) {
  const rows: [string, string, string][] = [["Working", "var(--k-ok)", "Drafting the reply"], ["Needs you", "var(--k-warn)", "Waiting for approval"], ["Idle", "var(--text-tertiary)", "Last ran 2 h ago"]];
  return (
    <div className={`${W(o, "w-[480px]")} hk-col gap-[10px]`}>
      {rows.map(([s, c, d], i) => (o.state === "All" || o.state === ["Working", "Waiting for you", "Idle"][i]) && (
        <div key={s} className="hk-panel !shadow-none hk-row gap-[12px] px-[14px] h-[60px]">
          <Ag size="lg" icon={i === 2 ? Bot : Sparkle} dot={c} />
          <span className="hk-col hk-grow min-w-0"><span className="hk-row gap-[6px]"><span className="hk-t truncate">{["Atlas", "Billing agent", "Research agent"][i]}</span>{o.badge && <Tag>Agent</Tag>}</span><span className="hk-s truncate">{d}</span></span>
          {i === 1 && o.state === "Waiting for you" ? <Btn size="sm" kind="main">Review</Btn> : <span className="hk-s font-medium shrink-0" style={{ color: c }}>{s}</span>}
        </div>
      ))}
    </div>
  );
}

/* Proactive suggestion — Copilot in Outlook "Draft a reply?", Gemini in Gmail nudges,
   Superhuman, Notion AI "noticed": once, specific, easy to dismiss. */
function ProactiveSuggestion({ o }: { o: Props }) {
  const inline = o.style === "Inline";
  const m = o.device === "mobile";
  const done = o.state === "Accepted" ? (
    <div className="hk-row gap-[10px]"><Ag size="sm" /><span className="hk-col hk-grow"><span className="hk-t !text-[13.5px]">Drafting 3 reminders</span><span className="hk-s">Invoices INV-2041, INV-2038, INV-2032</span></span><Spin /></div>
  ) : o.state === "Dismissed" ? (
    <div className="hk-row justify-between gap-[10px]"><span className="hk-s">Dismissed. Atlas won&apos;t suggest this again.</span><TextLink className="hk-s">Undo</TextLink></div>
  ) : null;
  const body = done ?? (
    <>
      <div className="hk-row !items-start gap-[10px]"><Ag size="sm" /><span className="hk-col hk-grow"><span className="hk-t !text-[13.5px]">3 invoices are over 30 days late</span><span className="hk-s">Want me to draft polite reminders?</span></span><IconBtn size="xs" label="Dismiss" icon={<X size={15} />} /></div>
      {m ? (
        // phone: the main action spans the width; the two ways out share the row under it
        <div className="hk-col !items-stretch gap-[8px]"><Btn size="sm" kind="main">Draft reminders</Btn><span className="hk-row gap-[8px] [&>*]:flex-1"><Btn size="sm">Not now</Btn>{o.never && <Btn size="sm" kind="ghost">Don&apos;t suggest this</Btn>}</span></div>
      ) : <div className="hk-row justify-end gap-[8px]">{o.never && <Btn size="sm" kind="ghost">Don&apos;t suggest this</Btn>}<Btn size="sm">Not now</Btn><Btn size="sm" kind="main">Draft reminders</Btn></div>}
    </>
  );
  return (
    <div className={`${W(o, "w-[520px]")} hk-col gap-[10px]`}>
      <div className="hk-panel !shadow-none p-[14px] hk-col">
        <span className="hk-xs pb-[6px]">Invoices</span>
        {[["INV-2041", "Acme", "34 days late"], ["INV-2038", "Globex", "41 days late"], ["INV-2032", "Initech", "33 days late"]].map(([a, b, c]) => <div key={a} className="hk-row gap-[12px] py-[7px] border-t border-[var(--k-edge)] text-[13px]"><span className={`hk-mono ${m ? "w-[72px]" : "w-[80px]"}`}>{a}</span><span className="hk-grow">{b}</span><span className="hk-badc font-medium">{c}</span></div>)}
        {/* inline: part of the page, right under what it is about (Gemini in Gmail, Notion AI) */}
        {inline && <div className="hk-well mt-[8px] p-[12px] hk-col gap-[10px]">{body}</div>}
      </div>
      {/* floating: a card on top of the app, in the corner, easy to dismiss (Copilot in Outlook) */}
      {/* phone: the card sits at the bottom of the screen, full width, above the thumb */}
      {!inline && <div className={`hk-pop !p-[14px] hk-col gap-[10px] ${m ? "w-full" : "w-[340px] self-end"}`}>{body}</div>}
    </div>
  );
}

/* Update notice — ChatGPT "We've updated the model", Claude "New: …" banner, Cursor
   changelog toast, GitHub Copilot model deprecation. */
function UpdateNotice({ o }: { o: Props }) {
  const m = o.device === "mobile";
  if (o.style === "Banner" && m)
    // phone: the message gets the full line; the link drops under it
    return (
      <div className="hk-panel hk-touch w-full hk-col !items-stretch gap-[2px] pl-[14px] pr-[4px] py-[6px]">
        <div className="hk-row gap-[10px]">{o.state !== "Read" && <Tag tone="blue">New</Tag>}<span className="hk-b hk-grow">Atlas can now read your team wiki.</span><IconBtn size="xs" label="Dismiss" icon={<X size={15} />} /></div>
        <TextLink className="hk-s hk-row gap-[4px] self-start">What changed<ArrowRight size={13} /></TextLink>
      </div>
    );
  if (o.style === "Banner")
    return (
      <div className="hk-panel w-[540px] hk-row gap-[10px] px-[14px] h-[52px]">
        {o.state !== "Read" && <Tag tone="blue">New</Tag>}<span className="hk-b hk-grow">Atlas can now read your team wiki.</span><TextLink className="hk-s hk-row gap-[4px]">What changed<ArrowRight size={13} /></TextLink><IconBtn size="xs" label="Dismiss" icon={<X size={15} />} />
      </div>
    );
  return (
    <div className={`hk-panel ${W(o, "w-[460px]")} ${m ? "p-[14px]" : "p-[16px]"} hk-col gap-[12px]`}>
      <div className="hk-row !items-start gap-[12px]"><BellRing size={17} className="hk-blue shrink-0 mt-[1px]" /><span className="hk-col hk-grow"><span className="hk-t">{o.state === "Needs a yes" ? "Atlas wants to read your team wiki" : "Atlas was updated"}</span><span className="hk-s">{o.state === "Read" ? "Version 2.4 · 3 days ago" : "Version 2.4 · today"}</span></span><IconBtn size="xs" label="Dismiss" icon={<X size={15} />} /></div>
      <Bullets items={["Reads the team wiki", "Asks before deleting any file", "Uses Atlas 3 by default"]} />
      {o.model && <div className="hk-well px-[12px] py-[8px] hk-row !items-start gap-[8px] hk-s"><CircleAlert size={14} className="hk-warnc shrink-0 mt-[2px]" />Atlas 2 retires on 1 Dec. Chats switch to Atlas 3.</div>}
      {o.state === "Needs a yes" ? <div className={`hk-row justify-end gap-[8px] ${m ? "[&>*]:flex-1" : ""}`}><Btn size="sm">Not now</Btn><Btn size="sm" kind="main">Allow</Btn></div> : <TextLink className="hk-s">See everything that changed</TextLink>}
    </div>
  );
}

/* Error message — ChatGPT "Something went wrong · Retry", Claude "overloaded, retrying",
   Copilot connector expired, Gemini "can't help with that": cause + one fix, nothing lost. */
function ErrorMessage({ o }: { o: Props }) {
  const k = o.kind as string;
  const [I, t, d0, fix0] = k === "Connection" ? [CircleAlert, "Couldn't reach the CRM", "The connection expired 2 hours ago.", "Reconnect"] : k === "Network" ? [WifiOff, "You're offline", "Atlas will send your message when you reconnect.", "Try again"] : [CircleAlert, "Atlas is busy right now", "Lots of people are asking at once. Retrying in 8 s.", "Retry now"];
  const d = o.state === "Retrying" ? "Attempt 2 of 3. Retrying in 8 s." : o.state === "Can't fix" ? "Atlas can't fix this. Ask your workspace admin to check the connection." : d0;
  const fix = o.state === "Retrying" ? "Retry now" : o.state === "Can't fix" ? "Copy details" : fix0;
  const m = o.device === "mobile";
  return (
    <div className={`hk-panel ${W(o, "w-[480px]")} ${m ? "p-[14px]" : "p-[16px]"} hk-col gap-[12px]`}>
      <div className="hk-row !items-start gap-[12px]">
        <I size={18} strokeWidth={2.25} className="shrink-0 mt-[1px]" style={{ color: "var(--k-bad)" }} />
        <span className="hk-col"><span className="hk-t">{t}</span><span className="hk-s">{d}</span></span>
      </div>
      {o.saved && <div className={`hk-well px-[12px] py-[8px] hk-row gap-[8px] hk-s ${m ? "flex-wrap gap-y-0" : ""}`}><Check size={14} strokeWidth={2.5} className="hk-okc" />Your request and <FileText size={13} />3 files are saved</div>}
      <div className={`hk-row justify-end gap-[8px] ${m ? "[&>*]:flex-1" : ""}`}>{o.details && <Btn kind="ghost">Details</Btn>}<Btn kind="main">{fix}</Btn></div>
    </div>
  );
}

export const NOTIFIERS: Record<string, Entry> = {
  "ai-label": { C: AILabel, opts: [sel("on", "On", ["Document", "Image"]), tog("details", "How it was made"), sel("state", "State", ["AI generated", "Edited", "Checked"])], refs: ["Adobe Content Credentials", "Meta AI info", "Microsoft Copilot", "Notion AI"], states: [st("AI generated", { state: "AI generated" }), st("Edited", { state: "Edited" }), st("Checked", { state: "Checked" })] },
  "agent-avatar": { C: AgentAvatar, opts: [tog("badge", "Agent badge", false), sel("state", "State", ["All", "Working", "Waiting for you", "Idle"])], refs: ["Microsoft Copilot", "Slack apps", "Linear agents", "Devin"], states: [st("Working", { state: "Working" }), st("Waiting for you", { state: "Waiting for you" }), st("Idle", { state: "Idle" })] },
  "proactive-suggestion": { C: ProactiveSuggestion, opts: [sel("style", "Style", ["Floating", "Inline"]), tog("never", "Stop suggesting", false), sel("state", "State", ["Shown", "Accepted", "Dismissed"])], refs: ["Copilot in Outlook", "Gemini in Gmail", "Notion AI", "Superhuman"], states: [st("Shown", { state: "Shown" }), st("Accepted", { state: "Accepted" }), st("Dismissed", { state: "Dismissed" })] },
  "update-notice": { C: UpdateNotice, opts: [sel("style", "Style", ["Card", "Banner"]), tog("model", "Model retiring"), sel("state", "State", ["New", "Read", "Needs a yes"])], refs: ["ChatGPT model updates", "Claude announcements", "Cursor changelog"], states: [st("New", { state: "New" }), st("Read", { state: "Read" }), st("Needs a yes", { state: "Needs a yes" })] },
  "error-message": { C: ErrorMessage, opts: [sel("kind", "Cause", ["Connection", "Busy", "Network"]), tog("saved", "Work saved"), tog("details", "Details", false), sel("state", "State", ["Can fix", "Retrying", "Can't fix"])], refs: ["ChatGPT", "Claude", "Microsoft Copilot", "Gemini"], states: [st("Can fix", { state: "Can fix" }), st("Retrying", { state: "Retrying" }), st("Can't fix", { state: "Can't fix" })] },
};
