import { Fragment, type ReactNode } from "react";
import { Bot, Brain, Check, ChevronDown, ChevronRight, CircleAlert, FileText, Globe, Info, Wrench } from "./icons";
import { Ag, Me, Spin, sel, st as stt, tog, type Entry, type Props } from "./ui";
import { Btn, Chip, Pressable, Progress, Rule, Tag, TextLink } from "./parts";

// width on a phone: the screen's width, with touch-sized controls (the component page's Mobile view
// sets o.device); on desktop, the component's own width
const W = (o: Props, w: string) => (o.device === "mobile" ? "hk-touch w-full" : w);

/* Reasoning — Claude "Thought for 12s", ChatGPT "Thought for …" with summary steps,
   Gemini "Show thinking", DeepSeek. Folded by default. */
function Reasoning({ o }: { o: Props }) {
  const open = o.state === "Open", live = o.state === "Thinking";
  return (
    <div className={`${W(o, "w-[520px]")} hk-col gap-[10px]`}>
      <div className="hk-row gap-[8px] hk-s">
        {live ? <><Spin s={14} /><span className="hk-shimmer font-medium">Thinking · Checking the May price change</span></> : <><Brain size={15} /><span className="font-medium text-[color:var(--text-secondary)]">Thought for 12 seconds</span></>}
        {!live && <ChevronDown size={15} className={open ? "rotate-180" : ""} />}
      </div>
      {open && (
        <div className="pl-[14px] ml-[7px] border-l-2 border-[var(--k-edge)] hk-col gap-[8px] text-[13.5px] leading-[20px] hk-mute">
          {o.steps ? (
            <>
              <span><b className="text-[color:var(--text-primary)] font-semibold">Finding the cause.</b> EMEA churn rose 4 points; the timing matches the May price change.</span>
              <span><b className="text-[color:var(--text-primary)] font-semibold">Checking who left.</b> 71% of lost teams had fewer than ten seats.</span>
            </>
          ) : <span>EMEA churn rose 4 points. The timing matches the May price change, so I&apos;ll split by plan size before blaming price…</span>}
        </div>
      )}
      <p className="hk-b">Churn rose because small teams moved to monthly billing after the price change, then left.</p>
    </div>
  );
}

/* Sources — Perplexity numbered citations + source cards, ChatGPT search pills,
   Gemini double-check, Claude citations, Copilot references. */
