"use client";
import { useEffect, useRef } from "react";

// The HAX master weave (seed 7, 36 tiles a row): the same field the HAX logo is lit in.
// Every tile holds two quarter arcs; neighbouring tiles' arcs meet, so the lines run on as one weave.
const MF: number[][] = (() => {
  let s = 7;
  const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
  const m: number[][] = [];
  for (let r = 0; r < 160; r++) { const row: number[] = []; for (let q = 0; q < 36; q++) row.push(rnd() < 0.5 ? 0 : 1); m.push(row); }
  return m;
})();
export const flipAt = (r: number, q: number) => MF[((r % 160) + 160) % 160][((q % 36) + 36) % 36];
export const CORNER: Record<string, [number, number, number, number]> = { TL: [-1, -1, 0, 90], TR: [1, -1, 90, 180], BR: [1, 1, 180, 270], BL: [-1, 1, 270, 360] };
export const BASE = (f: number) => (f === 0 ? ["TL", "BR"] : ["TR", "BL"]);

// The HAX logo's stroke (Figma 103:3141): H blue, A cyan, X orange, with a hard switch in the gap before X
export const STRONG: [number, string][] = [[0, "#0051af"], [0.294, "#0a6bd6"], [0.353, "#0096d6"], [0.647, "#00bceb"], [0.676, "#00bceb"], [0.676, "#ff8a50"], [1, "#ff6d2d"]];
// The HAX letters, 5 x 5 tiles each, lit at tile 17, row 8 of the master weave
const GL = { H: ["10001", "10001", "11111", "10001", "10001"], A: ["01110", "10001", "11111", "10001", "10001"], X: ["10001", "01010", "00100", "01010", "10001"] };
export const HAX_ROWS = [0, 1, 2, 3, 4].map((i) => GL.H[i] + "0" + GL.A[i] + "0" + GL.X[i]);

// A picture lit in the weave, the way the HAX logo is: lit cells keep the field's own tiles (only colour changes).
// rows: '.' or '0' = off, any other letter = on. colors maps a letter to a colour; without it the
// picture takes `stops` across its width. alpha (0–1, or per tile column for a sweep) cross-fades it
// in over the grey field, for hover states.
export type Lit = {
  rows: string[]; q0: number; r0: number;
  stops?: [number, string][]; colors?: Record<string, string>;
  width?: number; trim?: number; alpha?: number | ((q: number) => number);
  // draw-on: per arc (tile q, r) progress 0–1; the coloured stroke draws along the arc by that much
  // while the grey arc under it fades out (hover pictures that light up progressively)
  draw?: (q: number, r: number) => number;
};
export type Box = { x: number; y: number; w: number; h: number };

// lit arcs of one picture → "q,r,corner" → the letter that lit it (corner joins take the letter of the cell they join)
function litArcs(lit: Lit, row0: number) {
  const ch = (q: number, r: number) => { const c = lit.rows[r - lit.r0]?.[q - lit.q0]; return c && c !== "." && c !== "0" ? c : null; };
  const out = new Map<string, string>();
  for (let j = 0; j < lit.rows.length; j++) for (let i = 0; i < lit.rows[j].length; i++) {
    const q = lit.q0 + i, r = lit.r0 + j, c = ch(q, r); if (!c) continue;
    for (const k of BASE(flipAt(r + row0, q))) out.set(q + "," + r + "," + k, c);
  }
  const join = (q: number, r: number, K: string, c: string) => { if (!ch(q, r) && BASE(flipAt(r + row0, q)).includes(K)) out.set(q + "," + r + "," + K, c); };
  for (let j = 0; j < lit.rows.length; j++) for (let i = 0; i < lit.rows[j].length; i++) {
    const q = lit.q0 + i, r = lit.r0 + j, c = ch(q, r); if (!c) continue;
    if (ch(q + 1, r + 1) && !ch(q + 1, r) && !ch(q, r + 1)) { join(q + 1, r, "BL", c); join(q, r + 1, "TR", c); }
    if (ch(q - 1, r + 1) && !ch(q - 1, r) && !ch(q, r + 1)) { join(q - 1, r, "BR", c); join(q, r + 1, "TL", c); }
  }
  return out;
}

