import { FAMILIES, COMPS } from "../library/catalog";
import { FamilyArt } from "./FamilyArt";

// Figma: Four moments 98:19721, now the eight component families. Each card carries an
// illustration of what the family does (FamilyArt) and opens that family's section.
const pad = (n: number) => String(n).padStart(2, "0");

export function Families() {
  return (
    <section id="patterns" data-hx-blob-o="0.72" className="flex flex-col gap-[28px] items-center px-[114px] py-[96px] relative w-full" data-node-id="98:19721">
      <h2 className="hx-reveal font-extralight leading-[60px] text-[50px] text-center whitespace-nowrap">
        Every component sits in one of{" "}
        <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg, rgb(217, 119, 6) 0%, rgb(217, 119, 6) 68.644%, rgb(225, 29, 72) 87.458%, rgb(190, 24, 93) 100%)" }}>
          eight families
        </span>
      </h2>
      <p className="leading-[26px] text-[16px] text-[color:var(--text-secondary)] text-center whitespace-nowrap">
        Each family is one job the interface does between a person and an agent, so the right component is always one click away.
      </p>
      <a href="/library" className="hx-btn hx-btn--grad hx-btn--sm flex gap-[6px] h-[32px] items-center px-[12px] rounded-[var(--radius-pill)] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] font-semibold leading-[18px] text-[13px] tracking-[0.07px] whitespace-nowrap">
        <img alt="" src="/hax/v1/icon-arrow-right-14.svg" className="hx-arrow size-[14px]" />
        All {COMPS.length} components
      </a>
      <div className="hx-reveal grid grid-cols-4 gap-[16px] pt-[20px] w-[1212px]">
        {FAMILIES.map((f, i) => (
          <a key={f.id} href={`/library#${f.id}`}
            className="hx-card group bg-[var(--surface-tint)] border border-[var(--stroke-subtle)] flex flex-col overflow-clip rounded-[var(--radius-xl)]">
            <FamilyArt id={f.id} />
            <div className="flex flex-1 flex-col gap-[8px] items-start px-[20px] pt-[16px] pb-[20px]">
              <p className="font-semibold leading-[16px] text-[11px] text-[color:var(--text-secondary)] tracking-[1.2px] uppercase">{pad(i + 1)}</p>
              <h3 className="font-semibold leading-[28px] text-[20px]">{f.name}</h3>
              <p className="leading-[22px] text-[14px] text-[color:var(--text-secondary)]">{f.job}</p>
              <span className="mt-auto pt-[6px] flex">
                <span className="hx-btn hx-btn--outline hx-btn--sm bg-[var(--surface-page)] border border-[var(--stroke-default)] flex gap-[6px] h-[32px] items-center px-[12px] rounded-[var(--radius-pill)] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] font-semibold leading-[18px] text-[13px] tracking-[0.07px] whitespace-nowrap">
                  {f.comps.length} components
                  <img alt="" src="/hax/v1/icon-arrow-right-14.svg" className="hx-arrow size-[14px]" />
                </span>
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
