import { Weave } from "../Weave";
import { ArrowUpRight } from "../icons";

// Figma: HAX v2 · Home · Built by 103:3619. The developer at work is Figma's lit picture (103:3637), exported as is.
const SHIFT = { x: -20, y: -2 }, FADE = { top: 140, bottom: 200 };
const GRAD = "linear-gradient(90deg, #0051af 0%, #0a6bd6 30%, #00bceb 55%, #ff8a50 80%, #ff6d2d 100%)";

export function BuiltBy() {
  return (
    <section className="relative h-[618px] px-[120px] pt-[96px]" data-node-id="103:3619">
      <Weave row0={60} opacity={0.28} shift={SHIFT} fade={FADE} />
      <img alt="" aria-hidden src="/hax/v2/built-by-developer-lit.svg" className="hx2-reveal pointer-events-none absolute left-[816px] top-[213px] h-[192px] w-[440px] max-w-none" />
      <div className="hx2-reveal relative flex w-[520px] flex-col gap-[24px] rounded-[24px] border border-[color:var(--line)] bg-[color:var(--card)] p-[40px]">
        <h2 className="text-[48px] font-semibold leading-[48px] tracking-[-0.02em]">
          Built by people<br />who design<br />
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: GRAD }}>agentic</span> products
        </h2>
        <p className="text-[18px] leading-[28px] text-[color:var(--grey)]">
          Outshift Design works with teams building AI-native software on the human–agent experience. HAX is a public artifact of that practice — open to use, free to adapt, and updated as the practice evolves.
        </p>
        <a href="https://outshift.cisco.com" target="_blank" rel="noreferrer" className="hx2-btn hx2-btn--dark flex w-fit items-center gap-[8px] rounded-[8px] bg-[color:var(--btn)] py-[8px] pl-[16px] pr-[12px] text-[16px] font-semibold leading-[24px] text-white">
          Explore Outshift
          <ArrowUpRight className="size-[16px]" strokeWidth={1.6} />
        </a>
      </div>
    </section>
  );
}
