import type { ReactNode } from "react";
import {
  ArrowUpRight, AudioLines, BookOpen, Brain, Check, ChevronDown, Cloud, FileText, Folder, GitBranch, Globe, HardDrive,
  Image as ImageIcon, Laptop, ListChecks, MessageCircle, Mic, Palette, Paperclip, Plus, Ratio, Search, SlidersHorizontal, Sparkle, Telescope, Wand2, X, Zap,
} from "lucide-react";
import { Caret, Send, Spin, Wave, sel, tog, type Entry, type Props } from "./ui";

/* ── Prompt input ───────────────────────────────────────────────
   Studied: ChatGPT (+ menu, model in header, Thinking pill, dictate + voice mode),
   Claude (+, tools, extended thinking, model + effort bottom right), Gemini (Tools,
   Fast / Thinking / Pro switch, mic, Live), Codex and Cursor (repo + branch + environment
   under the box, Ask vs Code, reasoning effort), Firefly (content type, ratio, style
   reference, model, Generate). One component; each switcher is optional. */
const MODELS: [string, string][] = [["Atlas 3 Fast", "Quick answers, everyday tasks"], ["Atlas 3", "Balanced, the default"], ["Atlas 3 Pro", "Hard problems, long documents"]];
const EFFORT = ["Low", "Medium", "High"];

function Menu({ title, rows, on, w = 260 }: { title: string; rows: [ReactNode, string, string?][]; on: number; w?: number }) {
  return (
    <div className="hk-pop relative z-10 shrink-0" style={{ width: w }}>
      <p className="hk-xs px-[10px] pt-[6px] pb-[6px]">{title}</p>
      {rows.map(([ic, t, s], i) => (
        <div key={t} className={`hk-mi ${i === on ? "hk-mi--on" : ""}`}>
          {ic}
          <span className="hk-col hk-grow"><span className="font-medium">{t}</span>{s && <span className="hk-s">{s}</span>}</span>
          {i === on && <Check size={15} strokeWidth={2.5} className="hk-blue" />}
        </div>
      ))}
    </div>
  );
}

