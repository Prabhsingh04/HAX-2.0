"use client";
import "./statement.css";
import { useEffect, useRef } from "react";

// What HAX is for, as one big statement (landing skill: tagline reveal). The words light
// up one by one, in reading order, as the section scrolls up the screen, and stay lit.
// "agent" lights in agent orange and "You" in human blue: the X and the H of the logo.
const LINES: { t: string; tone?: "agent" | "human" }[][] = [
  [{ t: "Your" }, { t: "agent", tone: "agent" }, { t: "does" }, { t: "the" }, { t: "work." }],
  [{ t: "You", tone: "human" }, { t: "stay" }, { t: "in" }, { t: "charge" }, { t: "of" }, { t: "every" }, { t: "step." }],
];

export function Statement() {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const text = ref.current;
    if (!text) return;
    const words = [...text.querySelectorAll<HTMLElement>(".hx-say__w")];
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      words.forEach((w) => w.classList.add("is-lit"));
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      // 0 when the text's top reaches 82% of the screen, 1 when its bottom reaches 40%
      const r = text.getBoundingClientRect(), vh = innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.82 - r.top) / (vh * 0.42 + r.height)));
      const n = Math.round(p * words.length);
      for (let i = 0; i < n; i++) words[i].classList.add("is-lit");
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <section className="hx-say flex flex-col gap-[32px] items-center px-[144px] py-[160px] w-full" aria-label="What HAX is for">
      <p ref={ref} className="hx-say__text font-light text-center text-[64px] leading-[72px] tracking-[-1.2px]">
        {LINES.map((line, li) => (
          <span key={li} className="block">
            {line.map((w, wi) => (
              <span key={wi} className={`hx-say__w${w.tone ? ` hx-say__w--${w.tone}` : ""}`}>{w.t}{wi < line.length - 1 ? " " : ""}</span>
            ))}
          </span>
        ))}
      </p>
      <p className="max-w-[640px] text-[18px] leading-[28px] text-center text-[color:var(--text-secondary)] [text-wrap:balance]">
        Every HAX component is built around that. It shows what the agent is doing, asks before it acts, and leaves a trace you can undo.
      </p>
    </section>
  );
}
