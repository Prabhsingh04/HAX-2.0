"use client";
import { useEffect, useMemo, useState } from "react";
import { STAGES, type Pattern } from "./data";
import { Sidebar } from "./Sidebar";
import { CodeBlock } from "../CodeBlock";

// Figma: HAX · Component · Disclosure 98:25413 (template for every pattern; ?id=)
const FLAT = STAGES.flatMap((s) => s.cats.flatMap((c) => c.patterns.map((p) => ({ p, s, c }))));
const BY_ID = new Map(FLAT.map((x, i) => [x.p.id, { ...x, i }]));
// Figma has dedicated live/in-context visuals only for Disclosure; other patterns use their library preview.
const LIVE: Record<string, string> = { disclosure: "/hax/v1/pattern-live-disclosure.jpg" };
const CONTEXT: Record<string, string> = { disclosure: "/hax/v1/pattern-context-disclosure.jpg" };

const h2 = "font-semibold leading-[36px] text-[29px] tracking-[-0.2px] whitespace-nowrap";
const sub = "leading-[22px] text-[14px] text-[color:var(--text-secondary)] w-[640px]";

export function PatternPage() {
  const lib = "/library";
  const pat = "/pattern";
  const LIST = FLAT;
  const [id, setId] = useState("disclosure");
  const [onPage, setOnPage] = useState("live");
  useEffect(() => {
    const q = new URLSearchParams(location.search).get("id");
    if (q && BY_ID.has(q)) setId(q);
  }, []);
  const cur = BY_ID.get(id)!;
  const { p, s, c } = cur;
  const i = LIST.findIndex((x) => x.p.id === p.id);
  const prev = LIST[i - 1];
  const next = LIST[i + 1];
  const sections = useMemo(() => [
    ["live", "Live preview"],
    ...(CONTEXT[p.id] ? [["context", "In context"]] : []),
    ["code", "Code shape"],
    ["questions", "The four questions"],
  ], [p.id]);

  useEffect(() => {
    document.title = `${p.name} · HAX`;
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setOnPage(e.target.id)), { rootMargin: "-120px 0px -65% 0px" });
    sections.forEach(([k]) => { const el = document.getElementById(k); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [p, sections]);

  const qs: [string, keyof Pattern][] = [["What it is", "what"], ["Why it matters", "why"], ["When to use it", "when"], ["How to use it", "how"]];

  return (
    <div className="flex w-full items-start" data-node-id="98:25487">
      <Sidebar active={s.id} title="Library" selected={p.id} />
      <article key={p.id} className="hx-swap flex-1 min-w-0 flex flex-col gap-[48px] items-start pb-[96px] pl-[64px] pr-[48px] pt-[40px]" data-node-id="98:25539">
        <header className="flex flex-col gap-[14px] items-start w-full">
          <nav aria-label="Breadcrumb" className="flex gap-[8px] leading-[18px] text-[12px] whitespace-nowrap">
            <a href={lib} className="hx-link text-[color:var(--text-link)]">Components</a><span className="text-[color:var(--text-tertiary)]">/</span>
            <a href={`${lib}#${s.id}`} className="hx-link text-[color:var(--text-link)]">{s.label}</a><span className="text-[color:var(--text-tertiary)]">/</span>
            <span>{c.title}</span>
          </nav>
          <h1 className="font-semibold leading-[58px] text-[50px] tracking-[-0.6px]">{p.name}</h1>
          <p className="leading-[26px] text-[16px] text-[color:var(--text-secondary)] w-[640px]">{p.oneline}</p>
        </header>
        <section id="live" className="scroll-mt-[110px] flex flex-col gap-[14px] items-start w-full">
          <h2 className={h2}>Live preview</h2>
          <p className={sub}>The canonical shape of the pattern, on its own, as it would appear in context.</p>
          {LIVE[p.id]
            ? <img alt={`${p.name} live preview`} src={LIVE[p.id]} className="block h-[263px] w-full object-cover rounded-[12px]" />
            : <div className="bg-[var(--surface-tint)] border border-[var(--stroke-subtle)] rounded-[12px] h-[263px] w-full flex items-center justify-center"><img alt={`${p.name} preview`} src={p.img} className="h-[245px] object-contain rounded-[10px]" /></div>}
        </section>
        {CONTEXT[p.id] && (
          <section id="context" className="scroll-mt-[110px] flex flex-col gap-[14px] items-start w-full">
            <h2 className={h2}>In context</h2>
            <p className={sub}>Switch between product shells to see where the pattern sits in a real screen.</p>
            <img alt={`${p.name} in a product shell`} src={CONTEXT[p.id]} className="block h-[579px] w-full object-cover rounded-[12px]" />
          </section>
        )}
        <section id="code" className="scroll-mt-[110px] flex flex-col gap-[14px] items-start w-full">
          <h2 className={h2}>Code shape</h2>
          <p className={sub}>The shape of the markup. Real components live in the React package.</p>
          <CodeBlock code={p.code} label="HTML" />
        </section>
        <section id="questions" className="scroll-mt-[110px] flex flex-col gap-[14px] items-start w-full">
          <h2 className={h2}>The four questions</h2>
          <div className="flex flex-col gap-[16px]">
            {qs.map(([t, k]) => (
              <div key={k} className="bg-[var(--surface-tint)] border border-[var(--stroke-subtle)] flex flex-col gap-[8px] px-[22px] py-[20px] rounded-[var(--radius-xl)] w-[476px]">
                <h3 className="font-semibold leading-[24px] text-[16px]">{t}</h3>
                <p className="leading-[22px] text-[14px] text-[color:var(--text-secondary)]">{p[k] as string}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="flex flex-col gap-[14px] items-start w-full">
          <h2 className={h2}>Related and composed from</h2>
          <div className="flex gap-[8px] flex-wrap">
            {p.related.filter((r) => BY_ID.has(r)).map((r) => (
              <a key={r} href={`${pat}?id=${r}`} className="hx-btn hx-btn--outline hx-btn--sm bg-[var(--surface-page)] border border-[var(--stroke-default)] flex gap-[6px] h-[32px] items-center px-[12px] rounded-[var(--radius-pill)] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] font-semibold leading-[18px] text-[13px] tracking-[0.07px] whitespace-nowrap">
                {BY_ID.get(r)!.p.name}
                <img alt="" src="/hax/v1/icon-arrow-right-14.svg" className="hx-arrow size-[14px]" />
              </a>
            ))}
          </div>
          <div className="flex gap-[8px] items-center flex-wrap">
            <p className="leading-[20px] text-[13px] text-[color:var(--text-secondary)]">Composed from</p>
            {p.composed.map((t) => (
              <span key={t} className="bg-[var(--surface-tint)] border border-[var(--stroke-default)] px-[8px] py-[2px] rounded-[var(--radius-pill)] font-medium leading-[16px] text-[12px]">{t}</span>
            ))}
          </div>
        </section>
        <nav aria-label="Pattern pagination" className="flex gap-[16px] w-full">
          <a href={prev ? `${pat}?id=${prev.p.id}` : lib} className="hx-card flex-1 bg-[var(--surface-tint)] border border-[var(--stroke-subtle)] flex flex-col gap-[4px] px-[22px] py-[20px] rounded-[var(--radius-xl)] font-semibold">
            <span className="leading-[16px] text-[11px] text-[color:var(--text-secondary)] tracking-[1.2px] uppercase">Previous</span>
            <span className="leading-[24px] text-[16px]">{prev ? prev.p.name : "Back to the library"}</span>
          </a>
          <a href={next ? `${pat}?id=${next.p.id}` : lib} className="hx-card flex-1 bg-[var(--surface-tint)] border border-[var(--stroke-subtle)] flex flex-col gap-[4px] items-end px-[22px] py-[20px] rounded-[var(--radius-xl)] font-semibold">
            <span className="leading-[16px] text-[11px] text-[color:var(--text-secondary)] tracking-[1.2px] uppercase">Next</span>
            <span className="leading-[24px] text-[16px]">{next ? next.p.name : "Back to the library"}</span>
          </a>
        </nav>
      </article>
      <aside className="sticky top-[94px] shrink-0 w-[240px] flex flex-col gap-[4px] items-start pr-[32px] pt-[48px]" data-node-id="98:25540">
        <p className="font-semibold leading-[16px] text-[11px] text-[color:var(--text-secondary)] tracking-[1.2px] uppercase">On this page</p>
        {sections.map(([k, t]) => (
          <a key={k} href={`#${k}`} className={`hx-side flex h-[30px] items-center pl-[18px] pr-[10px] rounded-[6px] w-[200px] leading-[20px] text-[13px] ${onPage === k ? "bg-[var(--surface-tint)] font-semibold" : "text-[color:var(--text-secondary)]"}`}>{t}</a>
        ))}
        <div className="flex flex-col gap-[12px] pt-[20px] whitespace-nowrap">
          {[["Stage", s.label], ["Category", c.title]].map(([k, v]) => (
            <div key={k} className="flex flex-col gap-[2px]">
              <p className="font-semibold leading-[16px] text-[11px] text-[color:var(--text-secondary)] tracking-[1.2px] uppercase">{k}</p>
              <p className="font-medium leading-[18px] text-[13px]">{v}</p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
