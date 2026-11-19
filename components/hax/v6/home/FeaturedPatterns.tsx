"use client";
import type { CSSProperties, ReactNode } from "react";
import MagicBento, { type MagicBentoItem } from "@/components/reactbits/MagicBento";
import { LIBRARY } from "../../v1/library112/library";
import { Eyebrow, H2, MoreLink } from "../ui";
import { useMedia } from "../fx";

// v1's "The pattern library" (v5: four featured patterns in place of the eight component families,
// Srishti 14 Nov; her picks, names, summaries and previews from her Studio v3 home), in v3's magic
// bento (React Bits MagicBento, light, tablets and up): a cursor spotlight, edges that catch it in the
// person-to-agent gradient (motion.css), drifting stars, a slight tilt and a ripple on click. Each
// card opens the pattern's page; phones get plain cards.
const mock = "w-full max-w-[250px] rounded-[12px] border border-[var(--edge)] bg-white p-[14px] text-left shadow-[0_6px_18px_rgba(41,50,71,.08)]";
const chip = "rounded-[6px] border border-[var(--edge-2)] px-[7px] py-[3px] text-[11px] leading-[14px] text-[color:var(--text)]";
const small = "text-[12px] leading-[17px] text-[color:var(--text-2)]";
const over = "font-semibold text-[10px] leading-[14px] tracking-[1.2px] uppercase text-[color:var(--text-3)]";

const FEATURED: { id: string; name: string; summary: string; preview: ReactNode }[] = [
  {
    id: "nx-disclosure", name: "Disclosure",
    summary: "Make it clear when a person is interacting with AI and what that means for the result.",
    preview: (
      <div className={mock}>
        <div className="flex items-center gap-[8px]">
          <span className="size-[8px] rounded-full bg-[var(--agent)]" />
          <strong className="text-[13px] leading-[18px]">Atlas assistant</strong>
          <span className="rounded-[4px] bg-[rgba(15,17,23,.05)] px-[5px] py-px font-semibold text-[10px] leading-[14px] text-[color:var(--text-2)]">AI</span>
        </div>
        <p className={`mt-[8px] ${small}`}>I can help summarize this report. Check the source before using the answer.</p>
      </div>
    ),
  },
  {
    id: "pre-action-handshake", name: "Pre-Action Handshake",
    summary: "Show the action and its consequences before the agent commits to a consequential step.",
    preview: (
      <div className={mock}>
        <p className={over}>Proposed action</p>
        <strong className="mt-[6px] block text-[13px] leading-[18px]">Publish the update?</strong>
        <p className={`mt-[2px] ${small}`}>This will notify 24 team members.</p>
        <div className="mt-[10px] flex gap-[6px]">
          <span className={chip}>Review changes</span>
          <span className="rounded-[6px] bg-[var(--text)] px-[8px] py-[3px] font-semibold text-[11px] leading-[14px] text-white">Approve</span>
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
          <span className={`${chip} flex items-center gap-[6px]`}><span className="size-[6px] rounded-full bg-[var(--human)]" />Triage agent · Roll back</span>
          <span className={`${chip} flex items-center gap-[6px]`}><span className="size-[6px] rounded-full bg-[var(--agent)]" />Monitor agent · Hold restart</span>
        </div>
        <strong className="mt-[10px] block text-[13px] leading-[18px]">One recovery decision</strong>
        <p className={`mt-[2px] ${small}`}>Review the recommendation and trade-offs together.</p>
      </div>
    ),
  },
  {
    id: "agent-memory", name: "Memory",
    summary: "Let a person see and change what the agent carries into future work.",
    preview: (
      <div className={mock}>
        <p className={over}>Your saved context</p>
        <strong className="mt-[6px] block text-[13px] leading-[18px]">Use concise summaries</strong>
        <p className={`mt-[2px] ${small}`}>Used in future reports</p>
        <p className="mt-[8px] text-[12px] leading-[17px] text-[color:var(--link)]">Edit · Forget</p>
      </div>
    ),
  },
];
const href = (id: string) => `/v6/interaction-patterns/${id}`;
const pad = (n: number) => String(n).padStart(2, "0");

// compact (phones, two to a row): no preview (too small to read at ~165px), smaller type
function Card({ f, i, compact = false }: { f: (typeof FEATURED)[number]; i: number; compact?: boolean }) {
  return (
    <div className={`flex h-full flex-col ${compact ? "gap-[6px]" : "gap-[16px]"}`}>
      {!compact && <div aria-hidden className="flex h-[172px] shrink-0 items-center justify-center rounded-[12px] border border-[var(--edge)] bg-[var(--panel)] px-[16px]">{f.preview}</div>}
      <div className="flex flex-1 flex-col items-start gap-[6px]">
        <p className="font-[family-name:var(--font-mono)] leading-[16px] text-[12px] tracking-[0.96px] text-[color:var(--text-3)]">{pad(i + 1)}{compact ? "" : " / Featured pattern"}</p>
        <h3 className={`font-semibold text-[color:var(--text)] ${compact ? "line-clamp-2 min-h-[40px] break-words leading-[20px] text-[15px]" : "leading-[28px] text-[20px]"}`}>{f.name}</h3>
        <p className={`text-[color:var(--text-2)] ${compact ? "line-clamp-3 leading-[19px] text-[13px]" : "leading-[21px] text-[14px]"}`}>{f.summary}</p>
        <span className="mt-auto inline-flex items-center gap-[6px] pt-[6px] font-semibold leading-[18px] text-[13px] text-[color:var(--link)]">
          Open pattern
          <svg viewBox="0 0 14 14" aria-hidden className="h6-arrow size-[14px]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7h9M8 3.5 11.5 7 8 10.5" /></svg>
        </span>
      </div>
    </div>
  );
}

export function FeaturedPatterns() {
  const wide = useMedia("(min-width: 768px)");
  const xl = useMedia("(min-width: 1280px)");
  const items: MagicBentoItem[] = FEATURED.map((f, i) => ({ id: f.id, href: href(f.id), colSpan: 1, content: <Card f={f} i={i} /> }));
  return (
    <section id="patterns" className="px-[24px] py-[64px] md:py-[96px]">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-[32px] md:gap-[48px]">
        <div className="h6-reveal flex flex-wrap items-end justify-between gap-[24px]">
          <div className="flex max-w-[680px] flex-col gap-[16px]">
            <Eyebrow>Pattern library</Eyebrow>
            <H2>The pattern library</H2>
          </div>
          <MoreLink href="/v6/patterns">Browse all {LIBRARY.length} patterns</MoreLink>
        </div>
        {wide ? (
          <MagicBento items={items} columns={xl ? 4 : 2} rowHeight={430} gap={16} radius={20} theme="light" glowColor="#5aa9e6"
            enableStars particleCount={8} enableTilt clickEffect spotlightRadius={300} textAutoHide={false}
            style={{ "--mb-surface": "linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)", "--mb-ink": "var(--text)", "--mb-muted": "var(--text-2)", "--mb-pad": "16px" } as CSSProperties} />
        ) : (
          <div className="grid grid-cols-2 gap-[10px]">
            {FEATURED.map((f, i) => (
              <a key={f.id} href={href(f.id)} className="h6-card rounded-[16px] border border-[var(--edge)] bg-white p-[14px]"><Card f={f} i={i} compact /></a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
