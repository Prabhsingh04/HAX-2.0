"use client";
// Steps 03 and 04 of "From a prompt to behavior in your product", from Srishti's Studio v3 home
// (components/v3/V3HowStack.tsx): an editable behavior draft, and the same behavior shown in an
// incident workspace where the choices work. Typing in the draft updates the workspace. Drawn as
// light frames like the animated scenes of steps 01 and 02 (how-it-works-scenes.css).
import "@/components/hax/v1/home/how-it-works-scenes.css";

export type Behavior = { trigger: string; action: string; choices: string };
export const INITIAL_BEHAVIOR: Behavior = {
  trigger: "Checkout latency rose after the release.",
  action: "Restart payments service",
  choices: "Approve, Ask for details, Defer",
};

const frame = "flex h-[454px] flex-col overflow-hidden rounded-[16px] border border-[rgb(12_12_10/.1)] bg-white text-[#111] max-lg:h-auto max-lg:min-h-[380px]";
const top = "flex items-center gap-[8px] border-b border-[rgb(12_12_10/.08)] px-[14px] py-[12px] text-[13px]";
const tag = "ml-auto rounded-full border border-[rgb(12_12_10/.12)] px-[10px] py-[3px] text-[11.5px] font-medium text-[#222]";
const label = "flex flex-col gap-[6px] text-[12px] font-medium text-[#555]";
const input = "h-[40px] rounded-[10px] border border-[rgb(12_12_10/.14)] bg-white px-[12px] text-[14px] font-normal text-[#111] outline-none focus:border-[#0a6bd6] focus:shadow-[0_0_0_3px_rgb(10_107_214/.15)]";

export function BehaviorDraft({ value, onChange }: { value: Behavior; onChange: (field: keyof Behavior, v: string) => void }) {
  return (
    <div className={frame} aria-label="Editable behavior draft">
      <div className={top}><b>Behavior draft</b><span className={tag}>Editable</span></div>
      <div className="flex flex-1 flex-col gap-[14px] px-[18px] py-[16px]">
        <div className="flex flex-col gap-[2px]">
          <span className="text-[11px] font-semibold uppercase tracking-[1px] text-[#0a5fbf]">Pre-Action Handshake</span>
          <strong className="text-[16px] leading-[22px]">Service restart review</strong>
          <p className="text-[12.5px] leading-[18px] text-[#555]">Edit this example. The next step updates as you type.</p>
        </div>
        <label className={label}>When this happens<input className={input} value={value.trigger} onChange={(e) => onChange("trigger", e.target.value)} /></label>
        <label className={label}>The agent proposes<input className={input} value={value.action} onChange={(e) => onChange("action", e.target.value)} /></label>
        <label className={label}>A person can choose<input className={input} value={value.choices} onChange={(e) => onChange("choices", e.target.value)} /></label>
      </div>
    </div>
  );
}

export function WorkspaceView({ value, response, onRespond }: { value: Behavior; response: string | null; onRespond: (r: string) => void }) {
  const choices = value.choices.split(",").map((c) => c.trim()).filter(Boolean).slice(0, 4);
  const action = value.action.trim() || "Proposed action";
  const outcome = response === "Approve"
    ? "Approved. The agent can proceed and records the decision."
    : response === "Ask for details"
      ? "The agent shows its evidence before anything changes."
      : response === "Defer"
        ? "The agent waits. The proposed action stays on hold."
        : response ? `Decision recorded: ${response}.` : "Choose a response to see what happens next.";
  return (
    <div className={frame} aria-label="Interactive incident workspace example">
      <div className={top}><b>Incident workspace</b><span className={tag}>INC-2231</span></div>
      <div className="flex flex-1 flex-col gap-[12px] px-[18px] py-[16px]">
        <p className="text-[12px] text-[#666]">Payments API <span className="px-[4px] text-[#aaa]">/</span> Response</p>
        <div className={`flex items-center justify-between gap-[8px] rounded-[10px] px-[12px] py-[8px] text-[12px] ${response ? "bg-[#eaf6ee] text-[#1e7a3c]" : "bg-[#fff4ec] text-[#b4501a]"}`}>
          <span className="font-semibold uppercase tracking-[1px] text-[10.5px]">Pre-action check</span>
          <strong>{response ? "Decision recorded" : "Needs your input"}</strong>
        </div>
        <h4 className="text-[20px] font-semibold leading-[26px] tracking-[-0.2px]">{action}{action.endsWith("?") ? "" : "?"}</h4>
        <p className="text-[13.5px] leading-[20px] text-[#333]"><b className="text-[#0a5fbf]">@triage</b> reports: {value.trigger.trim() || "A change needs review."}</p>
        <div className="flex flex-wrap gap-[8px]" role="group" aria-label="Choose an operator response">
          {choices.map((c, i) => (
            <button key={c} type="button" aria-pressed={response === c} onClick={() => onRespond(c)}
              className={`h-[36px] rounded-full px-[14px] text-[13px] font-semibold transition-colors ${response === c ? "bg-[#0a6bd6] text-white" : i === 0 ? "bg-[#293247] text-white hover:bg-[#1c2333]" : "border border-[rgb(12_12_10/.15)] bg-white text-[#111] hover:bg-[#f4f5f6]"}`}>
              {c}
            </button>
          ))}
        </div>
        <p aria-live="polite" className="mt-auto rounded-[10px] border border-dashed border-[rgb(12_12_10/.15)] px-[12px] py-[10px] text-[13px] leading-[19px] text-[#444]">{outcome}</p>
      </div>
    </div>
  );
}
