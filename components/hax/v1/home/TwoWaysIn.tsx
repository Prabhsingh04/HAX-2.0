"use client";
import { useEffect, useRef, useState } from "react";
import { mountDotField } from "./dotField";

// Figma: Two ways in 98:19688 (hover states 101:4304)
import { AGENT_PROMPT as PROMPT } from "./AgentsAndDevelopers";

export function TwoWaysIn() {
  const sec = useRef<HTMLElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => (sec.current && cv.current ? mountDotField(sec.current, cv.current) : undefined), []);
  const copy = () => {
    navigator.clipboard?.writeText(PROMPT).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    }, () => {});
  };
  const btn = "hx-btn hx-btn--outline bg-[var(--surface-page)] border border-[var(--stroke-default)] flex gap-[6px] h-[40px] items-center justify-center px-[20px] rounded-[var(--radius-pill)] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] font-semibold leading-[20px] text-[14px] tracking-[0.07px] whitespace-nowrap";
  const cap = "font-[family-name:var(--font-code)] leading-[16px] text-[11.5px] text-[color:var(--text-secondary)] tracking-[0.2px] whitespace-nowrap";
  return (
    <section id="start" ref={sec} className="border-y border-[var(--stroke-subtle)] relative w-full h-[828px] overflow-hidden" data-node-id="98:19688">
      <canvas ref={cv} aria-hidden className="absolute inset-0 size-full pointer-events-none" />
      <div className="relative flex flex-col gap-[56px] items-center py-[128px] w-full">
        <h2 className="hx-reveal font-semibold leading-[58px] text-[50px] text-center tracking-[-0.6px] whitespace-nowrap">
          One library.{" "}
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg, rgb(217, 119, 6) 0%, rgb(217, 119, 6) 47.295%, rgb(225, 29, 72) 78.918%, rgb(190, 24, 93) 100%)" }}>
            Two ways in
          </span>
        </h2>
        <div className="flex gap-[56px] items-start w-[960px]">
          <div data-col className="flex flex-col gap-[12px] items-center px-[12px] py-[40px] w-[452px]">
            <div className="pb-[6px]"><div data-shape="spark" className="h-[190px] w-[360px]" /></div>
            <h3 className="font-semibold leading-[40px] text-[32px] tracking-[-0.3px]">For founders</h3>
            <p className="pb-[8px] leading-[26px] text-[16px] text-[color:var(--text-secondary)]">One prompt. Your agent builds the screens.</p>
            <button type="button" onClick={copy} className={btn}>
              <img alt="" src="/hax/v1/icon-arrow-right-ink.svg" className="hx-arrow size-[16px]" />
              <span aria-live="polite">{copied ? "Prompt copied" : "Copy the prompt"}</span>
            </button>
            <p className={cap}>Claude · Cursor · Codex</p>
          </div>
          <div data-col className="flex flex-col gap-[12px] items-center px-[12px] py-[40px] w-[452px]">
            <div className="pb-[6px]"><div data-shape="code" className="h-[190px] w-[360px]" /></div>
            <h3 className="font-semibold leading-[40px] text-[32px] tracking-[-0.3px]">For developers</h3>
            <p className="pb-[8px] leading-[26px] text-[16px] text-[color:var(--text-secondary)]">The same patterns, in React.</p>
            <a href="/hax-docs" className={btn}>
              <img alt="" src="/hax/v1/icon-arrow-right-ink.svg" className="hx-arrow size-[16px]" />
              Read the quick start
            </a>
            <p className={cap}>npm i @hax/react</p>
          </div>
        </div>
      </div>
    </section>
  );
}