// phone: the source cards become a compact list, and since a phone has no hover, a tapped citation
// opens its source as a bottom sheet.
function Sources({ o }: { o: Props }) {
  const m = o.device === "mobile";
  const hover = o.state === "Hover";
  const unsupported = o.state === "Unsupported";
  const src: [string, string, string][] = [["Q3 churn report", "Shared drive · PDF", "#d0342c"], ["Pricing change memo", "Team wiki", "#0a6bd6"], ["EMEA retention", "analytics.acme.com", "#12805c"]];
  return (
    <div className={`${W(o, "w-[540px]")} hk-col gap-[12px]`}>
      {o.layout === "Cards on top" && m && (
        <div className="hk-col gap-[6px]">
          {src.map(([t, s, c], i) => <div key={t} className="hk-well px-[10px] py-[8px] hk-row gap-[10px]"><span className="size-[20px] rounded-[5px] grid place-items-center text-white text-[11px] font-bold shrink-0" style={{ background: c }}>{i + 1}</span><span className="hk-col min-w-0"><span className="hk-t !text-[13px] hk-trunc">{t}</span><span className="hk-s hk-trunc">{s}</span></span></div>)}
        </div>
      )}
      {o.layout === "Cards on top" && !m && (
        <div className="grid grid-cols-3 gap-[8px]">
          {src.map(([t, s, c], i) => <div key={t} className="hk-well p-[10px] hk-col gap-[6px]"><span className="hk-row gap-[6px]"><span className="size-[18px] rounded-[5px] grid place-items-center text-white text-[11px] font-bold shrink-0" style={{ background: c }}>{i + 1}</span><span className="hk-s hk-trunc">{s}</span></span><span className="hk-t !text-[13px] hk-trunc">{t}</span></div>)}
        </div>
      )}
      <p className="hk-b">Churn rose 4 points in EMEA after the May price change<span className="hk-cite">1</span>. Most of the loss was teams under ten seats<span className="relative inline-block">
          <span className="hk-cite" style={hover ? { background: "var(--k-blue)", color: "var(--k-on-blue)" } : undefined}>3</span>
          {hover && !m && (
            <span className="hk-pop absolute left-[-6px] top-[calc(100%+6px)] w-[270px] !p-[12px] hk-col gap-[4px] z-10">
              <span className="hk-s hk-row gap-[6px]"><Globe size={13} />analytics.acme.com</span><span className="hk-t !text-[13px]">EMEA retention dashboard</span>
              <span className="text-[12.5px] leading-[18px] hk-mute">&ldquo;Teams with 1–9 seats churned at 7.1%, up from 3.4%.&rdquo;</span>
            </span>
          )}
        </span>, which the pricing memo had flagged as a risk<span className="hk-cite">2</span>.{unsupported && <> Support tickets also doubled<Tag tone="warn" className="ml-[6px] align-middle">No source</Tag>.</>}
      </p>
      {hover && m && (
        <div className="hk-sheet-scrim">
          <div className="hk-pop hk-sheet !gap-[6px] !px-[16px]">
            <span aria-hidden="true" className="hk-sheet-grab" />
            <span className="hk-s hk-row gap-[6px]"><span className="hk-cite !ml-0">3</span><Globe size={13} />analytics.acme.com</span><span className="hk-t">EMEA retention dashboard</span>
            <span className="text-[13.5px] leading-[20px] hk-mute">&ldquo;Teams with 1–9 seats churned at 7.1%, up from 3.4%.&rdquo;</span>
            <Btn size="sm" className="mt-[6px] w-full">Open the source</Btn>
          </div>
        </div>
      )}
      {o.layout === "List below" && (
        <div className="hk-col gap-[2px]"><span className="hk-xs pb-[4px]">Sources</span>{src.map(([t, s], i) => <span key={t} className={`hk-row gap-[8px] text-[13px] ${m ? "flex-wrap gap-y-0" : ""}`}><span className="hk-cite !ml-0">{i + 1}</span><span className="font-medium">{t}</span><span className="hk-s">{s}</span></span>)}</div>
      )}
    </div>
  );
}

/* Confidence — Gemini "Double-check" highlights (green / orange), Elicit, Copilot
   "may be inaccurate": confidence per claim, not one global score. */
function Confidence({ o }: { o: Props }) {
  const lvl = o.state as string;
  const hl = (t: string, ok: boolean) => <span className="px-[2px] rounded-[3px]" style={{ background: ok ? "var(--k-ok-bg)" : "var(--k-warn-bg)", boxShadow: `inset 0 -2px 0 ${ok ? "var(--k-ok)" : "var(--k-warn)"}` }}>{t}</span>;
  return (
    <div className={`hk-panel ${W(o, "w-[520px]")} p-[16px] hk-col gap-[12px]`}>
      <p className="hk-b">{hl("Churn rose 4 points in EMEA", lvl !== "Low")} after the May price change. {hl(lvl === "High" ? "Most of the loss came from teams under ten seats" : "Most of the loss probably came from teams under ten seats", lvl === "High")}, {lvl === "High" ? "confirmed by three sources." : lvl === "Low" ? "a guess based on two accounts." : "based on a partial export."}</p>
      {o.style === "Legend" ? (
        <div className="hk-row flex-wrap gap-x-[14px] gap-y-[4px] hk-s"><span className="hk-row gap-[6px]"><i className="size-[8px] rounded-full bg-[var(--k-ok)]" />Found in a source</span><span className="hk-row gap-[6px]"><i className="size-[8px] rounded-full bg-[var(--k-warn)]" />Not sure · check it</span></div>
      ) : (
        <div className="hk-well p-[12px] hk-row !items-start gap-[10px]"><CircleAlert size={16} className="hk-warnc mt-[2px]" /><span className="hk-col"><span className="hk-t !text-[13px]">{lvl === "High" ? "High confidence" : lvl === "Low" ? "Low confidence" : "Medium confidence"}</span><span className="hk-s">{lvl === "High" ? "The export, the CRM and the pricing memo agree." : lvl === "Low" ? "Based on two EMEA accounts only. Treat it as a hunch." : "Only 60% of EMEA accounts were in the export. Upload the full file to be sure."}</span></span></div>
      )}
      {o.check && <div className="hk-row gap-[8px]"><Btn size="sm" icon={<Check size={13} />}>Double-check</Btn></div>}
    </div>
  );
}

