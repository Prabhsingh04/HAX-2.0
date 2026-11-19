"use client";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { HowItWorksScene } from "../../v1/home/HowItWorksScene";
import { BehaviorDraft, INITIAL_BEHAVIOR, WorkspaceView, type Behavior } from "../../v1/home/HowItWorksBehavior";
import { HowItWorksStage, type Tint } from "./HowItWorksStage";
import { Spot, useMedia } from "../fx";

// v3's "How it works" story with v1's four steps (v5): the steps on the left, the active step's
// stage large on the right. When a step has played, the page waits 3 s and moves on (1 → 2 → 3 → 4,
// then it stays on 4); a line under the active step fills over that time. Clicking a step (or the
// arrow keys) jumps to it and the story carries on from there. Steps 03 and 04 are live: edit the
// draft and the workspace follows; once you edit or answer, the story stops moving on its own.
// Phones list the four steps, without stages.
const STEPS: { title: string; body: string; ex: string; tint: Tint }[] = [
  { title: "Find a pattern with a prompt", body: "Tell your agent what you are trying to build. Ask it which HAX patterns fit your task.", ex: "Describe", tint: "chat" },
  { title: "HAX finds the right building blocks", body: "Your agent gets patterns that fit the task, plus the interface parts needed to show them.", ex: "Match", tint: "map" },
  { title: "Create a behavior you can edit", body: "Review when the agent acts, what it proposes, and how a person can respond. Change the draft to fit your workflow.", ex: "Edit", tint: "draft" },
  { title: "Show the behavior in your workflow", body: "Place the behavior where the work happens, with the agent’s context and the person’s choices together.", ex: "Respond", tint: "workspace" },
];
// how long each stage plays before the pause (v1/home/HowItWorksScene.tsx: the chat ends at 3.3 s,
// the map at 3.2 s; the draft is given time to be read), plus the 3 s pause before the next step
const STAGE_MS = [3300, 3250, 5000, 0];
const PAUSE_MS = 3000;
const mono = "font-[family-name:var(--font-mono)] font-medium leading-[16px] text-[12px] tracking-[0.72px] text-[color:var(--link)]";
const pad = (n: number) => String(n).padStart(2, "0");

export function StepTabs() {
  const wide = useMedia("(min-width: 768px)");
  const still = useMedia("(prefers-reduced-motion: reduce)");
  const [cur, setCur] = useState(0);
  const [seen, setSeen] = useState(false);
  const [touched, setTouched] = useState(false);
  const [behavior, setBehavior] = useState<Behavior>(INITIAL_BEHAVIOR);
  const [response, setResponse] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  // watch the desktop layout once it exists (phones render the plain list, without the root)
  useEffect(() => {
    if (!wide || !root.current) return;
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { threshold: 0.35 });
    io.observe(root.current);
    return () => io.disconnect();
  }, [wide]);
  const last = STEPS.length - 1;
  const running = wide && seen && !still && !touched;
  const ms = STAGE_MS[cur] + (cur < last ? PAUSE_MS : 0);
  useEffect(() => {
    if (!running || cur >= last) return;
    const t = setTimeout(() => setCur((c) => Math.min(c + 1, last)), ms);
    return () => clearTimeout(t);
  }, [cur, running, ms, last]);

  if (!wide) {
    return (
      <ol className="flex flex-col gap-[20px]">
        {STEPS.map((s, i) => (
          <li key={s.tint} className="flex flex-col gap-[6px] border-l border-[var(--edge-3)] pl-[16px]">
            <p className={mono}>{pad(i + 1)} / {pad(STEPS.length)}</p>
            <h3 className="font-semibold leading-[24px] text-[18px] text-[color:var(--text)]">{s.title}</h3>
            <p className="leading-[20px] text-[14px] text-[color:var(--text-2)]">{s.body}</p>
          </li>
        ))}
      </ol>
    );
  }

  const edit = (field: keyof Behavior, v: string) => { setTouched(true); setBehavior((b) => ({ ...b, [field]: v })); setResponse(null); };
  const respond = (r: string) => { setTouched(true); setResponse(r); };
  const go = (i: number) => { setCur(i); tabs.current[i]?.focus(); };
  const keys = (e: KeyboardEvent) => {
    const d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    go((cur + d + STEPS.length) % STEPS.length);
  };
  const s = STEPS[cur];
  return (
    <div ref={root} className="grid items-center gap-[40px] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-[48px]">
      <div role="tablist" aria-label="How it works" aria-orientation="vertical" onKeyDown={keys} className="flex flex-col gap-[8px]">
        {STEPS.map((st, i) => {
          const on = i === cur;
          return (
            <button key={st.tint} ref={(el) => { tabs.current[i] = el; }} type="button" role="tab" id={`h6-how-${i}`} aria-selected={on} aria-controls="h6-how-stage" tabIndex={on ? 0 : -1}
              onClick={() => setCur(i)}
              className={`h6-tab relative flex flex-col gap-[8px] overflow-hidden rounded-[16px] border p-[20px] text-left transition-[background-color,border-color,opacity] duration-300 ${on ? "border-[rgba(15,17,23,.1)] bg-[rgba(255,255,255,.72)] shadow-[0_12px_32px_-18px_rgba(30,40,90,.35)] backdrop-blur-[6px]" : "border-transparent opacity-70 hover:bg-[rgba(255,255,255,.4)] hover:opacity-100"}`}>
              <p className={mono}>{pad(i + 1)} / {pad(STEPS.length)}</p>
              <h3 className="font-semibold leading-[28px] text-[20px] text-[color:var(--text)]">{st.title}</h3>
              <p className="leading-[20px] text-[14px] text-[color:var(--text-2)]">{st.body}</p>
              {on && !still && cur < last && (
                <span key={`run-${cur}-${touched}`} aria-hidden className="h6-steprun absolute inset-x-0 bottom-0 h-[2px]"
                  style={{ animationDuration: `${ms}ms`, animationPlayState: running ? "running" : "paused", backgroundImage: "linear-gradient(90deg, #3fc6ee, #9b7ce8, #ff8a50)" }} />
              )}
            </button>
          );
        })}
      </div>
      <div id="h6-how-stage" role="tabpanel" aria-labelledby={`h6-how-${cur}`} className="flex flex-col gap-[10px]">
        <p className="font-[family-name:var(--font-mono)] font-medium leading-[16px] text-[11px] tracking-[0.96px] text-[color:var(--text-3)] uppercase">Interaction example: {s.ex}</p>
        <Spot className="!rounded-[20px] border border-[var(--edge-2)] shadow-[0_28px_70px_-30px_rgba(30,40,90,.4)]">
          <div key={cur} className="h6-swap">
            <HowItWorksStage tint={s.tint}>
              {s.tint === "draft" ? <BehaviorDraft value={behavior} onChange={edit} />
                : s.tint === "workspace" ? <WorkspaceView value={behavior} response={response} onRespond={respond} />
                : <HowItWorksScene kind={s.tint} />}
            </HowItWorksStage>
          </div>
        </Spot>
      </div>
    </div>
  );
}
