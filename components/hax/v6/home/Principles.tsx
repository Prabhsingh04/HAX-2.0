"use client";
import { useEffect, useRef, useState } from "react";
import { PRINCIPLE_LABEL, type PrincipleId } from "@/components/hax/v1/patterns/model";
import { AcidBackdrop, FibersBackdrop, useMedia } from "@/components/hax/v6/fx";
import { Eyebrow, H2, Sub } from "@/components/hax/v6/ui";
import { createOrbs, type Orb } from "@/components/hax/v6/home/orbs";

// "Five principles guide HAX" (v1's words, v5, from Srishti's Studio v3 home; her call of 17 Nov),
// told the way Doctor Strange lays out the stones in Infinity War. The five are 3D spheres with the
// HAX weave painted on them (orbs.ts) on a big dial. As the section arrives they rise one by one from
// the bottom right; then the dial always rests on one principle, read left to right: one scroll (up
// and down or sideways), a drag, a click on a sphere or an arrow key turns it one notch, bringing the
// next sphere up to the pointer at the top, where its name and what it means open below (nothing
// else, 19 Nov). Earlier principles sit to the left, later ones to
// the right. The section pins while the dial has notches left, then lets the page go on. Over the acid
// squares (the fibres went back to the four setups, 19 Nov). Reduced motion gets a plain list.
const ORDER: [PrincipleId, string][] = [
  ["control", "People set an agent's boundaries, preferences, and goals; the agent adapts its autonomy to that direction."],
  ["clarity", "Agents make their reasoning, context, and confidence visible so people can assess decisions."],
  ["recovery", "People can undo agent actions, correct errors, and guide a safer next attempt."],
  ["collaboration", "People and agents share context, exchange input, and shape work together."],
  ["traceability", "Agent decisions and actions stay visible, searchable, and open to review."],
];
// the person's blue to the agent's orange, the site's own text gradient in five steps
const COLOR = ["#0a63c9", "#4259cf", "#7a4fd6", "#af5278", "#e4561a"];
const num = (k: number) => String(k + 1).padStart(2, "0");
const LAST = ORDER.length - 1;

// scrolling while pinned (vh): one notch per principle, then a little more before it lets go
const NOTCH = 55, TAIL = 35, RUN = LAST * NOTCH + TAIL;
const STEP = 36; // degrees between spheres on the dial
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease = (v: number) => { v = clamp(v); return v * v * (3 - 2 * v); };

export function Principles() {
  const still = useMedia("(prefers-reduced-motion: reduce)");
  return still ? <PrincipleList /> : <PrincipleDial />;
}

