// "Two ways in" particle field, ported from the old v1 #start script.
// 24px grid mirrored about centre, 1.15px dots in Figma's field colour (the theme's ink,
// --dot-ink, @15%, node 98:19689) wandering slowly; hovering a half raises dots into a
// shape on a 6.2px hex lattice (blue #21A4D7 → violet #8B57C7). Keyboard focus in a column
// holds its shape.
/* eslint-disable @typescript-eslint/no-explicit-any */
export function mountDotField(sec: HTMLElement, cv: HTMLCanvasElement): () => void {
  // shapes start forming the moment the pointer arrives and the dots visibly merge into
  // place over ~0.7 s; a short stagger keeps the merge organic (the Figma note's 1.1 s
  // glide plus 0.34 s stagger felt laggy, an instant swap lost the merge)
  const FORM_MS = 700, SETTLE_MS = 450, SPREAD_MS = 120;
  const GRID = 24, STEP = 6.2, DOT_R = 1.15;
  const WANDER_PX = 4.5, WANDER_W = [0.35, 0.95];
  const SHIMMER_PX = 0.7, SHIMMER_W = 2.1, FIELD_A = 0.15, CLAIM = 1.4;
  const SCATTER_R = 200, SCATTER_PX = 40, SCATTER_OUT_MS = 160, SCATTER_BACK_MS = 900;
  const BLUE = [33, 164, 215], VIOLET = [139, 87, 199];
  const ctx = cv.getContext("2d");
  if (!ctx) return () => {};
  // field ink follows the theme (tokens.css --dot-ink); light ink #293247 until read
  let INK = [41, 50, 71];
  const readInk = () => {
    const v = getComputedStyle(sec).getPropertyValue("--dot-ink").split(",").map(Number);
    if (v.length === 3 && v.every((n) => Number.isFinite(n))) INK = v;
  };
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touchMode = matchMedia("(hover: none), (max-width: 960px)");
  const TAU = Math.PI * 2;
  const star = (g: CanvasRenderingContext2D, cx: number, cy: number, r: number) => {
    g.moveTo(cx, cy - r);
    g.quadraticCurveTo(cx, cy, cx + r, cy); g.quadraticCurveTo(cx, cy, cx, cy + r);
    g.quadraticCurveTo(cx, cy, cx - r, cy); g.quadraticCurveTo(cx, cy, cx, cy - r);
  };
  const brace = (g: CanvasRenderingContext2D, x: number, cy: number, h: number, d: number) => {
    const t = cy - h / 2, b = cy + h / 2, xb = x + d, e = d * 0.9;
    g.beginPath(); g.moveTo(xb + e, t);
    g.quadraticCurveTo(xb, t, xb, t + e); g.lineTo(xb, cy - e);
    g.quadraticCurveTo(xb, cy, x, cy); g.quadraticCurveTo(xb, cy, xb, cy + e);
    g.lineTo(xb, b - e); g.quadraticCurveTo(xb, b, xb + e, b);
    g.stroke();
  };
  const SHAPES: Record<string, (g: CanvasRenderingContext2D, w: number, h: number) => void> = {
    spark: (g, w, h) => {
      const r = Math.min(w, h) * 0.44, cx = w / 2 - r * 0.18, cy = h / 2 + r * 0.06;
      g.beginPath(); star(g, cx, cy, r); star(g, cx + r, cy - r * 0.78, r * 0.34); g.fill();
    },
    code: (g, w, h) => {
      const hh = Math.min(h * 0.86, w * 0.6), gap = hh * 0.3, d = hh * 0.2;
      g.lineWidth = hh * 0.085; g.lineCap = g.lineJoin = "round";
      brace(g, w / 2 - gap - d, h / 2, hh, d);
      g.translate(w, 0); g.scale(-1, 1);
      brace(g, w / 2 - gap - d, h / 2, hh, d);
    },
  };
  // ease-out: dots leave at once and slow as they merge into the shape
  const ease = (u: number) => 1 - Math.pow(1 - u, 3);
  const mix = (a: number[], b: number[], k: number) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  const byAngle = (cx: number, cy: number) => (a: any, b: any) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx);

  let W = 0, H = 0, N = 0;
  let X = new Float32Array(0), Y = X, F = X, HIDE = X, SX = X, SY = X;
  const cols = Array.from(sec.querySelectorAll<HTMLElement>("[data-col]")).map((col) => ({
    col, art: col.querySelector<HTMLElement>("[data-shape]")!, goal: still ? 1 : 0, P: [] as any[], hide: [] as number[],
  })).filter((m) => m.art && SHAPES[m.art.dataset.shape!]);

  const prog = (p: any, now: number) => { const u = Math.min(1, Math.max(0, (now - p.at) / p.dur)); return p.from + (p.to - p.from) * ease(u); };
  const wx = (i: number, t: number) => { const o = i * 8; return WANDER_PX * (0.62 * Math.sin(F[o] * t + F[o + 4]) + 0.38 * Math.sin(F[o + 1] * t + F[o + 5])); };
  const wy = (i: number, t: number) => { const o = i * 8; return WANDER_PX * (0.62 * Math.sin(F[o + 2] * t + F[o + 6]) + 0.38 * Math.sin(F[o + 3] * t + F[o + 7])); };

  function claim(m: (typeof cols)[number]) {
    const art = m.art, w = art.clientWidth, h = art.clientHeight;
    if (!w || !h) return;
    const ar = art.getBoundingClientRect(), sr = sec.getBoundingClientRect();
    const ox = ar.left - sr.left, oy = ar.top - sr.top;
    const off = document.createElement("canvas"); off.width = w; off.height = h;
    const g = off.getContext("2d")!; g.fillStyle = g.strokeStyle = "#000";
    SHAPES[art.dataset.shape!](g, w, h);
    const px = g.getImageData(0, 0, w, h).data, T: any[] = [];
    let row = 0, lo = Infinity, hi = -Infinity;
    for (let y = STEP / 2; y < h; y += STEP * 0.866, row++)
      for (let x = STEP / 2 + (row % 2) * STEP / 2; x < w; x += STEP)
        if (px[((y | 0) * w + (x | 0)) * 4 + 3] > 127) { T.push({ x: ox + x, y: oy + y }); lo = Math.min(lo, x); hi = Math.max(hi, x); }
    const inShape = (x: number, y: number) => {
      for (let a = 0; a < 9; a++) {
        const sx = Math.round(x + (a ? Math.cos(a * TAU / 8) * 8 : 0)), sy = Math.round(y + (a ? Math.sin(a * TAU / 8) * 8 : 0));
        if (sx >= 0 && sy >= 0 && sx < w && sy < h && px[(sy * w + sx) * 4 + 3] > 127) return true;
      }
      return false;
    };
    const cx = ox + w / 2, cy = oy + h / 2, rx = w * CLAIM, ry = h * CLAIM;
    let C: any[] = [];
    m.hide = [];
    for (let i = 0; i < N; i++) {
      const d = Math.pow((X[i] - cx) / rx, 2) + Math.pow((Y[i] - cy) / ry, 2);
      if (d < 1) C.push({ x: X[i], y: Y[i], i, d });
      if (inShape(X[i] - ox, Y[i] - oy)) m.hide.push(i);
    }
    C.sort((a, b) => a.d - b.d); C = C.slice(0, T.length);
    T.sort(byAngle(cx, cy)); C.sort(byAngle(cx, cy));
    const n = Math.min(T.length, C.length), now = performance.now();
    m.P = [];
    for (let k = 0; k < n; k++) {
      const t = T[Math.floor(k * T.length / n)], c = C[Math.floor(k * C.length / n)];
      m.P.push({ i: c.i, tx: t.x, ty: t.y, c: mix(BLUE, VIOLET, (t.x - ox - lo) / (hi - lo || 1)),
        arc: (Math.random() - 0.5) * 40, sp: Math.random() * TAU, from: m.goal, to: m.goal, at: now, dur: 1 });
    }
  }
  function build() {
    W = sec.clientWidth; H = sec.clientHeight;
    if (!W || !H) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    const xs: number[] = [], ys: number[] = [];
    for (let y = (H / 2) % GRID; y < H; y += GRID) for (let x = (W / 2) % GRID; x < W; x += GRID) { xs.push(x); ys.push(y); }
    N = xs.length; X = new Float32Array(xs); Y = new Float32Array(ys);
    F = new Float32Array(N * 8); HIDE = new Float32Array(N); SX = new Float32Array(N); SY = new Float32Array(N);
    for (let i = 0; i < N; i++) for (let f = 0; f < 4; f++) {
      F[i * 8 + f] = WANDER_W[0] + Math.random() * (WANDER_W[1] - WANDER_W[0]);
      F[i * 8 + 4 + f] = Math.random() * TAU;
    }
    cols.forEach(claim);
    readInk();
    frame(performance.now());
  }
  function go(m: (typeof cols)[number], to: number) {
    if (still || to === m.goal) return;
    m.goal = to;
    const now = performance.now();
    m.P.forEach((p) => {
      p.from = prog(p, now); p.to = to;
      const k = Math.min(1, Math.max(0, p.ty / H));
      p.at = now + SPREAD_MS * (0.55 * Math.random() + 0.45 * (to ? k : 1 - k));
      p.dur = (to ? FORM_MS : SETTLE_MS) * (0.4 + 0.6 * Math.abs(to - p.from));
    });
  }
  let mx: number | null = null, my = 0, last = 0;
  function frame(now: number) {
    const c2 = ctx!;
    const t = still ? 0 : now / 1000, dt = Math.min(64, now - (last || now)); last = now;
    const kOut = 1 - Math.exp(-dt / SCATTER_OUT_MS), kBack = 1 - Math.exp(-dt / SCATTER_BACK_MS);
    c2.clearRect(0, 0, W, H);
    for (const col of cols) {
      let sum = 0;
      for (const p of col.P) sum += prog(p, now);
      for (const h of col.hide) HIDE[h] = col.P.length ? sum / col.P.length : 0;
    }
    const path = new Path2D();
    for (let i = 0; i < N; i++) {
      let x = X[i] + wx(i, t), y = Y[i] + wy(i, t), tx = 0, ty = 0;
      if (mx !== null) {
        const ex = x - mx, ey = y - my, d2 = ex * ex + ey * ey;
        if (d2 < SCATTER_R * SCATTER_R) {
          const d = Math.sqrt(d2) || 1, f = SCATTER_PX * Math.pow(1 - d / SCATTER_R, 2);
          tx = ex / d * f; ty = ey / d * f;
        }
      }
      const ks = tx * tx + ty * ty > SX[i] * SX[i] + SY[i] * SY[i] ? kOut : kBack;
      SX[i] += (tx - SX[i]) * ks; SY[i] += (ty - SY[i]) * ks;
      x += SX[i]; y += SY[i];
      if (HIDE[i] > 0.01) {
        if (HIDE[i] < 0.99) {
          c2.fillStyle = `rgba(${INK},${(FIELD_A * (1 - HIDE[i])).toFixed(3)})`;
          c2.beginPath(); c2.arc(x, y, DOT_R, 0, TAU); c2.fill();
        }
        continue;
      }
      path.moveTo(x + DOT_R, y); path.arc(x, y, DOT_R, 0, TAU);
    }
    c2.fillStyle = `rgba(${INK},${FIELD_A})`; c2.fill(path);
    for (const col of cols) for (const p of col.P) {
      const j = p.i, v = prog(p, now);
      if (v < 0.005) continue;
      const hx = X[j] + wx(j, t) + SX[j], hy = Y[j] + wy(j, t) + SY[j];
      const gx = p.tx + SHIMMER_PX * Math.sin(SHIMMER_W * t + p.sp), gy = p.ty + SHIMMER_PX * Math.cos(SHIMMER_W * 0.8 * t + p.sp * 1.7);
      const dx = gx - hx, dy = gy - hy, L = Math.hypot(dx, dy) || 1, bow = Math.sin(Math.PI * v) * p.arc;
      const qx = hx + dx * v - (dy / L) * bow, qy = hy + dy * v + (dx / L) * bow;
      const cc = mix(INK, p.c, v), al = 0.95 * Math.min(1, v * 1.6), rr = DOT_R * (1 - v) + 1.5 * v;
      c2.fillStyle = `rgba(${cc[0] | 0},${cc[1] | 0},${cc[2] | 0},${al.toFixed(3)})`;
      c2.beginPath(); c2.arc(qx, qy, rr, 0, TAU); c2.fill();
    }
  }
  let raf = 0, onScreen = false;
  const loop = (now: number) => { frame(now); raf = requestAnimationFrame(loop); };
  const run = () => {
    const want = !still && onScreen && !document.hidden;
    if (want && !raf) raf = requestAnimationFrame(loop);
    else if (!want && raf) { cancelAnimationFrame(raf); raf = 0; }
  };
  build();
  let w0 = W, h0 = H;
  const ro = new ResizeObserver(() => { if (sec.clientWidth === w0 && sec.clientHeight === h0) return; w0 = sec.clientWidth; h0 = sec.clientHeight; build(); });
  ro.observe(sec);
  let side = -1;
  // only keyboard focus holds a shape; a mouse click on Copy must not pin the spark
  const held = (m: (typeof cols)[number]) => !!m.col.querySelector(":focus-visible");
  const pick = (next: number) => {
    if (next === side) return;
    side = next;
    cols.forEach((m, i) => go(m, i === side || held(m) ? 1 : 0));
  };
  const offs: (() => void)[] = [];
  const on = (el: EventTarget, ev: string, fn: any) => { el.addEventListener(ev, fn); offs.push(() => el.removeEventListener(ev, fn)); };
  if (!still) {
    cols.forEach((m) => {
      on(m.col, "focusin", (e: FocusEvent) => { if ((e.target as Element).matches(":focus-visible")) go(m, 1); });
      on(m.col, "focusout", (e: FocusEvent) => { if (!m.col.contains(e.relatedTarget as Node) && side !== cols.indexOf(m)) go(m, 0); });
    });
    on(sec, "pointermove", (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const r = sec.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top;
      if (!touchMode.matches) pick(Math.min(cols.length - 1, Math.floor(mx / (W / cols.length))));
    });
    on(sec, "pointerleave", () => { mx = null; if (!touchMode.matches) pick(-1); });
  }
  const vis = new IntersectionObserver((es) => { onScreen = es[0].isIntersecting; run(); });
  vis.observe(sec);
  on(document, "visibilitychange", run);
  const mid = new IntersectionObserver((es) => es.forEach((e) => {
    const m = cols.find((c) => c.art === e.target); if (m && touchMode.matches) go(m, e.isIntersecting ? 1 : 0);
  }), { rootMargin: "-30% 0px -30% 0px" });
  cols.forEach((m) => mid.observe(m.art));
  // the theme switch changes the ink: repaint now if the field is at rest
  const theme = new MutationObserver(() => { readInk(); if (!raf) frame(performance.now()); });
  theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-hax-theme"] });
  return () => { cancelAnimationFrame(raf); ro.disconnect(); vis.disconnect(); mid.disconnect(); theme.disconnect(); offs.forEach((f) => f()); };
}
