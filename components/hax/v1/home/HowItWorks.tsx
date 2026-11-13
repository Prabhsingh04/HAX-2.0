// Figma: How it works 98:19623. Steps stack (sticky) as you scroll, like the
// old v1 "How HAX works" tiles. Each tile plays its animated scene
// (HowItWorksScene, ported from HAX-2.0/index.html) instead of a still image.
import { HowItWorksScene, type SceneKind } from "./HowItWorksScene";

const STEPS: { n: number; title: [string, string]; body: string; ex: string; scene: SceneKind }[] = [
  { n: 1, title: ["Describe the screen", "you need"], body: "Tell Claude what you want to build. Start with your intent.", ex: "describe", scene: "chat" },
  { n: 2, title: ["HAX finds the right", "building blocks"], body: "Your agent gets HAX patterns that fit the task.", ex: "compose", scene: "map" },
  { n: 3, title: ["Watch your UI", "take shape"], body: "Your agent assembles the interface in your theme.", ex: "assemble", scene: "ui" },
];

export function HowItWorks() {
  return (
    <section id="how-works" className="flex flex-col gap-[48px] items-center px-[144px] py-[96px] relative w-full" data-node-id="98:19623">
      <img alt="" aria-hidden src="/hax/v1/wash-lavender-tall.svg" className="hx-wash absolute h-[620px] left-0 top-[260px] w-[760px] max-w-none pointer-events-none z-10 mix-blend-multiply" />
      <img alt="" aria-hidden src="/hax/v1/wash-peach-tall.svg" className="hx-wash hx-wash--2 absolute h-[620px] left-[680px] top-[860px] w-[760px] max-w-none pointer-events-none z-10 mix-blend-multiply" />
      <div className="hx-reveal flex flex-col gap-[16px] items-center relative text-center whitespace-nowrap">
        <h2 className="font-extralight text-[50px] leading-[60px]">
          From one sentence to{" "}
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg, rgb(217, 119, 6) 0%, rgb(217, 119, 6) 50.348%, rgb(225, 29, 72) 80.139%, rgb(190, 24, 93) 100%)" }}>
            screens you can ship
          </span>
        </h2>
        <p className="leading-[26px] text-[16px] text-[color:var(--text-secondary)]">Describe what you need. HAX helps your agent build it.</p>
      </div>
      <ol className="flex flex-col items-start relative w-full">
        {STEPS.map((s, i) => (
          <li key={s.n} className={`hx-stack flex gap-[64px] items-center py-[40px] w-full sticky top-[94px] bg-[var(--surface-page)] ${i ? "border-t border-[var(--stroke-subtle)]" : ""}`} style={{ zIndex: i + 1 }}>
            <div className="flex flex-col gap-[12px] items-start shrink-0 w-[400px]">
              <p className="font-semibold leading-[16px] text-[11px] text-[color:var(--text-link)] tracking-[1.2px] uppercase">0{s.n} / 03</p>
              <h3 className="font-semibold leading-[40px] text-[32px] tracking-[-0.3px] w-[400px]">
                {s.title[0]}
                <br />
                {s.title[1]}
              </h3>
              <p className="leading-[22px] text-[14px] text-[color:var(--text-secondary)] w-[360px]">{s.body}</p>
            </div>
            <div className="flex flex-1 flex-col gap-[10px] items-start min-w-px">
              <p className="font-semibold leading-[16px] text-[11px] text-[color:var(--text-secondary)] tracking-[1.2px] uppercase">Interaction example: {s.ex}</p>
              <div className="relative w-[648px]">
                <div className="bg-[var(--surface-tint)] border border-[var(--stroke-subtle)] pl-[44px] pr-[28px] py-[28px] rounded-[var(--radius-2xl)] w-[648px]">
                  <HowItWorksScene kind={s.scene} />
                </div>
                <span className="absolute bg-[var(--brand-marker)] flex items-center justify-center left-[12px] top-[40px] rounded-[var(--radius-pill)] size-[20px] font-semibold leading-[16px] text-[12px] text-[color:var(--text-on-accent)] tracking-[0.06px]">{s.n}</span>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
