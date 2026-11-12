import { MOMENTS } from "@/components/hax/v1/home/content";
import { Eyebrow, H2, Sub, Tag } from "../ui";

// Figma: Four moments 105:6124. Copy and counts are v1's shared Home copy; the visuals are v3's
// own (same moments, framed for the dark page) at the sizes on the frame.
const SIZE = [[330, 360], [656, 349], [656, 276], [418, 360]];

export function FourMoments() {
  return (
    <section id="patterns" className="px-[24px] py-[96px]" data-node-id="105:6124">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-[48px]">
        <div className="h3-reveal flex flex-wrap items-end justify-between gap-[24px]">
          <div className="flex max-w-[680px] flex-col gap-[16px]">
            <Eyebrow>Four moments</Eyebrow>
            <H2>Every pattern belongs to<br />one of four moments</H2>
            <Sub>The library is organised against this map so the right pattern is always one click away.</Sub>
          </div>
          <a href="/v3/library" className="flex items-center gap-[8px] font-semibold leading-[20px] text-[14px] text-[color:var(--cyan)]">
            <span className="h3-link">All 84 patterns</span>
            <img alt="" src="/hax/v3/icon-right-16-cyan.svg" className="h3-arrow size-[16px]" />
          </a>
        </div>
        <ul className="border-t border-[var(--edge)]">
          {MOMENTS.map((m, i) => (
            <li key={m.n} className="h3-reveal border-b border-[var(--edge)]">
              <a href={`/v3/library?moment=${m.q}`} className="group flex flex-wrap items-center justify-between gap-[32px] py-[40px]">
                <div className="flex w-[420px] max-w-full flex-col items-start gap-[12px]">
                  <p className="font-extralight leading-[72px] text-[72px] tracking-[-2.16px] text-[rgba(255,255,255,.4)] transition-colors duration-300 group-hover:text-[rgba(255,255,255,.7)]">{m.n}</p>
                  <h3 className="font-light leading-[36px] text-[30px] tracking-[-0.3px] text-[color:var(--text)] transition-colors group-hover:text-white">{m.title}</h3>
                  <p className="leading-[24px] text-[16px] text-[rgba(255,255,255,.72)]">{m.body}</p>
                  <Tag className="gap-[6px] transition-colors group-hover:border-[var(--edge-3)] group-hover:text-white">
                    {m.count} patterns
                    <img alt="" src="/hax/v3/icon-right-14-cyan.svg" className="h3-arrow size-[14px] self-center opacity-0 transition-opacity group-hover:opacity-100" />
                  </Tag>
                </div>
                <img alt={`${m.title} patterns, example`} src={`/hax/v3/moment-${i + 1}.png`} loading="lazy"
                  className="block max-w-full rounded-[16px] border border-[var(--edge)] object-cover transition-[border-color] duration-300 group-hover:border-[var(--edge-3)]"
                  style={{ width: SIZE[i][0], aspectRatio: `${SIZE[i][0]} / ${SIZE[i][1]}` }} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
