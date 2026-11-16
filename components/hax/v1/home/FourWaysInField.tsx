"use client";
import { useEffect, useRef } from "react";
import { mountDotField } from "./dotField";

// The columns for "One library. Four ways in" (data in FourWaysIn.tsx), laid out like Antigravity's
// "For developers / For organizations": a dot field behind the whole section, each column's words
// in the middle of its own patch of it, and hovering or keyboard-focusing a column gathers the dots
// into a picture drawn round those words (the art box, [data-shape], reaches past the column so the
// picture has room). The columns share their rows (subgrid), so every title, line, button and
// caption sits on the same line across a row: four columns on desktop, two on tablets, one on phones.
export type Way = {
  id: string;
  shape: "pen" | "spark" | "code" | "bot";
  title: string;
  line: string;
  cta: { label: string; href: string };
  caption: string;
};

const btn = "hx-btn hx-btn--outline bg-[var(--surface-page)] border border-[var(--stroke-default)] flex gap-[6px] h-[40px] items-center justify-center px-[20px] rounded-[var(--radius-pill)] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] font-semibold leading-[20px] text-[14px] tracking-[0.07px] whitespace-nowrap";
const caption = "font-[family-name:var(--font-code)] leading-[16px] text-[11.5px] text-[color:var(--text-secondary)] tracking-[0.2px] [text-wrap:balance]";
// every line of a column's words is this wide, so the box the picture is drawn round matches:
// 224px up to 1440px, growing on wider windows (320px at 1900px and up) so lines don't wrap
const row = "relative w-[clamp(224px,21vw_-_80px,320px)] max-w-full";

export function FourWaysInField({ ways }: { ways: Way[] }) {
  const sec = useRef<HTMLElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  useEffect(() => (sec.current && cv.current ? mountDotField(sec.current, cv.current) : undefined), []);
  return (
    // the section runs the full width of the window, past the page's 1440px column (SiteShell clips
    // the overflow), so the field and its rules reach both edges
    <section id="ways-in" ref={sec} aria-labelledby="hx-ways-h" className="relative mx-[calc(50%_-_50vw)] w-screen overflow-hidden border-y border-[var(--stroke-subtle)]">
      <canvas ref={cv} aria-hidden="true" className="pointer-events-none absolute inset-0 size-full" />
      <div className="relative flex w-full flex-col items-center px-[var(--hx-gutter)] pb-[40px] pt-[72px] md:pt-[96px] xl:pt-[112px]">
        <div className="hx-reveal flex max-w-[720px] flex-col items-center gap-[16px] text-center">
          <h2 id="hx-ways-h" className="font-semibold leading-[42px] text-[34px] tracking-[-0.4px] [text-wrap:balance] md:leading-[50px] md:text-[42px] xl:leading-[58px] xl:text-[50px] xl:tracking-[-0.6px]">One library. Four ways in</h2>
          <p className="leading-[26px] text-[16px] text-[color:var(--text-secondary)] [text-wrap:balance]">
            Find the view that fits your work, whether you are designing an interaction, setting agent permissions, building an integration, or using patterns in an agent workflow.
          </p>
        </div>
        <div className="mt-[32px] grid w-full grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
          {ways.map((w) => (
            // more room under the words than over them: the pen's nib sits under its caption
            <div key={w.id} data-col className="relative row-span-4 grid grid-rows-subgrid justify-items-center gap-y-[12px] pb-[96px] pt-[64px] text-center md:pb-[112px] md:pt-[72px]">
              <div data-shape={w.shape} aria-hidden="true" className="pointer-events-none absolute -bottom-[32px] -inset-x-[20px] -top-[24px]" />
              <h3 data-tx className={`${row} font-semibold leading-[32px] text-[26px] tracking-[-0.3px]`}>{w.title}</h3>
              <p data-tx className={`${row} leading-[24px] text-[15px] text-[color:var(--text-secondary)] [text-wrap:balance]`}>{w.line}</p>
              <div data-tx className={`${row} flex justify-center pt-[8px]`}>
                <a href={w.cta.href} className={btn}>
                  <img alt="" src="/hax/v1/icon-arrow-right-ink.svg" className="hx-arrow size-[16px]" />
                  {w.cta.label}
                </a>
              </div>
              <p data-tx className={`${row} ${caption}`}>{w.caption}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
