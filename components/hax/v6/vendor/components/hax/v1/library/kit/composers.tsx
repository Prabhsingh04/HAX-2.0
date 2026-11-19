import type { ReactElement, ReactNode } from "react";
import {
  ArrowUpRight, AudioLines, BookOpen, Brain, Check, ChevronDown, Cloud, FileText, Folder, GitBranch, Globe, HardDrive,
  Image as ImageIcon, Laptop, ListChecks, MessageCircle, Mic, Palette, Paperclip, Plus, Ratio, Search, SlidersHorizontal, Sparkle, Square, Telescope, Wand2, X, Zap,
} from "@/components/hax/v6/vendor/components/hax/v1/library/kit/icons";
import { AgentHead, Caret, Send, Spin, Typing, Wave, sel, st, tog, type Entry, type Props } from "@/components/hax/v6/vendor/components/hax/v1/library/kit/ui";
import { Btn, Chip, Field, IconBtn, Menu, MenuItem, Pick, Pressable, Rule, SendBtn, Switch, TextLink } from "@/components/hax/v6/vendor/components/hax/v1/library/kit/parts";

/* ── Prompt input ───────────────────────────────────────────────
   Studied: ChatGPT (+ menu, model in header, Thinking pill, dictate + voice mode),
   Claude (+, tools, extended thinking, model + effort bottom right), Gemini (Tools,
   Fast / Thinking / Pro switch, mic, Live), Codex and Cursor (repo + branch + environment
   under the box, Ask vs Code, reasoning effort), Firefly (content type, ratio, style
   reference, model, Generate). One component; each switcher is optional. */
const MODELS: [string, string][] = [["Atlas 3 Fast", "Quick answers, everyday tasks"], ["Atlas 3", "Balanced, the default"], ["Atlas 3 Pro", "Hard problems, long documents"]];
const EFFORT = ["Low", "Medium", "High"];

// an open picker menu: a title, then one row per choice with the chosen one checked
function PickMenu({ title, rows, on, w = 260 }: { title: string; rows: [ReactElement, string, string?][]; on: number; w?: number }) {
  return (
    <Menu label={title} className="relative z-10 shrink-0" style={{ width: w }}>
      <p className="hk-xs px-[10px] pt-[6px] pb-[6px]">{title}</p>
      {rows.map(([ic, t, s], i) => (
        <MenuItem key={t} icon={ic} title={t} sub={s} on={i === on} end={i === on ? <Check size={15} strokeWidth={2.5} className="hk-blue" /> : undefined} />
      ))}
    </Menu>
  );
}

