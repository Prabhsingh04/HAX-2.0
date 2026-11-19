import { WorldHero } from "@/components/hax/v6/ui";

// v3's Contact (Figma HAX v3 · Contact 106:8704; hero 106:8705, form 106:8812) on white. Copy, options and the form
// target are v1's (components/hax/v1/ContactPage.tsx keeps them unexported).
const HELP: [string, string][] = [
  ["pattern-library-integration", "Pattern Library Integration"],
  ["ai-experience-design", "AI Experience Design"],
  ["agent-workflow-design", "Agent Workflow Design"],
  ["ai-design-system-audit", "AI Design System Audit"],
  ["custom-pattern-development", "Custom Pattern Development"],
  ["other", "Other"],
];
const label = "font-medium leading-[20px] text-[14px] text-[color:var(--text)]";
const field = "h6-field w-full rounded-[10px] border border-[var(--edge)] bg-[var(--bg)] px-[16px] leading-[24px] text-[16px] text-[color:var(--text)] outline-none placeholder:text-[color:var(--text-3)]";

export function ContactPage() {
  return (
    <>
      <WorldHero nodeId="106:8705">
        <h1 className="h6-rise max-w-[1100px] font-light text-[clamp(36px,4vw,56px)] leading-[1.08] tracking-[-0.03em] text-[color:var(--text)]">
          The fastest way to build better AI<br className="hidden lg:inline" /> products isn’t starting from scratch.{" "}
          <span className="-mb-[.12em] block bg-clip-text pb-[.12em] font-semibold lg:whitespace-nowrap text-transparent [-webkit-background-clip:text]" style={{ backgroundImage: "var(--grad-text)" }}>It’s building on patterns that already work.</span>
        </h1>
      </WorldHero>
      <section className="flex flex-col items-center gap-[48px] px-[24px] pb-[96px] pt-[24px]" data-node-id="106:8812">
        <div className="h6-reveal flex max-w-[516px] flex-col gap-[16px] text-center leading-[28px] text-[18px] text-[color:var(--text-2)]">
          <p>HAX helps transform proven AI interaction patterns into production-ready experiences, so you can spend more time solving real problems and less time reinventing common ones.</p>
          <p>Whether you’re exploring an idea, improving an existing product, or planning your next release, we’d love to help.</p>
        </div>
        <div className="h6-glow h6-reveal w-full max-w-[720px]">
          <form action="https://www.intelligaia.com/contact" method="get" target="_blank" className="h6-neon flex flex-col gap-[24px] rounded-[24px] p-[40px]">
            <h2 className="font-semibold leading-[32px] text-[24px] text-[color:var(--text)]">Book your scoping call</h2>
            <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-2">
              <label className="flex flex-col gap-[8px]">
                <span className={label}>Your name *</span>
                <input name="name" required autoComplete="name" placeholder="Full name" className={`${field} h-[48px]`} />
              </label>
              <label className="flex flex-col gap-[8px]">
                <span className={label}>Email *</span>
                <input name="email" type="email" required autoComplete="email" placeholder="you@company.com" className={`${field} h-[48px]`} />
              </label>
            </div>
            <fieldset className="m-0 flex flex-col gap-[12px] border-0 p-0">
              <legend className={`${label} mb-[12px]`}>I need help with</legend>
              <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-2">
                {HELP.map(([v, t]) => (
                  <label key={v} className="h6-field flex h-[50px] cursor-pointer items-center gap-[12px] rounded-[10px] border border-[var(--edge)] bg-[var(--bg)] px-[16px] leading-[24px] text-[16px] text-[color:var(--text)]">
                    <input type="checkbox" name="help" value={v} className="h6-check size-[18px] shrink-0 cursor-pointer appearance-none rounded-[4px] border border-[var(--edge-3)] bg-transparent" />
                    {t}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="flex flex-col gap-[8px]">
              <span className={label}>What are you looking to build? *</span>
              <textarea name="message" required placeholder="A sentence or two about your product and timeline" className={`${field} h-[112px] resize-none py-[12px]`} />
            </label>
            <button type="submit" className="h6-btn h6-btn--light inline-flex items-center gap-[8px] self-start rounded-[8px] px-[16px] py-[8px] font-semibold leading-[24px] text-[16px]">
              Request my call
              <svg viewBox="0 0 16 16" aria-hidden className="h6-arrow size-[16px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