function PrincipleDial() {
  const sec = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);
  const labels = useRef<(HTMLSpanElement | null)[]>([]);
  const halos = useRef<(HTMLSpanElement | null)[]>([]);
  const words = useRef<HTMLDivElement>(null);
  const goRef = useRef<(k: number) => void>(() => {});
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const el = sec.current, st = stage.current, cv = canvas.current, sv = svg.current;
    if (!el || !st || !cv || !sv) return;
    const orbs = createOrbs(cv, COLOR);
    const ticks = sv.querySelector<SVGPathElement>("[data-ticks]"), major = sv.querySelector<SVGPathElement>("[data-major]");
    const track = sv.querySelector<SVGCircleElement>("[data-track]"), dialG = sv.querySelector<SVGGElement>("[data-dial]");
    const pointer = sv.querySelector<SVGPathElement>("[data-pointer]");
    let raf = 0, last = -2, W = 0, H = 0, dpr = 1, seen = false, prev = 0, notchPx = 1;
    let a = -3, target = 0, entered = false, settled = false; // a: where the dial is, in notches (0 = the first principle at the top)
    let drag: { x: number; a0: number; id: number; moved: boolean } | null = null, dragA: number | null = null;
    let lockUntil = 0;
    let G = { cx: 0, cy: 0, R: 0, r0: 0, rMax: 0, Rt: 0 };
    const layout = () => {
      W = st.clientWidth; H = st.clientHeight; dpr = Math.min(1.5, window.devicePixelRatio || 1);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      notchPx = window.innerHeight * NOTCH / 100;
      const wide = W >= 1024, R = wide ? Math.min(H * .68, W * .4) : Math.min(W * .4, H * .3);
      const r0 = Math.max(24, Math.min(58, R * .1));
      G = { cx: W / 2, cy: wide ? H * .96 : H * .5, R, r0, rMax: r0 * 1.45, Rt: R + r0 * 1.5 + (wide ? 24 : 14) };
      // the dial: a faint track through the spheres, a ring of ticks outside it (a long one at each
      // principle) and a fixed pointer at the top; a CSS mask fades it toward the ends of the half circle
      let d = "", dm = "";
      for (let i = 0; i < 120; i++) {
        const big = i % 12 === 0, t = (90 - i * 3) * Math.PI / 180, l0 = G.Rt, l1 = G.Rt + (big ? 16 : 7);
        const seg = `M${(G.cx + l0 * Math.cos(t)).toFixed(1)} ${(G.cy - l0 * Math.sin(t)).toFixed(1)}L${(G.cx + l1 * Math.cos(t)).toFixed(1)} ${(G.cy - l1 * Math.sin(t)).toFixed(1)}`;
        if (big) dm += seg; else d += seg;
      }
      ticks?.setAttribute("d", d); major?.setAttribute("d", dm);
      track?.setAttribute("cx", String(G.cx)); track?.setAttribute("cy", String(G.cy)); track?.setAttribute("r", String(G.R));
      const py = G.cy - G.Rt - 22;
      pointer?.setAttribute("d", `M${G.cx - 7} ${py}L${G.cx + 7} ${py}L${G.cx} ${py + 11}Z`);
      const m = `linear-gradient(to bottom, #000 ${Math.round(G.cy - G.Rt * .3)}px, transparent ${Math.round(G.cy + 4)}px)`;
      sv.style.maskImage = m; sv.style.setProperty("-webkit-mask-image", m);
      // the spheres, their names and glows keep one size and scale (no layout work while turning)
      const box = `${(2 * G.rMax).toFixed(1)}px`;
      items.current.forEach((it) => { if (it) { it.style.width = it.style.height = box; } });
      halos.current.forEach((ha) => { if (ha) { ha.style.width = ha.style.height = `${(4 * G.rMax).toFixed(1)}px`; } });
      if (words.current) words.current.style.top = `${wide ? G.cy - G.R + G.rMax + 36 : G.cy + 30}px`;
    };
    const paint = (now: number) => {
      const dt = Math.min(.05, (now - prev) / 1000 || 0);
      prev = now;
      // ease to the notch (slower while the spheres first rise in), or follow the drag
      if (dragA !== null) a = dragA;
      else if (entered) {
        a += (target - a) * (1 - Math.exp(-dt * (settled ? 7 : 2.4)));
        if (!settled && a > -.05) settled = true;
      }
      const list: Orb[] = [], time = now / 1000;
      for (let k = 0; k < 5; k++) {
        const deg = 90 - (k - a) * STEP, th = deg * Math.PI / 180; // later principles to the right
        const x = G.cx + G.R * Math.cos(th), y = G.cy - G.R * Math.sin(th);
        const vis = ease((deg + 8) / 20) * ease((188 - deg) / 20);
        const f = Math.max(0, 1 - Math.abs(k - a)), r = G.r0 * (1 + .45 * f);
        list.push({ k, x: x * dpr, y: y * dpr, r: r * dpr, alpha: vis * (.72 + .28 * f), spin: time * .35 - a * 1.5 + k * 1.3, focus: f });
        const it = items.current[k], lb = labels.current[k], ha = halos.current[k];
        const hidden = vis < .02;
        if (it) {
          it.style.transform = `translate3d(${(x - G.rMax).toFixed(1)}px, ${(y - G.rMax).toFixed(1)}px, 0) scale(${(r / G.rMax).toFixed(3)})`;
          it.style.visibility = hidden ? "hidden" : "visible";
        }
        if (lb) {
          const lx = clamp(x, 74, W - 74); // names near the screen's edge stay on screen
          lb.style.transform = `translate3d(${lx.toFixed(1)}px, ${(y + r + 10).toFixed(1)}px, 0) translateX(-50%)`;
          lb.style.opacity = (vis * (1 - f)).toFixed(3);
        }
        if (ha) {
          ha.style.transform = `translate3d(${(x - 2 * G.rMax).toFixed(1)}px, ${(y - 2 * G.rMax).toFixed(1)}px, 0) scale(${(r / G.rMax).toFixed(3)})`;
          ha.style.opacity = (f * vis).toFixed(3);
        }
      }
      orbs?.draw(list);
      dialG?.setAttribute("transform", `rotate(${(-a * STEP).toFixed(2)} ${G.cx} ${G.cy})`);
      const act = a < -.45 ? -1 : clamp(Math.round(a), 0, LAST);
      if (pointer) pointer.style.fill = act < 0 ? "var(--edge-3)" : COLOR[act];
      if (act !== last) { last = act; setActive(act); }
    };
    const frame = (now: number) => { paint(now); raf = seen && !document.hidden ? requestAnimationFrame(frame) : 0; };
    const start = () => { if (!raf && seen && !document.hidden) { prev = performance.now(); raf = requestAnimationFrame(frame); } };

    // the page position decides the notch: scrolling through the pinned section moves one notch per NOTCH vh
    const secTop = () => el.getBoundingClientRect().top + window.scrollY;
    const read = () => {
      const r = el.getBoundingClientRect();
      if (!entered && r.top < window.innerHeight * .3) entered = true; // the spheres rise in as it arrives
      target = clamp(Math.round(-r.top / notchPx), 0, LAST);
    };
    const go = (k: number) => {
      k = clamp(k, 0, LAST);
      entered = true;
      window.scrollTo({ top: secTop() + k * notchPx, behavior: "instant" as ScrollBehavior });
      target = k;
      start();
    };
    goRef.current = go;
    const pinned = () => { const r = el.getBoundingClientRect(); return r.top <= 1 && r.bottom >= window.innerHeight - 1; };
    // one scroll gesture (up/down or sideways) = one notch; the rest of that gesture is held back so a
    // flick doesn't skip principles. At the first and last principle the page scrolls on as usual.
    const onWheel = (e: WheelEvent) => {
      if (!pinned()) return;
      const sideways = Math.abs(e.deltaX) > Math.abs(e.deltaY), d = sideways ? e.deltaX : e.deltaY;
      if (Math.abs(d) < 2) return;
      const now = performance.now();
      if (now < lockUntil) { e.preventDefault(); lockUntil = Math.max(lockUntil, now + 140); return; }
      const next = Math.round(target) + (d > 0 ? 1 : -1);
      if (next < 0 || next > LAST) { if (sideways) e.preventDefault(); return; }
      e.preventDefault();
      lockUntil = now + 560;
      go(next);
    };
    // drag the dial: left brings the next principle up, right the one before
    const dragPx = () => Math.max(120, Math.min(240, G.R * .42));
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || (e.target as Element).closest("a, [data-no-drag]")) return;
      drag = { x: e.clientX, a0: a, id: e.pointerId, moved: false };
    };
    const onMove = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved) {
        if (Math.abs(dx) < 6) return;
        drag.moved = true; entered = true; settled = true;
        try { st.setPointerCapture(drag.id); } catch {}
        st.dataset.dragging = "1";
      }
      dragA = clamp(drag.a0 - dx / dragPx(), -.35, LAST + .35);
      start();
    };
    const onUp = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag;
      drag = null;
      delete st.dataset.dragging;
      if (!d.moved) { dragA = null; return; }
      const dx = e.clientX - d.x, from = Math.round(d.a0);
      let k = Math.round(dragA ?? a);
      if (k === from && Math.abs(dx) > dragPx() * .15) k += dx < 0 ? 1 : -1;
      a = dragA ?? a;
      dragA = null;
      go(k);
    };
    const onCancel = () => { drag = null; dragA = null; delete st.dataset.dragging; };
    // a click that ends a drag shouldn't also press the sphere under it
    const onClick = (e: MouseEvent) => { if (st.dataset.justDragged) { e.preventDefault(); e.stopPropagation(); } };
    const onUpCapture = () => { if (st.dataset.dragging) { st.dataset.justDragged = "1"; setTimeout(() => { delete st.dataset.justDragged; }, 0); } };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const next = Math.round(target) + (e.key === "ArrowRight" ? 1 : -1);
      if (next < 0 || next > LAST) return;
      e.preventDefault();
      go(next);
    };

    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; if (seen) { read(); start(); } });
    io.observe(st);
    const onScroll = () => { read(); start(); };
    const onResize = () => { layout(); read(); paint(performance.now()); };
    const onVis = () => start();
    layout(); read(); prev = performance.now(); paint(prev);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("wheel", onWheel, { passive: false });
    document.addEventListener("visibilitychange", onVis);
    st.addEventListener("pointerdown", onDown);
    st.addEventListener("pointermove", onMove);
    st.addEventListener("pointerup", onUpCapture, true);
    st.addEventListener("pointerup", onUp);
    st.addEventListener("pointercancel", onCancel);
    st.addEventListener("click", onClick, true);
    st.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf); io.disconnect(); orbs?.dispose();
      window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onResize);
      window.removeEventListener("wheel", onWheel); document.removeEventListener("visibilitychange", onVis);
      st.removeEventListener("pointerdown", onDown); st.removeEventListener("pointermove", onMove);
      st.removeEventListener("pointerup", onUpCapture, true); st.removeEventListener("pointerup", onUp);
      st.removeEventListener("pointercancel", onCancel); st.removeEventListener("click", onClick, true); st.removeEventListener("keydown", onKey);
    };
  }, []);

  const go = (k: number) => goRef.current(k);
  const fade = (on: boolean) => `absolute inset-x-0 top-0 flex flex-col items-center gap-[14px] text-center transition-[opacity,transform] duration-500 ease-out ${on ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-[14px] opacity-0"}`;

  return (
    <section ref={sec} id="principles" aria-label="Five principles guide HAX" className="relative" style={{ height: `calc(100svh + ${RUN}vh)` }}>
      <div ref={stage} tabIndex={0} aria-roledescription="dial" aria-label="Principles dial. Scroll, drag, or use the left and right arrow keys to turn it."
        className="sticky top-0 h-[100svh] cursor-grab touch-pan-y select-none overflow-hidden outline-none data-[dragging]:cursor-grabbing">
        <AcidBackdrop dpr={1} />
        {/* the dial */}
        <svg ref={svg} aria-hidden className="pointer-events-none absolute inset-0 size-full">
          <defs>
            <linearGradient id="h6-dial-ink" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#3fc6ee" /><stop offset=".5" stopColor="#9b8ce8" /><stop offset="1" stopColor="#ff8a50" />
            </linearGradient>
          </defs>
          <circle data-track fill="none" stroke="url(#h6-dial-ink)" strokeOpacity=".4" strokeWidth="1.2" />
          <g data-dial>
            <path data-ticks fill="none" stroke="var(--edge-3)" strokeWidth="1" />
            <path data-major fill="none" stroke="var(--text-3)" strokeWidth="1.6" />
          </g>
          <path data-pointer style={{ transition: "fill .4s" }} />
        </svg>
        {/* a soft glow behind the sphere at the top */}
        {ORDER.map(([id], k) => (
          <span key={id} ref={(e) => { halos.current[k] = e; }} aria-hidden className="pointer-events-none absolute left-0 top-0 origin-center rounded-full will-change-transform"
            style={{ opacity: 0, background: `radial-gradient(closest-side, ${COLOR[k]}30, ${COLOR[k]}00)` }} />
        ))}
        <canvas ref={canvas} aria-hidden className="pointer-events-none absolute inset-0 size-full" />
        {/* each sphere is a button that turns the dial to it; its name sits under it */}
        {ORDER.map(([id], k) => (
          <button key={id} ref={(e) => { items.current[k] = e; }} type="button" onClick={() => go(k)} aria-label={`${num(k)} ${PRINCIPLE_LABEL[id]}`}
            className="absolute left-0 top-0 origin-center rounded-full will-change-transform" style={{ visibility: "hidden" }} />
        ))}
        {ORDER.map(([id], k) => (
          <span key={id} ref={(e) => { labels.current[k] = e; }} aria-hidden
            className="pointer-events-none absolute left-0 top-0 whitespace-nowrap font-[family-name:var(--font-mono)] leading-[14px] text-[10px] tracking-[0.12em] text-[color:var(--text-3)] uppercase will-change-transform md:text-[11px]"
            style={{ opacity: 0 }}>
            {num(k)} {PRINCIPLE_LABEL[id]}
          </span>
        ))}
        {/* the reading under the pointer */}
        <div ref={words} data-no-drag className="absolute inset-x-0 mx-auto flex w-full max-w-[560px] cursor-auto select-text flex-col items-center px-[24px]" style={{ top: "50%" }}>
          {/* a soft white glow behind the words, so they read over the squares */}
          <span aria-hidden className="pointer-events-none absolute left-1/2 top-[-60px] h-[calc(100%+120px)] w-[150%] -translate-x-1/2 rounded-full"
            style={{ background: "radial-gradient(closest-side, rgba(255,255,255,.92), rgba(255,255,255,.75) 55%, rgba(255,255,255,0))" }} />
          <div className="relative min-h-[200px] w-full md:min-h-[230px]">
            <div className={fade(active === -1)} inert={active !== -1}>
              <Eyebrow>Principles</Eyebrow>
              <H2>Five principles guide HAX</H2>
              <Sub className="max-w-[460px]">They set the standard for trustworthy agent experiences. Each pattern shows which principle its behavior puts into practice.</Sub>
            </div>
            {ORDER.map(([id, line], k) => (
              <div key={id} className={fade(active === k)} inert={active !== k}>
                <h3 className="font-light leading-[1] text-[44px] tracking-[-0.03em] md:text-[64px]" style={{ color: COLOR[k] }}>{PRINCIPLE_LABEL[id]}</h3>
                <p className="max-w-[460px] leading-[24px] text-[16px] text-[color:var(--text-2)] md:leading-[27px] md:text-[18px]">{line}</p>
              </div>
            ))}
          </div>
          {/* where the dial is: one mark per principle, each a way to turn to it */}
          <ol aria-label="Principles" className="relative flex gap-[6px]">
            {ORDER.map(([id], k) => (
              <li key={id}>
                <button type="button" onClick={() => go(k)} aria-label={`${num(k)} ${PRINCIPLE_LABEL[id]}`} aria-current={active === k ? "step" : undefined} className="flex h-[20px] items-center">
                  <span className="block h-[3px] w-[28px] rounded-full transition-colors duration-300" style={{ background: active >= k ? COLOR[k] : "var(--edge-2)" }} />
                </button>
              </li>
            ))}
          </ol>
          <p className="relative mt-[10px] flex items-center gap-[8px] font-[family-name:var(--font-mono)] leading-[16px] text-[11px] tracking-[0.08em] text-[color:var(--text-3)] uppercase">
            <svg aria-hidden viewBox="0 0 16 16" className="size-[14px]"><rect x="4.5" y="1.5" width="7" height="11" rx="3.5" fill="none" stroke="currentColor" strokeWidth="1.2" /><path d="M8 4v2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
            Scroll or drag to turn
            <svg aria-hidden viewBox="0 0 16 16" className="size-[14px]"><path d="M2 8h12M5 5 2 8l3 3M11 5l3 3-3 3" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </p>
        </div>
      </div>
    </section>
  );
}

