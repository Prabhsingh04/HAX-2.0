import { MOMENTS } from "./content";

// Figma: Four moments 98:19721. Image heights, and which cards take the wide column.
const LAYOUT = [
  { h: 351, wide: false },
  { h: 384, wide: true },
  { h: 304, wide: true },
  { h: 277, wide: false },
];

function Moment({ m, i }: { m: (typeof MOMENTS)[number]; i: number }) {
  const { h, wide } = LAYOUT[i];
  return (
    <a href={`/library?moment=${m.q}`}
      className={`hx-card group bg-[var(--surface-tint)] border border-[var(--stroke-subtle)] flex flex-col gap-[8px] items-start overflow-clip px-[22px] py-[20px] rounded-[var(--radius-xl)] self-stretch ${wide ? "flex-1 min-w-px" : "shrink-0 w-[368px]"}`}>
      <img alt="" src={m.img} className="block w-full object-cover rounded-[12px]" style={{ height: h }} />
      <p className="font-semibold leading-[16px] text-[11px] text-[color:var(--text-secondary)] tracking-[1.2px] uppercase">{m.n}</p>
      <h3 className="font-semibold leading-[28px] text-[20px]">{m.title}</h3>
      <p className="leading-[22px] text-[14px] text-[color:var(--text-secondary)] w-full">{m.body}</p>
      <span className="pt-[6px] flex">
        <span className="hx-btn hx-btn--outline hx-btn--sm bg-[var(--surface-page)] border border-[var(--stroke-default)] flex gap-[6px] h-[32px] items-center px-[12px] rounded-[var(--radius-pill)] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] font-semibold leading-[18px] text-[13px] tracking-[0.07px] whitespace-nowrap">
          {m.count} patterns
          <img alt="" src="/hax/v1/icon-arrow-right-14.svg" className="hx-arrow size-[14px]" />
        </span>
      </span>
    </a>
  );
}

export function FourMoments() {
  return (
    <section id="patterns" data-hx-blob-o="0.72" className="flex flex-col gap-[28px] items-center px-[144px] py-[96px] relative w-full" data-node-id="98:19721">
      <h2 className="hx-reveal font-extralight leading-[60px] text-[50px] text-center whitespace-nowrap">
        Every pattern belongs to one of{" "}
        <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg, rgb(217, 119, 6) 0%, rgb(217, 119, 6) 68.644%, rgb(225, 29, 72) 87.458%, rgb(190, 24, 93) 100%)" }}>
          four moments
        </span>
      </h2>
      <p className="leading-[26px] text-[16px] text-[color:var(--text-secondary)] text-center whitespace-nowrap">
        The library is organised against this map so the right pattern is always one click away.
      </p>
      <a href="/library" className="hx-btn hx-btn--grad hx-btn--sm flex gap-[6px] h-[32px] items-center px-[12px] rounded-[var(--radius-pill)] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] font-semibold leading-[18px] text-[13px] tracking-[0.07px] whitespace-nowrap">
        <img alt="" src="/hax/v1/icon-arrow-right-14.svg" className="hx-arrow size-[14px]" />
        All 84 patterns
      </a>
      <div className="hx-reveal flex flex-col gap-[16px] items-start pt-[20px] w-[1152px]">
        <div className="flex gap-[16px] items-start w-full">
          <Moment m={MOMENTS[0]} i={0} />
          <Moment m={MOMENTS[1]} i={1} />
        </div>
        <div className="flex gap-[16px] items-start w-full">
          <Moment m={MOMENTS[2]} i={2} />
          <Moment m={MOMENTS[3]} i={3} />
        </div>
      </div>
    </section>
  );
}
