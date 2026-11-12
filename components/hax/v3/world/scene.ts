import { arc, BASE, blob, flipAt, hx, NEON, rgba, type Projector } from "./weave";

// The v3 hero "world" (Figma Hero · world 106:8115): an aurora sky, a gradient sun rising at
// the vanishing point and the HAX weave as a neon floor you walk along. Laid out on the 1440 × 860
// frame (horizon at 580, floor 280 tall) and scaled to the canvas. Nothing ends hard: blobs fade
// to their rim, the floor fades at both sides and into the page at the bottom.
export const FRAME = { w: 1440, h: 860, horizon: 580 };

export type WorldOpts = { portal?: boolean };

export function layout(W: number, H: number) {
  const horizon = Math.round(H * FRAME.horizon / FRAME.h);
  const sx = W / FRAME.w, sy = horizon / FRAME.horizon;
  const s = Math.max(.55, Math.min(1.25, Math.min(sx, sy)));
  return { horizon, sx, sy, s, sunR: 150 * s, sunY: horizon + 30 * s, F: (H - horizon) * 4 };
}

// t = seconds since the world started (sky drift); walk = tiles walked along the floor
export function drawWorld(x: CanvasRenderingContext2D, W: number, H: number, t: number, walk: number, o: WorldOpts = {}) {
  const { horizon, sx, sy, s, sunR, sunY, F } = layout(W, H), cx = W / 2;
  x.clearRect(0, 0, W, H);

  // ---- sky (Figma Sky 106:8116) ----
  x.save(); x.beginPath(); x.rect(0, 0, W, horizon); x.clip();
  const d = (k: number, a: number) => Math.sin(t / k) * a; // slow drift, a few px
  blob(x, (160 + d(11, 24)) * sx, (120 + d(13, 10)) * sy, 620 * sx, 420 * sy, [[0, "#0051AF", .95], [1, "#0051AF", 0]]);
  blob(x, (420 + d(17, 18)) * sx, (420 + d(9, 8)) * sy, 520 * sx, 300 * sy, [[0, "#00BCEB", .75], [1, "#00BCEB", 0]]);
  blob(x, (1240 + d(14, -22)) * sx, (200 + d(12, 10)) * sy, 620 * sx, 420 * sy, [[0, "#9345E1", .85], [1, "#9345E1", 0]]);
  blob(x, (1180 + d(19, 16)) * sx, (520 + d(10, 6)) * sy, 420 * sx, 260 * sy, [[0, "#74BF4B", .5], [1, "#74BF4B", 0]]);
  blob(x, cx, horizon, 560 * s, 260 * s, [[0, "#FF8A50", .8], [.5, "#FF6D2D", .3], [1, "#9345E1", 0]]);
  const sg = x.createLinearGradient(0, sunY - sunR, 0, sunY + sunR);
  sg.addColorStop(0, "#FFCDB6"); sg.addColorStop(.45, "#FF8A50"); sg.addColorStop(1, "#FF6D2D");
  x.fillStyle = sg; x.beginPath(); x.arc(cx, sunY, sunR, 0, Math.PI * 2); x.fill();
  if (o.portal) drawPortal(x, cx, sunY, sunR, 1);
  x.restore();

  // ---- floor: the weave, walking in (Figma Floor 106:8123) ----
  x.save(); x.beginPath(); x.rect(0, horizon, W, H - horizon); x.clip();
  x.fillStyle = "#0B0D14"; x.fillRect(0, horizon, W, H - horizon);
  // camera one tile above the floor: a point at depth Z (tiles) sits F/Z below the horizon
  const QC = 17.5, S = walk;
  const P: Projector = (u, v) => { const Z = v - S; if (Z < .4) return null; return [cx + F * (u - QC) / Z, horizon + F / Z]; };
  const neon = x.createLinearGradient(0, 0, W, 0);
  NEON.forEach(([off, c]) => neon.addColorStop(off, rgba(hx(c), 1)));
  // near bands are bright and thick; far bands thin out and dim toward the horizon
  const BANDS: [number, number, number, number][] = [[5, 3.6, 1, 13], [6.5, 3, .95, 11], [9, 2.3, .85, 9], [13, 1.7, .7, 7], [20, 1.25, .5, 5], [32, .95, .32, 4], [48, .7, .16, 3], [80, .6, .1, 2], [130, .5, .07, 0], [200, .5, .05, 0]];
  x.lineCap = "butt"; // arcs meet end to end on a shared tangent: round caps bulged at every join and read as dots
  let near = 3.1;
  const bottom = F / (H - horizon); // depth at the canvas bottom edge
  for (const [far, lw, a, glow] of BANDS) {
    x.beginPath();
    const r0 = Math.floor(S + Math.max(near, bottom - 1.2) - .5), r1 = Math.ceil(S + far);
    for (let r = r0; r <= r1; r++) {
      const zm = r + .5 - S;
      if (zm < near || zm >= far || zm < bottom - 1.2) continue;
      const half = (W / 2) * (zm + .5) / F + 1.5;
      for (let q = Math.floor(QC - half); q <= Math.ceil(QC + half); q++) for (const K of BASE(flipAt(r, q))) arc(x, P, q, r, K);
    }
    near = far;
    x.strokeStyle = neon;
    x.globalAlpha = a * .16; x.lineWidth = glow * s; x.stroke();
    x.globalAlpha = a; x.lineWidth = lw * Math.max(.7, s); x.stroke();
  }
  x.globalAlpha = 1;
  // haze at the horizon so the densest rows melt into the dark
  // (was a dark haze, which read as a black strip between sky and floor; now light from the sun
  // spills onto the far floor, so the horizon reads as one glowing line)
  x.save(); x.globalCompositeOperation = "lighter";
  blob(x, cx, horizon, 760 * s, 46 * s, [[0, "#FF8A50", .55], [.5, "#9345E1", .22], [1, "#9345E1", 0]]);
  blob(x, cx, horizon, W * .55, 22 * s, [[0, "#3FC6EE", .25], [1, "#3FC6EE", 0]]);
  x.restore();
  // fade both sides out (the floor's own alpha, so it melts into the page)
  x.globalCompositeOperation = "destination-in";
  const side = x.createLinearGradient(0, 0, W, 0);
  side.addColorStop(0, "rgba(0,0,0,0)"); side.addColorStop(.1, "rgba(0,0,0,1)"); side.addColorStop(.9, "rgba(0,0,0,1)"); side.addColorStop(1, "rgba(0,0,0,0)");
  x.fillStyle = side; x.fillRect(0, horizon, W, H - horizon);
  x.globalCompositeOperation = "source-over";
  x.restore();

  // ---- horizon · neon (106:8141): a 1.5px line that fades out at both ends ----
  const hl = x.createLinearGradient(0, 0, W, 0);
  ([[0, "#00BCEB", 0], [.12, "#00BCEB", 1], [.35, "#3FC6EE", 1], [.5, "#9345E1", 1], [.68, "#FF6D2D", 1], [.88, "#FF8A50", 1], [1, "#FF8A50", 0]] as [number, string, number][])
    .forEach(([off, c, a]) => hl.addColorStop(off, rgba(hx(c), a)));
  x.fillStyle = hl; x.fillRect(0, horizon - .75, W, 1.5);

  // ---- fade · bottom (106:8142): into the page colour ----
  const fh = 140 * (H / FRAME.h), bf = x.createLinearGradient(0, H - fh, 0, H);
  bf.addColorStop(0, "rgba(15,17,23,0)"); bf.addColorStop(1, "rgba(15,17,23,1)");
  x.fillStyle = bf; x.fillRect(0, H - fh, W, fh);
}

// Home only: the C and its flip, two thick quarter arcs round the sun (Figma Portal 106:8121)
export function drawPortal(x: CanvasRenderingContext2D, cx: number, sunY: number, sunR: number, p: number) {
  const PR = sunR * 1.24, D = Math.PI / 180;
  const g = x.createLinearGradient(cx - sunR * 1.427, 0, cx + sunR * 1.427, 0);
  g.addColorStop(0, "#0051AF"); g.addColorStop(.28, "#00BCEB"); g.addColorStop(.72, "#FF8A50"); g.addColorStop(1, "#FF6D2D");
  x.strokeStyle = g; x.lineWidth = sunR * .187; x.lineCap = "round";
  x.beginPath(); x.arc(cx, sunY, PR, 184 * D, (184 + 64 * p) * D); x.stroke();
  x.beginPath(); x.arc(cx, sunY, PR, 356 * D, (356 - 64 * p) * D, true); x.stroke();
}
