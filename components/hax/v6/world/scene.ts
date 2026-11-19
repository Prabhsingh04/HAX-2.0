import { arc, BASE, flipAt, hx, NEON, rgba, type Projector } from "./weave";
import { drawFlow, routeFlip } from "./light";

// The v6 hero world: v3's floor of the HAX weave walking slowly toward you, on white. There is no
// sun and no horizon line (Srishti, 17 Nov): the far floor fades into the white sky, and neon liquid
// flows through three of the floor's own lines toward it, turning like paths through a maze (light.ts). Laid out on v3's
// 1440 × 860 frame (the floor starts at 580) and scaled to the canvas; nothing ends hard: the floor
// fades at both sides, into the sky at the back and into the page at the bottom.
export const FRAME = { w: 1440, h: 860, horizon: 580 };

export function layout(W: number, H: number) {
  const horizon = Math.round(H * FRAME.horizon / FRAME.h);
  const sx = W / FRAME.w, sy = horizon / FRAME.horizon;
  const s = Math.max(.55, Math.min(1.25, Math.min(sx, sy)));
  return { horizon, s, F: (H - horizon) * 4 };
}

const QC = 17.5;
export const WALK = .32; // tiles a second
const ROUTES = [17, 10, 24]; // the liquid's routes: the middle one, then left and right
const flip = (r: number, q: number) => routeFlip(r, q, ROUTES) ?? flipAt(r, q);
const WHITE = [255, 255, 255];
const white = (a: number) => rgba(WHITE, a);
// [far depth, line width, alpha]: near bands thicker; far bands thin out. On white the weave is
// quieter than v3's night floor, so the light running through it reads.
const BANDS: [number, number, number][] = [[5, 2.4, .55], [6.5, 2, .5], [9, 1.6, .46], [13, 1.3, .4], [20, 1.05, .32], [32, .85, .24], [48, .7, .16], [80, .6, .1], [130, .5, .07], [200, .5, .05]];

// t = seconds since the world started (moves the light); walk = tiles walked along the floor;
// light = false for reduced motion (a still floor)
export function drawWorld(x: CanvasRenderingContext2D, W: number, H: number, t: number, walk: number, light = true) {
  const { horizon, s, F } = layout(W, H), cx = W / 2;
  x.clearRect(0, 0, W, H);

  // ---- floor: the weave, walking in ----
  x.save(); x.beginPath(); x.rect(0, horizon, W, H - horizon); x.clip();
  // camera one tile above the floor: a point at depth Z (tiles) sits F/Z below the vanishing line
  const S = walk;
  const P: Projector = (u, v) => { const Z = v - S; if (Z < .4) return null; return [cx + F * (u - QC) / Z, horizon + F / Z]; };
  const bottom = F / (H - horizon); // depth at the canvas bottom edge
  // the floor's arcs between two depths, one path per band
  const each = (c: CanvasRenderingContext2D, from: number, to: number, draw: (lw: number, a: number) => void) => {
    let near = 3.1;
    for (const [far, lw, a] of BANDS) {
      const lo = Math.max(near, from, bottom - 1.2), hi = Math.min(far, to);
      near = far;
      if (lo >= hi) continue;
      c.beginPath();
      for (let r = Math.floor(S + lo - .5); r <= Math.ceil(S + hi); r++) {
        const zm = r + .5 - S;
        if (zm < lo || zm >= hi) continue;
        const half = (W / 2) * (zm + .5) / F + 1.5;
        for (let q = Math.floor(QC - half); q <= Math.ceil(QC + half); q++) for (const K of BASE(flip(r, q))) arc(c, P, q, r, K);
      }
      draw(lw * Math.max(.7, s), a);
    }
  };
  const neon = x.createLinearGradient(0, 0, W, 0);
  NEON.forEach(([off, c]) => neon.addColorStop(off, rgba(hx(c), 1)));
  x.lineCap = "butt"; // arcs meet end to end on a shared tangent: round caps bulged at every join and read as dots
  each(x, 0, Infinity, (lw, a) => { x.strokeStyle = neon; x.globalAlpha = a; x.lineWidth = lw; x.stroke(); });
  x.globalAlpha = 1;
  // ---- the neon liquid flowing through the routes toward the horizon ----
  if (light) {
    const width = (d: number) => (BANDS.find(([far]) => d < far) ?? BANDS[BANDS.length - 1])[1] * Math.max(.7, s);
    drawFlow(x, { P, cols: ROUTES, dir: 1, rowAt: (d, tk) => S - (t - .4 - tk) * WALK + d, depth: (v) => v - S, width, start: bottom * .8 }, t - .4);
  }
  // fade both sides out (the floor's own alpha, so it melts into the page)
  x.globalCompositeOperation = "destination-in";
  const side = x.createLinearGradient(0, 0, W, 0);
  side.addColorStop(0, "rgba(0,0,0,0)"); side.addColorStop(.12, "rgba(0,0,0,1)"); side.addColorStop(.88, "rgba(0,0,0,1)"); side.addColorStop(1, "rgba(0,0,0,0)");
  x.fillStyle = side; x.fillRect(0, horizon, W, H - horizon);
  x.globalCompositeOperation = "source-over";
  // the far floor fades into the white sky: no line where they meet
  const fog = x.createLinearGradient(0, horizon, 0, horizon + 150 * (H / FRAME.h));
  fog.addColorStop(0, white(1)); fog.addColorStop(1, white(0));
  x.fillStyle = fog; x.fillRect(0, horizon, W, 150 * (H / FRAME.h));
  x.restore();

  // ---- fade · bottom: into the page ----
  const fh = 140 * (H / FRAME.h), bf = x.createLinearGradient(0, H - fh, 0, H);
  bf.addColorStop(0, white(0)); bf.addColorStop(1, white(1));
  x.fillStyle = bf; x.fillRect(0, H - fh, W, fh);
}
