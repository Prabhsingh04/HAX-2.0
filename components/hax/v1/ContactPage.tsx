// Figma: HAX · Contact 101:3610 (body 101:3672). Form posts like the old v1 contact.html.
const HELP: [string, string][] = [
  ["pattern-library-integration", "Pattern Library Integration"],
  ["ai-experience-design", "AI Experience Design"],
  ["agent-workflow-design", "Agent Workflow Design"],
  ["ai-design-system-audit", "AI Design System Audit"],
  ["custom-pattern-development", "Custom Pattern Development"],
  ["other", "Other"],
];
const label = "font-medium leading-[18px] text-[13px]";
const field = "hx-field bg-[var(--surface-page)] border border-[var(--stroke-default)] rounded-[var(--radius-md)] px-[12px] w-full leading-[22px] text-[14px] placeholder:text-[color:var(--text-tertiary)] outline-none";

export function ContactPage() {
  return (
    <section className="flex flex-col gap-[40px] items-stretch pb-[72px] pt-[48px] px-[var(--hx-gutter)] relative w-full overflow-hidden md:pb-[96px] md:pt-[80px] lg:flex-row lg:items-start lg:gap-[56px] xl:gap-[80px]" data-node-id="101:3672">
      <div className="relative flex w-full flex-col gap-[20px] items-start lg:w-[440px] lg:shrink-0 xl:w-[520px]">
        <h1 className="hx-rise font-semibold leading-[36px] text-[29px] tracking-[-0.2px] [text-wrap:balance]">The fastest way to build better AI products isn’t starting from scratch. It’s building on patterns that already work.</h1>
        <p className="hx-rise hx-rise--2 leading-[26px] text-[16px] text-[color:var(--text-secondary)] max-w-[500px]">HAX helps transform proven AI interaction patterns into production-ready experiences, so you can spend more time solving real problems and less time reinventing common ones.</p>
        <p className="hx-rise hx-rise--3 leading-[26px] text-[16px] text-[color:var(--text-secondary)] max-w-[500px]">Whether you’re exploring an idea, improving an existing product, or planning your next release, we’d love to help.</p>
      </div>
      <form action="https://www.intelligaia.com/contact" method="get" target="_blank"
        className="hx-reveal relative bg-[var(--surface-raised)] border border-[var(--stroke-subtle)] flex flex-1 flex-col gap-[18px] items-start min-w-px px-[22px] py-[20px] rounded-[var(--radius-xl)] shadow-[0px_8px_24px_0px_rgba(41,50,71,0.08)]">
        <h2 className="font-semibold leading-[28px] text-[20px]">Book your scoping call</h2>
        <label className="flex flex-col gap-[6px] w-full">
          <span className={label}>Your name *</span>
          <input name="name" required autoComplete="name" placeholder="Full name" className={`${field} h-[40px]`} />
        </label>
        <label className="flex flex-col gap-[6px] w-full">
          <span className={label}>Email *</span>
          <input name="email" type="email" required autoComplete="email" placeholder="you@company.com" className={`${field} h-[40px]`} />
        </label>
        <fieldset className="flex flex-col gap-[10px] items-start border-0 p-0 m-0">
          <legend className={`${label} mb-[10px]`}>I need help with</legend>
          {HELP.map(([v, t]) => (
            <label key={v} className="flex gap-[10px] items-center cursor-pointer leading-[22px] text-[14px]">
              <input type="checkbox" name="help" value={v} className="hx-check appearance-none bg-[var(--surface-page)] border border-[var(--stroke-default)] rounded-[4px] size-[16px] shrink-0 cursor-pointer" />
              {t}
            </label>
          ))}
        </fieldset>
        <label className="flex flex-col gap-[6px] w-full">
          <span className={label}>What are you looking to build? *</span>
          <textarea name="message" required placeholder="A sentence or two about your product and timeline" className={`${field} h-[96px] pt-[10px] resize-none`} />
        </label>
        <button type="submit" className="hx-btn hx-btn--solid bg-[var(--surface-inverse)] flex gap-[6px] h-[40px] items-center px-[20px] rounded-[var(--radius-pill)] font-semibold leading-[20px] text-[14px] text-[color:var(--text-on-inverse)] tracking-[0.07px]">
          Request my call
          <img alt="" src="/hax/v1/icon-arrow-right.svg" className="hx-arrow size-[16px]" />
        </button>
      </form>
    </section>
  );
}
