import type { ReactNode } from "react";
import { World } from "./world/World";
import { DecodeText, RevealH2 } from "./fx";

// Shared v6 pieces: v3's type and component styles, on white. No "use client" here, so server
// components can import the class strings too; the hooks run in client callers.

// A page hero: the world fills it (860 tall at 1440; the floor starts at 580), the text sits in the sky.
export function WorldHero({ children, nodeId, className = "" }: { children: ReactNode; nodeId?: string; className?: string }) {
  return (
    <section className={`relative h-[860px] w-full overflow-hidden bg-[var(--bg)] max-md:h-[720px] ${className}`} data-node-id={nodeId}>
      <World className="absolute inset-0" />
      <div className="relative mx-auto flex max-w-[1200px] flex-col items-center gap-[24px] px-[24px] pt-[132px] text-center">{children}</div>
    </section>
  );
}

// H1: a light first line and a semibold second line in the gradient
export function H1({ line1, line2, className = "" }: { line1?: ReactNode; line2: ReactNode; className?: string }) {
  return (
    <h1 className={`h6-rise h6-rise--2 font-light text-[clamp(40px,5vw,72px)] leading-[1.02] tracking-[-0.03em] text-[color:var(--text)] [text-wrap:balance] ${className}`}>
      {line1 && <span className="block">{line1}</span>}
      <Grad className="block font-semibold leading-[1.06]">{line2}</Grad>
    </h1>
  );
}
export function Grad({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`bg-clip-text pb-[.12em] -mb-[.12em] text-transparent [-webkit-background-clip:text] ${className}`} style={{ backgroundImage: "var(--grad-text)" }}>{children}</span>;
}

// Tag · announcement / breadcrumb pill over the sky (v3 106:8144), frosted white
export function SkyTag({ children, href }: { children: ReactNode; href?: string }) {
  const cls = "h6-rise inline-flex items-center gap-[8px] rounded-[9999px] border border-[var(--edge-2)] bg-[rgba(255,255,255,.72)] px-[12px] py-[4px] font-[family-name:var(--font-mono)] font-medium leading-[16px] text-[12px] tracking-[0.72px] text-[color:var(--text)] uppercase whitespace-nowrap backdrop-blur-[8px]";
  return href ? <a href={href} className={`h6-btn h6-btn--glass ${cls}`}>{children}</a> : <p className={cls}>{children}</p>;
}

export function Lede({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`h6-rise h6-rise--3 font-normal leading-[28px] text-[18px] text-[color:var(--text-2)] [text-wrap:balance] max-md:text-[16px] max-md:leading-[26px] ${className}`}>{children}</p>;
}

// Section head: mono eyebrow, light 48 heading, 18 lede (v3 105:5878). The eyebrow decodes and the
// heading's words rise in the first time they scroll into view (fx.tsx, React Bits).
export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="font-[family-name:var(--font-mono)] font-medium leading-[16px] text-[12px] tracking-[0.96px] uppercase text-[color:var(--link)]">{typeof children === "string" ? <DecodeText text={children} /> : children}</p>;
}
export function H2({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <RevealH2 className={`font-light text-[clamp(34px,4vw,48px)] leading-[1.04] tracking-[-0.02em] text-[color:var(--text)] ${className}`}>{children}</RevealH2>;
}
export function Sub({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`leading-[28px] text-[18px] text-[color:var(--text-2)] max-md:text-[16px] max-md:leading-[24px] ${className}`}>{children}</p>;
}

// Mono tag (v3 Tag · 12 patterns 106:7423)
export function Tag({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`inline-flex rounded-[6px] border border-[var(--edge-2)] bg-[rgba(15,17,23,.03)] px-[8px] py-[2px] font-[family-name:var(--font-mono)] leading-[20px] text-[13px] text-[color:var(--text-soft)] whitespace-nowrap ${className}`}>{children}</span>;
}

// Text link with a right arrow, in the person's blue
export function MoreLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="flex items-center gap-[8px] font-semibold leading-[20px] text-[14px] text-[color:var(--link)]">
      <span className="h6-link">{children}</span>
      <svg viewBox="0 0 16 16" aria-hidden className="h6-arrow size-[16px]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
    </a>
  );
}

export const btn = "h6-btn inline-flex items-center gap-[8px] rounded-[8px] px-[12px] py-[8px] font-semibold leading-[24px] text-[16px] whitespace-nowrap";
