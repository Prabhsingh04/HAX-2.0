// Figma: Built by 98:19879
export function BuiltBy() {
  return (
    <section className="flex gap-[64px] items-center px-[144px] py-[96px] relative w-full" data-node-id="98:19879">
      <div className="hx-reveal relative flex flex-col gap-[20px] items-start shrink-0 w-[500px]">
        <h2 className="font-semibold leading-[36px] text-[29px] tracking-[-0.2px] w-[500px]">
          Built by people who design{" "}
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg, rgb(217, 119, 6) 0%, rgb(217, 119, 6) 74.4%, rgb(225, 29, 72) 89.76%, rgb(190, 24, 93) 100%)" }}>agentic</span>{" "}
          products
        </h2>
        <p className="leading-[22px] text-[14px] text-[color:var(--text-secondary)] w-[480px]">
          Outshift Design works with teams building AI-native software on the human-agent experience. HAX is a public artifact of that practice — open to use, free to adapt, and updated as the practice evolves.
        </p>
        <a href="https://outshift.cisco.com" target="_blank" rel="noreferrer" className="hx-btn hx-btn--grad flex gap-[6px] h-[36px] items-center px-[16px] rounded-[var(--radius-pill)] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] font-semibold leading-[20px] text-[14px] tracking-[0.07px] whitespace-nowrap">
          Explore Outshift
          <img alt="" src="/hax/v1/icon-arrow-up-right-ink.svg" className="hx-arrow size-[16px]" />
        </a>
      </div>
      <div className="hx-reveal relative bg-[var(--surface-accent-subtle)] flex flex-1 h-[220px] items-center justify-center min-w-px overflow-clip rounded-[var(--radius-2xl)]">
        {/* the HAX mark (same asset as the header), large and floating in the panel */}
        <img alt="HAX" src="/hax/v1/logo-hax-weave.svg" className="hx-cube h-[96px] w-[260.7px] max-w-none" />
      </div>
    </section>
  );
}
