import { arc, BASE, blob, flipAt, hx, LOGO, NEON, rgba, type Corner, type Projector } from "./weave";
import { drawFlow, routeFlip } from "./light";

// The v3 intro on white, as v5 plays it on its light home (light mode, 18 Nov), without the sun and
// the horizon (Srishti, 17 Nov). In their place the shot ends on the hero's own floor, with neon liquid
// flowing through three of its lines toward the horizon, turning like paths through a maze (light.ts). The
// whole shot pushes in slowly from 86% to the hero's framing, so it keeps coming toward you.
export const END = 7.4;
// Storyboard (one continuous shot, nothing reverses):
//  0.0–0.5  blank white
//  0.5–1.7  the weave fades up, quiet grey
//  1.6–3.0  HAX's lines strike on like neon tubes, letter by letter: a few flickers, then a steady glow
//  3.0–5.8  straight into the perspective change: the plane tips into a floor while it already
//           travels toward you; HAX rides it and passes under the camera
//  5.2      as HAX passes under you, neon liquid starts flowing through the middle line of the floor
//  7.4      the hero text rises; the floor keeps coming toward you at the hero's walk speed and a
//           new pulse sets off every 1.8 s, the routes taking turns
//  0.0–7.4  the whole shot pushes in from 86% to 100% at a steady speed, through the tilt too,
//           settling as the text rises
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const sine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
const T_IN = [.5, 1.7], T_LIT = 1.6, T_TILT = [3.0, 5.8], T_BUMP = 7.6, T_LIGHT = 5.2;
// the push-in: 86% to 100%, at one steady speed through HAX and the tilt, easing to a stop at END
const PUSH = .86, T_SLOW = 6.2;
const pushed = (t: number) => (t <= T_SLOW ? t : T_SLOW + (t - T_SLOW) - (t - T_SLOW) ** 2 / (2 * (END - T_SLOW)));
const push = (t: number) => PUSH + (1 - PUSH) * pushed(Math.max(0, Math.min(END, t))) / pushed(END);
const WALK = .32, EXTRA = 2.2; // hero walk (tiles/s) + a soft surge during the tilt so HAX passes under you
// tiles travelled toward the viewer; the speed is WALK·tilt + EXTRA·sin²(…), never negative
function travel(t: number) {
  const u = seg(t, T_TILT[0], T_TILT[1]), D = T_TILT[1] - T_TILT[0];
  const walk = WALK * (D * (u / 2 - Math.sin(Math.PI * u) / (2 * Math.PI)) + Math.max(0, t - T_TILT[1]));
  const w = seg(t, T_TILT[0], T_BUMP), E = T_BUMP - T_TILT[0];
  return walk + EXTRA * E * (w / 2 - Math.sin(2 * Math.PI * w) / (4 * Math.PI));
}
// a neon tube striking: brightness over the first 0.75 s after it is switched on
const STRIKE: [number, number][] = [[0, 0], [.04, .9], [.08, .1], [.13, .55], [.17, .05], [.28, .05], [.31, 1], [.35, .35], [.42, .8], [.47, .6], [.75, 1]];
function neonAt(dt: number) {
  if (dt <= 0) return 0; if (dt >= .75) return 1;
  for (let i = 1; i < STRIKE.length; i++) if (dt <= STRIKE[i][0]) { const [a, va] = STRIKE[i - 1], [b, vb] = STRIKE[i]; return va + (vb - va) * (dt - a) / (b - a); }
  return 1;
}
// HAX lit in the weave: 5×5 letters; lit cells keep the field's own tiles, diagonal neighbours
// joined at the corner (the same master tiles the HAX logo uses)
const GL = { H: ["10001", "10001", "11111", "10001", "10001"], A: ["01110", "10001", "11111", "10001", "10001"], X: ["10001", "01010", "00100", "01010", "10001"] };
const WORD = [0, 1, 2, 3, 4].map((i) => GL.H[i] + "0" + GL.A[i] + "0" + GL.X[i]);
const LQ = 17, LR = 8;
const LIT = (() => {
  const on = (q: number, r: number) => q >= LQ && q < LQ + 17 && r >= LR && r < LR + 5 && WORD[r - LR][q - LQ] === "1";
  const s = new Map<string, number>();
  for (let r = LR; r < LR + 5; r++) for (let q = LQ; q < LQ + 17; q++) if (on(q, r)) for (const k of BASE(flipAt(r, q))) s.set(`${q},${r},${k}`, (q - LQ) / 16);
  const join = (q: number, r: number, K: Corner, t: number) => { if (!on(q, r) && BASE(flipAt(r, q)).includes(K)) s.set(`${q},${r},${K}`, t); };
  for (let r = LR; r < LR + 5; r++) for (let q = LQ; q < LQ + 17; q++) if (on(q, r)) {
    const t = (q - LQ) / 16;
    if (on(q + 1, r + 1) && !on(q + 1, r) && !on(q, r + 1)) { join(q + 1, r, "BL", t); join(q, r + 1, "TR", t); }
    if (on(q - 1, r + 1) && !on(q - 1, r) && !on(q, r + 1)) { join(q - 1, r, "BR", t); join(q, r + 1, "TL", t); }
  }
  return s;
})();

