"use client";
import { useEffect, useState, type CSSProperties } from "react";
import CrystalizedBall, { shapePoints } from "@/components/hax/v6/vendor/components/reactbits/CrystalizedBall";
import { PRINCIPLE_LABEL, type PrincipleId } from "@/components/hax/v1/patterns/model";
import { useMedia } from "@/components/hax/v6/fx";
import { Eyebrow, H2 } from "@/components/hax/v6/ui";

// "Five principles guide HAX" (19 Nov, from the user's mock-up: "show 5 orbs and the name of the
// principles under them"): five crystal balls in a row, one per principle in the site's blue-to-orange
// ramp; under each, its number, its name in its colour and its one line, left-aligned. Each ball is a
// live React Bits CrystalizedBall (OGL) with a light particle count. It runs only while on screen,
// stays still under reduced motion, and its particles stir under the pointer on desktops. Without
// WebGL2 a light CSS orb stands in. Desktops show all five in a row that fills the home page's one
// content column (1200 wide, the same left edge as every other section): five equal columns, each ball
// centred in its column with room around it. Phones show two to a row with smaller balls (the user's
// two-grid system), tablets three. The heading is one line (it wraps only on phones). The five arrive one after another (motion.css .h6-seq).
// Hovering a principle (or tapping it on a phone) gathers its ball's particles into the principle's
// icon, then lets them drift back: Control, sliders (people set the limits); Clarity, an eye (the
// reasoning is visible); Recovery, undo; Collaboration, people together; Traceability, footprints (a
// trail you can follow back). Icons are Lucide's, the set the site already uses.
// Colours are the Cisco Outshift logo's only, in its order read left to right (19 Nov): the burst's
// sky blue, orange, deep blue and green, then the navy of the wordmark.
type Icon = { paths: string[]; circles?: [number, number, number][] };
type Principle = { id: PrincipleId; line: string; color: string; icon: Icon };
const PRINCIPLES: Principle[] = [
  { id: "control", line: "People set an agent's boundaries, preferences, and goals; the agent adapts its autonomy to that direction.", color: "#00bceb",
    icon: { paths: ["M10 5H3", "M12 19H3", "M14 3v4", "M16 17v4", "M21 12h-9", "M21 19h-5", "M21 5h-7", "M8 10v4", "M8 12H3"] } },
  { id: "clarity", line: "Agents make their reasoning, context, and confidence visible so people can assess decisions.", color: "#ff6d2d",
    icon: { paths: ["M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"], circles: [[12, 12, 3]] } },
  { id: "recovery", line: "People can undo agent actions, correct errors, and guide a safer next attempt.", color: "#0051af",
    icon: { paths: ["M9 14 4 9l5-5", "M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"] } },
  { id: "collaboration", line: "People and agents share context, exchange input, and shape work together.", color: "#74bf4b",
    icon: { paths: ["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", "M16 3.128a4 4 0 0 1 0 7.744", "M22 21v-2a4 4 0 0 0-3-3.87"], circles: [[9, 7, 4]] } },
  { id: "traceability", line: "Agent decisions and actions stay visible, searchable, and open to review.", color: "#293247",
    icon: { paths: ["M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z", "M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z", "M16 17h4", "M4 13h4"] } },
];
const N = PRINCIPLES.length;
// parallax (Parallax.tsx): each ball rises at its own pace as the row scrolls past, for depth
const DRIFT = [-24, -12, -32, -16, -20];
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
  // the principle whose ball shows its icon (the one under the pointer, or the last one tapped)
  const [on, setOn] = useState(-1);
  const [shapes, setShapes] = useState<Float32Array[]>([]);
  useEffect(() => {
    setWebgl2(!!document.createElement("canvas").getContext("webgl2"));
    setShapes(PRINCIPLES.map((p) => shapePoints(p.icon.paths, p.icon.circles)));
  }, []);
  return (
    <section id="principles" className="px-[24px] py-[72px] md:py-[112px]">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-[32px] md:gap-[48px]">
        <div className="h6-reveal flex flex-col gap-[16px]">
          <Eyebrow>Principles</Eyebrow>
          <H2 className="[text-wrap:balance]">Five principles guide HAX</H2>
        </div>
        {/* two columns on phones, three on tablets, five on desktops */}
        <ol aria-label="Principles" className="h6-reveal h6-seq grid grid-cols-2 gap-x-[16px] gap-y-[32px] md:grid-cols-3 md:gap-x-[24px] md:gap-y-[48px] lg:grid-cols-5 lg:gap-x-[32px]">
          {PRINCIPLES.map((p, k) => (
            <li key={p.id} className="h6-step flex min-w-0 flex-col" style={{ "--i": k } as CSSProperties}
              onPointerEnter={(e) => { if (e.pointerType === "mouse") setOn(k); }} onPointerLeave={(e) => { if (e.pointerType === "mouse") setOn((v) => (v === k ? -1 : v)); }}
              onClick={() => setOn((v) => (v === k ? -1 : k))}>
              <div aria-hidden data-parallax={DRIFT[k]} className="relative mx-auto aspect-square w-[72%] max-w-[120px] md:max-w-[160px] lg:w-[76%] lg:max-w-[220px]">
                {webgl2 ? (
                  <CrystalizedBall color={p.color} theme="light" size={0.82} speed={0.8} particleShape="round" particleCount={3200} interactive={hover}
                    shape={shapes[k] ?? null} formed={on === k} />
                ) : (
                  <div className="absolute inset-[9%] rounded-full" style={orbFace(p.color)}>
                    <span className={`absolute inset-0 rounded-full transition-opacity duration-500 ${on === k ? "opacity-15" : "opacity-50"}`} style={orbSpecks(p.color)} />
                    {/* without WebGL the icon simply fades in */}
                    <svg viewBox="0 0 24 24" className={`absolute inset-[24%] transition-opacity duration-500 ${on === k ? "opacity-100" : "opacity-0"}`} fill="none" stroke={p.color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      {p.icon.paths.map((d) => <path key={d} d={d} />)}
                      {p.icon.circles?.map(([cx, cy, r]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />)}
                    </svg>
                  </div>
                )}
              </div>
              <p className="mt-[12px] font-[family-name:var(--font-mono)] text-[12px] md:mt-[16px] font-medium leading-[16px] tracking-[0.96px] text-[color:var(--text-3)]">{num(k)} / {num(N - 1)}</p>
              <h3 className="mt-[8px] font-light text-[22px] leading-[1.15] md:text-[clamp(24px,2.3vw,34px)] tracking-[-0.025em]" style={{ color: p.color }}>{PRINCIPLE_LABEL[p.id]}</h3>
              <p className="mt-[8px] text-[13px] leading-[19px] text-[color:var(--text-2)] md:mt-[10px] md:text-[15px] md:leading-[24px]">{p.line}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
