import { PATTERNS } from "../patterns/model";
import { patternHref } from "../patterns/href";

// "The pattern library": four featured patterns, then the full list (Srishti, 14 Nov: "just 4-5
// featured ones like in my version, and then it will go to the full patterns page"). The picks,
// names, summaries and previews are from her Studio v3 home (/studio/v3#library); the cards are
// drawn in v1's card style. Replaces the eight component families on the home page.
const eyebrow = "font-semibold leading-[16px] text-[11px] tracking-[1.2px] uppercase";
const mock = "w-full max-w-[260px] rounded-[12px] border border-[var(--stroke-subtle)] bg-[var(--surface-page)] p-[14px] text-left shadow-[0px_6px_18px_0px_rgba(41,50,71,0.08)]";
const chip = "rounded-[6px] border border-[var(--stroke-default)] px-[7px] py-[3px] text-[11px] leading-[14px]";

const FEATURED: { id: string; name: string; summary: string; preview: React.ReactNode }[] = [
  {
    id: "disclosure-gradient", name: "Disclosure",
    summary: "Make it clear when a person is interacting with AI and what that means for the result.",
    preview: (
      <div className={mock}>
        <div className="flex items-center gap-[8px]">
          <span className="size-[8px] rounded-full bg-[var(--hx-agent)]" />
          <strong className="text-[13px] leading-[18px]">Atlas assistant</strong>
          <span className="rounded-[4px] bg-[var(--surface-tint)] px-[5px] py-px font-semibold text-[10px] leading-[14px] text-[color:var(--text-secondary)]">AI</span>
        </div>
        <p className="mt-[8px] text-[12px] leading-[17px] text-[color:var(--text-secondary)]">I can help summarize this report. Check the source before using the answer.</p>
      </div>
    ),
  },
  {
    id: "pre-action-handshake", name: "Pre-Action Handshake",
    summary: "Show the action and its consequences before the agent commits to a consequential step.",
    preview: (
      <div className={mock}>
        <p className={`${eyebrow} text-[10px] text-[color:var(--text-tertiary)]`}>Proposed action</p>
        <strong className="mt-[6px] block text-[13px] leading-[18px]">Publish the update?</strong>
        <p className="mt-[2px] text-[12px] leading-[17px] text-[color:var(--text-secondary)]">This will notify 24 team members.</p>
        <div className="mt-[10px] flex gap-[6px]">
          <span className={chip}>Review changes</span>
          <span className="rounded-[6px] bg-[var(--surface-inverse)] px-[8px] py-[3px] font-semibold text-[11px] leading-[14px] text-[color:var(--text-on-inverse)]">Approve</span>
        </div>
      </div>
    ),
  },
  {
    id: "convergence-point", name: "Convergence Point",
    summary: "Bring competing agent recommendations into one decision a person can review.",
    preview: (
      <div className={mock}>
        <div className="flex flex-col gap-[6px]">
          <span className={`${chip} flex items-center gap-[6px]`}><span className="size-[6px] rounded-full bg-[var(--hx-human)]" />Triage agent · Roll back</span>
          <span className={`${chip} flex items-center gap-[6px]`}><span className="size-[6px] rounded-full bg-[var(--hx-agent)]" />Monitor agent · Hold restart</span>
        </div>
        <strong className="mt-[10px] block text-[13px] leading-[18px]">One recovery decision</strong>
        <p className="mt-[2px] text-[12px] leading-[17px] text-[color:var(--text-secondary)]">Review the recommendation and trade-offs together.</p>
      </div>
    ),
  },
  {
    id: "memory-commitment-review", name: "Memory",
    summary: "Let a person see and change what the agent carries into future work.",
    preview: (
      <div className={mock}>
        <p className={`${eyebrow} text-[10px] text-[color:var(--text-tertiary)]`}>Your saved context</p>
        <strong className="mt-[6px] block text-[13px] leading-[18px]">Use concise summaries</strong>
        <p className="mt-[2px] text-[12px] leading-[17px] text-[color:var(--text-secondary)]">Used in future reports</p>
        <p className="mt-[8px] text-[12px] leading-[17px] text-[color:var(--text-link)]">Edit · Forget</p>
      </div>
    ),
  },
];

export function FeaturedPatterns() {
  return (
    <section id="patterns" data-hx-blob-o="0.72" className="flex flex-col gap-[24px] items-center px-[max(20px,calc(var(--hx-gutter)_-_30px))] py-[72px] relative w-full md:gap-[28px] md:py-[96px]">
      <div className="hx-reveal flex flex-col items-center gap-[16px] text-center">
        <h2 className="font-extralight leading-[42px] text-[34px] [text-wrap:balance] md:leading-[52px] md:text-[42px] xl:leading-[60px] xl:text-[50px] xl:whitespace-nowrap">
          The pattern library
        </h2>
        <p className="max-w-[640px] leading-[26px] text-[16px] text-[color:var(--text-secondary)] [text-wrap:balance]">
          Find a pattern for the experience you need to design. Explore a few examples here, or browse the full library.
        </p>
      </div>
      <div className="hx-reveal grid w-full max-w-[1212px] grid-cols-1 gap-[16px] pt-[12px] sm:grid-cols-2 xl:grid-cols-4">
        {FEATURED.map((f, i) => (
          <a key={f.id} href={patternHref(f.id)}
            className="hx-card group bg-[var(--surface-tint)] border border-[var(--stroke-subtle)] flex flex-col overflow-clip rounded-[var(--radius-xl)]">
            <div aria-hidden="true" className="flex h-[188px] items-center justify-center px-[20px]">{f.preview}</div>
            <div className="flex flex-1 flex-col gap-[8px] items-start border-t border-[var(--stroke-subtle)] px-[20px] pt-[16px] pb-[20px]">
              <p className={`${eyebrow} text-[color:var(--text-secondary)]`}>{String(i + 1).padStart(2, "0")} / Featured pattern</p>
              <h3 className="font-semibold leading-[28px] text-[20px]">{f.name}</h3>
              <p className="leading-[22px] text-[14px] text-[color:var(--text-secondary)]">{f.summary}</p>
              <span className="mt-auto flex items-center gap-[4px] pt-[6px] font-semibold leading-[18px] text-[13px] text-[color:var(--text-link)]">
                <span className="hx-link">Open pattern</span>
                <img alt="" src="/hax/v1/icon-arrow-right-link-12.svg" className="hx-arrow size-[12px]" />
              </span>
            </div>
          </a>
        ))}
      </div>
      <a href="/patterns" className="hx-btn hx-btn--solid mt-[8px] bg-[var(--surface-inverse)] flex gap-[6px] h-[40px] items-center justify-center px-[20px] rounded-[var(--radius-pill)]">
        <span className="font-semibold leading-[20px] text-[14px] text-[color:var(--text-on-inverse)] tracking-[0.07px] whitespace-nowrap">Browse all {PATTERNS.length} patterns</span>
        <img alt="" src="/hax/v1/icon-arrow-right.svg" className="hx-arrow size-[16px]" />
      </a>
    </section>
  );
}