function PromptInput({ o }: { o: Props }) {
  const st = o.state as string, img = o.surface === "Image", code = o.surface === "Coding agent";
  const open = o.open as string;
  const text = img ? "A paper boat on a still lake at dawn, soft fog, film grain" : code ? "Fix the flaky login test and open a PR" : "Summarise the Q3 churn report and draft three next steps";
  // "Run in" lives on the environment row, so opening it shows that row
  const ws = open === "Workspace" ? "Environment" : (o.workspace as string);
  const mic = o.voice === "Dictate" || st === "Listening";
  // the picker's right edge, from the composer's outer edge: border 1 + padding 10 +
  // send 34 (Generate 112) + gap 2 + mic 28 + gap 2 — so the menu opens right above it
  const pickerRight = 1 + 10 + (img ? 112 : 34) + 2 + (mic ? 30 : 0);
  const menu = open === "Model" && o.model
    ? <Menu title="Model" on={1} w={270} rows={(img ? [["Image 4", "Best detail and lighting"], ["Image 4 Ultra", "Highest quality, slower"], ["Partner model", "Uses other providers"]] as [string, string][] : MODELS).map(([t, s]) => [<Sparkle key={t} size={15} strokeWidth={2} className="hk-faint" />, t, s])} />
    : open === "Effort" && o.effort && !img
      ? <Menu title={code ? "Reasoning effort" : "Thinking"} on={2} w={240} rows={EFFORT.map((e, i) => [<Brain key={e} size={15} strokeWidth={2} className="hk-faint" />, e, ["Answers right away", "Thinks for a bit", "Thinks longest, best for hard tasks"][i]])} />
      : null;
  const runIn = open === "Workspace" && ws === "Environment" && !img;
  return (
    <div className="hk-col gap-[8px] w-[560px]" style={runIn ? { paddingBottom: 168 } : undefined}>
      {menu && <div className="hk-row justify-end" style={{ paddingRight: pickerRight }}>{menu}</div>}
      {st === "Working" && <div className="hk-row hk-s pl-[16px]"><Spin s={13} />Working on it · you can type the next ask</div>}
      <div className="hk-panel !rounded-[24px] p-[10px] pl-[12px] hk-col gap-[6px] relative">
        {o.attachments && st !== "Empty" && (
          <div className="hk-row gap-[8px] pb-[4px]">
            {img ? (
              <span className="hk-thumb relative" style={{ background: "linear-gradient(160deg,#c9d8e8,#8aa7c4 60%,#5f7d9c)" }}><span className="absolute right-[3px] top-[3px] grid place-items-center size-[18px] rounded-full bg-black/55 text-white"><X size={11} strokeWidth={2.5} /></span></span>
            ) : (
              <span className="hk-file"><span style={{ background: "#d0342c" }}><FileText size={16} strokeWidth={2} /></span><span className="hk-col"><span className="hk-t !text-[13px] !leading-[17px]">churn-q3.pdf</span><span className="hk-s !text-[11.5px] !leading-[15px]">PDF · 2.4 MB</span></span></span>
            )}
            {img && <span className="hk-s">Style reference</span>}
          </div>
        )}
        {st === "Listening" ? (
          <div className="hk-row h-[46px] px-[4px] gap-[12px]"><Wave n={34} h={24} /><span className="hk-s">Listening…</span></div>
        ) : (
          <p className={`hk-b px-[4px] pt-[6px] min-h-[46px] ${st === "Empty" ? "hk-faint" : ""}`}>
            {st === "Empty" ? (img ? "Describe the image you want" : code ? "Describe a task" : "Ask anything") : text}
            {st === "Typing" && <Caret />}
          </p>
        )}
        {/* Toolbar, as ChatGPT / Claude / Cursor do it: actions + active tool on the left,
            ONE combined model + effort picker on the right (Claude: "Opus · Extended"),
            then mic and send. When a tool is on, Tools collapses to its icon (ChatGPT). */}
        <div className="hk-row justify-between gap-[8px] min-w-0">
          <div className="hk-row !gap-[2px] relative min-w-0">
            <span className="hk-ib hk-ib--sm hk-ib--line shrink-0">{o.tools ? <Plus size={17} strokeWidth={2} /> : <Paperclip size={15} strokeWidth={2} />}</span>
            {o.tools && !img && (o.surface === "Chat"
              ? <><span className="hk-ib hk-ib--sm shrink-0" aria-label="Tools"><SlidersHorizontal size={15} strokeWidth={2} /></span><span className="hk-pick hk-pick--on shrink-0"><Telescope size={14} strokeWidth={2} />Deep research<X size={12} strokeWidth={2.25} /></span></>
              : <span className="hk-pick shrink-0"><SlidersHorizontal size={14} strokeWidth={2} />Tools</span>)}
            {img && <><span className="hk-pick"><ImageIcon size={14} strokeWidth={2} />Photo</span><span className="hk-pick"><Ratio size={14} strokeWidth={2} />16:9</span><span className="hk-pick"><Palette size={14} strokeWidth={2} />Style</span></>}
            {o.mode !== "None" && !img && <span className="hk-pick hk-pick--box shrink-0">{o.mode === "Ask" ? <MessageCircle size={13} strokeWidth={2} /> : o.mode === "Plan" ? <ListChecks size={13} strokeWidth={2} /> : <Zap size={13} strokeWidth={2} />}{o.mode}<ChevronDown size={13} strokeWidth={2} /></span>}
          </div>
          <div className="hk-row !gap-[2px] relative shrink-0">
            {(o.model || (o.effort && !img)) && (
              <span className={`hk-pick ${open === "Model" || open === "Effort" ? "hk-pick--box" : ""}`}>
                {o.model && (img ? "Image 4" : "Atlas 3")}
                {o.model && o.effort && !img && <span className="hk-faint">·</span>}
                {o.effort && !img && <span className={o.model ? "hk-faint" : ""}>{code ? "High" : "Thinking"}</span>}
                <ChevronDown size={13} strokeWidth={2} />
              </span>
            )}
            {o.voice === "Dictate" && st !== "Listening" && <span className="hk-ib hk-ib--sm"><Mic size={17} strokeWidth={1.9} /></span>}
            {st === "Listening" && <span className="hk-ib hk-ib--sm hk-ib--on"><Mic size={17} strokeWidth={1.9} /></span>}
            {img ? (
              <span className="hk-btn hk-btn--main !h-[34px] w-[112px]"><Wand2 size={14} strokeWidth={2} />Generate</span>
            ) : o.voice === "Voice mode" && st === "Empty" ? (
              <span className="hk-send" style={{ background: "var(--text-primary)", color: "var(--surface-page)" }}><AudioLines size={17} strokeWidth={2} /></span>
            ) : (
              <Send state={st === "Working" ? "stop" : st === "Empty" ? "off" : "on"} />
            )}
          </div>
        </div>
      </div>
      {ws !== "None" && !img && (
        <div className="hk-row gap-[2px] px-[6px] relative">
          {ws === "Folder" && <span className="hk-pick"><Folder size={14} strokeWidth={2} />atlas-web<ChevronDown size={13} strokeWidth={2} /></span>}
          {ws === "Repo and branch" && <><span className="hk-pick"><Folder size={14} strokeWidth={2} />acme/atlas-web<ChevronDown size={13} strokeWidth={2} /></span><span className="hk-pick"><GitBranch size={14} strokeWidth={2} />main<ChevronDown size={13} strokeWidth={2} /></span></>}
          {ws === "Environment" && <><span className="hk-pick"><Folder size={14} strokeWidth={2} />atlas-web<ChevronDown size={13} strokeWidth={2} /></span><span className="relative"><span className={`hk-pick ${runIn ? "hk-pick--box" : ""}`}><Cloud size={14} strokeWidth={2} />Cloud<ChevronDown size={13} strokeWidth={2} /></span>{runIn && <span className="absolute left-0 top-[calc(100%+8px)] z-10"><Menu title="Run in" on={1} w={250} rows={[[<Laptop key="l" size={15} strokeWidth={2} className="hk-faint" />, "On this computer", "Uses your local files"], [<Cloud key="c" size={15} strokeWidth={2} className="hk-faint" />, "Cloud", "Runs in a sandbox, keeps going when you close the laptop"]]} /></span>}</span><span className="hk-pick"><GitBranch size={14} strokeWidth={2} />main</span></>}
        </div>
      )}
    </div>
  );
}