type Props = {
  row0?: number;          // master row the field starts on, so neighbouring sections can continue one weave
  cell?: number;
  color?: string;
  opacity?: number;
  width?: number;
  shift?: { x?: number; y?: number }; // grid offset in px (some Figma sections start the tiles half a tile early)
  fade?: { top?: number; bottom?: number; sides?: number }; // px of fade at each edge (no hard stops)
  className?: string;
  lit?: Lit | Lit[];
  avoid?: Box[];          // lit arcs over these boxes (text) stay grey, so the words stay readable
  curve?: "trail"; // eased edge fade drawn as 13 mask stops instead of a linear ramp; "trail" = smootherstep^2.5,
                   // so a weave only shows where a neighbouring colour band has (almost) finished fading
  layer?: "both" | "field" | "pictures"; // split the grey field and the pictures onto two canvases (different fades)
};

const smoother = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const CURVES = { trail: (t: number) => smoother(t) ** 2.5 };
const q20 = (a: number) => Math.round(a * 20) / 20, q50 = (a: number) => Math.round(a * 50) / 50;

// a canvas weave that fills its parent; edges fade out with a CSS mask
export function Weave({ row0 = 0, cell = 40, color, opacity = 0.4, width = 1.5, shift, fade = { top: 140, bottom: 140, sides: 0 }, className = "", lit, avoid, curve, layer = "both" }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef<() => void>(() => {});
  // one observer for the canvas' life; redraws whenever it changes size
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ro = new ResizeObserver(() => drawRef.current()); ro.observe(cv);
    // the field colour comes from the theme (--weave); redraw when the theme flips
    const mo = new MutationObserver(() => drawRef.current());
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-hax2-theme"] });
    return () => { ro.disconnect(); mo.disconnect(); };
  }, []);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const pics = (Array.isArray(lit) ? lit : lit ? [lit] : []).map((p) => ({ p, arcs: litArcs(p, row0) }));
    const draw = () => {
      const b = cv.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1);
      if (!b.width || !b.height) return;
      if (cv.width !== Math.round(b.width * d) || cv.height !== Math.round(b.height * d)) { cv.width = Math.round(b.width * d); cv.height = Math.round(b.height * d); }
      const col = color ?? (getComputedStyle(cv).getPropertyValue("--weave").trim() || "#dddddd");
      const x = cv.getContext("2d")!; x.setTransform(d, 0, 0, d, 0, 0); x.clearRect(0, 0, b.width, b.height);
      const X0 = Math.round((b.width - 1440) / 2) + (shift?.x ?? 0), Y0 = shift?.y ?? 0, h = cell / 2, R = Math.PI / 180;
      const q0 = Math.floor(-X0 / cell) - 1, q1 = Math.ceil((b.width - X0) / cell), r0 = Math.floor(-Y0 / cell) - 1, r1 = Math.ceil((b.height - Y0) / cell);
      const arc = (q: number, r: number, k: string, trim = 0, part = 1) => {
        const [sx, sy, a0, a1] = CORNER[k], ax = X0 + q * cell + h + sx * h, ay = Y0 + r * cell + h + sy * h, s = (a0 + trim) * R, e = s + ((a1 - trim) * R - s) * part;
        x.moveTo(ax + h * Math.cos(s), ay + h * Math.sin(s)); x.arc(ax, ay, h, s, e);
      };
      const covered = (q: number, r: number, k: string) => {
        if (!avoid?.length) return false;
        const [sx, sy, a0] = CORNER[k], m = (a0 + 45) * R, mx = X0 + q * cell + h + sx * h + h * Math.cos(m), my = Y0 + r * cell + h + sy * h + h * Math.sin(m);
        return avoid.some((o) => mx > o.x - 6 && mx < o.x + o.w + 6 && my > o.y - 6 && my < o.y + o.h + 6);
      };
      // which picture owns each arc, in which colour, and how far it has faded in
      const owner = new Map<string, { i: number; c: string; a: number }>();
      pics.forEach(({ p, arcs }, i) => arcs.forEach((c, key) => {
        const [qs, rs, k] = key.split(","), q = +qs, a = p.draw ? q50(Math.max(0, Math.min(1, p.draw(q, +rs)))) : q20(Math.max(0, Math.min(1, typeof p.alpha === "function" ? p.alpha(q) : p.alpha ?? 1)));
        if (a > 0 && !covered(q, +rs, k)) owner.set(key, { i, c, a });
      }));
      x.lineCap = "round";
      if (layer !== "pictures") {
        // the grey field; arcs a picture is fading in over fade out by the same amount
        const fading = new Map<number, [number, number, string][]>();
        x.lineWidth = width; x.strokeStyle = col; x.beginPath();
        for (let r = r0; r <= r1; r++) for (let q = q0; q <= q1; q++) for (const k of BASE(flipAt(r + row0, q))) {
          const o = owner.get(q + "," + r + "," + k);
          if (!o) arc(q, r, k); else if (o.a < 1) { const l = fading.get(o.a) ?? []; l.push([q, r, k]); fading.set(o.a, l); }
        }
        x.globalAlpha = opacity; x.stroke();
        fading.forEach((l, a) => { x.beginPath(); l.forEach(([q, r, k]) => arc(q, r, k)); x.globalAlpha = opacity * (1 - a); x.stroke(); });
      }
      if (layer !== "field") {
        // each picture: the same arcs, thicker, in its colours (whole arcs, like the logo vector 103:3141; trim opens gaps)
        pics.forEach(({ p }, i) => {
          const groups = new Map<string, string[]>(); // "colour|alpha" → arcs
          owner.forEach((o, key) => { if (o.i !== i) return; const g = (p.colors ? p.colors[o.c] ?? "#00bceb" : "") + "|" + o.a; const l = groups.get(g) ?? []; l.push(key); groups.set(g, l); });
          if (!groups.size) return;
          let grad: CanvasGradient | null = null;
          if (!p.colors) { const xa = X0 + p.q0 * cell, xb = X0 + (p.q0 + p.rows[0].length) * cell; grad = x.createLinearGradient(xa, 0, xb, 0); (p.stops ?? STRONG).forEach(([o, c]) => grad!.addColorStop(o, c)); }
          x.lineWidth = p.width ?? 5;
          groups.forEach((keys, g) => {
            const [c, a] = g.split("|"); x.beginPath(); keys.forEach((key) => { const [q, r, k] = key.split(","); arc(+q, +r, k, p.trim ?? 0, p.draw ? +a : 1); });
            x.strokeStyle = grad ?? c; x.globalAlpha = p.draw ? Math.min(1, +a * 2.5) : +a; x.stroke();
          });
        });
      }
      x.globalAlpha = 1;
    };
    drawRef.current = draw;
    draw();
  }, [row0, cell, color, opacity, width, shift?.x, shift?.y, lit, avoid, layer]);
  const t = fade.top ?? 0, bt = fade.bottom ?? 0, sd = fade.sides ?? 0;
  const stops = (n: number, top: boolean) => Array.from({ length: 13 }, (_, i) => {
    const u = i / 12, a = Math.round(CURVES[curve!](top ? u : 1 - u) * 1000) / 1000;
    return `rgba(0,0,0,${a}) ${top ? `${Math.round(u * n)}px` : `calc(100% - ${Math.round((1 - u) * n)}px)`}`;
  }).join(", ");
  const v = curve
    ? `linear-gradient(to bottom, ${t ? stops(t, true) : "#000 0"}, ${bt ? stops(bt, false) : "#000 100%"})`
    : `linear-gradient(to bottom, transparent 0, #000 ${t}px, #000 calc(100% - ${bt}px), transparent 100%)`;
  const hz = sd ? `, linear-gradient(to right, transparent 0, #000 ${sd}px, #000 calc(100% - ${sd}px), transparent 100%)` : "";
  return (
    // full-bleed: the canvas spans the viewport, centred on its section, so the weave never stops in a hard
    // edge on screens wider than the 1440 design; the tile grid stays locked to the centred 1440 layout
    <canvas ref={ref} aria-hidden className={`pointer-events-none absolute inset-y-0 left-1/2 h-full w-screen max-w-none -translate-x-1/2 ${className}`}
      style={{ maskImage: v + hz, WebkitMaskImage: v + hz, maskComposite: sd ? "intersect" : undefined, WebkitMaskComposite: sd ? "source-in" : undefined }} />
  );
}
