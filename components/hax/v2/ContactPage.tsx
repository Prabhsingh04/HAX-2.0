import { Weave } from "./Weave";
import { HELP } from "./content";

// Figma: HAX v2 · Contact 103:2971 (🌐 Website v2). One continuous weave down to the footer; the form posts like v1's.
const field = "w-full rounded-[12px] border border-[color:var(--line)] bg-[color:var(--card)] px-[16px] text-[16px] leading-[24px] outline-none transition-colors placeholder:text-[color:var(--grey)] focus:border-[#999]";
const label = "text-[14px] font-medium leading-[20px]";

export function ContactPage() {
  return (
    <section className="relative flex gap-[64px] px-[120px] pb-[110px] pt-[168px]">
      <Weave row0={0} fade={{ top: 140, bottom: 140 }} />
      <div className="relative flex w-[560px] shrink-0 flex-col gap-[24px]">
        <h1 className="hx2-h1 hx2-rise text-[48px] font-semibold leading-[52px] tracking-[-0.02em]">The fastest way to build better AI products isn’t starting from scratch. It’s building on patterns that already work.</h1>
        <div className="flex w-[520px] flex-col gap-[16px] text-[18px] leading-[28px] text-[color:var(--grey)]">
          <p className="hx2-rise hx2-rise--2">HAX helps transform proven AI interaction patterns into production-ready experiences, so you can spend more time solving real problems and less time reinventing common ones.</p>
          <p className="hx2-rise hx2-rise--3">Whether you’re exploring an idea, improving an existing product, or planning your next release, we’d love to help.</p>
        </div>
      </div>
      <form action="https://www.intelligaia.com/contact" method="get" target="_blank"
        className="hx2-rise hx2-rise--2 relative flex w-[576px] flex-col gap-[24px] rounded-[24px] border border-[color:var(--line)] bg-[color:var(--card)] p-[40px]">
        <h2 className="text-[24px] font-semibold leading-[32px]">Book your scoping call</h2>
        <label className="flex flex-col gap-[8px]"><span className={label}>Your name *</span><input name="name" required autoComplete="name" placeholder="Full name" className={`${field} h-[48px]`} /></label>
        <label className="flex flex-col gap-[8px]"><span className={label}>Email *</span><input name="email" type="email" required autoComplete="email" placeholder="you@company.com" className={`${field} h-[48px]`} /></label>
        <fieldset className="m-0 flex flex-col gap-[12px] border-0 p-0">
          <legend className={`${label} mb-[12px]`}>I need help with</legend>
          {HELP.map(([v, t]) => (
            <label key={v} className="flex cursor-pointer items-center gap-[12px] text-[16px] leading-[24px]">
              <input type="checkbox" name="help" value={v} className="size-[18px] shrink-0 cursor-pointer appearance-none rounded-[5px] border border-[color:var(--line)] bg-[color:var(--card)] transition-colors checked:border-[#111] checked:bg-[color:var(--btn)] checked:bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22white%22 stroke-width=%223%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22M20 6 9 17l-5-5%22/></svg>')] checked:bg-[length:12px] checked:bg-center checked:bg-no-repeat" />
              {t}
            </label>
          ))}
        </fieldset>
        <label className="flex flex-col gap-[8px]"><span className={label}>What are you looking to build? *</span><textarea name="message" required placeholder="A sentence or two about your product and timeline" className={`${field} h-[112px] resize-none pt-[12px]`} /></label>
        <button type="submit" className="hx2-btn hx2-btn--dark flex w-fit items-center gap-[8px] rounded-[8px] bg-[color:var(--btn)] py-[8px] pl-[16px] pr-[12px] text-[16px] font-semibold leading-[24px] text-white">
          Request my call
          <svg viewBox="0 0 24 24" className="size-[16px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
        </button>
      </form>
    </section>
  );
}
