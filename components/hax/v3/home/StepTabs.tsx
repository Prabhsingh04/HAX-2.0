"use client";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { HowItWorksStage } from "./HowItWorksStage";
import type { SceneKind } from "../../v1/home/HowItWorksScene";
import { Spot, useMedia } from "../fx";

// "How it works" as a story that plays itself: the three steps on the left, the active step's scene
// large on the right. When a step's scene has finished, the page waits 3 s and moves on to the next
// (1 → 2 → 3, then it stays on 3); a line under the active step fills over that time. Clicking a step
// (or the arrow keys) jumps to it, its scene plays again from the start, and the story carries on
// from there. Phones list the three steps, without scenes.
const STEPS: { title: string; body: string; scene: SceneKind }[] = [
  { title: "Describe the screen you need", body: "Tell Claude what you want to build. Start with your intent.", scene: "chat" },
  { title: "HAX finds the right building blocks", body: "Your agent gets HAX patterns that fit the task.", scene: "map" },
  { title: "Watch your UI take shape", body: "Your agent assembles the interface in your theme.", scene: "ui" },
];
// each scene's length (v1/home/HowItWorksScene.tsx: the chat ends at 3.3 s, the map at 3.2 s, the
// screen at 5.2 s), plus the 3 s pause before the next step
const SCENE_MS = [3300, 3250, 5200];
const PAUSE_MS = 3000;
const mono = "font-[family-name:var(--font-mono)] font-medium leading-[16px] text-[12px] tracking-[0.72px] text-[color:var(--ice)]";

export function StepTabs() {
  const wide = useMedia("(min-width: 768px)");
  const still = useMedia("(prefers-reduced-motion: reduce)");
  const [cur, setCur] = useState(0);
  const [seen, setSeen] = useState(false);
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
  const running = wide && seen && !still;
  const ms = SCENE_MS[cur] + (cur < last ? PAUSE_MS : 0);
  useEffect(() => {
    if (!running || cur >= last) return;
    const t = setTimeout(() => setCur((c) => Math.min(c + 1, last)), ms);
    return () => clearTimeout(t);
  }, [cur, running, ms, last]);

  if (!wide) {
    return (
      <ol className="flex flex-col gap-[20px]">
        {STEPS.map((s, i) => (
          <li key={s.scene} className="flex flex-col gap-[6px] border-l border-[rgba(255,255,255,.25)] pl-[16px]">
            <p className={mono}>0{i + 1} / 03</p>
            <h3 className="font-semibold leading-[24px] text-[18px] text-[color:var(--text)]">{s.title}</h3>
            <p className="leading-[20px] text-[14px] text-[rgba(255,255,255,.72)]">{s.body}</p>
          </li>
        ))}
      </ol>
    );
  }

  const go = (i: number) => { setCur(i); tabs.current[i]?.focus(); };
  const keys = (e: KeyboardEvent) => {
    const d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    go((cur + d + STEPS.length) % STEPS.length);
  };
  return (
    <div ref={root} className="grid items-center gap-[48px] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div role="tablist" aria-label="How it works" aria-orientation="vertical" onKeyDown={keys} className="flex flex-col gap-[8px]">
        {STEPS.map((s, i) => {
          const on = i === cur;
          return (
            <button key={s.scene} ref={(el) => { tabs.current[i] = el; }} type="button" role="tab" id={`h3-how-${i}`} aria-selected={on} aria-controls="h3-how-stage" tabIndex={on ? 0 : -1}
              onClick={() => setCur(i)}
              className={`h3-tab relative flex flex-col gap-[8px] overflow-hidden rounded-[16px] border p-[20px] text-left transition-[background-color,border-color,opacity] duration-300 ${on ? "border-[rgba(255,255,255,.26)] bg-[rgba(255,255,255,.08)] backdrop-blur-[6px]" : "border-transparent opacity-60 hover:bg-[rgba(255,255,255,.05)] hover:opacity-100"}`}>
              <p className={mono}>0{i + 1} / 03</p>
              <h3 className="font-semibold leading-[28px] text-[20px] text-[color:var(--text)]">{s.title}</h3>
              <p className="leading-[20px] text-[14px] text-[rgba(255,255,255,.72)]">{s.body}</p>
              {on && !still && (
                <span key={`run-${cur}`} aria-hidden className="h3-steprun absolute inset-x-0 bottom-0 h-[2px]"
                  style={{ animationDuration: `${ms}ms`, animationPlayState: running ? "running" : "paused", backgroundImage: "linear-gradient(90deg, #00bceb, #b98cf0, #ff8a50)" }} />
              )}
            </button>
          );
        })}
      </div>
      <div id="h3-how-stage" role="tabpanel" aria-labelledby={`h3-how-${cur}`}>
        <Spot className="!rounded-[20px] border border-[rgba(255,255,255,.3)] shadow-[0_32px_80px_-24px_rgba(8,0,32,.85)]">
          <div key={cur} className="h3-swap"><HowItWorksStage kind={STEPS[cur].scene} /></div>
        </Spot>
      </div>
    </div>
  );
}
