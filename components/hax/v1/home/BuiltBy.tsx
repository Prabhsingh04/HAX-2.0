// Figma: Built by 98:19879
export function BuiltBy() {
  return (
    <section className="flex gap-[64px] items-center px-[144px] py-[96px] relative w-full" data-node-id="98:19879">
      <div className="hx-reveal relative flex flex-col gap-[20px] items-start shrink-0 w-[500px]">
        <h2 className="font-semibold leading-[36px] text-[30px] tracking-[-0.2px] w-[500px] [text-wrap:balance]">
          Built by people who design products with AI agents
        </h2>
        <p className="leading-[22px] text-[14px] text-[color:var(--text-secondary)] w-[480px]">
          Outshift Design works with teams building software where people and AI agents work together. HAX is the public part of that practice. It is free to use and adapt, and it changes as the practice does.
        </p>
        <div className="flex gap-[12px] items-center">
        <a href="/library" className="hx-btn hx-btn--solid bg-[var(--surface-inverse)] flex gap-[6px] h-[36px] items-center px-[16px] rounded-[var(--radius-pill)] font-semibold leading-[20px] text-[14px] text-[color:var(--text-on-inverse)] tracking-[0.07px] whitespace-nowrap">
          Browse patterns
          <img alt="" src="/hax/v1/icon-arrow-right.svg" className="hx-arrow size-[16px]" />
        </a>
        <a href="https://outshift.cisco.com" target="_blank" rel="noreferrer" className="hx-btn hx-btn--outline bg-[var(--surface-page)] border border-[var(--stroke-default)] flex gap-[6px] h-[36px] items-center px-[16px] rounded-[var(--radius-pill)] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] font-semibold leading-[20px] text-[14px] tracking-[0.07px] whitespace-nowrap">
          Explore Outshift
          <img alt="" src="/hax/v1/icon-arrow-up-right-ink.svg" className="hx-arrow size-[16px]" />
        </a>
        </div>
      </div>
      <div className="hx-reveal relative bg-[var(--surface-tint)] border border-[var(--stroke-subtle)] flex flex-1 h-[220px] items-center justify-center min-w-px overflow-clip rounded-[var(--radius-2xl)]">
        {/* the HAX mark (same asset as the header), large and floating in the panel */}
        <img alt="HAX" src="/hax/v1/logo-hax-weave.svg" className="hx-cube h-[96px] w-[260.7px] max-w-none" />
      </div>
    </section>
  );
}
