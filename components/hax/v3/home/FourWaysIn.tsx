"use client";
import { ArrowRight } from "lucide-react";
import SwarmCursor from "@/components/reactbits/SwarmCursor";
import { Eyebrow, H2, Sub } from "../ui";
import { useMedia } from "../fx";

// Figma: Two ways in 105:6092, now four: HAX Studio v2's four audiences, as the familiar big link list
// (one row per role, hairlines between): index, the role, one line, and a round arrow. One row is one
// link. The one distinctive touch is the swarm (React Bits SwarmCursor, extended with `forms`, one
// colour): it gathers round the cursor as you enter the section, and on whichever row you're on it
// settles into that role's picture at the row's right end (Lucide's pen tool, sparkles, braces and
// bot), moving from row to row with you. Tablets and up; phones get the plain rows.
type Shape = "pen" | "spark" | "code" | "bot";
type Way = { id: string; shape: Shape; title: string; line: string; cta: [string, string] };
const WAYS: Way[] = [
  { id: "designers", shape: "pen", title: "For designers", line: "Design the interaction, not just the screen", cta: ["Browse components", "/v3/library"] },
  { id: "pms", shape: "spark", title: "For PMs", line: "Decide where agents can act alone", cta: ["Read the PM guide", "/v3/hax-docs#product-managers"] },
  { id: "engineers", shape: "code", title: "For engineers", line: "Build exchanges with known replies", cta: ["Read the docs", "/v3/hax-docs#install"] },
  { id: "agents", shape: "bot", title: "For agents", line: "Look up a pattern when the task calls for one", cta: ["Set up MCP", "/v3/mcp"] },
];
const INK = "#8fd3ee"; // the swarm's one colour
const pad = (n: number) => String(n).padStart(2, "0");

// Lucide's paths for the four pictures (lucide-react PenTool, Sparkles, Braces, Bot), 24-unit box;
// circles and the bot's rounded rect written as paths
const PATHS: Record<Shape, string[]> = {
  pen: [
    "M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z",
    "m18 13-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.207L5.35 15.879a1 1 0 0 0 .776.746L13 18",
    "m2.3 2.3 7.286 7.286",
    "M13 11a2 2 0 1 1-4 0a2 2 0 1 1 4 0",
  ],
  spark: [
    "M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",
    "M20 2v4", "M22 4h-4", "M6 20a2 2 0 1 1-4 0a2 2 0 1 1 4 0",
  ],
  code: [
    "M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1",
    "M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1",
  ],
  bot: ["M12 8V4H8", "M6 8h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z", "M2 14h2", "M20 14h2", "M15 13v2", "M9 13v2"],
};

// A picture's points for the swarm: the icon stroked into the middle of its art box and read back
// on a 4.5px lattice
function forms(name: string, w: number, h: number) {
  const paths = PATHS[name as Shape];
  if (!paths || w < 8 || h < 8) return null;
  const c = document.createElement("canvas");
  c.width = Math.ceil(w); c.height = Math.ceil(h);
  const g = c.getContext("2d");
  if (!g) return null;
  const s = (Math.min(w, h) / 24) * 0.9;
  g.translate((w - 24 * s) / 2, (h - 24 * s) / 2);
  g.scale(s, s);
  g.lineWidth = 1.6; g.lineCap = "round"; g.lineJoin = "round";
  paths.forEach((d) => g.stroke(new Path2D(d)));
  const px = g.getImageData(0, 0, c.width, c.height).data, out: number[] = [], STEP = 4.5;
  for (let y = STEP / 2; y < h; y += STEP)
    for (let x = STEP / 2; x < w; x += STEP)
      if (px[((y | 0) * c.width + (x | 0)) * 4 + 3] > 120) out.push(x, y);
  return new Float32Array(out);
}

export function FourWaysIn() {
  const wide = useMedia("(min-width: 768px) and (prefers-reduced-motion: no-preference)");
  return (
    <section id="start" data-node-id="105:6092">
      <SwarmCursor enabled={wide} forms={forms} targets="[data-swarm-shape]" idle="hide" count={600} size={2.2} spread={64}
        color={INK} accentColor={INK} swirl={0.5} trail={0.4} wander={0.35} clickEffect="none" className="!h-auto">
        <div className="mx-auto flex max-w-[1248px] flex-col gap-[40px] px-[24px] py-[64px] md:gap-[56px] md:py-[112px]">
          <div className="h3-reveal flex max-w-[720px] flex-col gap-[16px]">
            <Eyebrow>Four ways in</Eyebrow>
            <H2>One library.<br />Four ways in</H2>
            <Sub className="max-md:text-[16px] max-md:leading-[24px]">Find the view that fits your work, whether you are designing an interaction, setting agent permissions, building an integration, or using patterns in an agent workflow.</Sub>
          </div>
          <ul className="border-t border-[var(--edge-2)]">
            {WAYS.map((w, i) => (
              <li key={w.id} className="border-b border-[var(--edge-2)]">
                <a href={w.cta[1]} data-swarm-shape={w.shape} aria-label={`${w.title}. ${w.line}. ${w.cta[0]}`}
                  className="h3-way grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-[16px] py-[20px] md:grid-cols-[48px_minmax(0,1fr)_200px_44px] md:gap-x-[32px] md:py-[28px]">
                  <span className="hidden font-[family-name:var(--font-mono)] leading-[16px] text-[12px] tracking-[0.96px] text-[color:var(--text-3)] md:block">{pad(i + 1)}</span>
                  <span className="flex min-w-0 flex-col gap-[4px] md:gap-[6px]">
                    <span className="h3-way-title font-light leading-[30px] text-[24px] tracking-[-0.02em] text-[color:var(--text)] md:leading-[48px] md:text-[42px]">{w.title}</span>
                    <span className="leading-[20px] text-[14px] text-[color:var(--text-2)] md:leading-[24px] md:text-[16px]">{w.line}</span>
                  </span>
                  {/* where the swarm draws this role's picture */}
                  <span data-swarm-art aria-hidden className="hidden h-[96px] md:block" />
                  <span aria-hidden className="h3-way-go grid size-[40px] place-items-center rounded-full border border-[var(--edge-3)] text-[color:var(--text)] md:size-[44px]">
                    <ArrowRight size={18} strokeWidth={1.75} />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </SwarmCursor>
    </section>
  );
}
