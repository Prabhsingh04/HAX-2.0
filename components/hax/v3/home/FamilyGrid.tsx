"use client";
import type { CSSProperties } from "react";
import MagicBento, { type MagicBentoItem } from "@/components/reactbits/MagicBento";
import CountUp from "@/components/reactbits/CountUp";
import { FAMILIES } from "../../v1/library/catalog";
import { FamilyArt } from "../../v1/home/FamilyArt";
import { useMedia } from "../fx";

// The eight families as a magic bento (React Bits MagicBento, tablets and up): a cursor spotlight,
// edges that catch it, drifting stars, a slight tilt and a ripple on click. Wide cards put the
// picture beside the words, narrow ones above. Each card shows v1's picture of what the family does
// (FamilyArt, v1's dark theme) and counts its components up. Phones get a plain two-by-two grid.
const SPAN = [2, 1, 1, 1, 1, 2, 2, 2]; // three full rows of four
const pad = (n: number) => String(n).padStart(2, "0");
type Fam = (typeof FAMILIES)[number];

function Words({ f, i }: { f: Fam; i: number }) {
  return (
    <div className="flex min-w-0 flex-col items-start gap-[6px] md:gap-[8px]">
      <p className="font-[family-name:var(--font-mono)] leading-[16px] text-[12px] tracking-[0.96px] text-[color:var(--text-3)]">{pad(i + 1)}</p>
      <h3 className="font-semibold leading-[20px] text-[15px] text-[color:var(--text)] md:leading-[28px] md:text-[20px]">{f.name}</h3>
      <p className="line-clamp-3 leading-[17px] text-[12px] text-[color:var(--text-2)] md:line-clamp-2 md:leading-[22px] md:text-[14px]">{f.job}</p>
      <span className="inline-flex items-center gap-[6px] pt-[4px] font-semibold leading-[18px] text-[13px] text-[color:var(--cyan)]">
        <CountUp to={f.comps.length} duration={1.2} />
        <span>components</span>
        <img alt="" src="/hax/v3/icon-right-14-cyan.svg" className="h3-arrow size-[14px]" />
      </span>
    </div>
  );
}

const Art = ({ id }: { id: string }) => (
  <div className="hax-v1 overflow-hidden rounded-[12px] border border-[var(--edge)]"><FamilyArt id={id} /></div>
);

export function FamilyGrid() {
  const wide = useMedia("(min-width: 768px)");
  const xl = useMedia("(min-width: 1280px)");
  if (!wide) {
    return (
      <div className="grid grid-cols-2 gap-[12px]">
        {FAMILIES.map((f, i) => (
          <a key={f.id} href={`/v3/library#${f.id}`} className="h3-card flex flex-col overflow-hidden rounded-[20px] border border-[var(--edge)] bg-[var(--panel)]">
            <div className="hax-v1"><FamilyArt id={f.id} /></div>
            <div className="p-[14px]"><Words f={f} i={i} /></div>
          </a>
        ))}
      </div>
    );
  }
  const items: MagicBentoItem[] = FAMILIES.map((f, i) => ({
    id: f.id,
    href: `/v3/library#${f.id}`,
    colSpan: SPAN[i],
    content: SPAN[i] === 2
      ? <div className="grid h-full grid-cols-2 items-center gap-[24px]"><Words f={f} i={i} /><Art id={f.id} /></div>
      : <div className="flex h-full flex-col justify-between gap-[14px]"><Art id={f.id} /><Words f={f} i={i} /></div>,
  }));
  return (
    // hover light in the Neural Expressive AI gradient, softened: the spotlight and stars in a muted
    // violet, and a soft blue to violet to pink edge that lights on hover (motion.css
    // .magic-bento__card::after)
    <MagicBento items={items} columns={4} rowHeight={xl ? 330 : 390} gap={16} radius={20} theme="dark" glowColor="#8a7cc4"
      enableStars particleCount={12} enableTilt clickEffect spotlightRadius={300} textAutoHide={false}
      style={{ "--mb-surface": "linear-gradient(180deg, #1b202a 0%, #12151c 100%)", "--mb-ink": "var(--text)", "--mb-muted": "var(--text-2)" } as CSSProperties} />
  );
}
