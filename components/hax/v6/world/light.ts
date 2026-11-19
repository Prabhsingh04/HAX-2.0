import { CORNER, NEON, ramp, rgba, type Corner, type Projector } from "@/components/hax/v6/world/weave";

// What replaces v3's sun and horizon (v6, 19 Nov), fifth pass. Neon liquid flows through the floor's
// own lines toward the horizon: the line it fills gets bolder and brighter, then settles back as it
// drains on, coloured along the flow from the person's blue (behind) to the agent's orange (in front).
// It flows along three routes, the middle one first, each one of the floor's lines set into the tiles
// so it can reach the horizon: a walk that turns left or right at every row like a path through a
// maze, keeps on the same way more often than not, and never strays more than 2 columns from its
// middle. Everywhere else the weave is the master field.

// each route's column offset at each row (160 rows, then it repeats; it ends where it started)
function walk(seed: number) {
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  const g = [0];
  let prev = 1;
  for (let r = 0; r < 160; r++) {
    const cur = g[r], left = 160 - r;
    const d = cur >= left ? -1 : -cur >= left ? 1 : cur >= 2 ? -1 : cur <= -2 ? 1 : rnd() < .68 ? prev : -prev;
    g.push(cur + d); prev = d;
  }
  return g;
}
const ROUTES = [walk(11), walk(29), walk(47)];
const mod = (r: number) => ((r % 160) + 160) % 160;

// the flip of a tile on a route (entering a row from the near edge, the line turns toward the next
// row's column, then on into that row), or null off the routes. cols: each route's middle column,
// at least 7 apart so they never share a tile
export function routeFlip(r: number, q: number, cols: number[]) {
  const m = mod(r);
  for (let i = 0; i < cols.length; i++) {
    const G = ROUTES[i], a = cols[i] + G[m], d = G[m + 1] - G[m];
    if (q === a || q === a + d) return d > 0 ? 1 : 0;
  }
  return null;
}

export type FlowView = {
  P: Projector;
  cols: number[]; // the routes' middle columns, the middle route first
  dir: 1 | -1; // which way the rows run toward the horizon
  rowAt: (depth: number, time: number) => number; // the floor row at a depth, at a time (flow clock)
  depth: (v: number) => number; // depth of a floor row coordinate now
  width: (depth: number) => number; // the floor's line width at a depth
  start: number; // depth the liquid sets off from (just under the bottom of the screen)
  minRow?: number; // the routes only exist up to this row (dir -1: rows ≤ minRow)
};

const GAP = 5.4; // a new pulse along each route every 5.4 s
const OFFSET = [0, 1.8, 3.6]; // the routes take turns: the middle one first
const SPEED = 7; // quarter arcs a second (3.5 rows a second)
const FRONT = 5, BODY = 14, DRAIN = 16; // the liquid's front edge, full part and draining tail (quarter arcs)
const LEN = FRONT + BODY + DRAIN;
const RUN = 70; // quarter arcs before the front is lost in the white (35 rows)
const N = 150, CHUNKS = 50;
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (v: number) => { v = clamp(v); return v * v * (3 - 2 * v); };

// the edge the line leaves a tile by, for the edge it came in by (flip 0: TL + BR, flip 1: TR + BL)
const EXIT = [{ T: "L", L: "T", B: "R", R: "B" }, { T: "R", R: "T", B: "L", L: "B" }] as Record<string, string>[];
const MOVE: Record<string, [number, number, string]> = { T: [0, -1, "B"], B: [0, 1, "T"], L: [-1, 0, "R"], R: [1, 0, "L"] };
const PAIR: Record<string, Corner> = { TL: "TL", LT: "TL", TR: "TR", RT: "TR", BR: "BR", RB: "BR", BL: "BL", LB: "BL" };
const FROM: Record<Corner, string> = { TL: "T", TR: "R", BR: "B", BL: "L" }; // the edge each arc is drawn from
type Step = { q: number; r: number; K: Corner; rev: boolean };

