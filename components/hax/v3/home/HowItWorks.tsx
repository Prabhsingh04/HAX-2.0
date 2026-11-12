import { Eyebrow, H2 } from "../ui";

// Figma: How it works 105:5951. The page's band: deep blue to purple, with soft glows round it.
const STEPS = [
  { n: 1, title: "Describe the screen you need", body: "Tell Claude what you want to build. Start with your intent.", ex: "describe" },
  { n: 2, title: "HAX finds the right building blocks", body: "Your agent gets HAX patterns that fit the task.", ex: "compose" },
  { n: 3, title: "Watch your UI take shape", body: "Your agent assembles the interface in your theme.", ex: "assemble" },
];

export function HowItWorks() {
  return (
    <section id="how-works" className="relative w-full px-[24px] py-[96px]" data-node-id="105:5951">
      <img alt="" aria-hidden src="/hax/v3/aura-cyan.svg" className="pointer-events-none absolute left-[2.8%] top-[348px] h-[480px] w-[620px] max-w-none" />
      <img alt="" aria-hidden src="/hax/v3/aura-orange.svg" className="pointer-events-none absolute left-[57%] top-[40px] h-[420px] w-[560px] max-w-none" />
      <div aria-hidden className="absolute inset-x-[32px] bottom-[48px] top-[24px] rounded-[40px]" style={{ backgroundImage: "var(--grad-band)" }} />
      <div className="relative mx-auto flex max-w-[1200px] flex-col gap-[64px]">
        <div className="h3-reveal flex max-w-[680px] flex-col gap-[16px]">
          <Eyebrow tone="ice">How it works</Eyebrow>
          <H2 className="text-white">From one sentence to<br />screens you can ship</H2>
          <p className="leading-[28px] text-[18px] text-[rgba(255,255,255,.72)]">Describe what you need. HAX helps your agent build it.</p>
        </div>
        <ol className="h3-reveal relative grid grid-cols-1 gap-[24px] md:grid-cols-3">
          <span aria-hidden className="absolute left-0 right-0 top-[6px] hidden h-[2px] md:block" style={{ backgroundImage: "linear-gradient(90deg, #00bceb 0%, #b5e9f8 33.3%, #ffcdb6 66.7%, rgba(255,109,45,0) 100%)" }} />
          {STEPS.map((s) => (
            <li key={s.n} className="relative flex flex-col gap-[16px]">
              <div className="flex flex-col gap-[12px]">
                <img alt="" src="/hax/v3/dot.svg" className="size-[13px]" />
                <p className="font-[family-name:var(--font-mono)] font-medium leading-[16px] text-[12px] tracking-[0.72px] text-[color:var(--ice)]">0{s.n} / 03</p>
              </div>
              <h3 className="font-semibold leading-[28px] text-[20px] text-[color:var(--text)]">{s.title}</h3>
              <p className="leading-[20px] text-[14px] text-[rgba(255,255,255,.72)]">{s.body}</p>
              <img alt={`Interaction example: ${s.ex}`} src={`/hax/v3/how-step-${s.n}.png`} className="mt-[8px] block aspect-[384/304] w-full rounded-[16px] border border-[rgba(255,255,255,.35)] object-cover" />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