/* Activity log — ChatGPT agent activity, Devin / Manus session timeline, Copilot
   audit, Zapier task history: everything done, in order, with a recap. */
// phone: each row keeps the action as its main line, with when and where under it.
function ActivityLog({ o }: { o: Props }) {
  const v = o.state as string, m = o.device === "mobile";
  const every: [string, string, string][] = [["2 min ago", "Sent email to Sam Ruiz", "Gmail"], ["8 min ago", "Read 3 CRM records", "Salesforce"], ["14 min ago", "Created issue ENG-412", "Linear"], ["22 min ago", "Read the Q3 churn report", "Drive"], ["31 min ago", "Posted in #pricing", "Slack"]];
  const rows = v === "Full log" ? every : v === "Filtered" ? every.filter((r) => ["Gmail", "Linear", "Slack"].includes(r[2])) : every.slice(0, 3);
  return (
    <div className={`hk-panel ${W(o, "w-[520px]")} ${m ? "p-[14px]" : "p-[16px]"} hk-col gap-[10px]`}>
      {v === "Recap" && <div className="hk-well p-[12px] hk-col gap-[2px]"><span className="hk-xs">Session recap</span><span className="text-[13.5px] leading-[20px]">Atlas sent 1 email, created 1 issue and read 3 records.</span></div>}
      {v !== "Recap" && <div className="hk-row gap-[6px]">{["All", "Changes", "Reads"].map((t, i) => <Chip key={t} kind="filter" selected={i === (v === "Filtered" ? 1 : 0)}>{t}</Chip>)}</div>}
      <div className="hk-col">
        {rows.map(([w, t, app]) => (
          m ? (
            <Pressable key={t} label={t} className="hk-row gap-[12px] min-h-[52px] py-[8px] border-t border-[var(--k-edge)]">
              <span className="hk-col hk-grow"><span className="hk-b">{t}</span><span className="hk-s">{w} · {app}</span></span><ChevronRight size={14} className="hk-faint" />
            </Pressable>
          ) : (
          <Pressable key={t} label={t} className="hk-row gap-[12px] py-[9px] border-t border-[var(--k-edge)]">
            <span className="hk-s w-[76px]">{w}</span><span className="hk-b hk-grow">{t}</span><Tag>{app}</Tag><ChevronRight size={14} className="hk-faint" />
          </Pressable>
          )
        ))}
      </div>
    </div>
  );
}

/* Tool call — Claude / ChatGPT tool chips that expand to input and output, Cursor tool
   rows, Vercel AI Elements <Tool>, MCP inspector. */
function ToolCall({ o }: { o: Props }) {
  const st = o.state as string;
  return (
    <div className={`${W(o, "w-[520px]")} hk-col gap-[8px]`}>
      <div className="hk-panel overflow-hidden">
        <Pressable label="Show input and output" className="hk-row gap-[10px] px-[14px] h-[48px]">
          {st === "Done" ? <span className="hk-step hk-step--done"><Check size={12} strokeWidth={3} /></span> : st === "Failed" ? <span className="hk-step !border-0 !bg-[var(--k-bad)]"><CircleAlert size={12} strokeWidth={3} /></span> : <Spin />}
          <Wrench size={14} className="hk-faint" /><span className="hk-mono hk-grow hk-trunc">linear.create_issue</span>
          <span className="hk-s">{st === "Running" ? "Running" : st === "Failed" ? "Failed · 401" : "1.2 s"}</span><ChevronDown size={15} className={`hk-faint ${o.open ? "rotate-180" : ""}`} />
        </Pressable>
        {o.open && (
          <div className="px-[14px] pb-[14px] hk-col gap-[8px]">
            <span className="hk-xs">Input</span>
            <div className="hk-code">{"{"}{"\n"}  <b>&quot;title&quot;</b>: <i>&quot;Fix login token refresh&quot;</i>,{"\n"}  <b>&quot;team&quot;</b>: <i>&quot;Platform&quot;</i>{"\n"}{"}"}</div>
            <span className="hk-xs">Output</span>
            {st === "Failed" ? <span className="hk-s hk-badc">The Linear token expired. Reconnect Linear to retry.</span> : <span className="hk-s">Created <TextLink>ENG-412</TextLink></span>}
          </div>
        )}
      </div>
      <div className="hk-panel !shadow-none hk-row gap-[10px] px-[14px] h-[44px]"><Spin s={15} /><Wrench size={14} className="hk-faint" /><span className="hk-mono hk-grow hk-trunc">slack.post_message</span><span className="hk-s">Waiting</span></div>
    </div>
  );
}

