"use client";
import { ArrowRight } from "lucide-react";
import SwarmCursor from "@/components/hax/v6/vendor/components/reactbits/SwarmCursor";
import { CATEGORIES, LIBRARY } from "@/components/hax/v6/vendor/components/hax/v1/library112/library";
import { Eyebrow, H2 } from "@/components/hax/v6/ui";
import { useMedia } from "@/components/hax/v6/fx";

// v3's Four ways in (Figma Two ways in 105:6092, now four) with v1's latest words (v5: each line is
// that audience's copy from Srishti's Studio v3 home, word for word, 17 Nov). The familiar big link
// list: one row per role, hairlines between, one row is one link. The one distinctive touch is the
// swarm (React Bits SwarmCursor, extended with `forms`, one colour): it gathers round the cursor as
// you enter the section, and on whichever row you're on it settles into that role's picture at the
// row's right end (Lucide's pen tool, sparkles, braces and bot). Tablets and up; phones get the rows.
type Shape = "pen" | "spark" | "code" | "bot";
type Way = { id: string; shape: Shape; title: string; line: string; caption: string; cta: [string, string] };
const WAYS: Way[] = [
  { id: "designers", shape: "pen", title: "For designers", line: "Find the moments when an agent should explain, ask, or hand off, then shape the exchange.", caption: `${LIBRARY.length} patterns · ${CATEGORIES.length} categories`, cta: ["Browse patterns", "/v4/patterns"] },
  { id: "pms", shape: "spark", title: "For product managers", line: "Decide where an agent can act and where a person needs a say.", caption: "Autonomy · approvals · roles", cta: ["Read the PM guide", "/v4/hax-docs#product-managers"] },
  { id: "engineers", shape: "code", title: "For engineers", line: "Use each pattern’s states and responses to build the interaction in the product.", caption: "npm i @hax/react", cta: ["Read the docs", "/v4/hax-docs#install"] },
  { id: "agents", shape: "bot", title: "For agents", line: "Look up a fitting pattern during a task and follow its expected exchange.", caption: "Claude · Cursor · Codex · VS Code", cta: ["Set up MCP", "/v4/mcp"] },
];
const INK = "#1f97d4"; // the swarm's one colour: the person's blue, deep enough for white
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
          <div className="h6-reveal flex max-w-[720px] flex-col gap-[16px]">
            <Eyebrow>Four ways in</Eyebrow>
            <H2>One library.<br />Four ways in</H2>
          </div>
          <ul className="border-t border-[var(--edge-2)]">
            {WAYS.map((w, i) => (
              <li key={w.id} className="border-b border-[var(--edge-2)]">
                <a href={w.cta[1]} data-swarm-shape={w.shape} aria-label={`${w.title}. ${w.line} ${w.cta[0]}`}
                  className="h6-way grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-[16px] py-[20px] md:grid-cols-[48px_minmax(0,1fr)_200px_44px] md:gap-x-[32px] md:py-[28px]">
                  <span className="hidden font-[family-name:var(--font-mono)] leading-[16px] text-[12px] tracking-[0.96px] text-[color:var(--text-3)] md:block">{pad(i + 1)}</span>
                  <span className="flex min-w-0 flex-col gap-[4px] md:gap-[6px]">
                    <span className="h6-way-title font-light leading-[30px] text-[24px] tracking-[-0.02em] text-[color:var(--text)] md:leading-[48px] md:text-[42px]">{w.title}</span>
                    <span className="max-w-[560px] leading-[20px] text-[14px] text-[color:var(--text-2)] md:leading-[24px] md:text-[16px]">{w.line}</span>
                    <span className="pt-[2px] font-[family-name:var(--font-mono)] leading-[16px] text-[12px] text-[color:var(--text-3)]">{w.cta[0]} · {w.caption}</span>
                  </span>
                  {/* where the swarm draws this role's picture */}
                  <span data-swarm-art aria-hidden className="hidden h-[96px] md:block" />
                  <span aria-hidden className="h6-way-go grid size-[40px] place-items-center rounded-full border border-[var(--edge-3)] text-[color:var(--text)] md:size-[44px]">
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
