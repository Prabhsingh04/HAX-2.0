import { arc, BASE, blob, flipAt, hx, LOGO, NEON, ramp, rgba, type Corner, type Projector } from "./weave";
// Copied from website/v3 (components/hax/v3/world) for the v1 home intro; keep in step with it.
import { drawPortal } from "./scene";

// The v3 intro (idea from Figma code layer 111:150), re-timed as one continuous camera move.
// It ends on the Home hero's own world: same horizon, same sun, so the hand-over is a cross-fade.
export const END = 7.4;
// Storyboard (one continuous shot, nothing reverses):
//  0.0–0.5  blank
//  0.5–1.7  the weave fades up, quiet
//  1.6–3.0  HAX's lines strike on like neon tubes, letter by letter: a few flickers, then a steady glow
//  3.0–5.8  straight into the perspective change (no hold): the plane tips into a floor while it
//           already travels TOWARD you; HAX rides it and passes under the camera
//  5.8–∞    the floor keeps coming toward you at the hero's walk speed; the hero takes over seamlessly
// The floor's speed only ever rises and falls; it never stops or turns round.
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const sine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
const T_IN = [.5, 1.7], T_LIT = 1.6, T_TILT = [3.0, 5.8], T_BUMP = 7.6;
const WALK = .32, EXTRA = 2.2; // hero walk (tiles/s) + a soft surge during the tilt so HAX passes under you
// tiles travelled toward the viewer; the speed is WALK·tilt + EXTRA·sin²(…) — never negative
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

// g: where the Home hero's world puts its horizon and sun, and where the nav logo sits
export type IntroGeo = { horizon: number; sunR: number; logoX: number; logoY: number; logoW: number };

