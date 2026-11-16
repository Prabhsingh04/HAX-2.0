"use client";
import "./use-two-ways.css";
import { useEffect, useRef, useState } from "react";
import { AGENT_PROMPT } from "./AgentsAndDevelopers";
import { KIT } from "../library/kit";
import { defaults } from "../library/kit/ui";
import { DSFonts } from "../library/kit/ds";

// Use HAX two ways, as one band. It replaces "Two ways in" and "Your AI agent already
// knows how to use it", which said the same thing twice. Flat HAX navy is the page's one
// colour moment, and the colour means something: the person's words are blue, the agent's
// are orange (the H and the X of the logo).
// Left: a coding agent asks the HAX MCP server which patterns fit (discover_patterns, the
// server's real search tool), step by step once the band scrolls in.
// Right: the React code, and the real kit components it draws.
const MCP_CMD = "claude mcp add --transport http hax https://nucleux.in/mcp";

export function UseTwoWays() {
  const ref = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (key: string, text: string) =>
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1400);
    }, () => {});

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStep(4);
      return;
    }
    const timers: number[] = [];
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      [1, 2, 3, 4].forEach((s, i) => timers.push(window.setTimeout(() => setStep(s), 250 + i * 850)));
    }, { threshold: 0.3 });
    io.observe(el);
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  const streaming = KIT.streaming, composer = KIT["prompt-input"];
  return (
    <section ref={ref} id="start" className="hx-two w-full px-[144px] py-[112px]" aria-labelledby="hx-two-h">
      <div className="flex flex-col gap-[16px] items-center text-center">
        <h2 id="hx-two-h" className="hx-reveal font-extralight text-[50px] leading-[60px]">Use HAX from your agent or your code</h2>
        <p className="max-w-[640px] text-[16px] leading-[26px] text-[color:var(--two-mute)] [text-wrap:balance]">
          HAX runs an MCP server, so Claude, Cursor, Codex and VS Code can ask it which patterns fit. Prefer to write the code yourself? It is one package.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-[32px] mt-[56px]">
        {/* From your agent */}
        <div className="hx-two__panel">
          <div className="hx-two__hd">
            <h3>From your agent</h3>
            <span className="hx-two__mono">Claude · Cursor · Codex · VS Code</span>
          </div>
          <div className="hx-two__chat">
            <p className={`hx-two__me hx-two__in${step >= 1 ? " is-on" : ""}`}>Add an approval step before Atlas sends renewal emails. Use HAX.</p>
            <div className={`hx-two__call hx-two__in${step >= 2 ? " is-on" : ""}`}>
              <span className="hx-two__ag" aria-hidden />
              <span className="hx-two__mono hx-two__tool">hax · discover_patterns</span>
              <span className="hx-two__mono hx-two__arg">query: &quot;approval before sending email&quot;</span>
              <span className="hx-two__status">{step >= 3 ? "2 found" : <i className="hx-two__spin" aria-label="Searching" />}</span>
            </div>
            <ul className={`hx-two__found hx-two__in${step >= 3 ? " is-on" : ""}`}>
              <li><b>Approval card</b><span>Shows what will happen, the cost and the undo window.</span></li>
              <li><b>Permission request</b><span>Asks once before the agent uses a new tool.</span></li>
            </ul>
            <p className={`hx-two__reply hx-two__in${step >= 4 ? " is-on" : ""}`}>
              <span className="hx-two__ag" aria-hidden />
              I&apos;ll use the Approval card with a 5 minute undo. Here is the plan before I change any files.
            </p>
          </div>
          <div className="hx-two__ft">
            <button type="button" className="hx-two__btn" onClick={() => copy("prompt", AGENT_PROMPT)}>
              <span aria-live="polite">{copied === "prompt" ? "Prompt copied" : "Copy the prompt"}</span>
            </button>
            <a href="/mcp" className="hx-two__link">MCP setup <span aria-hidden>→</span></a>
          </div>
          <button type="button" className="hx-two__cmd" onClick={() => copy("mcp", MCP_CMD)} aria-label="Copy the Claude Code setup command">
            <span className="hx-two__mono">{MCP_CMD}</span>
            <span className="hx-two__cmdk" aria-live="polite">{copied === "mcp" ? "Copied" : "Copy"}</span>
          </button>
        </div>

        {/* From your code */}
        <div className="hx-two__panel">
          <div className="hx-two__hd">
            <h3>From your code</h3>
            <button type="button" className="hx-two__pill hx-two__mono" onClick={() => copy("npm", "npm install @hax/react")} aria-label="Copy the install command">
              <span aria-live="polite">{copied === "npm" ? "Copied" : "npm i @hax/react"}</span>
            </button>
          </div>
          <pre className="hx-two__code" aria-label="Example code">
            <span className="k">import</span> {"{ "}<span className="t">Thread</span>, <span className="t">Message</span>, <span className="t">AgentComposer</span>{" }"} <span className="k">from</span> <span className="s">&quot;@hax/react&quot;</span>;{"\n\n"}
            {"<"}<span className="t">Thread</span>{">\n"}
            {"  <"}<span className="t">Message</span> <span className="a">role</span>=<span className="s">&quot;agent&quot;</span> <span className="a">content</span>={"{reply}"} <span className="a">streaming</span>{" />\n"}
            {"  <"}<span className="t">AgentComposer</span>{"\n"}
            {"    "}<span className="a">onSubmit</span>={"{send}"}{"\n"}
            {"    "}<span className="a">placeholder</span>=<span className="s">&quot;Ask anything&quot;</span>{"\n"}
            {"  />\n"}
            {"</"}<span className="t">Thread</span>{">"}
          </pre>
          <div className="hx-two__render">
            <span className="hx-two__lab">What it draws</span>
            <div className="hk hx-two__live" data-ds="shadcn" aria-hidden>
              <DSFonts ds="shadcn" />
              <streaming.C o={defaults(streaming.opts)} />
              <composer.C o={{ ...defaults(composer.opts), state: "Empty", attachments: false, tools: false, effort: false, voice: "None" }} />
            </div>
          </div>
          <div className="hx-two__ft">
            <a href="/hax-docs" className="hx-two__link">Read the quick start <span aria-hidden>→</span></a>
          </div>
        </div>
      </div>
    </section>
  );
}