/* Rationale — HAX 1.0 Inline Rationale, Copilot "why this suggestion", LinkedIn / Gmail
   "why am I seeing this": a verdict with its reason beside the result. */
function Rationale({ o }: { o: Props }) {
  const v = o.state as string;
  const tag: [("warn" | "ok" | "bad" | "neutral"), string] = v === "Approved" ? ["ok", "Approved"] : v === "Caution" ? ["warn", "Check first"] : v === "Blocked" ? ["bad", "Blocked"] : v === "For your info" ? ["neutral", "For your info"] : ["warn", "Flagged"];
  const why = v === "Approved" ? ["Why Atlas approved it", "The amount matches the purchase order, and the bank details have not changed."] : v === "Caution" ? ["Why Atlas wants a check", "Allowed once you confirm the new bank details with Acme by phone."] : v === "Blocked" ? ["Why Atlas blocked it", "Rule broken: payments over $4,000 to a new bank account need two approvers."] : v === "For your info" ? ["Why you are seeing this", "Nothing to do. Acme invoices are paid on the 12th of each month."] : ["Why Atlas flagged it", "The amount is 3× Acme's usual invoice, and the bank details changed last week."];
  const m = o.device === "mobile";
  return (
    <div className={`hk-panel ${W(o, "w-[500px]")} ${m ? "p-[14px]" : "p-[16px]"} hk-col gap-[12px]`}>
      <div className="hk-row flex-wrap justify-between gap-y-[6px]"><span className="hk-col"><span className="hk-t">Invoice INV-2041 · Acme</span><span className="hk-s">$4,800 · due 12 Sep</span></span><Tag tone={tag[0]}>{tag[1]}</Tag></div>
      <div className="hk-well p-[12px] hk-row !items-start gap-[10px]">
        <Info size={16} className="hk-blue mt-[2px]" />
        <span className="hk-col gap-[4px]"><span className="hk-t !text-[13px]">{why[0]}</span>
          <span className="text-[13px] leading-[19px] hk-mute">{why[1]}</span>
          {o.factors && <span className="hk-row flex-wrap gap-[6px] pt-[2px]"><Tag>Amount +210%</Tag><Tag>New bank account</Tag></span>}
        </span>
      </div>
      {o.actions && (v === "Flagged" || v === "Caution") && (m
        ? <div className="hk-col gap-[6px] [&>*]:w-full"><Btn kind="main">Hold payment</Btn><Btn kind="ghost">Not a problem</Btn></div>
        : <div className="hk-row justify-end gap-[8px]"><Btn kind="ghost">Not a problem</Btn><Btn kind="main">Hold payment</Btn></div>)}
    </div>
  );
}

/* Usage meter — Claude Code /context + plan limits, Cursor usage, ChatGPT "limit
   reached, resets at", Codex usage panel. */
function UsageMeter({ o }: { o: Props }) {
  const near = o.state === "Near limit";
  const full = o.state === "At the limit";
  const m = o.device === "mobile";
  return (
    <div className={`hk-pop ${W(o, "w-[340px]")} !p-[14px] hk-col gap-[12px]`}>
      <div className="hk-col gap-[6px]"><div className="hk-row justify-between"><span className="hk-t !text-[13px]">Context window</span><span className="hk-s">568k / 1M</span></div><Progress value={57} label="Context window" /></div>
      <Rule />
      <div className="hk-col gap-[6px]"><div className="hk-row justify-between"><span className="hk-t !text-[13px]">5-hour limit</span><span className={`hk-s ${near ? "hk-warnc font-semibold" : full ? "hk-badc font-semibold" : ""}`}>{full ? "100% used" : near ? "92% used" : "38% used"}</span></div><Progress value={full ? 100 : near ? 92 : 38} tone={full ? "bad" : near ? "warn" : undefined} label="5-hour limit" /><span className="hk-s">{full ? "Limit reached. Resets in 4 h 25 min" : "Resets in 4 h 25 min"}</span></div>
      {o.weekly && <div className="hk-col gap-[6px]"><div className="hk-row justify-between"><span className="hk-t !text-[13px]">This week</span><span className="hk-s">21% used</span></div><Progress value={21} label="This week" /></div>}
      {(near || full) && <div className={m ? "hk-col gap-[8px] [&>*:last-child]:w-full" : "hk-row justify-between"}><span className="hk-s">{full ? "Atlas stopped. Keep going on Atlas 3 Fast" : "Keep going on Atlas 3 Fast"}</span><Btn size="sm">Switch</Btn></div>}
    </div>
  );
}

