// Figma: How it works 98:19623. Steps stack (sticky) as you scroll, like the
// old v1 "How HAX works" tiles. Each tile plays its animated scene
// (HowItWorksScene, ported from HAX-2.0/index.html) instead of a still image.
import { HowItWorksScene, type SceneKind } from "./HowItWorksScene";
import { BlobLayer } from "../BlobLayer";

// Each tile has an opaque, full-width backdrop so a tile stacked on top hides the
// one below cleanly. The backdrop shows its own clipped copy of the page's fixed
// gradient (BlobLayer, at the same scroll-driven strength), so the gradient carries
// on behind the tile's copy; the UI frame on the right is opaque and sits above it.
const STEPS: { n: number; title: [string, string]; body: string; ex: string; scene: SceneKind }[] = [
  { n: 1, title: ["Describe the screen", "you need"], body: "Tell Claude what you want to build. Start with your intent.", ex: "describe", scene: "chat" },
  { n: 2, title: ["HAX finds the right", "building blocks"], body: "Your agent gets HAX patterns that fit the task.", ex: "compose", scene: "map" },
  { n: 3, title: ["Watch your UI", "take shape"], body: "Your agent assembles the interface in your theme.", ex: "assemble", scene: "ui" },
];

export function HowItWorks() {
  return (
    <section id="how-works" data-hx-blob-o="0.42" className="flex flex-col gap-[28px] items-center px-[var(--hx-gutter)] py-[56px] md:gap-[40px] relative w-full overflow-x-clip md:py-[96px] xl:gap-[48px]" data-node-id="98:19623">
      <div className="hx-reveal flex flex-col gap-[16px] items-center relative text-center">
        <h2 className="font-extralight leading-[42px] text-[34px] [text-wrap:balance] md:leading-[52px] md:text-[42px] xl:leading-[60px] xl:text-[50px] xl:whitespace-nowrap">
          From one sentence to screens you can ship
        </h2>
        <p className="leading-[26px] text-[16px] text-[color:var(--text-secondary)] [text-wrap:balance]">Describe what you need. HAX helps your agent build it.</p>
      </div>
      <ol className="flex flex-col items-start relative w-full">
        {STEPS.map((s, i) => (
          <li key={s.n} className={`hx-stack relative flex w-full items-start gap-[14px] py-[12px] md:flex-col md:gap-[24px] md:py-[32px] lg:sticky lg:top-[94px] lg:flex-row lg:items-center lg:gap-[48px] lg:bg-[var(--surface-page)] lg:py-[40px] xl:gap-[64px] ${i ? "md:border-t md:border-[var(--stroke-subtle)]" : ""} ${i < STEPS.length - 1 ? "max-md:after:absolute max-md:after:bottom-[-12px] max-md:after:left-[13.5px] max-md:after:top-[46px] max-md:after:w-px max-md:after:bg-[var(--stroke-default)]" : ""}`} style={{ zIndex: i + 1 }}>
            {/* phones: a numbered step, joined to the next by a thin line */}
            <span aria-hidden="true" className="relative z-[1] grid size-[28px] shrink-0 place-items-center rounded-full border border-[var(--stroke-default)] bg-[var(--surface-page)] font-semibold leading-[16px] text-[13px] text-[color:var(--text-link)] md:hidden">{s.n}</span>
            {/* clip-path (not overflow) clips the fixed blob layer to this backdrop */}
            <div aria-hidden className="absolute inset-y-0 -inset-x-[var(--hx-gutter)] z-0 pointer-events-none bg-[var(--surface-page)] [clip-path:inset(0)] hidden lg:block">
              <BlobLayer />
            </div>
            <div className="relative z-[1] flex w-full flex-col gap-[4px] items-start pt-[3px] md:gap-[12px] md:pt-0 lg:w-[340px] lg:shrink-0 xl:w-[400px]">
              <p className="font-semibold leading-[16px] text-[11px] text-[color:var(--text-link)] tracking-[1.2px] uppercase max-md:hidden">0{s.n} / 03</p>
              <h3 className="font-semibold leading-[24px] text-[18px] tracking-[-0.2px] md:leading-[40px] md:text-[32px] md:tracking-[-0.3px]">
                {s.title[0]}{" "}
                <br className="hidden md:block" />
                {s.title[1]}
              </h3>
              <p className="max-w-[360px] leading-[22px] text-[14px] text-[color:var(--text-secondary)]">{s.body}</p>
            </div>
            <div className="relative z-[1] flex w-full min-w-0 flex-col gap-[10px] items-start max-md:hidden lg:flex-1">
              <p className="font-semibold leading-[16px] text-[11px] text-[color:var(--text-secondary)] tracking-[1.2px] uppercase">Interaction example: {s.ex}</p>
              <div className="w-full max-w-[648px] bg-[var(--surface-frame)] border border-[var(--stroke-subtle)] p-[10px] rounded-[var(--radius-2xl)] md:p-[14px]">
                <HowItWorksScene kind={s.scene} fit />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