// the floor row at a depth at time t (the camera drawIntro uses, once the plane has tipped)
function rowAt(d: number, t: number) {
  const tilt = sine(seg(t, T_TILT[0], T_TILT[1])), th = tilt * Math.PI / 2 * .985, sT = Math.max(.5, Math.sin(th));
  const cell = 48, Fp = 560, Zc = Fp / cell + (3.2 - Fp / cell) * tilt;
  return 10.5 - travel(t) + (Zc - d) / sT - .5;
}
const PAGE = [255, 255, 255], white = (a: number) => rgba(PAGE, a);
// the liquid's routes (the middle one, then left and right); set only in rows ahead of HAX (≤ 5),
// once the plane has tipped, so the face-on weave and the letters are exactly the master field
const ROUTES = [25, 18, 32], ROUTE_ROW = 5;

// horizon: where the hero's floor meets the sky (scene.ts layout), so the shot ends on the hero's floor
export type IntroGeo = { horizon: number };

export function drawIntro(x: CanvasRenderingContext2D, W: number, H: number, t: number, g: IntroGeo) {
  x.globalAlpha = 1; x.fillStyle = white(1); x.fillRect(0, 0, W, H);
  const cell = Math.max(32, Math.min(48, W / 30)), cx = W / 2, cy = H / 2, horizonY = g.horizon;
  const field = sine(seg(t, T_IN[0], T_IN[1]));
  if (field <= 0) return;
  const tilt = sine(seg(t, T_TILT[0], T_TILT[1]));
  const QC = 25.5, RC = 10.5, Fp = 560, th = tilt * Math.PI / 2 * .985, cT = Math.cos(th), sT = Math.sin(th);
  const Zc = Fp / cell + (3.2 - Fp / cell) * tilt, Yc = tilt, cy0 = cy + (horizonY + 13 - cy) * tilt, scroll = -travel(t);
  const P: Projector = (u, v) => { const X = u - QC, vv = v - RC - scroll, Y = Yc + vv * cT, Z = Zc - vv * sT; if (Z < .45) return null; return [cx + Fp * X / Z, cy0 + Fp * Y / Z]; };
  const depthOf = (v: number) => Zc - (v + .5 - RC - scroll) * sT;
  const vl = Math.min(horizonY, cy0 - 13); // the floor's vanishing line, travelling up to where the sky starts
  // the push-in: everything scales about the camera's centre; the fades below stay on the screen edges
  const z = push(t);
  x.save(); x.translate(cx, cy0); x.scale(z, z); x.translate(-cx, -cy0);

  // ---- the weave: one plane the whole time; HAX's lines are part of it from the first frame ----
  const flat = tilt <= .02;
  const flip = (r: number, q: number) => (tilt > .6 && r <= ROUTE_ROW ? routeFlip(r, q, ROUTES) : null) ?? flipAt(r, q);
  const qA = flat ? QC - W / 2 / cell / z - 1 : QC - 40, qB = flat ? QC + W / 2 / cell / z + 1 : QC + 40;
  const rA = flat ? Math.floor(RC - H / 2 / cell / z - 1) : Math.floor(RC + scroll - 170), rB = flat ? Math.ceil(RC + H / 2 / cell / z + 1) : Math.ceil(RC + scroll + 4);
  x.lineCap = "butt"; // arcs meet end to end on a shared tangent: round caps bulged at every join and read as dots
  const neon = x.createLinearGradient(0, 0, W, 0); NEON.forEach(([o, c]) => neon.addColorStop(o, rgba(hx(c), 1)));
  const BANDS = [2, 3, 5, 8, 12, 20, 34, 60, 100, 160];
  const BA = [.55, .52, .47, .4, .32, .22, .14, .1, .07, .05], BW = [2.6, 2.2, 1.8, 1.4, 1.1, .9, .7, .6, .5, .5];
  let prev = -1e9;
  BANDS.forEach((zmax, band) => {
    x.beginPath(); let any = false;
    for (let r = rA; r <= rB; r++) {
      if (!flat) { const z = depthOf(r); if (z < prev || z >= zmax) continue; } else if (band > 0) continue;
      for (let q = Math.floor(qA); q <= qB; q++) for (const K of BASE(flip(r, q))) if (arc(x, P, q, r, K)) any = true;
    }
    prev = flat ? 1e9 : zmax; if (!any) return;
    const a = field * (flat ? 1 : BA[band] / .55);
    // quiet grey face-on, warming into the neon floor as the camera tips
    x.globalAlpha = a * (1 - tilt) * .1; x.strokeStyle = "#293247"; x.lineWidth = 1.5; x.stroke();
    if (tilt > 0) { x.strokeStyle = neon; x.globalAlpha = a * .55 * tilt; x.lineWidth = 1.5 + tilt * (BW[band] - 1.5); x.stroke(); }
    x.globalAlpha = 1;
  });

  // ---- the neon liquid flowing through the routes toward the horizon ----
  if (!flat && sT > .5 && t > T_LIGHT) {
    const yb = cy0 + (H - cy0) / z; // the screen's bottom edge, in the pushed-in shot
    const bottom = Fp * (Yc + Zc * cT / sT) / Math.max(1, yb - cy0 + Fp * cT / sT);
    const width = (d: number) => { const b = BANDS.findIndex((zmax) => d < zmax); return 1.5 + tilt * (BW[b < 0 ? BW.length - 1 : b] - 1.5); };
    drawFlow(x, { P, cols: ROUTES, dir: -1, rowAt: (d, tk) => rowAt(d, T_LIGHT + tk), depth: (v) => Zc - (v - RC - scroll) * sT, width, start: bottom * .8, minRow: ROUTE_ROW }, t - T_LIGHT, clamp((tilt - .8) / .2));
  }

  // ---- HAX: its lines strike on like neon tubes (H, then A, then X), glow, and ride the floor under you ----
  if (t > T_LIT) {
    const letter = (tp: number) => (tp < .33 ? 0 : tp < .66 ? 1 : 2);
    const lum = [0, 1, 2].map((i) => neonAt(t - (T_LIT + i * .35)));
    // the light the tubes throw onto the weave around them (fades as the floor tips away from the camera)
    const spill = (lum[0] + lum[1] + lum[2]) / 3 * (1 - tilt);
    if (spill > 0) blob(x, cx, cy, cell * 10, cell * 4, [[0, "#3FC6EE", .16 * spill], [.6, "#FF8A50", .06 * spill], [1, "#FF8A50", 0]]);
    // each letter is ONE path (one stroke per layer), so its round ends never overlap themselves and
    // there are no bright dots at the joins; colour runs across the word like the logo
    x.save(); x.lineCap = "round"; x.lineJoin = "round";
    const groups: [number, number, number][][] = [[], [], []]; // per letter: [q, r, cornerIndex]
    const KS: Corner[] = ["TL", "TR", "BR", "BL"];
    for (const [key, tpos] of LIT) { const [q, r, K] = key.split(","); groups[letter(tpos)].push([+q, +r, KS.indexOf(K as Corner)]); }
    const P0 = P(LQ, LR + 2.5), P1 = P(LQ + 17, LR + 2.5);
    const grad = P0 && P1 ? x.createLinearGradient(P0[0], 0, P1[0], 0) : null;
    if (grad) LOGO.forEach(([o, c]) => grad.addColorStop(o, rgba(hx(c), 1)));
    groups.forEach((arcs, i) => {
      const L = lum[i]; if (L <= 0 || !grad) return;
      // the word passes under the camera as one piece: fade by its mean depth
      const d = depthOf(LR + 2), near = tilt > .02 ? clamp((d - .8) / 1.4) : 1, a = L * near; if (a <= .01) return;
      const w = 3 + (Math.max(1, 9 / Math.max(1, d)) - 3) * tilt;
      x.beginPath(); let any = false;
      for (const [q, r, k] of arcs) if (arc(x, P, q, r, KS[k])) any = true;
      if (!any) return;
      x.strokeStyle = grad;
      x.globalAlpha = .1 * a; x.lineWidth = w * 7; x.stroke();   // outer bloom
      x.globalAlpha = .28 * a; x.lineWidth = w * 3; x.stroke();  // tube glow
      x.globalAlpha = a; x.lineWidth = w; x.stroke();            // the tube
      x.strokeStyle = "#FFFFFF"; x.globalAlpha = .35 * a; x.lineWidth = Math.max(.8, w * .35); x.stroke(); // hot core
      x.globalAlpha = 1;
    });
    x.restore();
  }

  if (tilt > 0) {
    // no horizon line: the far floor fades into the white sky instead of meeting it
    const fog = x.createLinearGradient(0, vl - 2, 0, vl + 150); fog.addColorStop(0, white(1)); fog.addColorStop(1, white(0));
    x.fillStyle = fog; x.globalAlpha = tilt; x.fillRect(-W, vl - 2, W * 3, 152); x.globalAlpha = 1;
    // while the floor finishes tipping, its farthest rows sit just above that and bunch into a line: veil them
    const sky = clamp((tilt - .85) / .1);
    if (sky > 0) {
      const v = x.createLinearGradient(0, vl - 80, 0, vl - 2); v.addColorStop(0, white(0)); v.addColorStop(.75, white(1)); v.addColorStop(1, white(1));
      x.fillStyle = v; x.globalAlpha = sky; x.fillRect(-W, vl - 80, W * 3, 78); x.globalAlpha = 1;
    }
  }
  x.restore();

  if (tilt > 0) {
    const vlS = cy0 + (vl - cy0) * z; // the vanishing line on screen
    const bf = x.createLinearGradient(0, H - 160, 0, H); bf.addColorStop(0, white(0)); bf.addColorStop(1, white(1)); x.fillStyle = bf; x.globalAlpha = tilt; x.fillRect(0, H - 160, W, 160);
    const sf = x.createLinearGradient(0, 0, W, 0); sf.addColorStop(0, white(1)); sf.addColorStop(.07, white(0)); sf.addColorStop(.93, white(0)); sf.addColorStop(1, white(1));
    x.fillStyle = sf; x.fillRect(0, vlS + 1, W, H - vlS); x.globalAlpha = 1;
  }
}
