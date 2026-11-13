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
    <section id="how-works" data-hx-blob-o="0.42" className="flex flex-col gap-[48px] items-center px-[144px] py-[96px] relative w-full overflow-x-clip" data-node-id="98:19623">
      <div className="hx-reveal flex flex-col gap-[16px] items-center relative text-center whitespace-nowrap">
        <h2 className="font-extralight text-[50px] leading-[60px]">
          From one sentence to screens you can ship
        </h2>
        <p className="leading-[26px] text-[16px] text-[color:var(--text-secondary)]">Describe what you need. HAX helps your agent build it.</p>
      </div>
      <ol className="flex flex-col items-start relative w-full">
        {STEPS.map((s, i) => (
          <li key={s.n} className={`hx-stack flex gap-[64px] items-center py-[40px] w-full sticky top-[94px] bg-[var(--surface-page)] ${i ? "border-t border-[var(--stroke-subtle)]" : ""}`} style={{ zIndex: i + 1 }}>
            {/* clip-path (not overflow) clips the fixed blob layer to this backdrop */}
            <div aria-hidden className="absolute inset-y-0 left-[-144px] right-[-144px] z-0 pointer-events-none bg-[var(--surface-page)] [clip-path:inset(0)]">
              <BlobLayer />
            </div>
            <div className="relative z-[1] flex flex-col gap-[12px] items-start shrink-0 w-[400px]">
              <p className="font-semibold leading-[16px] text-[11px] text-[color:var(--text-link)] tracking-[1.2px] uppercase">0{s.n} / 03</p>
              <h3 className="font-semibold leading-[40px] text-[32px] tracking-[-0.3px] w-[400px]">
                {s.title[0]}
                <br />
                {s.title[1]}
              </h3>
              <p className="leading-[22px] text-[14px] text-[color:var(--text-secondary)] w-[360px]">{s.body}</p>
            </div>
            <div className="relative z-[1] flex flex-1 flex-col gap-[10px] items-start min-w-px">
              <p className="font-semibold leading-[16px] text-[11px] text-[color:var(--text-secondary)] tracking-[1.2px] uppercase">Interaction example: {s.ex}</p>
              <div className="bg-[var(--surface-frame)] border border-[var(--stroke-subtle)] p-[14px] rounded-[var(--radius-2xl)] w-[648px]">
                <HowItWorksScene kind={s.scene} />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
