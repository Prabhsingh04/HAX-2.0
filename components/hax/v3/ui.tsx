import type { ReactNode } from "react";
import { World } from "./world/World";
import { DecodeText, RevealH2 } from "./fx";

// Shared v3 pieces, from the type and component styles on the v3 frames. No "use client" here,
// so server components can import the class strings too; the hooks run in client callers.

// The hero: the world fills it (860 tall at 1440, horizon at 580), the text sits in the sky.
export function WorldHero({ children, portal = false, nodeId, className = "" }: { children: ReactNode; portal?: boolean; nodeId?: string; className?: string }) {
  return (
    <section className={`relative h-[860px] w-full overflow-hidden bg-[var(--bg)] ${className}`} data-node-id={nodeId}>
      <World portal={portal} className="absolute inset-0" />
      <div className="relative mx-auto flex max-w-[1200px] flex-col items-center gap-[24px] px-[24px] pt-[96px] text-center">{children}</div>
    </section>
  );
}

// H1: a light first line and the one gradient line
export function H1({ line1, line2, className = "" }: { line1?: ReactNode; line2: ReactNode; className?: string }) {
  return (
    <h1 className={`h3-rise h3-rise--2 font-light text-[clamp(44px,5vw,72px)] leading-[1] tracking-[-0.03em] text-white ${className}`}>
      {line1 && <span className="block">{line1}</span>}
      <Grad className="block font-semibold leading-[1.06]">{line2}</Grad>
    </h1>
  );
}
export function Grad({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`bg-clip-text pb-[.12em] -mb-[.12em] text-transparent [-webkit-background-clip:text] ${className}`} style={{ backgroundImage: "var(--grad-text)" }}>{children}</span>;
}

// Tag · announcement / breadcrumb pill over the sky (106:8144)
export function SkyTag({ children, href }: { children: ReactNode; href?: string }) {
  const cls = "h3-rise inline-flex items-center gap-[8px] rounded-[9999px] border border-[rgba(255,255,255,.3)] bg-[rgba(255,255,255,.12)] px-[12px] py-[4px] font-[family-name:var(--font-mono)] font-medium leading-[16px] text-[12px] tracking-[0.72px] text-white uppercase whitespace-nowrap";
  return href ? <a href={href} className={`h3-btn h3-btn--glass ${cls}`}>{children}</a> : <p className={cls}>{children}</p>;
}

export function Lede({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`h3-rise h3-rise--3 font-normal leading-[28px] text-[18px] text-[rgba(255,255,255,.86)] ${className}`}>{children}</p>;
}

// Section head: mono eyebrow, light 48 heading, 18 lede (105:5878). The eyebrow decodes and the
// heading's words rise in the first time they scroll into view (fx.tsx, React Bits).
export function Eyebrow({ children, tone = "cyan" }: { children: ReactNode; tone?: "cyan" | "ice" }) {
  return <p className={`font-[family-name:var(--font-mono)] font-medium leading-[16px] text-[12px] tracking-[0.96px] uppercase ${tone === "ice" ? "text-[color:var(--ice)]" : "text-[color:var(--cyan)]"}`}>{typeof children === "string" ? <DecodeText text={children} /> : children}</p>;
}
export function H2({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <RevealH2 className={`font-light text-[clamp(36px,4vw,48px)] leading-[1] tracking-[-0.02em] text-[color:var(--text)] ${className}`}>{children}</RevealH2>;
}
export function Sub({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`leading-[28px] text-[18px] text-[color:var(--text-2)] ${className}`}>{children}</p>;
}

// Mono tag (Tag · 12 patterns 106:7423)
export function Tag({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`inline-flex rounded-[6px] border border-[var(--edge-2)] bg-[rgba(255,255,255,.08)] px-[8px] py-[2px] font-[family-name:var(--font-mono)] leading-[20px] text-[13px] text-[color:var(--text-soft)] whitespace-nowrap ${className}`}>{children}</span>;
}

// Horizon rule between Home sections (105:5949)
export function HorizonRule() {
  return (
    <div aria-hidden className="h3-reveal h3-rule mx-auto h-px w-full max-w-[1200px]"
      style={{ backgroundImage: "linear-gradient(90deg, rgba(0,188,235,0) 0%, rgba(0,188,235,.55) 30%, rgba(181,233,248,.55) 50%, rgba(255,109,45,.55) 70%, rgba(255,109,45,0) 100%)" }} />
  );
}

export const btn = "h3-btn inline-flex items-center gap-[8px] rounded-[8px] px-[12px] py-[8px] font-semibold leading-[24px] text-[16px] whitespace-nowrap";
