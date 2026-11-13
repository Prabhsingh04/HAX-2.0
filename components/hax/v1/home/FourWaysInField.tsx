"use client";
import { useEffect, useRef } from "react";
import { mountDotField } from "./dotField";

// The columns for "One library. Four ways in" (data in FourWaysIn.tsx), built like the old
// "Two ways in" (Figma 98:19688): a dot field behind, and hovering or keyboard-focusing a column
// gathers the dots into its shape. The columns share their rows (subgrid), so every title,
// line, button and caption sits on the same line across all four.
export type Way = {
  id: string;
  shape: "frame" | "spark" | "code" | "bot";
  title: string;
  line: string;
  cta: { label: string; href: string };
  caption: string;
};

const btn = "hx-btn hx-btn--outline bg-[var(--surface-page)] border border-[var(--stroke-default)] flex gap-[6px] h-[40px] items-center justify-center px-[20px] rounded-[var(--radius-pill)] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] font-semibold leading-[20px] text-[14px] tracking-[0.07px] whitespace-nowrap";
const caption = "font-[family-name:var(--font-code)] leading-[16px] text-[11.5px] text-[color:var(--text-secondary)] tracking-[0.2px] whitespace-nowrap";

export function FourWaysInField({ ways }: { ways: Way[] }) {
  const sec = useRef<HTMLElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  useEffect(() => (sec.current && cv.current ? mountDotField(sec.current, cv.current) : undefined), []);
  return (
    <section id="ways-in" ref={sec} aria-labelledby="hx-ways-h" className="relative w-full overflow-hidden border-y border-[var(--stroke-subtle)]">
      <canvas ref={cv} aria-hidden="true" className="pointer-events-none absolute inset-0 size-full" />
      <div className="relative flex w-full flex-col items-center gap-[56px] px-[144px] py-[128px]">
        <div className="hx-reveal flex flex-col items-center gap-[16px] text-center">
          <h2 id="hx-ways-h" className="whitespace-nowrap font-semibold leading-[58px] text-[50px] tracking-[-0.6px]">One library. Four ways in</h2>
          <p className="max-w-[720px] leading-[26px] text-[16px] text-[color:var(--text-secondary)] [text-wrap:balance]">
            Find the view that fits your work, whether you are designing an interaction, setting agent permissions, building an integration, or using patterns in an agent workflow.
          </p>
        </div>
        <div className="grid w-full max-w-[1152px] grid-cols-4 gap-x-[24px] gap-y-[12px]">
          {ways.map((w) => (
            <div key={w.id} data-col className="row-span-5 grid grid-rows-subgrid justify-items-center gap-y-[12px] text-center">
              <div className="pb-[6px]"><div data-shape={w.shape} className="h-[150px] w-[220px]" /></div>
              <h3 className="font-semibold leading-[32px] text-[26px] tracking-[-0.3px]">{w.title}</h3>
              <p className="max-w-[240px] leading-[24px] text-[15px] text-[color:var(--text-secondary)] [text-wrap:balance]">{w.line}</p>
              <div className="pt-[8px]">
                <a href={w.cta.href} className={btn}>
                  <img alt="" src="/hax/v1/icon-arrow-right-ink.svg" className="hx-arrow size-[16px]" />
                  {w.cta.label}
                </a>
              </div>
              <p className={caption}>{w.caption}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
