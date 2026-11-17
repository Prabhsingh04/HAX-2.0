"use client";
// Figma: How it works 98:19623. Steps stack (sticky) as you scroll, like the
// old v1 "How HAX works" tiles. Each tile plays its animated scene
// (HowItWorksScene, ported from HAX-2.0/index.html) instead of a still image.
import { HowItWorksScene, type SceneKind } from "./HowItWorksScene";
import { BlobLayer } from "../BlobLayer";
import { useState } from "react";
import { BehaviorDraft, INITIAL_BEHAVIOR, WorkspaceView, type Behavior } from "./HowItWorksBehavior";

// Each tile has an opaque, full-width backdrop so a tile stacked on top hides the
// one below cleanly. The backdrop shows its own clipped copy of the page's fixed
// gradient (BlobLayer, at the same scroll-driven strength), so the gradient carries
// on behind the tile's copy; the UI frame on the right is opaque and sits above it.
// Copy and step details from Srishti's Studio v3 home ("From a prompt to behavior in your product",
// components/v3/V3HowStack.tsx), 17 Nov: one service-restart example runs through all four steps.
// 01 and 02 keep v1's animated scenes with that example; 03 and 04 are live (HowItWorksBehavior):
// edit the draft and the workspace below follows.
type Stage = SceneKind | "draft" | "workspace";
const STEPS: { n: number; title: string; body: string; ex: string; stage: Stage }[] = [
  { n: 1, title: "Find a pattern with a prompt", body: "Tell your agent what you are trying to build. Ask it which HAX patterns fit your task.", ex: "describe", stage: "chat" },
  { n: 2, title: "HAX finds the right building blocks", body: "Your agent gets patterns that fit the task, plus the interface parts needed to show them.", ex: "match", stage: "map" },
  { n: 3, title: "Create a behavior you can edit", body: "Review when the agent acts, what it proposes, and how a person can respond. Change the draft to fit your workflow.", ex: "edit", stage: "draft" },
  { n: 4, title: "Show the behavior in your workflow", body: "Place the behavior where the work happens, with the agent’s context and the person’s choices together.", ex: "respond", stage: "workspace" },
];

export function HowItWorks() {
  const [behavior, setBehavior] = useState<Behavior>(INITIAL_BEHAVIOR);
  const [response, setResponse] = useState<string | null>(null);
  const edit = (field: keyof Behavior, v: string) => { setBehavior((b) => ({ ...b, [field]: v })); setResponse(null); };
  return (
    <section id="how-works" data-hx-blob-o="0.42" className="flex flex-col gap-[40px] items-center px-[var(--hx-gutter)] py-[72px] relative w-full overflow-x-clip md:py-[96px] xl:gap-[48px]" data-node-id="98:19623">
      <div className="hx-reveal flex flex-col gap-[16px] items-center relative text-center">
        <h2 className="font-extralight leading-[42px] text-[34px] [text-wrap:balance] md:leading-[52px] md:text-[42px] xl:leading-[60px] xl:text-[50px] xl:whitespace-nowrap">
          From a prompt to behavior in your product
        </h2>
        <p className="max-w-[680px] leading-[26px] text-[16px] text-[color:var(--text-secondary)] [text-wrap:balance]">Describe what you need. HAX helps your agent find the right building blocks, shape an editable behavior, and show it in your workflow.</p>
      </div>
      <ol className="flex flex-col items-start relative w-full">
        {STEPS.map((s, i) => (
          <li key={s.n} className={`hx-stack relative flex w-full flex-col items-start gap-[24px] py-[32px] bg-[var(--surface-page)] lg:sticky lg:top-[94px] lg:flex-row lg:items-center lg:gap-[48px] lg:py-[40px] xl:gap-[64px] ${i ? "border-t border-[var(--stroke-subtle)]" : ""}`} style={{ zIndex: i + 1 }}>
            {/* clip-path (not overflow) clips the fixed blob layer to this backdrop */}
            <div aria-hidden className="absolute inset-y-0 -inset-x-[var(--hx-gutter)] z-0 pointer-events-none bg-[var(--surface-page)] [clip-path:inset(0)]">
              <BlobLayer />
            </div>
            <div className="relative z-[1] flex w-full flex-col gap-[12px] items-start lg:w-[340px] lg:shrink-0 xl:w-[400px]">
              <p className="font-semibold leading-[16px] text-[11px] text-[color:var(--text-link)] tracking-[1.2px] uppercase">0{s.n} / 0{STEPS.length}</p>
              <h3 className="font-semibold leading-[34px] text-[26px] tracking-[-0.3px] [text-wrap:balance] md:leading-[40px] md:text-[32px]">{s.title}</h3>
              <p className="max-w-[360px] leading-[22px] text-[14px] text-[color:var(--text-secondary)]">{s.body}</p>
            </div>
            <div className="relative z-[1] flex w-full min-w-0 flex-col gap-[10px] items-start lg:flex-1">
              <p className="font-semibold leading-[16px] text-[11px] text-[color:var(--text-secondary)] tracking-[1.2px] uppercase">Interaction example: {s.ex}</p>
              <div className="w-full max-w-[648px] bg-[var(--surface-frame)] border border-[var(--stroke-subtle)] p-[10px] rounded-[var(--radius-2xl)] md:p-[14px]">
                {s.stage === "draft" ? <BehaviorDraft value={behavior} onChange={edit} />
                  : s.stage === "workspace" ? <WorkspaceView value={behavior} response={response} onRespond={setResponse} />
                  : <HowItWorksScene kind={s.stage} fit />}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