/* Agent agreement — Google AI co-scientist (ideas ranked after debate), Claude Research
   sub-agents, Perplexity, Grok Heavy: several agents take the same question; the card leads
   with the adopted answer, says how many agree, and lists each agent's pick and reason. */
function AgentAgreement({ o }: { o: Props }) {
  const split = o.state !== "Agreed";
  const waiting = o.state === "Waiting on a person";
  const picks: [string, string, string, boolean][] = [
    ["Pricing agent", "Contoso", "Lowest cost over three years", true],
    ["Risk agent", "Contoso", "Best uptime of the three, 99.5%", true],
    ["Legal agent", split ? "Fabrikam" : "Contoso", split ? "The only one that keeps data in the EU" : "Standard contract terms", !split],
  ];
  const m = o.device === "mobile";
  return (
    <div className={`hk-panel ${W(o, "w-[520px]")} ${m ? "p-[14px]" : "p-[16px]"} hk-col gap-[10px]`}>
      <div className={m ? "hk-col !items-start gap-[8px]" : "hk-row justify-between !items-start"}>
        <span className="hk-col gap-[2px]"><span className="hk-xs">Vendor choice · 3 agents</span><span className="hk-h">{waiting ? "Pick a vendor" : "Go with Contoso"}</span></span>
        <Tag tone={split ? "warn" : "ok"}>{waiting ? "Waiting on you" : split ? "2 of 3 agree" : "All 3 agree"}</Tag>
      </div>
      <div className="hk-col">
        {picks.map(([n, pick, why, agrees]) => (
          <div key={n} className="hk-row !items-start gap-[10px] py-[8px] border-t border-[var(--k-edge)]">
            <Ag size="sm" icon={Bot} />
            <span className="hk-col hk-grow"><span className="hk-t">{n}</span>{o.reasons && <span className="hk-s">{why}</span>}</span>
            <span className={`hk-row !gap-[6px] text-[13.5px] font-medium whitespace-nowrap ${agrees ? "" : "hk-warnc"}`}>
              {agrees ? <Check size={14} strokeWidth={2.5} className="hk-okc" /> : <CircleAlert size={14} />}{pick}
            </span>
          </div>
        ))}
      </div>
      {split && o.dissent && <div className="hk-well px-[12px] py-[8px] hk-row gap-[8px] hk-s"><CircleAlert size={14} className="hk-warnc shrink-0" />Legal disagrees: Contoso stores data in the US. Check this before you sign.</div>}
      {waiting && (m
        ? <div className="hk-col gap-[6px] [&>*]:w-full"><Btn kind="main">Approve Contoso</Btn><Btn kind="ghost">See how they decided</Btn></div>
        : <div className="hk-row justify-end gap-[8px]"><Btn kind="ghost">See how they decided</Btn><Btn kind="main">Approve Contoso</Btn></div>)}
    </div>
  );
}

/* Disagreement — what each agent could see, what it assumed and what it concluded, side by
   side, so a person can find the one assumption they differ on and settle it (incident.io and
   PagerDuty incident reviews, Google AI co-scientist debates, Cursor background agents). */
