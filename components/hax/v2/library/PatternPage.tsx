"use client";
import { useEffect, useState } from "react";
import { STAGES, type Pattern } from "../../v1/library/data";
import { CodeBlock } from "../../v1/CodeBlock";
import { Weave } from "../Weave";
import { ArrowRight } from "../icons";

// Figma: HAX v2 · Component · Disclosure 103:5104, the template for every pattern (?id=). v1's data, read
// only. Like v1, only Disclosure has its own live and in-context pictures; the rest show their preview.
const FLAT = STAGES.flatMap((s) => s.cats.flatMap((c) => c.patterns.map((p) => ({ p, s, c }))));
const BY_ID = new Map(FLAT.map((x) => [x.p.id, x]));
const LIVE: Record<string, string> = { disclosure: "/hax/v1/pattern-live-disclosure.jpg" };
const CONTEXT: Record<string, string> = { disclosure: "/hax/v1/pattern-context-disclosure.jpg" };
const QS: [string, keyof Pattern][] = [["What it is", "what"], ["Why it matters", "why"], ["When to use it", "when"], ["How to use it", "how"]];
const FADE = { top: 140, bottom: 140 };
const mono = "font-[family-name:var(--font-mono)] text-[12px] font-medium uppercase leading-[16px] tracking-[0.06em]";
const chip = "rounded-[6px] border border-[color:var(--line)] bg-[color:var(--card)] px-[8px] py-[2px] font-[family-name:var(--font-mono)] text-[12px] leading-[16px]";
const card = "flex flex-col gap-[16px] rounded-[24px] border border-[color:var(--line)] bg-[color:var(--card)] p-[24px]";

function Head({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex flex-col gap-[4px]">
      <p className={mono}>{title}</p>
      <p className="text-[14px] leading-[20px] text-[color:var(--grey)]">{desc}</p>
    </div>
  );
}

