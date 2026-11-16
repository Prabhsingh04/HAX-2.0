"use client";
import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { STAGES } from "./data";
import { BY_COMP, COMPS, FROM_OLD, ORIGIN } from "./catalog";
import { DETAILS } from "./details";
import { Sidebar } from "./Sidebar";
import { PreviewLarge } from "./Previews";
import { CodeBlock } from "../CodeBlock";
import { DSContext, withDS, type DS } from "./kit/ds";

// Figma: HAX · Component · Disclosure 98:25413, now the page for each of the 45 components (?id=).
// An id from the old 89-entry list opens the component that took it over; one that was cut
// goes back to the library.
const OLD = new Map(STAGES.flatMap((s) => s.cats.flatMap((c) => c.patterns.map((p) => [p.id, p] as const))));
const SECTIONS = [
  ["preview", "Preview"], ["how", "How it works"], ["states", "States"], ["needs", "What it needs"],
  ["rules", "Do and don't"], ["covers", "What it brings together"], ["family", "More in this family"],
] as const;
const STEPS = ["When it shows up", "What people see", "What happens next"];
// JSON with short lists of plain values kept on one line, so the shape reads at a glance
const pretty = (v: unknown) => JSON.stringify(v, null, 2).replace(/\[\n\s+([^[\]{}]*?)\n\s*\]/g, (whole, body: string) => {
  const line = `[${body.split(/,\n\s+/).join(", ")}]`;
  return line.length <= 64 ? line : whole;
});

const h2 = "font-semibold leading-[30px] text-[23px] tracking-[-0.2px] md:leading-[36px] md:text-[29px] md:whitespace-nowrap";
const sub = "leading-[22px] text-[14px] text-[color:var(--text-secondary)] w-full max-w-[640px] xl:w-[640px]";
const eyebrow = "font-semibold leading-[16px] text-[11px] text-[color:var(--text-secondary)] tracking-[1.2px] uppercase";
const tile = "bg-[var(--surface-tint)] border border-[var(--stroke-subtle)] rounded-[var(--radius-xl)]";

