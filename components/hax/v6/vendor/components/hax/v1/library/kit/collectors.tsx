import { Bot, Check, ChevronDown, ChevronLeft, ChevronRight, Copy, RefreshCw, Share2, ThumbsDown, ThumbsUp, X } from "@/components/hax/v6/vendor/components/hax/v1/library/kit/icons";
import { AgentHead, Send, sel, st, tog, type Entry, type Props } from "@/components/hax/v6/vendor/components/hax/v1/library/kit/ui";
import { Btn, Chip, Field, IconBtn, Kbd, Pressable, Tag } from "@/components/hax/v6/vendor/components/hax/v1/library/kit/parts";

/* Clarifying question — ChatGPT Deep Research asks before it starts, Claude Research
   clarifies scope, Codex asks in plan mode, Cursor's "questions" card. */
function ClarifyingQuestion({ o }: { o: Props }) {
  const multi = o.questions === "Several";
  return (
    <div className="w-[520px] hk-col gap-[12px]">
      <span className="hk-bubble">Research our competitors&apos; pricing</span>
      <AgentHead note="needs one thing first" />
      {o.state === "Answered" || o.state === "Skipped" ? (
        <div className="hk-panel px-[16px] py-[12px] hk-row gap-[10px]"><Check size={15} strokeWidth={2.5} className="hk-okc" /><span className="hk-b hk-grow">{o.state === "Answered" ? "You chose EMEA. Atlas is starting the research." : "Skipped. Atlas will assume all regions and say so in the report."}</span></div>
      ) : (
      <div className="hk-panel p-[16px] hk-col gap-[10px]">
        <div className="hk-row justify-between"><span className="hk-t">Which region should the report cover?</span>{multi && <span className="hk-row gap-[4px] hk-s"><ChevronLeft size={14} />1 of 3<ChevronRight size={14} /></span>}</div>
        <div className="hk-col gap-[4px]">
          {["North America", "EMEA", "All regions"].map((t, i) => (
            <Pressable key={t} selected={i === 1} className="hk-opt !min-h-[36px] !py-[6px]"><Kbd>{i + 1}</Kbd><span className="hk-grow">{t}</span>{i === 1 && <Check size={15} strokeWidth={2.5} className="hk-blue" />}</Pressable>
          ))}
          {/* own answer = the last option, a row you type into (Claude Code, Cursor, Codex) */}
          {o.other && <Pressable className="hk-opt !min-h-[36px] !py-[6px]"><Kbd>4</Kbd><span className="hk-grow hk-faint">Type your own answer…</span></Pressable>}
        </div>
        <div className="hk-row justify-end gap-[6px]">{o.skip && <Btn kind="ghost" size="sm">Skip, use my best guess</Btn>}<Btn kind="main" size="sm">{multi ? "Next" : "Start research"}</Btn></div>
      </div>
      )}
    </div>
  );
}

/* Choice picker — Claude "pick a direction", Gemini drafts, ChatGPT image options,
   Copilot plan choices: a few rich options, the agent waits. */
function ChoicePicker({ o }: { o: Props }) {
  const cards = o.layout === "Cards";
  const choosing = o.state === "Choosing";
  const gone = o.state === "Gone";
  const opts: [string, string, string][] = [["Quick fix", "Patch the retry loop", "~10 min · 1 file"], ["Proper fix", "Move retries into the client, across 6 files", "~45 min"], ["Investigate", "Trace why the test is flaky first", "~20 min · read only"]];
  return (
    <div className="w-[540px] hk-col gap-[12px]">
      <AgentHead note="Pick one and I'll start" />
      <div className={cards ? "grid grid-cols-3 gap-[8px]" : "hk-col gap-[6px]"}>
        {opts.map(([t, d, m], i) => (
          <Pressable key={t} selected={!choosing && i === 1} label={gone && i === 2 ? `${t}, not available` : undefined} className={`hk-panel !shadow-none p-[14px] hk-col gap-[4px] ${!choosing && i === 1 ? "hk-opt--on !border-[var(--k-blue)]" : ""} ${gone && i === 2 ? "opacity-50 pointer-events-none" : ""} ${cards ? "h-[128px]" : ""}`}>
            <span className="hk-t">{t}</span>
            <span className="hk-s hk-grow">{d}</span><span className="hk-s font-medium whitespace-nowrap">{gone && i === 2 ? "No longer available" : m}{o.recommend && i === 1 && <span className="hk-blue"> · Recommended</span>}</span>
          </Pressable>
        ))}
      </div>
      <div className="hk-row justify-end gap-[8px]"><Btn kind="ghost">Something else</Btn><Btn kind="main" disabled={choosing}>{choosing ? "Choose one" : "Go with Proper fix"}</Btn></div>
    </div>
  );
}