export function drawIntro(x: CanvasRenderingContext2D, W: number, H: number, t: number, g: IntroGeo) {
  x.globalAlpha = 1; x.fillStyle = "#0F1117"; x.fillRect(0, 0, W, H);
  const cell = Math.max(32, Math.min(48, W / 30)), cx = W / 2, cy = H / 2, horizonY = g.horizon;
  const field = sine(seg(t, T_IN[0], T_IN[1]));
  if (field <= 0) return;
  const tilt = sine(seg(t, T_TILT[0], T_TILT[1]));
  const QC = 25.5, RC = 10.5, Fp = 560, th = tilt * Math.PI / 2 * .985, cT = Math.cos(th), sT = Math.sin(th);
  const Zc = Fp / cell + (3.2 - Fp / cell) * tilt, Yc = tilt, cy0 = cy + (horizonY + 13 - cy) * tilt, scroll = -travel(t);
  const P: Projector = (u, v) => { const X = u - QC, vv = v - RC - scroll, Y = Yc + vv * cT, Z = Zc - vv * sT; if (Z < .45) return null; return [cx + Fp * X / Z, cy0 + Fp * Y / Z]; };
  const depthOf = (v: number) => Zc - (v + .5 - RC - scroll) * sT;
  const vl = Math.min(horizonY, cy0 - 13); // the floor's vanishing line, travelling up to the horizon

  // ---- sky and sun come up with the tilt ----
  const sky = sine(seg(t, 3.6, 5.8));
  if (sky > 0) {
    x.save(); x.beginPath(); x.rect(0, 0, W, vl); x.clip(); x.globalAlpha = sky;
    const sx = W / 1440, sy = horizonY / 580;
    blob(x, 160 * sx, 120 * sy, 620 * sx, 420 * sy, [[0, "#0051AF", .95], [1, "#0051AF", 0]]);
    blob(x, 420 * sx, 420 * sy, 520 * sx, 300 * sy, [[0, "#00BCEB", .75], [1, "#00BCEB", 0]]);
    blob(x, 1240 * sx, 200 * sy, 620 * sx, 420 * sy, [[0, "#9345E1", .85], [1, "#9345E1", 0]]);
    blob(x, 1180 * sx, 520 * sy, 420 * sx, 260 * sy, [[0, "#74BF4B", .5], [1, "#74BF4B", 0]]);
    const rise = sine(seg(t, 4.0, 6.2)), sunR = g.sunR, sunY = horizonY + sunR * (1.15 - .95 * rise), s = sunR / 150;
    x.globalAlpha = sky * rise; blob(x, cx, horizonY, 560 * s, 260 * s, [[0, "#FF8A50", .8], [.5, "#FF6D2D", .3], [1, "#9345E1", 0]]);
    const sg = x.createLinearGradient(0, sunY - sunR, 0, sunY + sunR); sg.addColorStop(0, "#FFCDB6"); sg.addColorStop(.45, "#FF8A50"); sg.addColorStop(1, "#FF6D2D");
    x.fillStyle = sg; x.beginPath(); x.arc(cx, sunY, sunR, 0, Math.PI * 2); x.fill(); x.globalAlpha = 1;
    const pr = sine(seg(t, 5.2, 6.8));
    if (pr > 0) drawPortal(x, cx, horizonY + sunR * .2, sunR, pr);
    x.restore();
  }

  // ---- the weave: one plane the whole time; HAX's lines are part of it from the first frame ----
  const flat = tilt <= .02;
  const qA = flat ? QC - W / 2 / cell - 1 : QC - 40, qB = flat ? QC + W / 2 / cell + 1 : QC + 40;
  const rA = flat ? Math.floor(RC - H / 2 / cell - 1) : Math.floor(RC + scroll - 170), rB = flat ? Math.ceil(RC + H / 2 / cell + 1) : Math.ceil(RC + scroll + 4);
  x.lineCap = "butt"; // arcs meet end to end on a shared tangent: round caps bulged at every join and read as dots
  const neon = x.createLinearGradient(0, 0, W, 0); NEON.forEach(([o, c]) => neon.addColorStop(o, rgba(hx(c), 1)));
  const BANDS = [2, 3, 5, 8, 12, 20, 34, 60, 100, 160];
  const BA = [1, .95, .85, .7, .5, .3, .18, .12, .08, .05], BW = [3.2, 2.6, 2.1, 1.6, 1.2, .9, .7, .6, .5, .5], BG = [14, 11, 9, 7, 5, 4, 3, 2, 0, 0];
  let prev = -1e9;
  BANDS.forEach((zmax, band) => {
    x.beginPath(); let any = false;
    for (let r = rA; r <= rB; r++) {
      if (!flat) { const z = depthOf(r); if (z < prev || z >= zmax) continue; } else if (band > 0) continue;
      for (let q = Math.floor(qA); q <= qB; q++) for (const K of BASE(flipAt(r, q))) if (arc(x, P, q, r, K)) any = true;
    }
    prev = flat ? 1e9 : zmax; if (!any) return;
    const a = field * (flat ? 1 : BA[band]);
    // quiet white face-on (14%), warming into the neon floor as the camera tips
    x.globalAlpha = a * (1 - tilt) * .14; x.strokeStyle = "#FFFFFF"; x.lineWidth = 1.5; x.stroke();
    if (tilt > 0) {
      x.strokeStyle = neon; x.globalAlpha = a * tilt; x.lineWidth = 1.5 + tilt * (BW[band] - 1.5); x.stroke();
      x.globalAlpha = a * tilt * .16; x.lineWidth = BG[band] * tilt; x.stroke();
    }
    x.globalAlpha = 1;
  });

  // ---- HAX: its lines strike on like neon tubes (H, then A, then X), glow, and ride the floor under you ----
  if (t > T_LIT) {
    const letter = (tp: number) => (tp < .33 ? 0 : tp < .66 ? 1 : 2);
    const lum = [0, 1, 2].map((i) => neonAt(t - (T_LIT + i * .35)));
    // the light the tubes throw onto the weave around them (fades as the floor tips away from the camera)
    const spill = (lum[0] + lum[1] + lum[2]) / 3 * (1 - tilt);
    if (spill > 0) { x.save(); x.globalCompositeOperation = "lighter"; blob(x, cx, cy, cell * 10, cell * 4, [[0, "#3FC6EE", .16 * spill], [.6, "#FF8A50", .06 * spill], [1, "#FF8A50", 0]]); x.restore(); }
    // each letter is ONE path (one stroke per layer), so its round ends never overlap themselves and
    // there are no bright dots at the joins; colour runs across the word like the logo
    x.save(); x.globalCompositeOperation = "lighter"; x.lineCap = "round"; x.lineJoin = "round";
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
      x.strokeStyle = "#FFFFFF"; x.globalAlpha = .55 * a; x.lineWidth = Math.max(.8, w * .35); x.stroke(); // hot core
      x.globalAlpha = 1;
    });
    x.restore();
  }

  // ---- horizon: a glow where sky meets floor (no dark strip), the neon line, and soft edges ----
  if (tilt > 0) {
    const s = g.sunR / 150, glow = sky;
    if (glow > 0) {
      x.save(); x.globalAlpha = glow; x.globalCompositeOperation = "lighter";
      blob(x, cx, vl, 760 * s, 46 * s, [[0, "#FF8A50", .55], [.5, "#9345E1", .22], [1, "#9345E1", 0]]);
      blob(x, cx, vl, W * .55, 22 * s, [[0, "#3FC6EE", .25], [1, "#3FC6EE", 0]]);
      x.restore();
    }
    const hl = x.createLinearGradient(0, 0, W, 0);
    ([[0, "#00BCEB", 0], [.12, "#00BCEB", 1], [.35, "#3FC6EE", 1], [.5, "#9345E1", 1], [.68, "#FF6D2D", 1], [.88, "#FF8A50", 1], [1, "#FF8A50", 0]] as [number, string, number][]).forEach(([o, c, a]) => hl.addColorStop(o, rgba(hx(c), a)));
    const grow = sine(seg(t, 4.0, 5.8)); x.fillStyle = hl; x.globalAlpha = tilt * grow; x.fillRect(cx - W / 2 * grow, vl - .75, W * grow, 1.5); x.globalAlpha = 1;
    const bf = x.createLinearGradient(0, H - 160, 0, H); bf.addColorStop(0, "rgba(15,17,23,0)"); bf.addColorStop(1, "rgba(15,17,23,1)"); x.fillStyle = bf; x.globalAlpha = tilt; x.fillRect(0, H - 160, W, 160);
    const sf = x.createLinearGradient(0, 0, W, 0); sf.addColorStop(0, "rgba(15,17,23,1)"); sf.addColorStop(.07, "rgba(15,17,23,0)"); sf.addColorStop(.93, "rgba(15,17,23,0)"); sf.addColorStop(1, "rgba(15,17,23,1)");
    x.fillStyle = sf; x.fillRect(0, vl + 1, W, H - vl); x.globalAlpha = 1;
  }
}
