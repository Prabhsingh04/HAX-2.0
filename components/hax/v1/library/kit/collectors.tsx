import { Check, ChevronDown, ChevronLeft, ChevronRight, Copy, RefreshCw, Share2, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { AgentHead, Send, sel, tog, type Entry, type Props } from "./ui";

/* Clarifying question — ChatGPT Deep Research asks before it starts, Claude Research
   clarifies scope, Codex asks in plan mode, Cursor's "questions" card. */
function ClarifyingQuestion({ o }: { o: Props }) {
  const multi = o.questions === "Several";
  return (
    <div className="w-[520px] hk-col gap-[12px]">
      <span className="hk-bubble">Research our competitors&apos; pricing</span>
      <AgentHead note="needs one thing first" />
      <div className="hk-panel !rounded-[18px] p-[16px] hk-col gap-[10px]">
        <div className="hk-row justify-between"><span className="hk-t">Which region should the report cover?</span>{multi && <span className="hk-row gap-[4px] hk-s"><ChevronLeft size={14} />1 of 3<ChevronRight size={14} /></span>}</div>
        <div className="hk-col gap-[4px]">
          {["North America", "EMEA", "All regions"].map((t, i) => (
            <div key={t} className={`hk-opt !min-h-[36px] !py-[6px] ${i === 1 ? "hk-opt--on" : ""}`}><span className="hk-kbd">{i + 1}</span><span className="hk-grow">{t}</span>{i === 1 && <Check size={15} strokeWidth={2.5} className="hk-blue" />}</div>
          ))}
          {/* own answer = the last option, a row you type into (Claude Code, Cursor, Codex) */}
          {o.other && <div className="hk-opt !min-h-[36px] !py-[6px]"><span className="hk-kbd">4</span><span className="hk-grow hk-faint">Type your own answer…</span></div>}
        </div>
        <div className="hk-row justify-end gap-[6px]">{o.skip && <span className="hk-btn hk-btn--ghost hk-btn--sm">Skip, use my best guess</span>}<span className="hk-btn hk-btn--main hk-btn--sm">{multi ? "Next" : "Start research"}</span></div>
      </div>
    </div>
  );
}

/* Choice picker — Claude "pick a direction", Gemini drafts, ChatGPT image options,
   Copilot plan choices: a few rich options, the agent waits. */
function ChoicePicker({ o }: { o: Props }) {
  const cards = o.layout === "Cards";
  const opts: [string, string, string][] = [["Quick fix", "Patch the retry loop", "~10 min · 1 file"], ["Proper fix", "Move retries into the client, across 6 files", "~45 min"], ["Investigate", "Trace why the test is flaky first", "~20 min · read only"]];
  return (
    <div className="w-[540px] hk-col gap-[12px]">
      <AgentHead note="Pick one and I'll start" />
      <div className={cards ? "grid grid-cols-3 gap-[8px]" : "hk-col gap-[6px]"}>
        {opts.map(([t, d, m], i) => (
          <div key={t} className={`hk-panel !shadow-none !rounded-[14px] p-[14px] hk-col gap-[4px] ${i === 1 ? "hk-opt--on !border-[var(--k-blue)]" : ""} ${cards ? "h-[128px]" : ""}`}>
            <span className="hk-t">{t}</span>
            <span className="hk-s hk-grow">{d}</span><span className="hk-s font-medium whitespace-nowrap">{m}{o.recommend && i === 1 && <span className="hk-blue"> · Recommended</span>}</span>
          </div>
        ))}
      </div>
      <div className="hk-row justify-end gap-[8px]"><span className="hk-btn hk-btn--ghost">Something else</span><span className="hk-btn hk-btn--main">Go with Proper fix</span></div>
    </div>
  );
}

/* Form request — Copilot Studio adaptive cards, Slack AI workflow forms, OpenAI
   ChatKit widgets: the agent asks for the details it is missing in one short form. */
function FormRequest({ o }: { o: Props }) {
  return (
    <div className="w-[480px] hk-col gap-[12px]">
      <AgentHead note="needs 3 details to book the trip" />
      <div className="hk-panel !rounded-[18px] p-[18px] hk-col gap-[12px]">
        <div className="grid grid-cols-2 gap-[10px]">
          <label className="hk-col gap-[4px]"><span className="hk-s font-medium text-[color:var(--text-primary)]">Leaving</span><span className="hk-field">Mon 3 Nov<ChevronDown size={14} className="ml-auto hk-faint" /></span></label>
          <label className="hk-col gap-[4px]"><span className="hk-s font-medium text-[color:var(--text-primary)]">Returning</span><span className={`hk-field ${o.error ? "!border-[var(--k-bad)]" : "hk-field--focus"}`}>{o.error ? "Sun 2 Nov" : "Fri 7 Nov"}<ChevronDown size={14} className="ml-auto hk-faint" /></span></label>
        </div>
        {o.error && <span className="hk-s hk-badc -mt-[6px]">Return is before the departure date</span>}
        <label className="hk-col gap-[4px]"><span className="hk-s font-medium text-[color:var(--text-primary)]">Budget per night</span><span className="hk-field">$220</span></label>
        {o.prefill && <span className="hk-s">Dates come from your calendar invite. Change anything that&apos;s wrong.</span>}
        <div className="hk-row justify-end gap-[8px]"><span className="hk-btn hk-btn--ghost">Cancel</span><span className="hk-btn hk-btn--main">Send to Atlas</span></div>
      </div>
    </div>
  );
}

/* Feedback — ChatGPT / Claude / Gemini thumbs with a reason sheet; Copilot reasons list. */
function Feedback({ o }: { o: Props }) {
  const st = o.state as string;
  return (
    <div className="w-[520px] hk-col gap-[10px] relative">
      <p className="hk-b">Churn rose 4 points in EMEA after the May price change, mostly in teams under ten seats.</p>
      <div className="hk-row !gap-[2px] -ml-[6px]">
        <span className="hk-ib hk-ib--sm"><Copy size={15} /></span>
        <span className="hk-ib hk-ib--sm"><ThumbsUp size={15} /></span>
        <span className={`hk-ib hk-ib--sm ${st !== "Idle" ? "hk-ib--on" : ""}`}><ThumbsDown size={15} fill={st !== "Idle" ? "currentColor" : "none"} /></span>
        <span className="hk-ib hk-ib--sm"><RefreshCw size={15} /></span><span className="hk-ib hk-ib--sm"><Share2 size={15} /></span>
        {st === "Sent" && <span className="hk-s ml-[8px]">Thanks. This helps Atlas get better.</span>}
      </div>
      {st === "Reason" && (
        <div className="hk-panel !rounded-[16px] p-[14px] hk-col gap-[10px]">
          <div className="hk-row justify-between"><span className="hk-t">What went wrong?</span><span className="hk-ib hk-ib--bare"><X size={16} /></span></div>
          <div className="hk-row flex-wrap gap-[6px]">{["Not accurate", "Missed the question", "Too long", "Out of date", "Unsafe"].map((t, i) => <span key={t} className={`hk-chip !h-[30px] ${i === 0 ? "hk-chip--sel" : ""}`}>{t}</span>)}</div>
          {o.comment && <span className="hk-field hk-field--empty">Tell us more (optional)</span>}
          <div className="hk-row justify-between"><span className="hk-s">The conversation is shared with the team that trains Atlas.</span><Send /></div>
        </div>
      )}
    </div>
  );
}

export const COLLECTORS: Record<string, Entry> = {
  "clarifying-question": { C: ClarifyingQuestion, opts: [sel("questions", "Questions", ["One", "Several"]), tog("other", "Own answer"), tog("skip", "Skip")], refs: ["ChatGPT Deep Research", "Claude Research", "Codex plan mode", "Cursor"] },
  "choice-picker": { C: ChoicePicker, opts: [sel("layout", "Layout", ["Cards", "List"]), tog("recommend", "Recommended")], refs: ["Claude", "Gemini drafts", "GitHub Copilot agent"] },
  "form-request": { C: FormRequest, opts: [tog("prefill", "Pre-filled note"), tog("error", "Error", false)], refs: ["Copilot Studio adaptive cards", "OpenAI ChatKit widgets", "Slack AI workflows"] },
  feedback: { C: Feedback, opts: [sel("state", "State", ["Reason", "Idle", "Sent"]), tog("comment", "Comment box")], refs: ["ChatGPT", "Claude", "Gemini", "Microsoft Copilot"] },
};
