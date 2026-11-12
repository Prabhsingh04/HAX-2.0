// Figma: HAX v2 · Home · How it works 103:3325. The step pictures are v1's (same inner UI in every version).
const STEPS = [
  { n: 1, title: "Describe the screen you need", body: "Tell Claude what you want to build. Start with your intent.", ex: "describe" },
  { n: 2, title: "HAX finds the right building blocks", body: "Your agent gets HAX patterns that fit the task.", ex: "compose" },
  { n: 3, title: "Watch your UI take shape", body: "Your agent assembles the interface in your theme.", ex: "assemble" },
];
const eyebrow = "font-[family-name:var(--font-mono)] text-[12px] font-medium uppercase leading-[16px] tracking-[0.06em] text-[color:var(--grey)]";

// A soft band: the grey fades in and out over 160px, so the page never switches colour on a line.
export const SOFT_FILL = "linear-gradient(to bottom, transparent 0, var(--fill) 160px, var(--fill) calc(100% - 160px), transparent 100%)";

export function HowItWorks() {
  return (
    <section id="how-works" className="hx2-band relative flex flex-col gap-[48px] px-[120px] py-[120px]" data-node-id="103:3325">
      {/* a solid dark band, edge to edge with hard edges (like MCP); the content keeps the 1440 grid */}
      <div aria-hidden className="absolute inset-y-0 left-1/2 w-screen max-w-none -translate-x-1/2" style={{ background: "var(--mcp)" }} />
      {/* the header fills the content width: title left, the line that sums it up on the right edge */}
      <div className="hx2-reveal relative flex w-full items-end justify-between gap-[48px]">
        <div className="flex flex-col gap-[16px]">
          <p className={eyebrow}>How it works</p>
          <h2 className="text-[48px] font-semibold leading-[48px] tracking-[-0.02em]">From one sentence to<br />screens you can ship</h2>
        </div>
        <p className="max-w-[384px] text-right text-[18px] leading-[28px] text-[color:var(--grey)]">Describe what you need. HAX helps your agent build it.</p>
      </div>
      {/* a stepper: numbered stops joined by a line, each step's card under its number */}
      <ol className="relative grid w-full grid-cols-3 items-stretch gap-[24px]" aria-label="Steps">
        {STEPS.map((s, i) => (
          <li key={s.n} className="hx2-reveal flex min-w-0 flex-col gap-[20px]" style={{ transitionDelay: `${i * 120}ms` }}>
            <div className="flex items-center gap-[12px]">
              <span className="flex size-[32px] shrink-0 items-center justify-center rounded-full bg-[color:var(--btn)] text-[14px] font-semibold leading-[20px] hx2-inv">{s.n}</span>
              <span className={eyebrow}>Step {s.n}</span>
              {i < STEPS.length - 1 && <span aria-hidden className="h-px flex-1 bg-[color:var(--line)]" />}
            </div>
            <div className="flex flex-1 flex-col rounded-[24px] border border-[color:var(--line)] bg-[color:var(--card)] p-[8px]">
              <img alt={`Interaction example: ${s.ex}`} src={`/hax/v1/how-step-${s.n}.jpg`} className="block h-[292px] w-full rounded-[16px] object-cover" />
              <div className="flex flex-col gap-[8px] px-[16px] pb-[16px] pt-[24px]">
                <h3 className="text-[18px] font-semibold leading-[28px]">{s.title}</h3>
                <p className="text-[14px] leading-[20px] text-[color:var(--grey)]">{s.body}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
