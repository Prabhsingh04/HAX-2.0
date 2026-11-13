"use client";

// One animated "How HAX works" scene, ported from HAX-2.0/index.html.
// Plays when its tile is mostly on screen, starts over after the tile leaves
// and comes back, and replays from the button. Reduced motion: finished scene.
import { useEffect, useRef } from "react";
import "./how-it-works-scenes.css";
import { CHAT_HTML, DASHBOARD_HTML, MAP_HTML } from "./howItWorksScenes";

export type SceneKind = "chat" | "map" | "ui";

const HTML: Record<SceneKind, string> = { chat: CHAT_HTML, map: MAP_HTML, ui: DASHBOARD_HTML };
const LABEL: Record<SceneKind, string> = {
  chat: "A chat with Claude, the HAX MCP connected. The request “Build a dashboard for my projects.” is typed into the prompt composer and sent. Claude answers “I’ll find the right HAX patterns.” and shows “Finding patterns…”.",
  map: "The request travels to HAX (@hax/react, shadcn), which picks six matches: App shell → Sidebar, Metric cards → CardContainer, Project table → Table, Selection & actions → Checkbox and Button, and two agentic patterns, AI assistant → AgentAvatar and Ask Aria → OpenInput.",
  ui: "A project dashboard assembles: an icon sidebar, a header with Export and New project buttons, three metric cards, and a project table with search, row checkboxes, status badges, progress and row actions. Then the AI assistant Aria appears at the bottom right and opens a panel with a greeting, suggested prompts and a prompt composer.",
};
const REQ = "Build a dashboard for my projects.";

type At = (ms: number, fn: () => void) => void;
type Scene = { reset(): void; play(at: At, track: (id: number) => void): void; final?(): void; dispose?(): void };

const $ = (r: Element, q: string) => r.querySelector(q) as HTMLElement | null;
const $$ = (r: Element, q: string) => Array.from(r.querySelectorAll(q)) as HTMLElement[];

/* 01 · type the request, send it, Claude starts finding patterns */
function chatScene(t: HTMLElement): Scene {
  return {
    reset() {
      $(t, ".hw-chat")?.classList.remove("is-sent");
      const typed = $(t, ".hw-chat__typed");
      if (typed) typed.textContent = "";
      $$(t, ".hw-chat__user, .hw-chat__bot").forEach((e) => e.classList.remove("is-in"));
    },
    play(at, track) {
      const typed = $(t, ".hw-chat__typed");
      let n = 0;
      at(500, () => {
        const id = window.setInterval(() => {
          n++;
          if (typed) typed.textContent = REQ.slice(0, n);
          if (n >= REQ.length) clearInterval(id);
        }, 42);
        track(id);
      });
      const sent = 500 + REQ.length * 42 + 450;
      at(sent, () => {
        if (typed) typed.textContent = "";
        $(t, ".hw-chat")?.classList.add("is-sent");
        $(t, ".hw-chat__user")?.classList.add("is-in");
      });
      at(sent + 900, () => $(t, ".hw-chat__bot")?.classList.add("is-in"));
    },
  };
}

/* 02 · the request reaches HAX, which branches out to six matching patterns */
function mapScene(t: HTMLElement): Scene {
  const map = $(t, ".hw-map")!;
  const svg = $(t, ".hw-map__lines")!;
  function draw() {
    const b = map.getBoundingClientRect();
    if (!b.width) return;
    const req = $(t, ".hw-map__req")!.getBoundingClientRect();
    const hax = $(t, ".hw-map__hax")!.getBoundingClientRect();
    const X = (v: number) => v - b.left;
    const Y = (v: number) => v - b.top;
    const hy = Y(hax.top + hax.height / 2), hx = X(hax.right);
    const d = [`M${X(req.right)} ${Y(req.top + req.height / 2)} L${X(hax.left)} ${hy}`];
    $$(t, ".hw-pk").forEach((pk) => {
      const r = pk.getBoundingClientRect(), x2 = X(r.left), y2 = Y(r.top + r.height / 2), mx = hx + (x2 - hx) * 0.5;
      d.push(`M${hx} ${hy} C${mx} ${hy} ${mx} ${y2} ${x2} ${y2}`);
    });
    const on = $$(svg, "path").map((p) => p.classList.contains("is-in"));
    svg.setAttribute("viewBox", `0 0 ${b.width} ${b.height}`);
    svg.innerHTML = d.map((s, i) => `<path class="hw-map__l${i}" d="${s}"/>`).join("");
    (Array.from(svg.querySelectorAll("path")) as SVGPathElement[]).forEach((p, i) => {
      p.style.setProperty("--len", String(Math.ceil(p.getTotalLength()) + 1));
      if (on[i] || t.classList.contains("is-done")) p.classList.add("is-in");
    });
  }
  draw();
  const ro = new ResizeObserver(draw);
  ro.observe(map);
  document.fonts?.ready.then(draw);
  return {
    reset() {
      draw();
      $$(t, ".hw-pk, .hw-map__req, .hw-map__hax, .hw-map__lines path").forEach((e) => e.classList.remove("is-in"));
      map.classList.remove("is-think");
    },
    final() {
      draw();
      $$(svg, "path").forEach((p) => p.classList.add("is-in"));
    },
    play(at) {
      // one thing after another: request → line → HAX → for each match, its
      // line draws out of HAX and the card lands as the line reaches it
      const paths = $$(svg, "path"), req = $(t, ".hw-map__req"), hax = $(t, ".hw-map__hax"), LINE = 280;
      const on = (el?: Element | null) => () => el?.classList.add("is-in");
      at(80, on(req));
      at(380, on(paths[0]));
      at(380 + LINE, on(hax));
      at(380 + LINE + 100, () => map.classList.add("is-think"));
      let ms = 380 + LINE + 320;
      $$(t, ".hw-pk").forEach((pk, i) => {
        at(ms, on(paths[i + 1]));
        at(ms + LINE - 40, on(pk));
        ms += LINE + 70;
      });
      at(ms + 150, () => map.classList.remove("is-think"));
    },
    dispose() {
      ro.disconnect();
    },
  };
}