// phone: the three-column grid is too tight, so each line (Could see, Assumed, Concluded) lists what
// each agent said, one under the other, with the difference still marked; the answers share the width.
function Disagreement({ o }: { o: Props }) {
  const m = o.device === "mobile";
  const settled = o.state === "Settled";
  const same = o.state === "Same inputs";
  const rows: [string, string, string, boolean?][] = [
    ["Could see", same ? "Error logs and the deploy history" : "Error logs since 09:00", "Error logs and the deploy history"],
    ["Assumed", "The outage began at 09:40", "The outage began at 09:12", true],
    ["Concluded", "Not caused by a deploy", "Caused by the 09:05 deploy"],
  ];
  const cell = "text-[13.5px] leading-[19px] px-[12px] py-[10px] border-t border-[var(--k-edge)]";
  return (
    <div className={`hk-panel ${W(o, "w-[540px]")} overflow-hidden`}>
      <div className={m ? "hk-col px-[14px] py-[12px]" : "hk-row justify-between px-[16px] h-[46px]"}><span className="hk-t">Why the agents disagree</span><span className="hk-s">Checkout outage · INC-2207</span></div>
      {m ? (
        <div className="hk-col">
          {rows.map(([l, a, b, diff]) => (
            <div key={l} className="hk-col gap-[6px] px-[14px] py-[10px] border-t border-[var(--k-edge)]">
              <span className="hk-xs">{l}</span>
              {([["Triage agent", a], ["Release agent", b]] as const).map(([who, v]) => (
                <span key={who} className={`hk-row !items-start gap-[8px] rounded-[8px] ${diff && o.highlight && !settled ? "bg-[var(--k-warn-bg)] px-[8px] py-[6px] -mx-[8px]" : ""}`}>
                  <Ag size="sm" icon={Bot} /><span className="hk-col"><span className="hk-s">{who}</span><span className={`text-[13.5px] leading-[19px] ${diff && o.highlight && !settled ? "font-medium" : ""}`}>{v}</span></span>
                </span>
              ))}
            </div>
          ))}
        </div>
      ) : (
      <div className="grid grid-cols-[96px_1fr_1fr]">
        <span className="border-t border-[var(--k-edge)]" />
        {["Triage agent", "Release agent"].map((a) => <span key={a} className="hk-row gap-[8px] px-[12px] py-[8px] border-t border-[var(--k-edge)]"><Ag size="sm" icon={Bot} /><span className="hk-t !text-[13px]">{a}</span></span>)}
        {rows.map(([l, a, b, diff]) => (
          <Fragment key={l}>
            <span className={`${cell} hk-s !pl-[16px]`}>{l}</span>
            {[a, b].map((v, i) => <span key={i} className={`${cell} ${diff && o.highlight && !settled ? "bg-[var(--k-warn-bg)] font-medium" : ""}`}>{v}</span>)}
          </Fragment>
        ))}
      </div>
      )}
      <div className={`${m ? "hk-col !items-stretch gap-[10px] px-[14px]" : "hk-row justify-between gap-[12px] px-[16px]"} py-[12px] border-t border-[var(--k-edge)] bg-[var(--k-soft)]`}>
        {settled ? <span className="hk-s">Settled: the outage began at 09:12. Both agents are running again.</span> : <>
          <span className="hk-s">{same ? "They saw the same data and still differ. It is a judgement call." : "They differ on one thing: when it began."}</span>
          <span className={`hk-row gap-[8px] ${m ? "[&>*]:flex-1" : ""}`}><Btn size="sm">09:40</Btn><Btn size="sm" kind="main">09:12 is right</Btn></span></>}
      </div>
    </div>
  );
}

/* Decision trail — a decision traced back to what it rests on: the person who signed off, the
   agents' findings and the record under them, each with its owner and time (Git history,
   Linear issue history, dbt and Datadog lineage, Notion page history). */