// Reduced motion: the five in a row
function PrincipleList() {
  return (
    <section id="principles" className="relative overflow-hidden px-[24px] py-[96px] md:py-[128px]">
      <FibersBackdrop />
      <div className="relative mx-auto flex max-w-[1200px] flex-col gap-[40px] md:gap-[56px]">
        <div className="flex max-w-[720px] flex-col gap-[16px]">
          <Eyebrow>Principles</Eyebrow>
          <H2>Five principles guide HAX</H2>
          <Sub>They set the standard for trustworthy agent experiences. Each pattern shows which principle its behavior puts into practice.</Sub>
        </div>
        <ol className="grid grid-cols-1 gap-x-[32px] gap-y-[36px] sm:grid-cols-2 lg:grid-cols-5">
          {ORDER.map(([id, line], k) => (
            <li key={id} className="flex flex-col gap-[10px] border-t-2 pt-[22px]" style={{ borderColor: COLOR[k] }}>
              <p className="font-[family-name:var(--font-mono)] leading-[16px] text-[12px] tracking-[0.96px] text-[color:var(--text-3)]">{num(k)}</p>
              <h3 className="font-semibold leading-[30px] text-[22px] tracking-[-0.01em] text-[color:var(--text)]">{PRINCIPLE_LABEL[id]}</h3>
              <p className="leading-[22px] text-[15px] text-[color:var(--text-2)]">{line}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