/* 03 · the dashboard assembles, then Aria arrives and opens */
function dashboardScene(t: HTMLElement): Scene {
  const db = $(t, ".hw-db")!;
  function pct(final: boolean) {
    $$(t, ".hw-db__pc").forEach((el) => {
      const to = Number(el.getAttribute("data-pct"));
      if (final) {
        el.textContent = `${to}%`;
        return;
      }
      const s0 = performance.now();
      const tick = (now: number) => {
        const k = Math.min(1, (now - s0) / 1000);
        el.textContent = `${Math.round(to * (1 - Math.pow(1 - k, 3)))}%`;
        if (k < 1 && !t.classList.contains("is-done")) requestAnimationFrame(tick);
      };
      tick(s0);
    });
  }
  const tag = (at: At, el: Element | null, ms: number) => {
    at(ms, () => el?.classList.add("is-tag"));
    at(ms + 1100, () => el?.classList.remove("is-tag"));
  };
  return {
    reset() {
      db.classList.remove("is-fab", "is-open");
      $$(t, ".hw-db__in, .is-tag").forEach((e) => e.classList.remove("is-in", "is-tag"));
      $$(t, ".hw-db__pc").forEach((e) => (e.textContent = "0%"));
    },
    final() {
      pct(true);
    },
    play(at) {
      const side = $(t, ".hw-db__side"), top = $(t, ".hw-db__top"), cards = $$(t, ".hw-db__card"), tbl = $(t, ".hw-db__tbl");
      const rows = $$(t, ".hw-db__tr:not(.hw-db__tr--h)");
      at(250, () => side?.classList.add("is-in"));
      tag(at, side, 350);
      at(700, () => top?.classList.add("is-in"));
      tag(at, $(t, ".hw-db__btn"), 800);
      cards.forEach((c, i) => at(1150 + i * 140, () => c.classList.add("is-in")));
      tag(at, $(t, ".hw-db__cards"), 1250);
      at(1800, () => tbl?.classList.add("is-in"));
      tag(at, tbl, 1850);
      rows.forEach((r, i) => at(2150 + i * 160, () => r.classList.add("is-in")));
      at(2150, () => pct(false));
      tag(at, $(t, ".hw-db__cb[data-tag]"), 2700);
      at(3700, () => db.classList.add("is-fab"));
      tag(at, $(t, ".hw-db__fab"), 3800);
      at(5000, () => $(t, ".hw-db__fab")?.classList.add("is-press"));
      at(5180, () => {
        $(t, ".hw-db__fab")?.classList.remove("is-press");
        db.classList.add("is-open");
      });
      tag(at, $(t, ".hw-db__aria"), 5500);
    },
  };
}

const BUILD: Record<SceneKind, (t: HTMLElement) => Scene> = { chat: chatScene, map: mapScene, ui: dashboardScene };

export function HowItWorksScene({ kind }: { kind: SceneKind }) {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const replay = useRef<HTMLButtonElement>(null);
  const playRef = useRef<() => void>(() => {});

  useEffect(() => {
    const t = root.current!;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = BUILD[kind](t);
    let timers: number[] = [];
    const stop = () => {
      timers.forEach((id) => {
        clearTimeout(id);
        clearInterval(id);
      });
      timers = [];
    };
    const play = () => {
      stop();
      t.classList.remove("is-done");
      if (still) {
        t.classList.add("is-done");
        scene.final?.();
        return;
      }
      scene.reset();
      scene.play((ms, fn) => timers.push(window.setTimeout(fn, ms)), (id) => timers.push(id));
    };
    playRef.current = play;

    if (still || !("IntersectionObserver" in window)) {
      play();
      return () => {
        stop();
        scene.dispose?.();
      };
    }
    // play each time the tile comes back into view; leaving resets it
    let shown = false;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && e.intersectionRatio >= 0.6) {
          if (!shown) {
            shown = true;
            play();
          }
        } else if (!e.isIntersecting) shown = false;
      },
      { threshold: [0, 0.6] },
    );
    io.observe(stage.current!);
    return () => {
      io.disconnect();
      stop();
      scene.dispose?.();
    };
  }, [kind]);

  const onReplay = () => {
    const rp = replay.current;
    if (rp) {
      rp.classList.remove("is-spin");
      void rp.offsetWidth;
      rp.classList.add("is-spin");
    }
    playRef.current();
  };

  return (
    <div ref={root} data-hw={kind} className="hw-scene">
      <div ref={stage} role="img" aria-label={LABEL[kind]} className="h-full">
        <div aria-hidden className="h-full" dangerouslySetInnerHTML={{ __html: HTML[kind] }} />
      </div>
      <button ref={replay} className="hw-replay" type="button" aria-label="Replay this step" title="Replay" onClick={onReplay}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