// route i, quarter arc by quarter arc, from row r toward the horizon
function routePath(i: number, cols: number[], r: number, dir: 1 | -1, n: number) {
  const G = ROUTES[i], m = mod(r), a = cols[i] + G[m], d = G[m + 1] - G[m];
  let q = dir > 0 ? a : a + d, e = dir > 0 ? "T" : "B";
  const out: Step[] = [];
  for (let k = 0; k < n; k++) {
    const f = routeFlip(r, q, cols);
    if (f === null) break;
    const x = EXIT[f][e], K = PAIR[e + x];
    out.push({ q, r, K, rev: FROM[K] !== e });
    const [dq, dr, ne] = MOVE[x]; q += dq; r += dr; e = ne;
  }
  return out;
}
function at(s: Step, f: number): [number, number] {
  const [sx, sy, a0, a1] = CORNER[s.K], ax = s.q + .5 + sx * .5, ay = s.r + .5 + sy * .5;
  const a = (a0 + (a1 - a0) * (s.rev ? 1 - f : f)) * Math.PI / 180;
  return [ax + .5 * Math.cos(a), ay + .5 * Math.sin(a)];
}
// how full the line is at a distance behind the front (quarter arcs): rises at the front, stays, drains
function fill(b: number) {
  if (b < 0) return 0;
  if (b < FRONT) return smooth(b / FRONT);
  if (b < FRONT + BODY) return 1;
  return 1 - smooth((b - FRONT - BODY) / DRAIN);
}

// t: seconds since the flow started; strength: 0–1
export function drawFlow(x: CanvasRenderingContext2D, V: FlowView, t: number, strength = 1) {
  if (strength <= 0 || t < 0) return;
  const life = (RUN + LEN) / SPEED;
  x.save(); x.lineCap = "butt"; x.lineJoin = "round";
  V.cols.forEach((_, i) => {
    const t0 = t - OFFSET[i % OFFSET.length];
    for (let k = Math.floor(t0 / GAP); k >= 0 && t0 - k * GAP < life; k--) {
      const tk = OFFSET[i % OFFSET.length] + k * GAP;
      let r0 = Math.round(V.rowAt(V.start, tk));
      if (V.minRow !== undefined && r0 * V.dir < V.minRow * V.dir) r0 = V.minRow; // the routes start there
      const path = routePath(i, V.cols, r0, V.dir, RUN);
      const h = (t - tk) * SPEED, s0 = Math.max(0, h - LEN), s1 = Math.min(h, path.length);
      if (s1 <= s0) continue;
      const fadeIn = clamp((t - tk) / .6) * strength;
      // points along the liquid, back to front: [x, y, depth, distance behind the front]
      const pts: ([number, number, number, number] | null)[] = [];
      for (let n = 0; n <= N; n++) {
        const s = s0 + (s1 - s0) * n / N, j = Math.min(path.length - 1, Math.floor(s));
        const [u, v] = at(path[j], Math.min(1, s - j)), p = V.P(u, v);
        pts.push(p ? [p[0], p[1], V.depth(v), h - s] : null);
      }
      // a soft halo, then the line itself, bolder where it is full
      for (const [halo, mul, a] of [[true, 4, .04], [false, 1, .55]] as [boolean, number, number][]) {
        for (let m = 0; m < CHUNKS; m++) {
          const i0 = Math.floor(m * N / CHUNKS), i1 = Math.floor((m + 1) * N / CHUNKS), mid = pts[(i0 + i1) >> 1];
          if (!mid) continue;
          const f = fill(mid[3]), far = clamp(1 - (mid[2] - 14) / 30), alpha = a * Math.pow(f, .8) * far * fadeIn;
          if (alpha <= .004) continue;
          x.strokeStyle = rgba(ramp(NEON, 1 - clamp(mid[3] / LEN)), 1); // blue behind, orange in front
          x.beginPath(); let on = false;
          for (let n = i0; n <= i1; n++) { const p = pts[n]; if (!p) { on = false; continue; } if (on) x.lineTo(p[0], p[1]); else { x.moveTo(p[0], p[1]); on = true; } }
          x.globalAlpha = alpha; x.lineWidth = V.width(mid[2]) * (halo ? mul * f : 1 + .7 * f); x.stroke();
        }
      }
    }
  });
  x.restore();
}