/* ── Source picker ── Perplexity (Web · Academic · Social), Claude (Search and tools),
   ChatGPT (Connectors), Copilot (Work / Web). */
function SourcePicker({ o }: { o: Props }) {
  const rows: [ReactNode, string, string, boolean | "connect"][] = [
    [<Globe key="g" size={16} strokeWidth={1.9} />, "Web", "Search the internet", true],
    [<HardDrive key="d" size={16} strokeWidth={1.9} />, "Shared drive", "Finance, Sales, Product", true],
    [<BookOpen key="w" size={16} strokeWidth={1.9} />, "Team wiki", "142 pages", false],
    [<GitBranch key="r" size={16} strokeWidth={1.9} />, "Code", o.unconnected ? "Not connected" : "acme/atlas-web", o.unconnected ? "connect" : false],
  ];
  const n = rows.filter((r) => r[3] === true).length;
  return (
    <div className="w-[480px] hk-col gap-[8px]">
      {/* open menu: left edge on the "sources" button, 8 px above the composer (Perplexity, Claude) */}
      <div className="hk-pop relative z-10 w-[300px] ml-[11px]">
        {o.search && <div className="hk-field !h-[34px] !rounded-[9px] mb-[4px] hk-field--empty"><Search size={14} strokeWidth={2} />Find a source</div>}
        {rows.map(([ic, t, s, on]) => (
          <div key={t} className="hk-mi">
            <span className="w-[20px] grid place-items-center hk-mute shrink-0">{ic}</span>
            <span className="hk-col hk-grow"><span className="font-medium">{t}</span><span className="hk-s">{s}</span></span>
            {on === "connect" ? <span className="hk-btn hk-btn--sm">Connect</span> : o.style === "Switches" ? <span className={`hk-switch ${on ? "hk-switch--on" : ""}`} /> : on && <Check size={16} strokeWidth={2.5} className="hk-blue" />}
          </div>
        ))}
        <div className="hk-rule my-[4px] mx-[6px]" />
        <div className="hk-mi hk-link"><span className="w-[20px] grid place-items-center shrink-0"><Plus size={16} strokeWidth={2} /></span>Add connectors</div>
      </div>
      <div className="hk-panel !rounded-[22px] h-[56px] px-[10px] hk-row">
        <span className="hk-pick hk-pick--on"><Globe size={14} strokeWidth={2} />{n} sources<ChevronDown size={13} strokeWidth={2} /></span>
        <span className="hk-s hk-grow">Ask across your sources</span>
        <Send state="off" />
      </div>
    </div>
  );
}

