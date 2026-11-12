"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Weave, STRONG, type Box, type Lit } from "../Weave";
import { AGENT_PROMPT } from "../../v1/home/AgentsAndDevelopers";

// Figma: HAX v2 · Home · Two ways in 103:3398. Hovering (or focusing) a column lights its picture in the
// weave behind the words, sweeping left to right in about 0.7 s (the Wave site's "Start where you work"
// interaction, v2's take on v1's dots merging). Lit lines under the words stay grey so they stay readable.
const ROW0 = 22; // master row, as the Wave site's section
// v1's two illustrations (dotField.ts: "spark" and "code"), redrawn on the weave's own tiles and
// centred over each column: the AI spark (a big four-point star and a small one) and a pair of braces { }.
const SPARK = ["...b....b.", "...b...bbb", "..bbb...b.", "bbbbbbb...", "..bbb.....", "...b......", "...b......"];
const OPEN = ["..bb", ".b..", ".b..", "b...", ".b..", ".b..", "..bb"];
const BRACES = OPEN.map((r) => r + ".." + [...r].reverse().join(""));
const PICS = {
  founders: { rows: SPARK, q0: 3, r0: 3 },
  developers: { rows: BRACES, q0: 23, r0: 3 },
};
type K = keyof typeof PICS;
const FIELD_FADE = { top: 160, bottom: 160 }, NO_FADE = { top: 0, bottom: 0 };
const W = 0.45; // how much of the run each arc takes to draw on

