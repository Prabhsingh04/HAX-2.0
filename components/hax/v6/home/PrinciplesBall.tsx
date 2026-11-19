"use client";
import { useEffect, useState, type CSSProperties } from "react";
import CrystalizedBall from "@/components/reactbits/CrystalizedBall";
import { PRINCIPLE_LABEL, type PrincipleId } from "../../v1/patterns/model";
import { useMedia } from "../fx";
import { Eyebrow, H2 } from "../ui";

// "Five principles guide HAX" (19 Nov, from the user's mock-up: "show 5 orbs and the name of the
// principles under them"): five crystal balls in a row, one per principle in the site's blue-to-orange
// ramp; under each, its number, its name in its colour and its one line, left-aligned. Each ball is a
// live React Bits CrystalizedBall (OGL) with a light particle count. It runs only while on screen,
// stays still under reduced motion, and its particles stir under the pointer on desktops. Without
// WebGL2 a light CSS orb stands in. Desktops show all five in a row that fills the home page's one
// content column (1200 wide, the same left edge as every other section): five equal columns, each ball
// centred in its column with room around it. Phones and tablets swipe through them. The heading is one
// line (it wraps only on phones). The five arrive one after another (motion.css .h6-seq).
type Principle = { id: PrincipleId; line: string; color: string };
const PRINCIPLES: Principle[] = [
  { id: "control", line: "People set an agent's boundaries, preferences, and goals; the agent adapts its autonomy to that direction.", color: "#0a63c9" },
  { id: "clarity", line: "Agents make their reasoning, context, and confidence visible so people can assess decisions.", color: "#4259cf" },
  { id: "recovery", line: "People can undo agent actions, correct errors, and guide a safer next attempt.", color: "#7a4fd6" },
  { id: "collaboration", line: "People and agents share context, exchange input, and shape work together.", color: "#af5278" },
  { id: "traceability", line: "Agent decisions and actions stay visible, searchable, and open to review.", color: "#e4561a" },
];
const N = PRINCIPLES.length;
const num = (k: number) => String(k + 1).padStart(2, "0");

// without WebGL2: a light CSS orb (a bright rim, a haze inside, specks, a highlight)
const orbFace = (c: string): CSSProperties => ({
  background: [
    "radial-gradient(circle at 35% 30%, rgba(255,255,255,.95) 0%, rgba(255,255,255,0) 17%)",
    `radial-gradient(circle, ${c}00 54%, ${c}d9 63%, ${c}66 67%, ${c}00 71%)`,
    `radial-gradient(circle at 50% 58%, ${c}47 0%, ${c}1a 42%, ${c}00 62%)`,
  ].join(","),
});
const orbSpecks = (c: string): CSSProperties => ({
  backgroundImage: `radial-gradient(${c} 0.9px, transparent 1.4px)`,
  backgroundSize: "6px 6px",
  maskImage: "radial-gradient(circle at 50% 56%, #000 0%, #000 34%, transparent 60%)",
  WebkitMaskImage: "radial-gradient(circle at 50% 56%, #000 0%, #000 34%, transparent 60%)",
});

export function PrinciplesBall() {
  const [webgl2, setWebgl2] = useState(true);
  const hover = useMedia("(hover: hover) and (pointer: fine)");
  useEffect(() => { setWebgl2(!!document.createElement("canvas").getContext("webgl2")); }, []);
  return (
    <section id="principles" className="px-[24px] py-[72px] md:py-[112px]">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-[32px] md:gap-[48px]">
        <div className="h6-reveal flex flex-col gap-[16px]">
          <Eyebrow>Principles</Eyebrow>
          <H2 className="[text-wrap:balance]">Five principles guide HAX</H2>
        </div>
        {/* below lg a swipe row that runs to the screen's edges (one and a half on phones); from lg, five
            equal columns across the content column */}
        <ol aria-label="Principles" className="h6-reveal h6-seq -mx-[24px] flex snap-x snap-mandatory scroll-px-[24px] gap-[24px] overflow-x-auto px-[24px] pb-[8px] [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-5 lg:gap-[32px] lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden">
          {PRINCIPLES.map((p, k) => (
            <li key={p.id} className="h6-step flex w-[68%] shrink-0 snap-start flex-col sm:w-[38%] lg:w-auto" style={{ "--i": k } as CSSProperties}>
              <div aria-hidden className="relative mx-auto aspect-square w-[76%] max-w-[220px]">
                {webgl2 ? (
                  <CrystalizedBall color={p.color} theme="light" size={0.82} speed={0.8} particleShape="round" particleCount={3200} interactive={hover} />
                ) : (
                  <div className="absolute inset-[9%] rounded-full" style={orbFace(p.color)}>
                    <span className="absolute inset-0 rounded-full opacity-50" style={orbSpecks(p.color)} />
                  </div>
                )}
              </div>
              <p className="mt-[16px] font-[family-name:var(--font-mono)] text-[12px] font-medium leading-[16px] tracking-[0.96px] text-[color:var(--text-3)]">{num(k)} / {num(N - 1)}</p>
              <h3 className="mt-[8px] font-light text-[clamp(24px,2.3vw,34px)] leading-[1.15] tracking-[-0.025em]" style={{ color: p.color }}>{PRINCIPLE_LABEL[p.id]}</h3>
              <p className="mt-[10px] text-[15px] leading-[24px] text-[color:var(--text-2)]">{p.line}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