export function PatternPage({ ds = "shadcn" }: { ds?: DS }) {
  const lib = withDS("/library", ds);
  const page = (to: string) => withDS(`/pattern?id=${to}`, ds);
  const [id, setId] = useState<string | null>(null);
  const [onPage, setOnPage] = useState("preview");
  useEffect(() => {
    const q = new URLSearchParams(location.search).get("id") ?? COMPS[0].c.id;
    if (BY_COMP.has(q)) setId(q);
    else if (FROM_OLD.has(q)) {
      const to = FROM_OLD.get(q)!;
      history.replaceState(null, "", page(to));
      setId(to);
    } else location.replace(lib);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const cur = id ? BY_COMP.get(id) : undefined;

  useEffect(() => {
    if (!cur) return;
    document.title = `${cur.c.name} · HAX`;
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setOnPage(e.target.id)), { rootMargin: "-120px 0px -65% 0px" });
    SECTIONS.forEach(([k]) => { const el = document.getElementById(k); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [cur]);

  if (!cur) return <div className="min-h-[70vh]" />;
  const { c, f } = cur;
  const d = DETAILS[c.id];
  const i = COMPS.findIndex((x) => x.c.id === c.id);
  const prev = COMPS[i - 1];
  const next = COMPS[i + 1];
  const covered = c.covers.map((o) => OLD.get(o)).filter((p): p is NonNullable<typeof p> => !!p);

  return (
    <DSContext.Provider value={ds}>
    <div className="flex w-full flex-col items-stretch lg:flex-row lg:items-start" data-node-id="98:25487">
      <Sidebar active={f.id} selected={c.id} ds={ds} />
      <article key={c.id} className="hx-swap flex-1 min-w-0 flex flex-col gap-[40px] items-start pb-[72px] px-[var(--hx-gutter)] pt-[20px] md:gap-[56px] lg:pb-[96px] lg:pl-[48px] lg:pr-[32px] lg:pt-[40px] xl:pl-[64px] xl:pr-[48px]" data-node-id="98:25539">
        <header className="flex flex-col gap-[14px] items-start w-full">
          <nav aria-label="Breadcrumb" className="flex flex-wrap gap-[8px] leading-[18px] text-[12px] whitespace-nowrap">
            <a href={lib} className="hx-link text-[color:var(--text-link)]">Components</a><span className="text-[color:var(--text-tertiary)]">/</span>
            <a href={withDS(`/library#${f.id}`, ds)} className="hx-link text-[color:var(--text-link)]">{f.name}</a><span className="text-[color:var(--text-tertiary)]">/</span>
            <span>{c.name}</span>
          </nav>
          <h1 className="font-semibold leading-[40px] text-[34px] tracking-[-0.4px] md:leading-[58px] md:text-[50px] md:tracking-[-0.6px]">{c.name}</h1>
          <p className="leading-[26px] text-[16px] text-[color:var(--text-secondary)] w-full max-w-[640px] xl:w-[640px]">{c.line}</p>
        </header>

        <section id="preview" className="scroll-mt-[110px] flex flex-col gap-[14px] items-start w-full">
          <h2 className={h2}>Preview</h2>
          <p className={sub}>The component at real size, and live: hover it, click it. Customize switches its states and options; Code shows the code for this version.</p>
          <PreviewLarge id={c.id} />
        </section>

        <section id="how" className="scroll-mt-[110px] flex flex-col gap-[14px] items-start w-full">
          <h2 className={h2}>How it works</h2>
          <p className={sub}>What sets it off, what people see, and what happens when they act on it.</p>
          <ol className="grid grid-cols-1 gap-[12px] w-full md:grid-cols-3 md:gap-[16px]">
            {d.how.map((t, k) => (
              <li key={k} className={`${tile} flex flex-col gap-[10px] px-[22px] py-[20px]`}>
                <span className="flex gap-[10px] items-center">
                  <span className="grid place-items-center size-[24px] rounded-full border border-[var(--stroke-default)] bg-[var(--surface-page)] font-semibold text-[12px] leading-none">{k + 1}</span>
                  <span className={eyebrow}>{STEPS[k]}</span>
                </span>
                <p className="leading-[22px] text-[14px]">{t}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="states" className="scroll-mt-[110px] flex flex-col gap-[14px] items-start w-full">
          <h2 className={h2}>States</h2>
          <p className={sub}>Every state it can be in. Each one needs its own design.</p>
          <dl className="w-full border-b border-[var(--stroke-subtle)]">
            {d.states.map(([name, line]) => (
              <div key={name} className="grid grid-cols-1 gap-[6px] border-t border-[var(--stroke-subtle)] py-[14px] md:grid-cols-[200px_1fr] md:gap-[24px]">
                <dt className="font-semibold leading-[22px] text-[14px]">{name}</dt>
                <dd className="leading-[22px] text-[14px] text-[color:var(--text-secondary)]">{line}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="needs" className="scroll-mt-[110px] flex flex-col gap-[14px] items-start w-full">
          <h2 className={h2}>What it needs</h2>
          <p className={sub}>The fields that draw it, as the agent or the app would send them. The values match the preview above.</p>
          <CodeBlock code={pretty(d.needs)} label="JSON" />
        </section>

        <section id="rules" className="scroll-mt-[110px] flex flex-col gap-[14px] items-start w-full">
          <h2 className={h2}>Do and don&apos;t</h2>
          <div className="grid grid-cols-1 gap-[12px] w-full md:grid-cols-2 md:gap-[16px]">
            {([["Do", d.dos, true], ["Don't", d.donts, false]] as const).map(([t, items, ok]) => (
              <div key={t} className={`${tile} flex flex-col gap-[12px] px-[22px] py-[20px]`}>
                <p className={eyebrow}>{t}</p>
                <ul className="flex flex-col gap-[10px]">
                  {items.map((x) => (
                    <li key={x} className="flex gap-[10px] items-start leading-[22px] text-[14px]">
                      {ok ? <Check size={16} strokeWidth={2.5} className="hx-do shrink-0 mt-[3px]" /> : <X size={16} strokeWidth={2.5} className="hx-dont shrink-0 mt-[3px]" />}
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section id="covers" className="scroll-mt-[110px] flex flex-col gap-[14px] items-start w-full">
          <h2 className={h2}>What it brings together</h2>
          {covered.length ? (
            <>
              <p className={sub}>{covered.length === 1 ? "This entry from the earlier library now lives here." : `These ${covered.length} entries from the earlier library now live here, as parts and variants of ${c.name}.`}</p>
              <div className="grid grid-cols-1 gap-[12px] w-full md:grid-cols-2 md:gap-[16px]">
                {covered.map((p) => (
                  <div key={p.id} className={`${tile} flex flex-col gap-[6px] px-[22px] py-[18px]`}>
                    <h3 className="font-semibold leading-[24px] text-[16px]">{p.name}</h3>
                    <p className="leading-[20px] text-[13px] text-[color:var(--text-secondary)]">{p.oneline}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className={sub}>{ORIGIN[c.id] ?? "New in HAX 2.0. Nothing in the earlier library covered this."}</p>
          )}
        </section>

        <section id="family" className="scroll-mt-[110px] flex flex-col gap-[14px] items-start w-full">
          <h2 className={h2}>More {f.name.toLowerCase()}</h2>
          <p className={sub}>{f.job}</p>
          <div className="flex gap-[8px] flex-wrap">
            {f.comps.filter((x) => x.id !== c.id).map((x) => (
              <a key={x.id} href={page(x.id)} className="hx-btn hx-btn--outline hx-btn--sm bg-[var(--surface-page)] border border-[var(--stroke-default)] flex gap-[6px] h-[32px] items-center px-[12px] rounded-[var(--radius-pill)] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] font-semibold leading-[18px] text-[13px] tracking-[0.07px] whitespace-nowrap">
                {x.name}
                <img alt="" src="/hax/v1/icon-arrow-right-14.svg" className="hx-arrow size-[14px]" />
              </a>
            ))}
          </div>
        </section>

        <nav aria-label="Component pagination" className="flex gap-[16px] w-full">
          <a href={prev ? page(prev.c.id) : lib} className={`hx-card flex-1 ${tile} flex flex-col gap-[4px] px-[22px] py-[20px] font-semibold`}>
            <span className={eyebrow}>Previous</span>
            <span className="leading-[24px] text-[16px]">{prev ? prev.c.name : "Back to the library"}</span>
          </a>
          <a href={next ? page(next.c.id) : lib} className={`hx-card flex-1 ${tile} flex flex-col gap-[4px] items-end px-[22px] py-[20px] font-semibold`}>
            <span className={eyebrow}>Next</span>
            <span className="leading-[24px] text-[16px]">{next ? next.c.name : "Back to the library"}</span>
          </a>
        </nav>
      </article>
      <aside className="hk-side sticky top-[94px] shrink-0 w-[240px] flex flex-col gap-[4px] items-start pr-[32px] pt-[48px]" data-node-id="98:25540">
        {/* the Customize panel opens here, in place of the page index */}
        <div id="hk-custom-slot" className="contents" />
        <div className="hk-side-toc flex flex-col gap-[4px] items-start">
        <p className={eyebrow}>On this page</p>
        {SECTIONS.map(([k, t]) => (
          <a key={k} href={`#${k}`} className={`hx-side flex h-[30px] items-center pl-[18px] pr-[10px] rounded-[6px] w-[200px] leading-[20px] text-[13px] ${onPage === k ? "bg-[var(--surface-tint)] font-semibold" : "text-[color:var(--text-secondary)]"}`}>{t}</a>
        ))}
        <div className="flex flex-col gap-[2px] pt-[20px]">
          <p className={eyebrow}>Family</p>
          <p className="font-medium leading-[18px] text-[13px]">{f.name}</p>
          <p className="leading-[18px] text-[12px] text-[color:var(--text-secondary)] w-[200px]">{f.job}</p>
        </div>
        </div>
      </aside>
    </div>
    </DSContext.Provider>
  );
}