/* Form request — Copilot Studio adaptive cards, Slack AI workflow forms, OpenAI
   ChatKit widgets: the agent asks for the details it is missing in one short form. */
function FormRequest({ o }: { o: Props }) {
  const v = o.state as string;
  const empty = v === "Empty";
  const partly = v === "Partly filled";
  if (v === "Sent")
    return (
      <div className="w-[480px] hk-col gap-[12px]">
        <AgentHead note="booking the trip" />
        <div className="hk-panel px-[16px] py-[12px] hk-row gap-[10px]"><Check size={15} strokeWidth={2.5} className="hk-okc" /><span className="hk-b hk-grow">Sent: Mon 3 Nov to Fri 7 Nov, $220 a night</span></div>
      </div>
    );
  return (
    <div className="w-[480px] hk-col gap-[12px]">
      <AgentHead note="needs 3 details to book the trip" />
      <div className="hk-panel p-[18px] hk-col gap-[12px]">
        <div className="grid grid-cols-2 gap-[10px]">
          <label className="hk-col gap-[4px]"><span className="hk-s font-medium text-[color:var(--text-primary)]">Leaving</span><Field value={empty ? undefined : "Mon 3 Nov"} placeholder="Pick a date" trailing={<ChevronDown size={14} className="hk-faint" />} /></label>
          <label className="hk-col gap-[4px]"><span className="hk-s font-medium text-[color:var(--text-primary)]">Returning</span><Field value={empty || partly ? undefined : o.error ? "Sun 2 Nov" : "Fri 7 Nov"} placeholder="Pick a date" invalid={!!o.error} focus={!o.error && !empty && !partly} trailing={<ChevronDown size={14} className="hk-faint" />} /></label>
        </div>
        {o.error && <span className="hk-s hk-badc -mt-[6px]">Return is before the departure date</span>}
        <label className="hk-col gap-[4px]"><span className="hk-s font-medium text-[color:var(--text-primary)]">Budget per night</span><Field value={empty ? undefined : "$220"} placeholder="$ per night" /></label>
        {o.prefill && <span className="hk-s">Dates come from your calendar invite. Change anything that&apos;s wrong.</span>}
        <div className="hk-row justify-end gap-[8px]"><Btn kind="ghost">Cancel</Btn><Btn kind="main" disabled={empty || partly}>Send to Atlas</Btn></div>
      </div>
    </div>
  );
}

/* Feedback — ChatGPT / Claude / Gemini thumbs with a reason sheet; Copilot reasons list. */
function Feedback({ o }: { o: Props }) {
  const sv = o.state as string;
  return (
    <div className="w-[520px] hk-col gap-[10px] relative">
      <p className="hk-b">Churn rose 4 points in EMEA after the May price change, mostly in teams under ten seats.</p>
      <div className="hk-row !gap-[2px] -ml-[6px]">
        <IconBtn size="sm" label="Copy" icon={<Copy size={15} />} />
        <IconBtn size="sm" label="Good answer" icon={<ThumbsUp size={15} />} />
        <IconBtn size="sm" kind={sv !== "Idle" ? "on" : "ghost"} label="Bad answer" icon={<ThumbsDown size={15} fill={sv !== "Idle" ? "currentColor" : "none"} />} />
        <IconBtn size="sm" label="Try again" icon={<RefreshCw size={15} />} /><IconBtn size="sm" label="Share" icon={<Share2 size={15} />} />
        {sv === "Sent" && <span className="hk-s ml-[8px]">Thanks. This helps Atlas get better.</span>}
      </div>
      {sv === "Reason" && (
        <div className="hk-panel p-[14px] hk-col gap-[10px]">
          <div className="hk-row justify-between"><span className="hk-t">What went wrong?</span><IconBtn size="xs" label="Close" icon={<X size={16} />} /></div>
          <div className="hk-row flex-wrap gap-[6px]">{["Not accurate", "Missed the question", "Too long", "Out of date", "Unsafe"].map((t, i) => <Chip key={t} kind="filter" selected={i === 0}>{t}</Chip>)}</div>
          {o.comment && <Field placeholder="Tell us more (optional)" />}
          <div className="hk-row justify-between"><span className="hk-s">The conversation is shared with the team that trains Atlas.</span><Send /></div>
        </div>
      )}
    </div>
  );
}