export function TwoWaysIn() {
  const sec = useRef<HTMLElement>(null);
  const [p, setP] = useState<Record<K, { p: number; o: number }>>({ founders: { p: 0, o: 1 }, developers: { p: 0, o: 1 } });
  const target = useRef<Record<K, number>>({ founders: 0, developers: 0 });
  const raf = useRef(0);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [copied, setCopied] = useState(false);

  // the words each picture must not cover, measured in the section's own coordinates
  useEffect(() => {
    const s = sec.current; if (!s) return;
    const measure = () => {
      const sb = s.getBoundingClientRect(), cvLeft = sb.left + sb.width / 2 - window.innerWidth / 2;
      setBoxes([...s.querySelectorAll<HTMLElement>("[data-avoid]")].map((el) => { const b = el.getBoundingClientRect(); return { x: b.left - cvLeft, y: b.top - sb.top, w: b.width, h: b.height }; }));
    };
    measure();
    document.fonts?.ready.then(measure);
    const ro = new ResizeObserver(measure); ro.observe(s);
    window.addEventListener("resize", measure);
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
  }, []);

  // In: each picture's progress runs 0→1 over 1.1 s (the staggered draw-on below). Out: the whole picture
  // lets go together in 280 ms, eased out (its own fade, o 1→0), then the progress resets for the next hover.
  // The state lives in a ref and is stepped here, so the loop knows for sure whether it is still moving.
  const cur = useRef<Record<K, { p: number; o: number }>>({ founders: { p: 0, o: 1 }, developers: { p: 0, o: 1 } });
  const OUT = 280;
  const run = useCallback(() => {
    cancelAnimationFrame(raf.current);
    const show = () => setP({ founders: { ...cur.current.founders }, developers: { ...cur.current.developers } });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      (Object.keys(cur.current) as K[]).forEach((k) => { cur.current[k] = { p: target.current[k], o: 1 }; }); show(); return;
    }
    let last = performance.now();
    const tick = () => {
      const now = performance.now(), dt = Math.min(64, now - last); last = now;
      let moving = false;
      (Object.keys(cur.current) as K[]).forEach((k) => {
        const c = cur.current[k];
        if (target.current[k] === 1) {
          if (c.o < 1) { c.p = 0; c.o = 1; } // re-entered mid let-go: draw on again from the centre
          if (c.p < 1) { c.p = Math.min(1, c.p + dt / 1100); moving = true; }
        } else if (c.p > 0) {
          c.o = Math.max(0, c.o - dt / OUT); moving = true;
          if (c.o === 0) { c.p = 0; c.o = 1; }
        }
      });
      show();
      if (moving) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  }, []);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  const set = (k: K, on: boolean) => { target.current = { ...target.current, [k]: on ? 1 : 0 }; run(); };

  const lits = useMemo<Lit[]>(() => (Object.keys(PICS) as K[]).map((k) => {
    const pic = PICS[k], prog = p[k].p, out = p[k].o ** 3; // out: ease-out let-go, all arcs together
    // each arc draws itself on along its curve, staggered from the picture's centre outward (like v1's dots
    // travelling in to merge): arc at distance d starts at prog = d·(1−W) and takes W of the run, eased out.
    // On leave the outer arcs let go first and the centre last.
    const cx = pic.q0 + pic.rows[0].length / 2, cy = pic.r0 + pic.rows.length / 2;
    const far = Math.hypot(pic.rows[0].length / 2, pic.rows.length / 2);
    const e = (u: number) => { const v = Math.max(0, Math.min(1, u)); return 1 - Math.pow(1 - v, 3); };
    return { ...pic, stops: STRONG, width: 4, draw: (q: number, r: number) => out * e((prog - (Math.hypot(q + 0.5 - cx, r + 0.5 - cy) / far) * (1 - W)) / W) };
  }), [p]);

  const copy = () => {
    navigator.clipboard?.writeText(AGENT_PROMPT).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1400); }, () => {});
  };
  const chip = "rounded-[6px] border border-[color:var(--line)] bg-[color:var(--card)] px-[8px] py-[2px] font-[family-name:var(--font-mono)] text-[12px] leading-[16px]";
  const col = (k: K) => ({
    onPointerEnter: () => set(k, true), onPointerLeave: () => set(k, false),
    onFocusCapture: () => set(k, true), onBlurCapture: () => set(k, false),
  });
  return (
    <section ref={sec} id="start" className="relative flex h-[740px] flex-col gap-[40px] px-[120px] pb-[96px] pt-[64px]" data-node-id="103:3398">
      <Weave layer="field" row0={ROW0} opacity={0.28} fade={FIELD_FADE} lit={lits} avoid={boxes} />
      <Weave layer="pictures" row0={ROW0} fade={NO_FADE} lit={lits} avoid={boxes} />
      <p className="relative w-fit font-[family-name:var(--font-mono)] text-[12px] font-medium uppercase leading-[16px] tracking-[0.06em] text-[color:var(--grey)]" data-avoid>One library. Two ways in</p>
      <div className="relative flex justify-between">
        <div className="flex w-[400px] flex-col items-center gap-[8px] pt-[340px] text-center" {...col("founders")}>
          <span className={chip} data-avoid>Claude · Cursor · Codex</span>
          <h3 className="text-[30px] font-semibold leading-[36px] tracking-[-0.02em]" data-avoid>For founders</h3>
          <p className="whitespace-nowrap text-[24px] font-semibold leading-[32px] tracking-[-0.02em] text-[color:var(--grey)]" data-avoid>One prompt. Your agent builds the screens.</p>
          <span className="h-[16px]" />
          <button type="button" onClick={copy} data-avoid className="hx2-btn hx2-btn--dark rounded-full bg-[color:var(--btn)] px-[16px] py-[8px] text-[14px] font-semibold leading-[20px] text-white">
            <span aria-live="polite">{copied ? "Prompt copied" : "Copy the prompt"}</span>
          </button>
        </div>
        <div className="flex w-[400px] flex-col items-center gap-[8px] pt-[340px] text-center" {...col("developers")}>
          <span className={chip} data-avoid>npm i @hax/react</span>
          <h3 className="text-[30px] font-semibold leading-[36px] tracking-[-0.02em]" data-avoid>For developers</h3>
          <p className="whitespace-nowrap text-[24px] font-semibold leading-[32px] tracking-[-0.02em] text-[color:var(--grey)]" data-avoid>The same patterns, in React.</p>
          <span className="h-[16px]" />
          <a href="/v2/hax-docs" data-avoid className="hx2-btn rounded-full border border-[color:var(--line)] bg-[color:var(--fill)] px-[16px] py-[8px] text-[14px] font-semibold leading-[20px] transition-colors hover:bg-[color:var(--fill-2)] active:bg-[color:var(--fill-3)]">Read the quick start</a>
        </div>
      </div>
    </section>
  );
}