function PromptInput({ o }: { o: Props }) {
  const st = o.state as string, img = o.surface === "Image", code = o.surface === "Coding agent";
  const open = o.open as string;
  const text = img ? "A paper boat on a still lake at dawn, soft fog, film grain" : code ? "Fix the flaky login test and open a PR" : "Summarise the Q3 churn report and draft three next steps";
  // "Run in" lives on the environment row, so opening it shows that row
  const ws = open === "Workspace" ? "Environment" : (o.workspace as string);
  const mic = o.voice === "Dictate" || st === "Listening";
  // the picker's right edge, from the composer's outer edge: border 1 + padding 10 + send
  // (Generate 112) + gap 2 + mic + gap 2, with send and mic at the design system's sizes,
  // so the menu opens right above it
  const pickerRight = `calc(13px + ${img ? "112px" : "var(--hk-send)"}${mic ? " + var(--hk-ib-sm) + 2px" : ""})`;
  const menu = open === "Model" && o.model
    ? <PickMenu title="Model" on={1} w={270} rows={(img ? [["Image 4", "Best detail and lighting"], ["Image 4 Ultra", "Highest quality, slower"], ["Partner model", "Uses other providers"]] as [string, string][] : MODELS).map(([t, s]) => [<Sparkle key={t} size={15} strokeWidth={2} className="hk-faint" />, t, s])} />
    : open === "Effort" && o.effort && !img
      ? <PickMenu title={code ? "Reasoning effort" : "Thinking"} on={2} w={240} rows={EFFORT.map((e, i) => [<Brain key={e} size={15} strokeWidth={2} className="hk-faint" />, e, ["Answers right away", "Thinks for a bit", "Thinks longest, best for hard tasks"][i]])} />
      : null;
  const runIn = open === "Workspace" && ws === "Environment" && !img;
  return (
    <div className="hk-col gap-[8px] w-[560px]" style={runIn ? { paddingBottom: 168 } : undefined}>
      {menu && <div className="hk-row justify-end" style={{ paddingRight: pickerRight }}>{menu}</div>}
      {st === "Working" && <div className="hk-row hk-s pl-[16px]"><Spin s={13} />Working on it · you can type the next ask</div>}
      <div className="hk-panel hk-panel--bar p-[10px] pl-[12px] hk-col gap-[6px] relative" data-state={st}>
        {o.attachments && st !== "Empty" && (
          <div className="hk-row gap-[8px] pb-[4px]">
            {img ? (
              <span className="hk-thumb relative" style={{ background: "linear-gradient(160deg,#c9d8e8,#8aa7c4 60%,#5f7d9c)" }}>
                <button type="button" aria-label="Remove image" className="absolute right-[3px] top-[3px] grid place-items-center size-[18px] rounded-full bg-black/55 text-white transition-colors hover:bg-black/80"><X size={11} strokeWidth={2.5} /></button>
              </span>
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
            <IconBtn kind="outline" size="sm" label={o.tools ? "Add files and tools" : "Attach a file"} className="shrink-0"
              icon={o.tools ? <Plus size={17} strokeWidth={2} /> : <Paperclip size={15} strokeWidth={2} />} />
            {o.tools && !img && (o.surface === "Chat"
              ? <><IconBtn size="sm" label="Tools" className="shrink-0" icon={<SlidersHorizontal size={15} strokeWidth={2} />} /><Pick variant="on" removable className="shrink-0" icon={<Telescope size={14} strokeWidth={2} />}>Deep research</Pick></>
              : <Pick className="shrink-0" icon={<SlidersHorizontal size={14} strokeWidth={2} />}>Tools</Pick>)}
            {img && <><Pick icon={<ImageIcon size={14} strokeWidth={2} />}>Photo</Pick><Pick icon={<Ratio size={14} strokeWidth={2} />}>16:9</Pick><Pick icon={<Palette size={14} strokeWidth={2} />}>Style</Pick></>}
            {o.mode !== "None" && !img && (
              <Pick variant="box" chevron className="shrink-0" icon={o.mode === "Ask" ? <MessageCircle size={13} strokeWidth={2} /> : o.mode === "Plan" ? <ListChecks size={13} strokeWidth={2} /> : <Zap size={13} strokeWidth={2} />}>{o.mode as string}</Pick>
            )}
          </div>
          <div className="hk-row !gap-[2px] relative shrink-0">
            {(o.model || (o.effort && !img)) && (
              <Pick variant={open === "Model" || open === "Effort" ? "box" : "ghost"} chevron expanded={open === "Model" || open === "Effort"}>
                {o.model && (img ? "Image 4" : "Atlas 3")}
                {o.model && o.effort && !img && <span className="hk-faint">·</span>}
                {o.effort && !img && <span className={o.model ? "hk-faint" : ""}>{code ? "High" : "Thinking"}</span>}
              </Pick>
            )}
            {o.voice === "Dictate" && st !== "Listening" && <IconBtn size="sm" label="Dictate" icon={<Mic size={17} strokeWidth={1.9} />} />}
            {st === "Listening" && <IconBtn size="sm" kind="on" label="Stop dictating" icon={<Mic size={17} strokeWidth={1.9} />} />}
            {img ? (
              <Btn kind="main" className="w-[112px]" icon={<Wand2 size={14} strokeWidth={2} />}>Generate</Btn>
            ) : o.voice === "Voice mode" && st === "Empty" ? (
              <SendBtn label="Start voice mode" icon={<AudioLines size={17} strokeWidth={2} />} stopIcon={<Square size={11} fill="currentColor" strokeWidth={0} />} />
            ) : (
              <Send state={st === "Working" ? "stop" : st === "Empty" ? "off" : "on"} />
            )}
          </div>
        </div>
      </div>
      {ws !== "None" && !img && (
        <div className="hk-row gap-[2px] px-[6px] relative">
          {ws === "Folder" && <Pick chevron icon={<Folder size={14} strokeWidth={2} />}>atlas-web</Pick>}
          {ws === "Repo and branch" && <><Pick chevron icon={<Folder size={14} strokeWidth={2} />}>acme/atlas-web</Pick><Pick chevron icon={<GitBranch size={14} strokeWidth={2} />}>main</Pick></>}
          {ws === "Environment" && (
            <>
              <Pick chevron icon={<Folder size={14} strokeWidth={2} />}>atlas-web</Pick>
              <span className="relative">
                <Pick variant={runIn ? "box" : "ghost"} chevron expanded={runIn} icon={<Cloud size={14} strokeWidth={2} />}>Cloud</Pick>
                {runIn && <span className="absolute left-0 top-[calc(100%+8px)] z-10"><PickMenu title="Run in" on={1} w={250} rows={[[<Laptop key="l" size={15} strokeWidth={2} className="hk-faint" />, "On this computer", "Uses your local files"], [<Cloud key="c" size={15} strokeWidth={2} className="hk-faint" />, "Cloud", "Runs in a sandbox, keeps going when you close the laptop"]]} /></span>}
              </span>
              <Pick icon={<GitBranch size={14} strokeWidth={2} />}>main</Pick>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Source picker ── Perplexity (Web · Academic · Social), Claude (Search and tools),
   ChatGPT (Connectors), Copilot (Work / Web).
   Default = the workspace's usual source (the web); Custom = the person turned more on, so
   the chip counts them; Not connected = a source that needs sign-in shows Connect. */
function SourcePicker({ o }: { o: Props }) {
  const state = o.state as string, custom = state !== "Default", unconnected = state === "Not connected";
  const rows: [ReactElement, string, string, boolean | "connect"][] = [
    [<Globe key="g" size={16} strokeWidth={1.9} />, "Web", "Search the internet", true],
    [<HardDrive key="d" size={16} strokeWidth={1.9} />, "Shared drive", "Finance, Sales, Product", custom],
    [<BookOpen key="w" size={16} strokeWidth={1.9} />, "Team wiki", "142 pages", false],
    [<GitBranch key="r" size={16} strokeWidth={1.9} />, "Code", unconnected ? "Not connected" : "acme/atlas-web", unconnected ? "connect" : false],
  ];
  const n = rows.filter((r) => r[3] === true).length;
  return (
    <div className="w-[480px] hk-col gap-[8px]">
      {/* open menu: left edge on the "sources" button, 8 px above the composer (Perplexity, Claude) */}
      <Menu label="Search in" className="relative z-10 w-[300px] ml-[11px]">
        {o.search && <Field dense placeholder="Find a source" icon={<Search size={14} strokeWidth={2} />} className="mb-[4px]" />}
        {rows.map(([ic, t, s, on]) => (
          <MenuItem key={t} icon={ic} title={t} sub={s}
            end={on === "connect" ? <Btn size="sm">Connect</Btn> : o.style === "Switches" ? <Switch on={!!on} label={t} /> : on ? <Check size={16} strokeWidth={2.5} className="hk-blue" /> : undefined} />
        ))}
        <Rule className="my-[4px] mx-[6px]" />
        <MenuItem icon={<Plus size={16} strokeWidth={2} />} title="Add connectors" />
      </Menu>
      <div className="hk-panel hk-panel--bar h-[56px] px-[10px] hk-row">
        <Pick variant={custom ? "on" : "ghost"} chevron expanded icon={<Globe size={14} strokeWidth={2} />}>{custom ? `${n} sources` : "Web"}</Pick>
        <span className="hk-s hk-grow">Ask across your sources</span>
        <Send state="off" />
      </div>
    </div>
  );
}

/* ── Suggested prompts ── ChatGPT and Claude empty state, Gemini starter chips.
   Each ask shows its arrow on hover and sends on tap; they are gone once the conversation starts. */
function SuggestedPrompts({ o }: { o: Props }) {
  const asks: [string, string][] = [["Draft", "the launch announcement for Atlas 3"], ["Compare", "churn in Q2 and Q3 by region"], ["List", "the open risks before the March launch"], ["Plan", "next week's customer interviews"]];
  const chips = ["Draft the launch post", "Compare Q2 and Q3 churn", "List the open risks", "Plan customer interviews"];
  const n = Number(o.count), state = o.state as string;
  if (state === "Gone") {
    return (
      <div className="w-[520px] hk-col gap-[16px]">
        <span className="hk-bubble">Draft the launch announcement for Atlas 3</span>
        <AgentHead note={<><Typing />Writing</>} />
        <div className="hk-panel hk-panel--bar w-full h-[56px] hk-row justify-between pl-[18px] pr-[10px]"><span className="hk-b hk-faint">Ask a follow-up</span><Send state="off" /></div>
      </div>
    );
  }
  return (
    <div className="w-[520px] hk-col gap-[18px] items-center">
      {o.greeting && <p className="text-[24px] leading-[30px] font-semibold tracking-[-.4px]">What should we work on, Maya?</p>}
      <div className="hk-panel hk-panel--bar w-full h-[56px] hk-row justify-between pl-[18px] pr-[10px]"><span className="hk-b hk-faint">Ask anything</span><Send state="off" /></div>
      {o.layout === "Chips" ? (
        <div className="hk-row flex-wrap justify-center gap-[8px]">
          {chips.slice(0, n).map((c) => <Chip key={c}>{c}</Chip>)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-[8px] w-full">
          {asks.slice(0, n).map(([v, t], i) => (
            <Pressable key={t} hover={state === "Hover" && i === 0} label={`${v} ${t}`} className="hk-panel !shadow-none !rounded-[var(--hk-r-lg)] px-[14px] py-[10px] hk-row !items-start justify-between">
              <span className="hk-col"><span className="hk-t">{v}</span><span className="hk-s">{t}</span></span>
              <ArrowUpRight size={15} strokeWidth={2} className="hk-hover-show mt-[2px]" />
            </Pressable>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Suggestions ── Copilot in Word/GitHub, Gemini in Workspace side panel, Notion AI. */
function Suggestions({ o }: { o: Props }) {
  const state = o.state as string, after = state === "After a reply";
  const chips = after ? ["Turn this into a slide", "Shorten to 3 bullets", "Email it to the team"] : ["Close 3 stale issues", "Review 2 open PRs", "Draft release notes"];
  return (
    <div className="hk-panel hk-panel--bar w-[520px] p-[14px] hk-col gap-[12px]">
      {state !== "None" && (
        <>
          <p className="hk-s hk-row gap-[6px]"><Sparkle size={14} strokeWidth={2.25} className="hk-blue" />{after ? "Next steps for this answer" : <span>Suggested for <b className="text-[color:var(--text-primary)] font-semibold">atlas-web</b> right now</span>}</p>
          {o.layout === "List" ? (
            <div className="hk-col gap-[6px]">
              {chips.map((c) => (
                <Pressable key={c} className="hk-row gap-[8px] h-[36px] px-[10px] border border-[var(--k-edge)] rounded-[var(--hk-r-lg)] hk-b">
                  <Sparkle size={14} strokeWidth={2} className="hk-faint" /><span className="hk-grow">{c}</span><ArrowUpRight size={14} strokeWidth={2} className="hk-faint" />
                </Pressable>
              ))}
            </div>
          ) : (
            <div className="hk-row flex-wrap gap-[8px]">{chips.map((c) => <Chip key={c}>{c}</Chip>)}</div>
          )}
          <Rule />
        </>
      )}
      <div className="hk-row justify-between"><span className="hk-b hk-faint">Ask about this project</span><span className="hk-row !gap-[2px]"><IconBtn size="sm" label="Dictate" icon={<Mic size={17} strokeWidth={1.9} />} /><Send state="off" /></span></div>
    </div>
  );
}

/* ── Prompt templates ── ChatGPT GPT starters, Microsoft Copilot Prompt Gallery,
   Jasper/Writer templates; blanks as inline tokens (Mad Libs).
   Ready = each blank offers its default, Use template waits; Editing a blank = its menu is
   open; Filled = every blank has a value and Use template lights up. */
const BLANKS: [string, string[]?][] = [["short"], ["the exec team", ["the exec team", "my manager", "the whole company"]], ["launch risks"], ["calm"]];
function PromptTemplates({ o }: { o: Props }) {
  const state = o.state as string, ready = state === "Ready";
  const Blank = ({ v, choices, open }: { v: string; choices?: string[]; open?: boolean }) => (
    <span className="relative inline-flex align-[1px]">
      <button type="button" aria-haspopup={choices ? "menu" : undefined} aria-expanded={choices ? !!open : undefined}
        className={`inline-flex items-center gap-[3px] h-[28px] px-[9px] mx-[2px] rounded-[8px] font-semibold text-[color:var(--k-blue)] cursor-pointer outline-none transition-shadow hover:shadow-[0_0_0_1.5px_var(--k-blue)] focus-visible:shadow-[0_0_0_2px_var(--k-blue)] ${open ? "shadow-[0_0_0_2px_var(--k-blue)]" : ""} ${ready ? "border border-dashed border-[var(--k-edge-2)] bg-transparent !text-[color:var(--text-secondary)]" : "bg-[var(--k-blue-soft)]"}`}>
        {v}<ChevronDown size={13} strokeWidth={2.5} />
      </button>
      {open && choices && (
        <Menu label="Who it is for" className="absolute left-0 top-[calc(100%+6px)] w-[200px] z-10 font-normal text-[13.5px] leading-[20px] text-[color:var(--text-primary)]">
          {choices.map((t, i) => <MenuItem key={t} on={i === 0} end={i === 0 ? <Check size={15} strokeWidth={2.5} className="hk-blue" /> : undefined}>{t}</MenuItem>)}
        </Menu>
      )}
    </span>
  );
  const v = (i: number) => BLANKS[i][0];
  return (
    <div className="hk-panel w-[520px] p-[18px] hk-col gap-[14px]">
      <div className="hk-row justify-between"><span className="hk-xs">Template · Status update</span>{o.gallery && <TextLink className="hk-s">All templates</TextLink>}</div>
      <div className="text-[17px] leading-[38px] font-medium">Write a <Blank v={v(0)} /> update for <Blank v={v(1)} choices={BLANKS[1][1]} open={state === "Editing a blank"} /> about <Blank v={v(2)} />, in a <Blank v={v(3)} /> tone.</div>
      <div className="hk-row justify-end gap-[8px]"><Btn kind="ghost">Edit as text</Btn><Btn kind="main" disabled={ready}>Use template</Btn></div>
    </div>
  );
}

/* ── Example gallery ── Firefly and Midjourney explore grids, v0 / Lovable community,
   Claude Artifacts gallery, Gemini Gems. Hovering a tile shows its action; picking one puts
   its ask in the input, ready to edit. */
function ExampleGallery({ o }: { o: Props }) {
  const img = o.kind === "Images", picked = o.state === "Picked";
  const tiles: [string, ReactNode][] = img
    ? [["Paper boat at dawn", "linear-gradient(160deg,#dfe7ef,#9fb5cb 55%,#6b84a0)"], ["Neon street in rain", "linear-gradient(160deg,#2b1d4e,#6a2c91 50%,#f06292)"], ["Clay desk scene", "linear-gradient(160deg,#f7e3cf,#e8b48d 55%,#c27b54)"]].map(([t, g]) => [t as string, <span key={t as string} className="block size-full" style={{ background: g as string }} />])
    : [["Weekly KPI dashboard", <div key="k" className="flex items-end gap-[6px] h-full p-[12px]">{[34, 46, 40, 58, 52, 76].map((h, i) => <i key={i} className="flex-1 rounded-t-[3px]" style={{ height: `${h}%`, background: i === 5 ? "var(--k-chart)" : "color-mix(in srgb, var(--k-chart) 24%, transparent)" }} />)}</div>],
       ["Vendor comparison", <div key="v" className="hk-col gap-[7px] p-[12px] text-[11px]">{[["Northwind", "$1.2k"], ["Contoso", "$980"], ["Fabrikam", "$1.4k"]].map(([n, v]) => <span key={n} className="hk-row justify-between border-b border-[var(--k-edge)] pb-[5px]"><span>{n}</span><span className="font-semibold">{v}</span></span>)}</div>],
       ["Launch checklist", <div key="c" className="hk-col gap-[8px] p-[12px] text-[11px]">{["Final brief", "QA sign-off", "Go live"].map((r, i) => <span key={r} className="hk-row !gap-[6px]"><span className={`hk-check !size-[13px] ${i < 2 ? "hk-check--on" : ""}`}>{i < 2 && <Check size={9} strokeWidth={3} />}</span>{r}</span>)}</div>]];
  return (
    <div className="w-[540px] hk-col gap-[12px]">
      <div className="hk-row justify-between"><span className="hk-h">{img ? "Start from an image" : "Start from an example"}</span><TextLink className="hk-s">See all</TextLink></div>
      {o.filters && <div className="hk-row gap-[6px]">{["All", img ? "Photo" : "Reports", img ? "Illustration" : "Planning", img ? "3D" : "Data"].map((t, i) => <Chip key={t} kind="filter" selected={i === 0}>{t}</Chip>)}</div>}
      <div className="grid grid-cols-3 gap-[10px]">
        {tiles.map(([t, art], i) => (
          <div key={t} className={`hk-panel overflow-hidden hk-col group/tile ${picked && i === 0 ? "hk-opt--on !border-[var(--k-blue)]" : ""}`}>
            <div className="h-[120px] relative" style={{ background: "var(--k-soft)" }}>{art}
              <span className={`absolute inset-0 grid place-items-center transition-opacity duration-150 focus-within:opacity-100 ${i === 0 && o.hover && !picked ? "opacity-100" : "opacity-0 group-hover/tile:opacity-100"}`} style={{ background: "rgba(16,24,40,.45)" }}>
                <Btn size="sm">{img ? "Use prompt" : "Remix"}</Btn>
              </span>
            </div>
            <p className="hk-t !text-[13px] px-[12px] py-[10px]">{t}</p>
          </div>
        ))}
      </div>
      {picked && (
        <div className="hk-panel hk-panel--bar h-[56px] pl-[16px] pr-[10px] hk-row justify-between">
          <span className="hk-b">{img ? "A paper boat on a still lake at dawn, soft fog" : "Build a weekly KPI dashboard from our sales data"}<Caret /></span>
          <Send />
        </div>
      )}
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
    states: [st("Empty", { state: "Empty" }), st("Typing", { state: "Typing" }), st("Working", { state: "Working" }), st("Listening", { state: "Listening" })],
    refs: ["ChatGPT composer", "Claude composer", "Gemini prompt bar", "Codex / Cursor agent input", "Adobe Firefly prompt bar"],
  },
  "source-picker": {
    C: SourcePicker,
    opts: [sel("state", "State", ["Not connected", "Custom", "Default"]), sel("style", "Selection", ["Checks", "Switches"]), tog("search", "Search box", false)],
    states: [st("Default", { state: "Default" }), st("Custom", { state: "Custom" }), st("Not connected", { state: "Not connected" })],
    refs: ["Perplexity sources", "Claude search and tools", "ChatGPT connectors", "Microsoft Copilot Work / Web"],
  },
  "suggested-prompts": {
    C: SuggestedPrompts,
    opts: [sel("state", "State", ["Shown", "Hover", "Gone"]), sel("layout", "Layout", ["Cards", "Chips"]), sel("count", "Count", ["4", "3", "2"]), tog("greeting", "Greeting")],
    states: [st("Shown", { state: "Shown" }), st("Hover", { state: "Hover", layout: "Cards" }), st("Gone", { state: "Gone" })],
    refs: ["ChatGPT empty state", "Claude starters", "Gemini chips"],
  },
  suggestions: {
    C: Suggestions,
    opts: [sel("state", "State", ["Showing", "After a reply", "None"]), sel("layout", "Layout", ["Chips", "List"])],
    states: [st("Showing", { state: "Showing" }), st("After a reply", { state: "After a reply" }), st("None", { state: "None" })],
    refs: ["GitHub Copilot chat", "Gemini in Workspace", "Notion AI"],
  },
  "prompt-templates": {
    C: PromptTemplates,
    opts: [sel("state", "State", ["Filled", "Ready", "Editing a blank"]), tog("gallery", "Link to gallery")],
    states: [st("Ready", { state: "Ready" }), st("Editing a blank", { state: "Editing a blank" }), st("Filled", { state: "Filled" })],
    refs: ["Microsoft Copilot Prompt Gallery", "ChatGPT GPT starters", "Writer templates"],
  },
  "example-gallery": {
    C: ExampleGallery,
    opts: [sel("state", "State", ["Shown", "Picked"]), sel("kind", "Content", ["Documents", "Images"]), tog("filters", "Filters"), tog("hover", "Show hover", false)],
    states: [st("Shown", { state: "Shown" }), st("Picked", { state: "Picked" })],
    refs: ["Adobe Firefly gallery", "Midjourney explore", "v0 community", "Claude artifacts"],
  },
};
