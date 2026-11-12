"use client";
import { AGENT_PROMPT } from "@/components/hax/v1/home/AgentsAndDevelopers";
import { Eyebrow, H2, Tag, btn } from "../ui";
import { CopyIcon, useCopy } from "../copy";

// Figma: Two ways in 105:6092
export function TwoWaysIn() {
  const [copied, copy] = useCopy();
  const col = "flex flex-col items-start gap-[16px] p-[40px]";
  const h3 = "font-light leading-[36px] text-[30px] tracking-[-0.3px] text-[color:var(--text)]";
  const sub = "leading-[24px] text-[16px] text-[color:var(--text-2)]";
  const well = "w-full rounded-[12px] border border-[var(--edge)] bg-[var(--panel-2)] p-[16px] font-[family-name:var(--font-mono)] leading-[20px] text-[13px]";
  return (
    <section id="start" className="px-[24px] py-[96px]" data-node-id="105:6092">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-[48px]">
        <div className="h3-reveal flex flex-col gap-[16px]">
          <Eyebrow>Two ways in</Eyebrow>
          <H2>One library.<br />Two ways in</H2>
        </div>
        <div className="h3-reveal grid grid-cols-1 overflow-clip rounded-[24px] border border-[var(--edge)] bg-[var(--panel)] md:grid-cols-2">
          <div className={col}>
            <Tag>Claude · Cursor · Codex</Tag>
            <h3 className={h3}>For founders</h3>
            <p className={sub}>One prompt. Your agent builds the screens.</p>
            <pre className={`${well} m-0 whitespace-pre-wrap text-[rgba(224,228,236,.88)]`}>{AGENT_PROMPT}</pre>
            <button type="button" onClick={() => copy(AGENT_PROMPT)} className={`${btn} h3-btn--primary`}>
              <span aria-live="polite">{copied ? "Prompt copied" : "Copy the prompt"}</span>
              <CopyIcon copied={copied} src="/hax/v3/icon-copy-16-ink.svg" />
            </button>
          </div>
          <div className={`${col} border-t border-[var(--edge)] md:border-l md:border-t-0`}>
            <Tag>React</Tag>
            <h3 className={h3}>For developers</h3>
            <p className={sub}>The same patterns, in React.</p>
            <p className={`${well} text-[color:var(--text)]`}><span className="text-[color:var(--text-2)]">$</span> npm i @hax/react</p>
            <a href="/v3/hax-docs#quick-start" className={`${btn} h3-btn--secondary`}>
              Read the quick start
              <img alt="" src="/hax/v3/icon-right-16-light.svg" className="h3-arrow size-[16px]" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