/* Team decision — a call a team makes together: the agents lay out the options with what each
   costs, people weigh in, and the owner decides (Slack and Teams polls, Microsoft Loop, Notion
   decision logs, FigJam voting). */
function TeamDecision({ o }: { o: Props }) {
  const done = o.state === "Decided";
  const reopened = o.state === "Reopened";
  const options: [string, string, string, string[]][] = [
    ["Keep $12 a seat", "least churn risk, revenue flat", "Pricing agent", ["MR", "JK", "AL"]],
    ["Raise to $14", "revenue up 9%, churn up about 2 points", "Revenue agent", ["SR"]],
  ];
  return (
    <div className="hk-panel w-[520px] p-[16px] hk-col gap-[12px]">
      <div className="hk-row justify-between !items-start">
        <span className="hk-col gap-[2px]"><span className="hk-xs">#pricing · owner Maya Ruiz</span><span className="hk-h">Which price ships in March?</span></span>
        <span className="hk-s whitespace-nowrap">{done ? "Decided today" : reopened ? "Reopened · due Friday" : "Due Friday"}</span>
      </div>
      <div className="hk-col gap-[8px]">
        {options.map(([t, d, by, votes], i) => (
          <Pressable key={t} selected={done && i === 0} className={`hk-opt ${done && i === 0 ? "hk-opt--on" : ""}`}>
            <span className="hk-col hk-grow gap-[2px]"><span className="hk-t">{t}</span>{o.notes && <span className="hk-s hk-row !gap-[6px]"><Bot size={13} />{by}: {d}</span>}</span>
            {o.votes && <span className="hk-row !gap-0">{votes.map((v, k) => <span key={v} className="hk-me !size-[24px] !text-[10px] !tracking-normal ring-2 ring-[var(--k-panel)]" style={{ marginLeft: k ? -3 : 0 }}>{v}</span>)}</span>}
            {done && i === 0 && <Check size={16} strokeWidth={2.5} className="hk-blue" />}{reopened && i === 0 && <Tag>Earlier choice</Tag>}
          </Pressable>
        ))}
      </div>
      <div className="hk-row justify-between">
        <span className="hk-s">{done ? "Maya chose Keep $12 a seat" : reopened ? "Maya reopened this. 0 of 5 have weighed in again." : "4 of 5 people weighed in"}</span>
        {done ? <Btn size="sm">Reopen</Btn> : <span className="hk-row gap-[8px]"><Btn size="sm" kind="ghost">Ask the agents</Btn><Btn size="sm" kind="main">Decide</Btn></span>}
      </div>
    </div>
  );
}

export const COLLECTORS: Record<string, Entry> = {
  "clarifying-question": { C: ClarifyingQuestion, opts: [sel("questions", "Questions", ["One", "Several"]), tog("other", "Own answer"), tog("skip", "Skip"), sel("state", "State", ["Asking", "Answered", "Skipped"])], refs: ["ChatGPT Deep Research", "Claude Research", "Codex plan mode", "Cursor"], states: ["Asking", "Answered", "Skipped"].map((n) => st(n, { state: n })) },
  "choice-picker": { C: ChoicePicker, opts: [sel("layout", "Layout", ["Cards", "List"]), tog("recommend", "Recommended"), sel("state", "State", ["Picked", "Choosing", "Gone"])], refs: ["Claude", "Gemini drafts", "GitHub Copilot agent"], states: [st("Choosing", { state: "Choosing" }), st("Picked", { state: "Picked" }), st("Gone", { state: "Gone" })] },
  "form-request": { C: FormRequest, opts: [tog("prefill", "Pre-filled note"), tog("error", "Error", false), sel("state", "State", ["Ready", "Empty", "Partly filled", "Sent"])], refs: ["Copilot Studio adaptive cards", "OpenAI ChatKit widgets", "Slack AI workflows"], states: ["Empty", "Partly filled", "Sent"].map((n) => st(n, { state: n })) },
  "team-decision": { C: TeamDecision, opts: [sel("state", "State", ["Open", "Decided", "Reopened"]), tog("notes", "Agent notes"), tog("votes", "Votes")], refs: ["Slack polls", "Microsoft Loop", "Notion decision log", "FigJam voting"], states: ["Open", "Decided", "Reopened"].map((n) => st(n, { state: n })) },
  feedback: { C: Feedback, opts: [sel("state", "State", ["Reason", "Idle", "Sent"]), tog("comment", "Comment box")], refs: ["ChatGPT", "Claude", "Gemini", "Microsoft Copilot"], states: [st("Idle", { state: "Idle" }), st("Rated", { state: "Sent" }), st("Asking why", { state: "Reason" })] },
};
