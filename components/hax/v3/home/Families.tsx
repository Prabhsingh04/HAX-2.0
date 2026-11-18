import "../../v1/tokens.css";
import { COMPS } from "../../v1/library/catalog";
import { Eyebrow, H2, Sub } from "../ui";
import { FamilyGrid } from "./FamilyGrid";

// v1's latest Home section (Families.tsx): the 51 components in their eight families, each card with
// v1's picture of what the family does (FamilyArt, in v1's dark theme; v1's tokens are scoped to
// .hax-v1, so they only reach the pictures). In v3 the cards are a magic bento (FamilyGrid).
export function Families() {
  return (
    <section id="patterns" className="px-[24px] py-[64px] md:py-[96px]">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-[32px] md:gap-[48px]">
        <div className="h3-reveal flex flex-wrap items-end justify-between gap-[24px]">
          <div className="flex max-w-[680px] flex-col gap-[16px]">
            <Eyebrow>Eight families</Eyebrow>
            <H2>Every component sits in<br />one of eight families</H2>
            <Sub className="max-md:text-[16px] max-md:leading-[24px]">Each family is one job the interface does between a person and an agent, so the right component is always one click away.</Sub>
          </div>
          <a href="/v3/library" className="flex items-center gap-[8px] font-semibold leading-[20px] text-[14px] text-[color:var(--cyan)]">
            <span className="h3-link">All {COMPS.length} components</span>
            <img alt="" src="/hax/v3/icon-right-16-cyan.svg" className="h3-arrow size-[16px]" />
          </a>
        </div>
        <FamilyGrid />
      </div>
    </section>
  );
}
