"use client";
import { useEffect, useMemo, useState } from "react";
import { STAGES, type Pattern } from "@/components/hax/v1/library/data";
import { CodePanel, SideNav, useActive } from "../DocsPage";
import { Grad, Lede, SkyTag, Tag, WorldHero } from "../ui";

// /v3/pattern?id=<pattern>. No v3 frame: v1's pattern template (Figma 98:25413) in the v3 look,
// laid out like v3 Docs (world hero, section rail, code panels). Content is v1's data.
const FLAT = STAGES.flatMap((s) => s.cats.flatMap((c) => c.patterns.map((p) => ({ p, s, c }))));
const BY_ID = new Map(FLAT.map((x, i) => [x.p.id, { ...x, i }]));
// v1 has dedicated live / in-context visuals only for Disclosure; the rest use their library preview
const LIVE: Record<string, string> = { disclosure: "/hax/v1/pattern-live-disclosure.jpg" };
const CONTEXT: Record<string, string> = { disclosure: "/hax/v1/pattern-context-disclosure.jpg" };
const QS: [string, keyof Pattern][] = [["What it is", "what"], ["Why it matters", "why"], ["When to use it", "when"], ["How to use it", "how"]];
const h2 = "font-light leading-[40px] text-[36px] tracking-[-0.36px] text-white";
const sub = "max-w-[640px] leading-[24px] text-[16px] text-[color:var(--text-2)]";
const card = "rounded-[16px] border border-[var(--edge)] bg-[var(--panel)]";

export function PatternPage() {
  const [id, setId] = useState("disclosure");
  useEffect(() => {
    const q = new URLSearchParams(location.search).get("id");
    if (q && BY_ID.has(q)) setId(q);
  }, []);
  const { p, s, c, i } = BY_ID.get(id)!;
  const prev = FLAT[i - 1], next = FLAT[i + 1];
  const sections = useMemo(() => [["live", "Live preview"], ...(CONTEXT[p.id] ? [["context", "In context"]] : []), ["code", "Code shape"], ["questions", "The four questions"], ["related", "Related"]], [p.id]);
  const ids = useMemo(() => sections.map(([k]) => k), [sections]);
  const active = useActive(ids);
  useEffect(() => { document.title = `${p.name} · HAX`; }, [p.name]);

  return (
    <>
      <WorldHero>
        <SkyTag>
          <a href="/v3/library" className="h3-link">Components</a><span aria-hidden>/</span>
          <a href={`/v3/library#${s.id}`} className="h3-link">{s.label}</a><span aria-hidden>/</span>
          <span className="text-[color:var(--text-soft)]">{c.title}</span>
        </SkyTag>
        <h1 className="h3-rise h3-rise--2 font-semibold text-[clamp(44px,5vw,72px)] leading-[1.06] tracking-[-0.03em]"><Grad>{p.name}</Grad></h1>
        <Lede className="max-w-[720px]">{p.oneline}</Lede>
        <div className="h3-rise h3-rise--4 flex gap-[8px]"><Tag>Stage {s.num} · {s.label}</Tag><Tag>{c.title}</Tag></div>
      </WorldHero>
      <div key={p.id} className="h3-swap mx-auto flex max-w-[1200px] gap-[64px] px-[24px] pb-[120px] pt-[48px]">
        <SideNav items={sections} active={active} />
        <article className="flex min-w-0 flex-1 flex-col gap-[96px]">
          <section id="live" className="flex scroll-mt-[96px] flex-col gap-[16px]">
            <h2 className={h2}>Live preview</h2>
            <p className={sub}>The canonical shape of the pattern, on its own, as it would appear in context.</p>
            <div className={`${card} p-[8px]`}>
              {LIVE[p.id]
                ? <img alt={`${p.name} live preview`} src={LIVE[p.id]} className="block h-[263px] w-full rounded-[12px] object-cover" />
                : <div className="flex h-[263px] items-center justify-center rounded-[12px] bg-white"><img alt={`${p.name} preview`} src={p.img} className="h-[245px] rounded-[10px] object-contain" /></div>}
            </div>
          </section>
          {CONTEXT[p.id] && (
            <section id="context" className="flex scroll-mt-[96px] flex-col gap-[16px]">
              <h2 className={h2}>In context</h2>
              <p className={sub}>Where the pattern sits in a real product screen.</p>
              <div className={`${card} p-[8px]`}><img alt={`${p.name} in a product shell`} src={CONTEXT[p.id]} className="block h-[579px] w-full rounded-[12px] object-cover" /></div>
            </section>
          )}
          <section id="code" className="flex scroll-mt-[96px] flex-col gap-[16px]">
            <h2 className={h2}>Code shape</h2>
            <p className={sub}>The shape of the markup. Real components live in the React package.</p>
            <CodePanel code={p.code} label="HTML" featured />
          </section>
          <section id="questions" className="flex scroll-mt-[96px] flex-col gap-[16px]">
            <h2 className={h2}>The four questions</h2>
            <div className="grid grid-cols-1 gap-[16px] md:grid-cols-2">
              {QS.map(([t, k]) => (
                <div key={k} className={`${card} flex flex-col gap-[8px] p-[24px]`}>
                  <h3 className="font-semibold leading-[24px] text-[16px] text-[color:var(--text)]">{t}</h3>
                  <p className="leading-[22px] text-[14px] text-[color:var(--text-2)]">{p[k] as string}</p>
                </div>
              ))}
            </div>
          </section>
          <section id="related" className="flex scroll-mt-[96px] flex-col gap-[16px]">
            <h2 className={h2}>Related and composed from</h2>
            <div className="flex flex-wrap gap-[8px]">
              {p.related.filter((r) => BY_ID.has(r)).map((r) => (
                <a key={r} href={`/v3/pattern?id=${r}`} className="h3-btn h3-btn--secondary inline-flex items-center gap-[6px] rounded-[8px] px-[12px] py-[6px] font-semibold leading-[20px] text-[14px]">
                  {BY_ID.get(r)!.p.name}
                  <img alt="" src="/hax/v3/icon-right-16-light.svg" className="h3-arrow size-[14px]" />
                </a>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-[8px]">
              <p className="leading-[20px] text-[14px] text-[color:var(--text-2)]">Composed from</p>
              {p.composed.map((t) => <code key={t} className="rounded-[6px] bg-[var(--panel-2)] px-[8px] py-[4px] font-[family-name:var(--font-mono)] leading-[16px] text-[12px] text-[color:var(--text)]">{t}</code>)}
            </div>
          </section>
          <nav aria-label="Pattern pagination" className="grid grid-cols-2 gap-[16px]">
            <a href={prev ? `/v3/pattern?id=${prev.p.id}` : "/v3/library"} className={`h3-card ${card} flex flex-col gap-[4px] p-[24px]`}>
              <span className="font-[family-name:var(--font-mono)] leading-[16px] text-[12px] tracking-[0.96px] text-[color:var(--text-3)] uppercase">Previous</span>
              <span className="leading-[28px] text-[20px] text-white">{prev ? prev.p.name : "Back to the library"}</span>
            </a>
            <a href={next ? `/v3/pattern?id=${next.p.id}` : "/v3/library"} className={`h3-card ${card} flex flex-col items-end gap-[4px] p-[24px] text-right`}>
              <span className="font-[family-name:var(--font-mono)] leading-[16px] text-[12px] tracking-[0.96px] text-[color:var(--text-3)] uppercase">Next</span>
              <span className="leading-[28px] text-[20px] text-white">{next ? next.p.name : "Back to the library"}</span>
            </a>
          </nav>
        </article>
      </div>
    </>
  );
}