export function PatternPage() {
  const [id, setId] = useState("disclosure");
  useEffect(() => {
    const q = new URLSearchParams(location.search).get("id");
    if (q && BY_ID.has(q)) setId(q);
  }, []);
  const { p, s, c } = BY_ID.get(id)!;
  const i = FLAT.findIndex((x) => x.p.id === p.id), prev = FLAT[i - 1], next = FLAT[i + 1];
  useEffect(() => { document.title = `${p.name} · HAX`; }, [p]);
  return (
    <article key={p.id}>
      <header className="relative flex h-[430px] flex-col gap-[24px] px-[120px] pt-[168px]" data-node-id="103:5104">
        <Weave row0={0} fade={FADE} />
        <nav aria-label="Breadcrumb" className={`hx2-rise relative flex gap-[8px] text-[color:var(--grey)] ${mono}`}>
          <a href="/v2/library" className="hx2-link hover:text-[color:var(--ink)]">Components</a><span>/</span>
          <a href={`/v2/library?stage=${s.id}`} className="hx2-link hover:text-[color:var(--ink)]">{s.label}</a><span>/</span>
          <span className="text-[color:var(--ink)]">{c.title}</span>
        </nav>
        <h1 className="hx2-h1 hx2-rise relative w-fit text-[60px] font-semibold leading-[60px] tracking-[-0.03em]">{p.name}</h1>
        <p className="hx2-rise hx2-rise--2 relative w-[680px] text-[18px] leading-[28px] text-[color:var(--grey)]">{p.oneline}</p>
        <div className="hx2-rise hx2-rise--3 relative flex items-center gap-[16px]">
          <span className="flex items-center gap-[8px]"><span className={`${mono} text-[color:var(--grey)]`}>Stage</span><span className={chip}>{s.label}</span></span>
          <span className="flex items-center gap-[8px]"><span className={`${mono} text-[color:var(--grey)]`}>Category</span><span className={chip}>{c.title}</span></span>
        </div>
      </header>
      <section className="relative flex flex-col gap-[48px] px-[120px] py-[96px]">
        <div aria-hidden className="absolute inset-y-0 left-1/2 w-screen max-w-none -translate-x-1/2 bg-[color:var(--fill)]" />
        <div className="relative flex items-start gap-[48px]">
          <div className="hx2-reveal flex w-[384px] shrink-0 flex-col gap-[32px]">
            <p className={`${mono} text-[color:var(--grey)]`}>The four questions</p>
            {QS.map(([q, k]) => (
              <div key={k} className="flex flex-col gap-[8px]">
                <h2 className="text-[18px] font-semibold leading-[28px]">{q}</h2>
                <p className="text-[16px] leading-[24px] text-[color:var(--grey)]">{p[k] as string}</p>
              </div>
            ))}
            {p.related.some((r) => BY_ID.has(r)) && (
              <div className="flex flex-col gap-[12px]">
                <p className={`${mono} text-[color:var(--grey)]`}>Related patterns</p>
                <div className="flex flex-wrap gap-[8px]">
                  {p.related.filter((r) => BY_ID.has(r)).map((r) => (
                    <a key={r} href={`/v2/pattern?id=${r}`} className="hx2-btn rounded-full border border-[color:var(--line)] bg-[color:var(--card)] px-[16px] py-[8px] text-[14px] font-semibold leading-[20px] transition-colors hover:border-[color:var(--line-strong)] active:bg-[color:var(--fill)]">{BY_ID.get(r)!.p.name}</a>
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-col gap-[12px]">
              <p className={`${mono} text-[color:var(--grey)]`}>Composed from</p>
              <div className="flex flex-wrap gap-[8px]">{p.composed.map((t) => <span key={t} className={chip}>{t}</span>)}</div>
            </div>
          </div>
          <div className="flex w-[768px] flex-col gap-[24px]">
            <div className={`hx2-reveal ${card}`}>
              <Head title="Live preview" desc="The canonical shape of the pattern, on its own, as it would appear in context." />
              {LIVE[p.id]
                ? <img alt={`${p.name} live preview`} src={LIVE[p.id]} className="block h-[234px] w-full rounded-[16px] object-cover" />
                : <span className="flex h-[234px] w-full items-center justify-center rounded-[16px] bg-[color:var(--fill)]"><img alt={`${p.name} preview`} src={p.img} className="h-[214px] rounded-[10px] object-contain" /></span>}
            </div>
            {CONTEXT[p.id] && (
              <div className={`hx2-reveal ${card}`}>
                <Head title="In context" desc="Switch between product shells to see where the pattern sits in a real screen." />
                <img alt={`${p.name} in a product shell`} src={CONTEXT[p.id]} className="block h-[516px] w-full rounded-[16px] object-cover" />
              </div>
            )}
            <div className={`hx2-reveal ${card}`}>
              <Head title="Code shape" desc="The shape of the markup. Real components live in the React package." />
              <CodeBlock code={p.code} label="HTML" />
            </div>
          </div>
        </div>
        <nav aria-label="Pattern pagination" className="relative flex items-end justify-between">
          <a href={prev ? `/v2/pattern?id=${prev.p.id}` : "/v2/library"} className="group flex flex-col gap-[4px]">
            <span className={`${mono} text-[color:var(--grey)]`}>Previous</span>
            <span className="flex items-center gap-[8px] text-[16px] font-semibold leading-[24px]">
              <ArrowRight className="size-[16px] rotate-180 transition-transform duration-300 group-hover:-translate-x-[3px]" strokeWidth={1.6} />
              <span className="hx2-link">{prev ? prev.p.name : "Back to the library"}</span>
            </span>
          </a>
          <a href={next ? `/v2/pattern?id=${next.p.id}` : "/v2/library"} className="flex flex-col items-end gap-[4px]">
            <span className={`${mono} text-[color:var(--grey)]`}>Next</span>
            <span className="flex items-center gap-[8px] text-[16px] font-semibold leading-[24px]">
              <span className="hx2-link">{next ? next.p.name : "Back to the library"}</span>
              <ArrowRight className="hx2-arrow size-[16px]" strokeWidth={1.6} />
            </span>
          </a>
        </nav>
      </section>
    </article>
  );
}
