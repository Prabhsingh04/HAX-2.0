// "Ways in" particle field, ported from the old v1 #start script. Figma's field (98:19689) sets the
// dots: about one per 24px square, in the theme's ink (--dot-ink).
// The dots float freely across the section, each on its own wandering path, so the field is always
// visibly moving. Hovering a column pulls the dots around it into the column's picture on a 6.2px
// hex lattice, and they turn the logo blues (#0A6BD6 → #00BCEB, no violet) on the way in. Leaving
// sends each dot back to the spot it left, and it floats on from there.
// The motion is the earlier field's: the dots leave at once and slow as they settle (ease-out,
// ~0.7 s in and ~0.45 s out, a 120 ms stagger, a slight bow in each path).
// No patch of the field is emptied: a picture first takes the dots under its own lines, then at
// most a quarter of the dots in any 72px square, nearest squares first, so the field round it thins
// evenly instead of opening a hole.
// Each picture is drawn round its column's words, the way Antigravity draws its braces and rings
// round "For developers" and "For organizations": the words stay in the middle, clear, and the
// picture fills the space round them. Pictures: the pen tool (designers), AI sparks (PMs), { }
// (engineers) and Lucide's bot (agents). Keyboard focus in a column holds its picture; on phones
// and tablets a picture forms while its column is mid-screen.
/* eslint-disable @typescript-eslint/no-explicit-any */
export function mountDotField(sec: HTMLElement, cv: HTMLCanvasElement): () => void {
  const CELL = 24, STEP = 6.2, DOT_R = 1.2, SHAPE_R = 1.5, FIELD_A = 0.2, SHAPE_A = 0.95;
  // free motion: 10–26 px/s along a heading that wanders on two slow waves; dots leaving one edge
  // come back at the other
  const SPEED = [10, 26], TURN = [0.8, 0.45], TURN_W = [0.15, 0.6], EASE_V = 0.6;
  // the earlier field's timing: a picture starts forming the moment the pointer arrives and its dots
  // merge over ~0.7 s; letting go takes ~0.45 s; the stagger and the bow keep the merge organic
  const FORM_MS = 700, SETTLE_MS = 450, SPREAD_MS = 120, BOW_PX = 40;
  // how much of the field a picture may take: a quarter of any 72px square, nearest squares first
  const SHARE = 0.25, PATCH = 72;
  // a pulled dot keeps the field's grey for the first 30% of its way, then takes the blues
  const BLUE_FROM = 0.3;
  // free dots fade out of the area a formed picture covers, so the picture reads cleanly
  const COVER_PAD = 8;
  const SHIMMER_PX = 0.7, SHIMMER_W = 2.1;
  const BLUE = [10, 107, 214], CYAN = [0, 188, 235];
  const ctx = cv.getContext("2d");
  if (!ctx) return () => {};
  // the canvas sits behind the section and never takes part in its layout, even if the page's
  // utility classes are missing; otherwise its height would feed back into the section's
  Object.assign(cv.style, { position: "absolute", inset: "0", width: "100%", height: "100%", pointerEvents: "none" });
  // field ink follows the theme (tokens.css --dot-ink); light ink #293247 until read
  let INK = [41, 50, 71];
  const readInk = () => {
    const v = getComputedStyle(sec).getPropertyValue("--dot-ink").split(",").map(Number);
    if (v.length === 3 && v.every((n) => Number.isFinite(n))) INK = v;
  };
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touchMode = matchMedia("(hover: none), (max-width: 960px)");
  const TAU = Math.PI * 2, DEG = Math.PI / 180;
  const rnd = (r: number[]) => r[0] + Math.random() * (r[1] - r[0]);
  // a four-point spark; k moves each side's bend out from the centre, so the points are fuller
  const star = (g: CanvasRenderingContext2D, cx: number, cy: number, r: number, k = 0.14) => {
    const q = r * k;
    g.moveTo(cx, cy - r);
    g.quadraticCurveTo(cx + q, cy - q, cx + r, cy); g.quadraticCurveTo(cx + q, cy + q, cx, cy + r);
    g.quadraticCurveTo(cx - q, cy + q, cx - r, cy); g.quadraticCurveTo(cx - q, cy - q, cx, cy - r);
  };
  const brace = (g: CanvasRenderingContext2D, x: number, cy: number, h: number, d: number) => {
    const t = cy - h / 2, b = cy + h / 2, xb = x + d, e = d * 0.9;
    g.beginPath(); g.moveTo(xb + e, t);
    g.quadraticCurveTo(xb, t, xb, t + e); g.lineTo(xb, cy - e);
    g.quadraticCurveTo(xb, cy, x, cy); g.quadraticCurveTo(xb, cy, xb, cy + e);
    g.lineTo(xb, b - e); g.quadraticCurveTo(xb, b, xb + e, b);
    g.stroke();
  };
  // Each picture gets its art box (w × h) and t, the box its column's words fill, in the art box's
  // pixels, and is drawn round t. Lines are LW wide, about two dots on the lattice; whatever still
  // falls on the words is cleared afterwards (measure).
  type Box = { x0: number; y0: number; x1: number; y1: number };
  const LW = 7;
  const SHAPES: Record<string, (g: CanvasRenderingContext2D, w: number, h: number, t: Box) => void> = {
    // designers: the pen tool, its nib pointing down and to the left. The curve wraps under the
    // words from one side to the other, with square anchors at both ends and low on the left; that
    // anchor's handle lies along the curve, with round ends, and the nib (slit, hole, collar) rests
    // its tip on it in the space under the caption. Drawn the other way up (curve over the words,
    // nib above the title), then turned over top to bottom about the words' middle. The slit, the
    // hole and the gap before the collar are each wider than one dot step
    pen: (g, w, h, t) => {
      const cx = (t.x0 + t.x1) / 2, mid = (t.y0 + t.y1) / 2;
      g.translate(0, 2 * mid); g.scale(1, -1);
      const R = Math.min((t.x1 - t.x0) / 2 + 38, w / 2 - LW - 6);
      // in the turned-over drawing the art box's bottom edge is at y = 2·mid − h. The nib is as
      // large as fits between the curve's anchor and the words (its lowest corner is 17.7 units
      // below its tip); room left over moves the curve in towards the words
      const edge = 2 * mid - h + LW / 2 + 6, dip = R * (1 - Math.sin(70 * DEG));
      const room = t.y0 - 8 - edge - dip, u = Math.max(3.4, Math.min(7, room / 17.7));
      const ay = edge + Math.max(0, room - 17.7 * u) / 2 + R;
      const at = (deg: number) => [cx + R * Math.cos(deg * DEG), ay + R * Math.sin(deg * DEG)];
      g.lineCap = g.lineJoin = "round"; g.lineWidth = LW;
      g.beginPath(); g.arc(cx, ay, R, 156 * DEG, 345 * DEG); g.stroke();
      // the anchor the nib rests on, and its handle along the curve there (shorter towards the edge)
      const [bx, by] = at(250), tx = -Math.sin(250 * DEG), ty = Math.cos(250 * DEG);
      const ends = [[bx - tx * R * 0.46, by - ty * R * 0.46], [bx + tx * R * 0.2, by + ty * R * 0.2]];
      g.beginPath(); g.moveTo(ends[0][0], ends[0][1]); g.lineTo(ends[1][0], ends[1][1]); g.stroke();
      for (const [x, y] of ends) { g.beginPath(); g.arc(x, y, 1.45 * u, 0, TAU); g.fill(); }
      const sq = 2.9 * u;
      for (const [x, y] of [at(156), [bx, by], at(345)]) g.fillRect(x - sq / 2, y - sq / 2, sq, sq);
      // the nib, its tip just off the anchor and tilted as in the icon: body, then the slit and
      // hole cut out, then the collar
      g.translate(bx + 0.75 * u, by + 1.35 * u); g.rotate(-24.3 * DEG); g.scale(u, u);
      g.beginPath(); g.moveTo(0, 0);
      g.quadraticCurveTo(-4.7, 4, -4, 9.4); g.lineTo(-3.3, 12); g.lineTo(3.3, 12); g.lineTo(4, 9.4);
      g.quadraticCurveTo(4.7, 4, 0, 0); g.fill();
      g.globalCompositeOperation = "destination-out";
      g.lineWidth = Math.max(1.35, 7.4 / u); g.beginPath(); g.moveTo(0, 0.4); g.lineTo(0, 6.2); g.stroke();
      g.beginPath(); g.arc(0, 7.6, Math.max(1.55, 7 / u), 0, TAU); g.fill();
      g.globalCompositeOperation = "source-over";
      g.fillRect(-4, 13.7, 8, 2.4);
    },
    // agents: Lucide's bot with the words for its face. The head goes round them, the eyes sit
    // above the title, the antenna on top and an ear either side
    bot: (g, w, h, t) => {
      const cx = (t.x0 + t.x1) / 2, side = Math.min(t.x0, w - t.x1);
      const ear = Math.max(10, Math.min(22, side * 0.4)), m = Math.max(12, Math.min(26, side - ear - LW));
      const l = t.x0 - m, r = t.x1 + m, tp = Math.max(LW + 36, t.y0 - 60), bt = Math.min(h - LW, t.y1 + 28);
      const my = (tp + bt) / 2, ex = (t.x1 - t.x0) * 0.2, e0 = tp + 16, e1 = Math.max(e0 + 10, Math.min(t.y0 - 16, tp + 40));
      g.lineWidth = LW; g.lineCap = g.lineJoin = "round";
      g.beginPath(); g.roundRect(l, tp, r - l, bt - tp, 30);
      g.moveTo(cx, tp); g.lineTo(cx, tp - 28); g.lineTo(cx - 26, tp - 28);
      g.moveTo(l - ear, my); g.lineTo(l, my); g.moveTo(r, my); g.lineTo(r + ear, my);
      g.moveTo(cx - ex, e0); g.lineTo(cx - ex, e1); g.moveTo(cx + ex, e0); g.lineTo(cx + ex, e1);
      g.stroke();
    },
    // PMs: AI sparks round the words, a large one over the top right and smaller ones round the rest
    spark: (g, w, h, t) => {
      const tw = t.x1 - t.x0, th = t.y1 - t.y0, up = t.y0, dn = h - t.y1, sl = t.x0, sr = w - t.x1;
      g.beginPath();
      star(g, t.x1 - tw * 0.08, up * 0.5, Math.min(up * 0.45, 60));
      star(g, t.x0 + tw * 0.14, t.y1 + dn * 0.46, Math.min(dn * 0.34, 40));
      star(g, t.x0 - sl * 0.5, t.y0 + th * 0.34, Math.min(sl * 0.42, 24));
      star(g, t.x1 + sr * 0.5, t.y1 - th * 0.16, Math.min(sr * 0.36, 19));
      star(g, t.x0 + tw * 0.2, up * 0.42, Math.min(up * 0.15, 14));
      g.fill();
    },
    // engineers: { } either side of the words, points out, curls over and under them
    code: (g, w, h, t) => {
      const cy = (t.y0 + t.y1) / 2, half = Math.min(cy, h - cy) - LW - 6, bar = t.x0 - 12 - LW / 2;
      const d = Math.max(12, Math.min(half * 0.2, bar - LW / 2 - 4));
      g.lineWidth = LW; g.lineCap = g.lineJoin = "round";
      brace(g, bar - d, cy, half * 2, d);
      g.translate(t.x0 + t.x1, 0); g.scale(-1, 1);
      brace(g, bar - d, cy, half * 2, d);
    },
  };
  // ease-out: dots leave at once and slow as they merge into the picture
  const ease = (u: number) => 1 - Math.pow(1 - u, 3);
  const smooth = (x: number) => { const u = Math.min(1, Math.max(0, x)); return u * u * (3 - 2 * u); };
  const mix = (a: number[], b: number[], k: number) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

  type Col = {
    col: HTMLElement; art: HTMLElement; goal: number;
    T: { x: number; y: number; c: number[] }[]; cx: number; cy: number;
    ox: number; oy: number; w: number; h: number; cover: Uint8Array | null;
    lev: { from: number; to: number; at: number; dur: number };
  };
  const cols: Col[] = Array.from(sec.querySelectorAll<HTMLElement>("[data-col]")).map((col) => ({
    col, art: col.querySelector<HTMLElement>("[data-shape]")!, goal: 0,
    T: [], cx: 0, cy: 0, ox: 0, oy: 0, w: 0, h: 0, cover: null, lev: { from: 0, to: 0, at: 0, dur: 1 },
  })).filter((m) => m.art && SHAPES[m.art.dataset.shape!]);
  const level = (m: Col, now: number) => { const u = Math.min(1, Math.max(0, (now - m.lev.at) / m.lev.dur)); return m.lev.from + (m.lev.to - m.lev.from) * ease(u); };

  // each dot: position, velocity, cruising speed and heading waves while it floats. While a picture
  // holds it: OWN the column (-1 when free), TGT its point there, HX/HY the spot it left (where it
  // goes back to), and its journey PF → PT (0 = that spot, 1 = its point) starting at PA over PD ms,
  // with ARC its bow and SP its shimmer phase
  let W = 0, H = 0, N = 0;
  let PX = new Float32Array(0), PY = PX, VX = PX, VY = PX, SPD = PX, H0 = PX, HW1 = PX, HW2 = PX, HP1 = PX, HP2 = PX;
  let HX = PX, HY = PX, PF = PX, PT = PX, PD = PX, ARC = PX, SP = PX;
  let OWN = new Int16Array(0), TGT = new Int32Array(0), PA = new Float64Array(0);
  const waves = (i: number, t: number) => TURN[0] * Math.sin(HW1[i] * t + HP1[i]) + TURN[1] * Math.sin(HW2[i] * t + HP2[i]);
  const prog = (i: number, now: number) => { const u = Math.min(1, Math.max(0, (now - PA[i]) / PD[i])); return PF[i] + (PT[i] - PF[i]) * ease(u); };

  // a picture's points on the hex lattice (sorted round its centre, coloured left to right), and the
  // area it covers, grown by COVER_PAD, where free dots fade while it is formed
  function measure(m: Col) {
    const art = m.art, w = art.clientWidth, h = art.clientHeight;
    m.T = []; m.cover = null; m.w = w; m.h = h;
    if (!w || !h) return;
    const ar = art.getBoundingClientRect(), sr = sec.getBoundingClientRect();
    m.ox = ar.left - sr.left; m.oy = ar.top - sr.top; m.cx = m.ox + w / 2; m.cy = m.oy + h / 2;
    // the box the column's words fill ([data-tx]), in the art box's pixels
    const rs = Array.from(m.col.querySelectorAll<HTMLElement>("[data-tx]")).map((e) => e.getBoundingClientRect());
    const t: Box = rs.length
      ? { x0: Math.min(...rs.map((r) => r.left)) - ar.left, y0: Math.min(...rs.map((r) => r.top)) - ar.top,
          x1: Math.max(...rs.map((r) => r.right)) - ar.left, y1: Math.max(...rs.map((r) => r.bottom)) - ar.top }
      : { x0: w * 0.2, y0: h * 0.3, x1: w * 0.8, y1: h * 0.7 };
    const off = document.createElement("canvas"); off.width = w; off.height = h;
    const g = off.getContext("2d")!; g.fillStyle = g.strokeStyle = "#000";
    g.save(); SHAPES[art.dataset.shape!](g, w, h, t); g.restore();
    // the words sit in front of their picture: none of it stays under them
    g.globalCompositeOperation = "destination-out";
    g.fillRect(t.x0 - 8, t.y0 - 6, t.x1 - t.x0 + 16, t.y1 - t.y0 + 12);
    g.globalCompositeOperation = "source-over";
    const px = g.getImageData(0, 0, w, h).data;
    let row = 0, lo = Infinity, hi = -Infinity;
    const T: { x: number; y: number }[] = [];
    for (let y = STEP / 2; y < h; y += STEP * 0.866, row++)
      for (let x = STEP / 2 + (row % 2) * STEP / 2; x < w; x += STEP)
        if (px[((y | 0) * w + (x | 0)) * 4 + 3] > 127) { T.push({ x, y }); lo = Math.min(lo, x); hi = Math.max(hi, x); }
    T.sort((a, b) => Math.atan2(a.y - h / 2, a.x - w / 2) - Math.atan2(b.y - h / 2, b.x - w / 2));
    m.T = T.map((p) => ({ x: m.ox + p.x, y: m.oy + p.y, c: mix(BLUE, CYAN, (p.x - lo) / (hi - lo || 1)) }));
    // grow the drawn shape by COVER_PAD in both directions (two passes of a running max)
    const a = new Uint8Array(w * h), b = new Uint8Array(w * h), R = COVER_PAD;
    for (let i = 0; i < w * h; i++) a[i] = px[i * 4 + 3] > 127 ? 1 : 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let on = 0; for (let k = Math.max(0, x - R); k <= Math.min(w - 1, x + R) && !on; k++) on = a[y * w + k];
      b[y * w + x] = on;
    }
    for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) {
      let on = 0; for (let k = Math.max(0, y - R); k <= Math.min(h - 1, y + R) && !on; k++) on = b[k * w + x];
      a[y * w + x] = on;
    }
    m.cover = a;
  }
  const covered = (m: Col, x: number, y: number) => {
    const ix = (x - m.ox) | 0, iy = (y - m.oy) | 0;
    return !!m.cover && ix >= 0 && iy >= 0 && ix < m.w && iy < m.h && m.cover[iy * m.w + ix] === 1;
  };

  function seed() {
    // one dot per 24px square, placed at random inside it, so the field starts evenly spread
    const xs: number[] = [], ys: number[] = [];
    for (let y = 0; y < H; y += CELL) for (let x = 0; x < W; x += CELL) {
      xs.push(still ? x + CELL / 2 : x + Math.random() * CELL); ys.push(still ? y + CELL / 2 : y + Math.random() * CELL);
    }
    N = xs.length;
    PX = new Float32Array(xs); PY = new Float32Array(ys);
    VX = new Float32Array(N); VY = new Float32Array(N); SPD = new Float32Array(N);
    H0 = new Float32Array(N); HW1 = new Float32Array(N); HW2 = new Float32Array(N); HP1 = new Float32Array(N); HP2 = new Float32Array(N);
    HX = new Float32Array(N); HY = new Float32Array(N); PF = new Float32Array(N); PT = new Float32Array(N);
    PD = new Float32Array(N).fill(1); ARC = new Float32Array(N); SP = new Float32Array(N);
    OWN = new Int16Array(N).fill(-1); TGT = new Int32Array(N); PA = new Float64Array(N);
    for (let i = 0; i < N; i++) {
      SPD[i] = rnd(SPEED); H0[i] = Math.random() * TAU;
      HW1[i] = rnd(TURN_W) * (Math.random() < 0.5 ? -1 : 1); HW2[i] = rnd(TURN_W) * (Math.random() < 0.5 ? -1 : 1);
      HP1[i] = Math.random() * TAU; HP2[i] = Math.random() * TAU;
      VX[i] = Math.cos(H0[i]) * SPD[i]; VY[i] = Math.sin(H0[i]) * SPD[i];
    }
  }

  // which free dots answer a picture's pull: first those under the picture itself (they would fade
  // there anyway), then the nearest, but never more than SHARE of any PATCH-sized square
  function recruit(m: Col, n: number) {
    const d2 = (i: number) => (PX[i] - m.cx) ** 2 + (PY[i] - m.cy) ** 2;
    const under: number[] = [], bins = new Map<number, number[]>();
    for (let i = 0; i < N; i++) {
      if (OWN[i] >= 0) continue;
      if (covered(m, PX[i], PY[i])) { under.push(i); continue; }
      const key = Math.floor(PY[i] / PATCH + 1) * 10000 + Math.floor(PX[i] / PATCH + 1);
      const bin = bins.get(key);
      if (bin) bin.push(i); else bins.set(key, [i]);
    }
    const near: number[] = [], rest: number[] = [];
    bins.forEach((bin) => {
      bin.sort((a, b) => d2(a) - d2(b));
      const q = Math.floor(bin.length * SHARE + Math.random());
      bin.forEach((i, r) => (r < q ? near : rest).push(i));
    });
    near.sort((a, b) => d2(a) - d2(b)); rest.sort((a, b) => d2(a) - d2(b));
    return under.concat(near, rest).slice(0, n);
  }

  // send dot i towards its point in the picture (to 1) or back to the spot it left (to 0), from
  // wherever it is now; the earlier field's stagger and durations
  function aim(i: number, to: number, now: number) {
    const from = prog(i, now);
    PF[i] = still ? to : from; PT[i] = to;
    if (still) { PA[i] = 0; PD[i] = 1; return; }
    const k = Math.min(1, Math.max(0, cols[OWN[i]].T[TGT[i]].y / H));
    PA[i] = now + SPREAD_MS * (0.55 * Math.random() + 0.45 * (to ? k : 1 - k));
    PD[i] = (to ? FORM_MS : SETTLE_MS) * (0.4 + 0.6 * Math.abs(to - from));
  }

  function go(m: Col, to: number) {
    if (to === m.goal) return;
    m.goal = to;
    const now = performance.now(), ci = cols.indexOf(m);
    m.lev = still ? { from: to, to, at: 0, dur: 1 } : { from: level(m, now), to, at: now, dur: to ? FORM_MS : SETTLE_MS };
    // the dots this picture still holds (forming, formed, or on their way back) turn round
    const kept = new Uint8Array(m.T.length);
    for (let i = 0; i < N; i++) if (OWN[i] === ci) { aim(i, to, now); kept[TGT[i]] = 1; }
    if (!to) return;
    // its other points are filled from the free dots, paired by angle round its centre so their
    // paths don't cross (the points are already in that order)
    const need: number[] = [];
    for (let k = 0; k < m.T.length; k++) if (!kept[k]) need.push(k);
    if (!need.length) return;
    const ang = (i: number) => Math.atan2(PY[i] - m.cy, PX[i] - m.cx);
    const pick = recruit(m, need.length).sort((a, b) => ang(a) - ang(b));
    for (let k = 0; k < pick.length; k++) {
      const i = pick[k];
      OWN[i] = ci; TGT[i] = need[Math.floor(k * need.length / pick.length)];
      HX[i] = PX[i]; HY[i] = PY[i]; PF[i] = PT[i] = 0; PA[i] = now; PD[i] = 1;
      ARC[i] = (Math.random() - 0.5) * BOW_PX; SP[i] = Math.random() * TAU;
      aim(i, 1, now);
    }
  }

  function build() {
    W = sec.clientWidth; H = sec.clientHeight;
    if (!W || !H) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
    cols.forEach(measure);
    readInk();
    // pictures that were formed (or always are, with reduced motion) form again on the new field
    cols.forEach((m) => { const on = still || m.goal === 1; m.goal = 0; m.lev = { from: 0, to: 0, at: 0, dur: 1 }; if (on) go(m, 1); });
    last = performance.now();
    frame(last);
  }

  let last = 0;
  function frame(now: number) {
    const c2 = ctx!;
    const dt = still ? 0 : Math.min(0.05, Math.max(0, (now - last) / 1000)), t = now / 1000;
    last = now;
    c2.clearRect(0, 0, W, H);
    const L = cols.map((m) => level(m, now));
    const kv = 1 - Math.exp(-dt / EASE_V);
    const path = new Path2D();
    for (let i = 0; i < N; i++) {
      if (OWN[i] >= 0) {
        // a dot back at the spot it left is let go, and floats on from there
        if (PT[i] !== 0 || now < PA[i] + PD[i]) continue;
        OWN[i] = -1; PX[i] = HX[i]; PY[i] = HY[i];
      }
      const hd = H0[i] + waves(i, t);
      VX[i] += (Math.cos(hd) * SPD[i] - VX[i]) * kv; VY[i] += (Math.sin(hd) * SPD[i] - VY[i]) * kv;
      PX[i] += VX[i] * dt; PY[i] += VY[i] * dt;
      if (PX[i] < -4) PX[i] += W + 8; else if (PX[i] > W + 4) PX[i] -= W + 8;
      if (PY[i] < -4) PY[i] += H + 8; else if (PY[i] > H + 4) PY[i] -= H + 8;
      // a free dot fades while it crosses a formed picture
      let a = 1;
      for (let c = 0; c < cols.length; c++) if (L[c] > 0.01 && covered(cols[c], PX[i], PY[i])) a = Math.min(a, 1 - L[c]);
      if (a > 0.99) { path.moveTo(PX[i] + DOT_R, PY[i]); path.arc(PX[i], PY[i], DOT_R, 0, TAU); }
      else if (a > 0.01) {
        c2.fillStyle = `rgba(${INK},${(FIELD_A * a).toFixed(3)})`;
        c2.beginPath(); c2.arc(PX[i], PY[i], DOT_R, 0, TAU); c2.fill();
      }
    }
    c2.fillStyle = `rgba(${INK},${FIELD_A})`; c2.fill(path);
    // pulled dots travel a slightly bowed path between the spot they left and their point in the
    // picture (which shimmers a little), turning from the field's grey to the blues as they arrive
    for (let i = 0; i < N; i++) {
      const o = OWN[i];
      if (o < 0) continue;
      const v = prog(i, now), p = cols[o].T[TGT[i]];
      const gx = p.x + SHIMMER_PX * Math.sin(SHIMMER_W * t + SP[i]), gy = p.y + SHIMMER_PX * Math.cos(SHIMMER_W * 0.8 * t + SP[i] * 1.7);
      const dx = gx - HX[i], dy = gy - HY[i], len = Math.hypot(dx, dy) || 1, bow = Math.sin(Math.PI * v) * ARC[i];
      const x = HX[i] + dx * v - (dy / len) * bow, y = HY[i] + dy * v + (dx / len) * bow;
      const k = smooth((v - BLUE_FROM) / (1 - BLUE_FROM)), cc = mix(INK, p.c, k);
      const al = FIELD_A + (SHAPE_A - FIELD_A) * k, rr = DOT_R + (SHAPE_R - DOT_R) * k;
      c2.fillStyle = `rgba(${cc[0] | 0},${cc[1] | 0},${cc[2] | 0},${al.toFixed(3)})`;
      c2.beginPath(); c2.arc(x, y, rr, 0, TAU); c2.fill();
    }
  }

  let raf = 0, onScreen = false;
  const loop = (now: number) => { frame(now); raf = requestAnimationFrame(loop); };
  const run = () => {
    const want = !still && onScreen && !document.hidden;
    if (want && !raf) { last = performance.now(); raf = requestAnimationFrame(loop); }
    else if (!want && raf) { cancelAnimationFrame(raf); raf = 0; }
  };
  build();
  let w0 = W, h0 = H;
  const ro = new ResizeObserver(() => { if (sec.clientWidth === w0 && sec.clientHeight === h0) return; w0 = sec.clientWidth; h0 = sec.clientHeight; build(); });
  ro.observe(sec);
  let side = -1;
  // only keyboard focus holds a picture; a mouse click on a button must not pin it
  const held = (m: Col) => !!m.col.querySelector(":focus-visible");
  const pick = (next: number) => {
    if (next === side) return;
    side = next;
    // let go first, so the dots on their way back stay with their own picture
    cols.forEach((m, i) => { if (i !== side && !held(m)) go(m, 0); });
    cols.forEach((m, i) => { if (i === side || held(m)) go(m, 1); });
  };
  const offs: (() => void)[] = [];
  const on = (el: EventTarget, ev: string, fn: any) => { el.addEventListener(ev, fn); offs.push(() => el.removeEventListener(ev, fn)); };
  if (!still) {
    cols.forEach((m) => {
      on(m.col, "focusin", (e: FocusEvent) => { if ((e.target as Element).matches(":focus-visible")) go(m, 1); });
      on(m.col, "focusout", (e: FocusEvent) => { if (!m.col.contains(e.relatedTarget as Node) && side !== cols.indexOf(m)) go(m, 0); });
    });
    on(sec, "pointermove", (e: PointerEvent) => {
      if (e.pointerType === "touch" || touchMode.matches) return;
      // the column whose centre is nearest the pointer (on tablets the columns sit two to a row)
      let best = -1, bd = Infinity;
      cols.forEach((m, i) => {
        const c = m.col.getBoundingClientRect(), d = Math.hypot(e.clientX - (c.left + c.width / 2), e.clientY - (c.top + c.height / 2));
        if (d < bd) { bd = d; best = i; }
      });
      pick(best);
    });
    on(sec, "pointerleave", () => { if (!touchMode.matches) pick(-1); });
  }
  const vis = new IntersectionObserver((es) => { onScreen = es[0].isIntersecting; run(); });
  vis.observe(sec);
  on(document, "visibilitychange", run);
  // on phones and tablets the picture forms while its column sits in the middle of the screen
  const mid = new IntersectionObserver((es) => es.forEach((e) => {
    const m = cols.find((c) => c.art === e.target); if (m && touchMode.matches && !still) go(m, e.isIntersecting ? 1 : 0);
  }), { rootMargin: "-30% 0px -30% 0px" });
  cols.forEach((m) => mid.observe(m.art));
  // the theme switch changes the ink: repaint now if the field is at rest
  const theme = new MutationObserver(() => { readInk(); if (!raf) frame(performance.now()); });
  theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-hax-theme"] });
  return () => { cancelAnimationFrame(raf); ro.disconnect(); vis.disconnect(); mid.disconnect(); theme.disconnect(); offs.forEach((f) => f()); };
}