function DecisionTrail({ o }: { o: Props }) {
  const steps: [ReactNode, string, string, string][] = [
    [<Me key="m" i="MR" />, "Maya approved holding the payment", "Finance · owns this decision", "10:42"],
    [<Ag key="r" size="sm" />, "Risk agent flagged the invoice", "The amount is 3× Acme's usual", "10:31"],
    [<Ag key="b" size="sm" icon={Bot} />, "Bank agent spotted new bank details", "Changed last Tuesday", "10:30"],
  ];
  if (o.depth === "Decided") steps.splice(1);
  const m = o.device === "mobile";
  if (o.depth === "Full trail") steps.push([<span key="s" className="hk-app !size-[28px]"><FileText size={14} /></span>, "Acme vendor record", "ERP · last edited by Jon on 2 Sep", "2 Sep"]);
  return (
    <div className={`hk-panel ${W(o, "w-[500px]")} ${m ? "p-[14px]" : "p-[16px]"} hk-col gap-[12px]`}>
      <div className="hk-row justify-between !items-start gap-[8px]">
        <span className="hk-col gap-[2px]"><span className="hk-xs">Decision</span><span className="hk-h">Hold payment on INV-2041</span></span>
        <Tag tone="ok">Decided</Tag>
      </div>
      <div className="hk-col">
        {steps.map(([who, t, s, at], i) => (
          <div key={t} className="hk-row !items-stretch gap-[12px]">
            <span className="hk-col items-center shrink-0 w-[28px]"><span className="grid place-items-center size-[28px]">{who}</span>{i < steps.length - 1 && <i className="block w-[2px] flex-1 my-[4px] rounded-full bg-[var(--k-edge)]" />}</span>
            <span className="hk-col hk-grow pt-[4px] pb-[14px]"><span className="text-[13.5px] leading-[19px] font-medium">{t}</span>{o.owners && <span className="hk-s">{s}</span>}</span>
            <span className="hk-s whitespace-nowrap pt-[5px]">{at}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export const EXPLORERS: Record<string, Entry> = {
  reasoning: { C: Reasoning, opts: [sel("state", "State", ["Open", "Thinking", "Folded"]), tog("steps", "Step titles")], refs: ["Claude thinking", "ChatGPT reasoning summary", "Gemini show thinking"], states: ["Thinking", "Folded", "Open"].map((n) => stt(n, { state: n })) },
  sources: { C: Sources, opts: [sel("layout", "Source list", ["Cards on top", "List below", "Inline only"]), sel("state", "State", ["Cited", "Hover", "Unsupported"])], refs: ["Perplexity", "ChatGPT search", "Claude citations", "Microsoft Copilot"], states: ["Cited", "Hover", "Unsupported"].map((n) => stt(n, { state: n })) },
  confidence: { C: Confidence, opts: [sel("style", "Explain with", ["Legend", "Note"]), tog("check", "Double-check"), sel("state", "State", ["Medium", "High", "Low"])], refs: ["Gemini double-check", "Elicit", "Consensus"], states: ["High", "Medium", "Low"].map((n) => stt(n, { state: n })) },
  "activity-log": { C: ActivityLog, opts: [sel("state", "State", ["Recap", "Full log", "Filtered"])], refs: ["ChatGPT agent", "Devin", "Manus", "Zapier task history"], states: ["Recap", "Full log", "Filtered"].map((n) => stt(n, { state: n })) },
  "tool-call": { C: ToolCall, opts: [sel("state", "State", ["Done", "Running", "Failed"]), tog("open", "Expanded")], refs: ["Claude tool use", "Cursor", "Vercel AI Elements", "MCP Inspector"], states: ["Running", "Done", "Failed"].map((n) => stt(n, { state: n })) },
  rationale: { C: Rationale, opts: [tog("factors", "Factors"), tog("actions", "Actions"), sel("state", "State", ["Flagged", "Approved", "Caution", "Blocked", "For your info"])], refs: ["HAX 1.0 Inline Rationale", "GitHub Copilot", "Gmail why this"], states: ["Approved", "Caution", "Blocked", "For your info"].map((n) => stt(n, { state: n })) },
  "agent-agreement": { C: AgentAgreement, opts: [sel("state", "State", ["Split", "Agreed", "Waiting on a person"]), tog("reasons", "Reasons"), tog("dissent", "Dissent note")], refs: ["Google AI co-scientist", "Claude Research", "Perplexity", "Grok Heavy"], states: [stt("Agreed", { state: "Agreed" }), stt("Split", { state: "Split" }), stt("Waiting on a person", { state: "Waiting on a person" })] },
  "agent-disagreement": { C: Disagreement, opts: [tog("highlight", "Mark the difference"), sel("state", "State", ["Differ", "Settled", "Same inputs"])], refs: ["incident.io", "PagerDuty incident review", "Google AI co-scientist", "Cursor background agents"], states: ["Differ", "Settled", "Same inputs"].map((n) => stt(n, { state: n })) },
  "decision-trail": { C: DecisionTrail, opts: [sel("depth", "Show", ["Full trail", "Direct inputs", "Decided"]), tog("owners", "Owners and details")], refs: ["Git history", "Linear issue history", "dbt lineage", "Notion page history"], states: [stt("Decided", { depth: "Decided" }), stt("Direct inputs", { depth: "Direct inputs" }), stt("Full trail", { depth: "Full trail" })] },
  "usage-meter": { C: UsageMeter, opts: [sel("state", "State", ["Normal", "Near limit", "At the limit"]), tog("weekly", "Weekly limit")], refs: ["Claude Code /context", "Cursor usage", "Codex usage", "ChatGPT limits"], states: [stt("Plenty", { state: "Normal" }), stt("Filling up", { state: "Near limit" }), stt("At the limit", { state: "At the limit" })] },
};
