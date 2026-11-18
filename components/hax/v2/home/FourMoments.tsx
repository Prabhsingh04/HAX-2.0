import { MOMENTS } from "../../v1/home/content";
import { ArrowRight } from "../icons";

// Figma: HAX v2 · Home · Four moments 103:3431. A bento: 384 + 792 over 792 + 384, pictures 400 / 320 tall.
const LAYOUT = [
  { w: "w-[384px] shrink-0", h: 400 },
  { w: "min-w-0 flex-1", h: 400 },
  { w: "min-w-0 flex-1", h: 320 },
  { w: "w-[384px] shrink-0", h: 320 },
];
const mono = "font-[family-name:var(--font-mono)] text-[12px] font-medium uppercase leading-[16px] tracking-[0.06em] text-[color:var(--grey)]";

function Moment({ i }: { i: number }) {
  const m = MOMENTS[i], { w, h } = LAYOUT[i];
  return (
    <a href={`/v2/library?moment=${m.q}`} className={`hx2-card group flex flex-col rounded-[24px] border border-[color:var(--line)] bg-[color:var(--card)] p-[8px] ${w}`}>
      <span className="block overflow-hidden rounded-[16px]" style={{ height: h }}>
        <img alt="" src={m.img} className="hx2-zoom block size-full object-cover" />
      </span>
      <span className="flex flex-col gap-[8px] px-[16px] pb-[16px] pt-[24px]">
        <span className={`flex justify-between ${mono}`}><span>{m.n}</span><span>{m.count} patterns</span></span>
        <span className="text-[18px] font-semibold leading-[28px]">{m.title}</span>
        <span className="text-[14px] leading-[20px] text-[color:var(--grey)]">{m.body}</span>
      </span>
    </a>
  );
}

export function FourMoments() {
  return (
    <section id="patterns" className="flex flex-col gap-[48px] px-[120px] py-[96px]" data-node-id="103:3431">
      <div className="hx2-reveal flex items-end justify-between">
        <div className="flex w-[680px] flex-col gap-[16px]">
          <p className={mono}>Four moments</p>
          <h2 className="text-[48px] font-semibold leading-[48px] tracking-[-0.02em]">Every pattern belongs to<br />one of four moments</h2>
          <p className="text-[18px] leading-[28px] text-[color:var(--grey)]">The library is organised against this map so the right pattern is always one click away.</p>
        </div>
        <a href="/v2/library" className="hx2-link flex items-center gap-[8px] text-[16px] font-semibold leading-[24px]">
          All 84 patterns
          <ArrowRight className="hx2-arrow size-[16px]" strokeWidth={1.6} />
        </a>
      </div>
      <div className="flex flex-col gap-[24px]">
        <div className="hx2-reveal flex items-stretch gap-[24px]"><Moment i={0} /><Moment i={1} /></div>
        <div className="hx2-reveal flex items-stretch gap-[24px]"><Moment i={2} /><Moment i={3} /></div>
      </div>
    </section>
  );
}
