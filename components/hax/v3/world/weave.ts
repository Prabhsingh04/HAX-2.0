// The master HAX weave (seed 7, 36 columns a row), the same field the HAX logo is lit in.
// Ported from design-automation/context/projects/hax/site-code/weave-engine.js and the v3 intro.
// Every tile holds two quarter arcs (radius 1/2) that join the midpoints of neighbouring edges,
// so lines run on from tile to tile. flip 0 = arcs round the tile's TL and BR corners, 1 = TR and BL.
let SEED = 7;
const rnd = () => { SEED = (SEED * 1103515245 + 12345) & 0x7fffffff; return SEED / 0x7fffffff; };
const MF: number[][] = [];
for (let r = 0; r < 160; r++) { MF.push([]); for (let q = 0; q < 36; q++) MF[r].push(rnd() < .5 ? 0 : 1); }

export const flipAt = (r: number, q: number) => MF[((r % 160) + 160) % 160][((q % 36) + 36) % 36];
export type Corner = "TL" | "TR" | "BR" | "BL";
export const CORNER: Record<Corner, [number, number, number, number]> = { TL: [-1, -1, 0, 90], TR: [1, -1, 90, 180], BR: [1, 1, 180, 270], BL: [-1, 1, 270, 360] };
export const BASE = (fl: number): Corner[] => (fl === 0 ? ["TL", "BR"] : ["TR", "BL"]);

export type Projector = (u: number, v: number) => [number, number] | null;

// One quarter arc of tile (q, r) through a projector, as a cubic bezier on the current path.
// upto < 1 draws only the first part of the arc (a line being drawn on).
// Returns false when any control point falls behind the camera.
export function arc(x: CanvasRenderingContext2D, P: Projector, q: number, r: number, K: Corner, trim = 0, upto = 1) {
  const [sx, sy, a0, a1] = CORNER[K], ax = q + .5 + sx * .5, ay = r + .5 + sy * .5, D = Math.PI / 180;
  const a = (a0 + trim) * D, b = a + ((a1 - trim) * D - a) * upto, k = 4 / 3 * Math.tan((b - a) / 4) * .5;
  const p0 = [ax + .5 * Math.cos(a), ay + .5 * Math.sin(a)], p3 = [ax + .5 * Math.cos(b), ay + .5 * Math.sin(b)];
  const p1 = [p0[0] - k * Math.sin(a), p0[1] + k * Math.cos(a)], p2 = [p3[0] + k * Math.sin(b), p3[1] - k * Math.cos(b)];
  const S = [p0, p1, p2, p3].map((p) => P(p[0], p[1]));
  if (S.some((s) => !s)) return false;
  const [s0, s1, s2, s3] = S as [number, number][];
  x.moveTo(s0[0], s0[1]);
  x.bezierCurveTo(s1[0], s1[1], s2[0], s2[1], s3[0], s3[1]);
  return true;
}

// ---------- colour ----------
export const hx = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
export const rgba = (c: number[], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
export const ramp = (stops: [number, string][], t: number) => {
  t = Math.max(0, Math.min(1, t));
  for (let i = 1; i < stops.length; i++) if (t <= stops[i][0]) {
    const [a, ca] = stops[i - 1], [b, cb] = stops[i], u = (t - a) / (b - a || 1), A = hx(ca), B = hx(cb);
    return A.map((v, j) => Math.round(v + (B[j] - v) * u));
  }
  return hx(stops[stops.length - 1][1]);
};
export const NEON: [number, string][] = [[0, "#00BCEB"], [.35, "#3FC6EE"], [.5, "#9345E1"], [.68, "#FF6D2D"], [1, "#FF8A50"]];
export const LOGO: [number, string][] = [[0, "#0087CD"], [.35, "#0096D6"], [.62, "#00BCEB"], [.67, "#B5E9F8"], [.71, "#FFCDB6"], [.76, "#FF8A50"], [1, "#FF6D2D"]];

// soft radial blob: an ellipse that fades to nothing at its rim (no hard edges)
export function blob(x: CanvasRenderingContext2D, X: number, Y: number, rx: number, ry: number, stops: [number, string, number][]) {
  const g = x.createRadialGradient(0, 0, 0, 0, 0, 1);
  stops.forEach(([o, c, a]) => g.addColorStop(o, rgba(hx(c), a)));
  x.save(); x.translate(X, Y); x.scale(rx, ry); x.fillStyle = g; x.beginPath(); x.arc(0, 0, 1, 0, Math.PI * 2); x.fill(); x.restore();
}