/* ── Suggested prompts ── ChatGPT and Claude empty state, Gemini starter chips. */
function SuggestedPrompts({ o }: { o: Props }) {
  const asks: [string, string][] = [["Draft", "the launch announcement for Atlas 3"], ["Compare", "churn in Q2 and Q3 by region"], ["List", "the open risks before the March launch"], ["Plan", "next week's customer interviews"]];
  const chips = ["Draft the launch post", "Compare Q2 and Q3 churn", "List the open risks", "Plan customer interviews"];
  const n = Number(o.count);
  return (
    <div className="w-[520px] hk-col gap-[18px] items-center">
      {o.greeting && <p className="text-[24px] leading-[30px] font-semibold tracking-[-.4px]">What should we work on, Maya?</p>}
      <div className="hk-panel !rounded-[22px] w-full h-[56px] hk-row justify-between pl-[18px] pr-[10px]"><span className="hk-b hk-faint">Ask anything</span><Send state="off" /></div>
      {o.layout === "Chips" ? (
        <div className="hk-row flex-wrap justify-center gap-[8px]">
          {chips.slice(0, n).map((c) => <span key={c} className="hk-chip">{c}</span>)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-[8px] w-full">
          {asks.slice(0, n).map(([v, t]) => (
            <div key={t} className="hk-well !rounded-[14px] !bg-[var(--k-panel)] px-[14px] py-[10px] hk-row !items-start justify-between">
              <span className="hk-col"><span className="hk-t">{v}</span><span className="hk-s">{t}</span></span>
              <ArrowUpRight size={15} strokeWidth={2} className="hk-faint mt-[2px]" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Suggestions ── Copilot in Word/GitHub, Gemini in Workspace side panel, Notion AI. */
function Suggestions({ o }: { o: Props }) {
  const chips = o.after ? ["Turn this into a slide", "Shorten to 3 bullets", "Email it to the team"] : ["Close 3 stale issues", "Review 2 open PRs", "Draft release notes"];
  return (
    <div className="hk-panel !rounded-[22px] w-[520px] p-[14px] hk-col gap-[12px]">
      <p className="hk-s hk-row gap-[6px]"><Sparkle size={14} strokeWidth={2.25} className="hk-blue" />{o.after ? "Next steps for this answer" : <span>Suggested for <b className="text-[color:var(--text-primary)] font-semibold">atlas-web</b> right now</span>}</p>
      {o.layout === "List" ? (
        <div className="hk-col gap-[6px]">
          {chips.map((c) => (
            <div key={c} className="hk-mi !px-[10px] border border-[var(--k-edge)] !rounded-[12px]">
              <Sparkle size={14} strokeWidth={2} className="hk-faint" /><span className="hk-grow">{c}</span><ArrowUpRight size={14} strokeWidth={2} className="hk-faint" />
            </div>
          ))}
        </div>
      ) : (
        <div className="hk-row flex-wrap gap-[8px]">{chips.map((c) => <span key={c} className="hk-chip">{c}</span>)}</div>
      )}
      <div className="hk-rule" />
      <div className="hk-row justify-between"><span className="hk-b hk-faint">Ask about this project</span><span className="hk-row !gap-[2px]"><span className="hk-ib hk-ib--sm"><Mic size={17} strokeWidth={1.9} /></span><Send state="off" /></span></div>
    </div>
  );
}

/* ── Prompt templates ── ChatGPT GPT starters, Microsoft Copilot Prompt Gallery,
   Jasper/Writer templates; blanks as inline tokens (Mad Libs). */
function PromptTemplates({ o }: { o: Props }) {
  const Slot = ({ v, open }: { v: string; open?: boolean }) => (
    <span className="relative inline-flex items-center gap-[3px] h-[28px] px-[9px] mx-[2px] rounded-[8px] align-[1px] font-semibold text-[color:var(--k-blue)]" style={{ background: "var(--k-blue-soft)", boxShadow: open ? "0 0 0 2px var(--k-blue)" : undefined }}>
      {v}<ChevronDown size={13} strokeWidth={2.5} />
      {open && (
        <span className="hk-pop absolute left-0 top-[calc(100%+6px)] w-[200px] z-10 font-normal text-[13.5px] leading-[20px] text-[color:var(--text-primary)]">
          {["the exec team", "my manager", "the whole company"].map((t, i) => <span key={t} className={`hk-mi ${i === 0 ? "hk-mi--on" : ""}`}><span className="hk-grow">{t}</span>{i === 0 && <Check size={15} strokeWidth={2.5} className="hk-blue" />}</span>)}
        </span>
      )}
    </span>
  );
  return (
    <div className="hk-panel w-[520px] p-[18px] hk-col gap-[14px]">
      <div className="hk-row justify-between"><span className="hk-xs">Template · Status update</span>{o.gallery && <span className="hk-s hk-link">All templates</span>}</div>
      <p className="text-[17px] leading-[38px] font-medium">Write a <Slot v="short" /> update for <Slot v="the exec team" open={!!o.open} /> about <Slot v="launch risks" />, in a <Slot v="calm" /> tone.</p>
      <div className="hk-row justify-end gap-[8px]"><span className="hk-btn hk-btn--ghost">Edit as text</span><span className="hk-btn hk-btn--main">Use template</span></div>
    </div>
  );
}

/* ── Example gallery ── Firefly and Midjourney explore grids, v0 / Lovable community,
   Claude Artifacts gallery, Gemini Gems. */
function ExampleGallery({ o }: { o: Props }) {
  const img = o.kind === "Images";
  const tiles: [string, ReactNode][] = img
    ? [["Paper boat at dawn", "linear-gradient(160deg,#dfe7ef,#9fb5cb 55%,#6b84a0)"], ["Neon street in rain", "linear-gradient(160deg,#2b1d4e,#6a2c91 50%,#f06292)"], ["Clay desk scene", "linear-gradient(160deg,#f7e3cf,#e8b48d 55%,#c27b54)"]].map(([t, g]) => [t as string, <span key={t as string} className="block size-full" style={{ background: g as string }} />])
    : [["Weekly KPI dashboard", <div key="k" className="flex items-end gap-[6px] h-full p-[12px]">{[34, 46, 40, 58, 52, 76].map((h, i) => <i key={i} className="flex-1 rounded-t-[3px]" style={{ height: `${h}%`, background: i === 5 ? "var(--k-blue)" : "color-mix(in srgb, var(--k-blue) 24%, transparent)" }} />)}</div>],
       ["Vendor comparison", <div key="v" className="hk-col gap-[7px] p-[12px] text-[11px]">{[["Northwind", "$1.2k"], ["Contoso", "$980"], ["Fabrikam", "$1.4k"]].map(([n, v]) => <span key={n} className="hk-row justify-between border-b border-[var(--k-edge)] pb-[5px]"><span>{n}</span><span className="font-semibold">{v}</span></span>)}</div>],
       ["Launch checklist", <div key="c" className="hk-col gap-[8px] p-[12px] text-[11px]">{["Final brief", "QA sign-off", "Go live"].map((r, i) => <span key={r} className="hk-row !gap-[6px]"><span className={`hk-check !size-[13px] ${i < 2 ? "hk-check--on" : ""}`}>{i < 2 && <Check size={9} strokeWidth={3} />}</span>{r}</span>)}</div>]];
  return (
    <div className="w-[540px] hk-col gap-[12px]">
      <div className="hk-row justify-between"><span className="hk-h">{img ? "Start from an image" : "Start from an example"}</span><span className="hk-s hk-link">See all</span></div>
      {o.filters && <div className="hk-row gap-[6px]">{["All", img ? "Photo" : "Reports", img ? "Illustration" : "Planning", img ? "3D" : "Data"].map((t, i) => <span key={t} className={`hk-chip !h-[28px] ${i === 0 ? "hk-chip--sel" : ""}`}>{t}</span>)}</div>}
      <div className="grid grid-cols-3 gap-[10px]">
        {tiles.map(([t, art], i) => (
          <div key={t} className="hk-panel !rounded-[14px] overflow-hidden hk-col">
            <div className="h-[120px] relative" style={{ background: "var(--k-soft)" }}>{art}
              {i === 0 && o.hover && <span className="absolute inset-0 grid place-items-center" style={{ background: "rgba(16,24,40,.45)" }}><span className="hk-btn hk-btn--sm">{img ? "Use prompt" : "Remix"}</span></span>}
            </div>
            <p className="hk-t !text-[13px] px-[12px] py-[10px]">{t}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export const COMPOSERS: Record<string, Entry> = {
  "prompt-input": {
    C: PromptInput,
    opts: [
      sel("surface", "Surface", ["Chat", "Coding agent", "Image"]),
      sel("state", "State", ["Typing", "Empty", "Working", "Listening"]),
      tog("model", "Model switcher"), tog("effort", "Effort switcher"),
      sel("workspace", "Folder / environment", ["None", "Folder", "Repo and branch", "Environment"]),
      sel("mode", "Mode", ["None", "Ask", "Agent", "Plan"]),
      tog("tools", "Tools menu"), tog("attachments", "Attachments"),
      sel("voice", "Voice", ["Dictate", "Voice mode", "None"]),
      sel("open", "Open menu", ["None", "Model", "Effort", "Workspace"]),
    ],
    refs: ["ChatGPT composer", "Claude composer", "Gemini prompt bar", "Codex / Cursor agent input", "Adobe Firefly prompt bar"],
  },
  "source-picker": { C: SourcePicker, opts: [sel("style", "Selection", ["Checks", "Switches"]), tog("search", "Search box", false), tog("unconnected", "Unconnected source")], refs: ["Perplexity sources", "Claude search and tools", "ChatGPT connectors", "Microsoft Copilot Work / Web"] },
  "suggested-prompts": { C: SuggestedPrompts, opts: [sel("layout", "Layout", ["Cards", "Chips"]), sel("count", "Count", ["4", "3", "2"]), tog("greeting", "Greeting")], refs: ["ChatGPT empty state", "Claude starters", "Gemini chips"] },
  suggestions: { C: Suggestions, opts: [sel("layout", "Layout", ["Chips", "List"]), tog("after", "After a reply", false)], refs: ["GitHub Copilot chat", "Gemini in Workspace", "Notion AI"] },
  "prompt-templates": { C: PromptTemplates, opts: [tog("open", "Blank open", false), tog("gallery", "Link to gallery")], refs: ["Microsoft Copilot Prompt Gallery", "ChatGPT GPT starters", "Writer templates"] },
  "example-gallery": { C: ExampleGallery, opts: [sel("kind", "Content", ["Documents", "Images"]), tog("filters", "Filters"), tog("hover", "Hover", false)], refs: ["Adobe Firefly gallery", "Midjourney explore", "v0 community", "Claude artifacts"] },
};
