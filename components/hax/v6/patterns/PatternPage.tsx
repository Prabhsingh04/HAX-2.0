import { CodeBlock } from "@/components/hax/v1/CodeBlock";
import { BY_ID, patternHref, type Page } from "./data";
import { JumpNav } from "./JumpNav";
import { PatternPreview } from "./PatternPreview";
import { Grad } from "../ui";

// One pattern's page: Srishti's structure and words (v3 draft), v6's look. Agentic patterns: live
// preview, what it solves, how the interaction works, who is involved, behavior spec, guiding
// principles, related patterns. General patterns: live preview, what it solves, how the interaction
// works (when it happens, what happens), implementation example, related patterns.
const h2 = "font-light text-[clamp(28px,3.2vw,38px)] leading-[1.1] tracking-[-0.02em]";
const body = "max-w-[720px] text-[18px] leading-[30px] text-[color:var(--text-2)] max-md:text-[16px] max-md:leading-[26px]";
const section = "mx-auto flex w-full max-w-[1200px] scroll-mt-[128px] flex-col gap-[24px] px-[24px]";
const mono = "font-[family-name:var(--font-mono)] text-[11px] font-medium uppercase leading-[16px] tracking-[0.96px] text-[color:var(--text-3)]";

const SECTIONS: [string, string, (p: Page) => boolean][] = [
  ["preview", "Live preview", () => true],
  ["solves", "What it solves", (p) => p.solves.length > 0],
  ["how", "How the interaction works", (p) => !!(p.steps?.length || p.questions?.length)],
  ["who", "Who is involved", (p) => !!p.who?.length],
  ["spec", "Behavior spec", (p) => !!p.spec?.length],
  ["principles", "Guiding principles", (p) => !!p.principles?.length],
  ["code", "Implementation example", (p) => !!p.code],
  ["related", "Related patterns", (p) => p.related.length > 0],
];

export function PatternPage({ id }: { id: string }) {
  const pat = BY_ID.get(id)!;
  const p = pat.page;
  if (!p) return <p className="px-[24px] pt-[140px]">This pattern has no page yet.</p>;
  const toc = SECTIONS.filter(([, , ok]) => ok(p)).map(([k, l]) => [k, l] as [string, string]);
  const related = p.related.map((r) => ({ ...r, summary: r.summary ?? BY_ID.get(r.id)?.summary })).filter((r) => BY_ID.has(r.id));

  return (
    <article className="pb-[120px]">
      <header className="px-[24px] pb-[48px] pt-[120px] md:pb-[56px] md:pt-[140px]" style={{ background: "linear-gradient(180deg, #f6f8fc 0%, #fff 100%)" }}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-[16px]">
          <nav aria-label="Breadcrumb" className="h6-rise flex flex-wrap items-center gap-[8px] text-[13px] leading-[20px] text-[color:var(--text-3)]">
            <a href="/v6/patterns" className="h6-link text-[color:var(--link)]">Pattern library</a>
            <span aria-hidden>/</span>
            <a href={`/v6/patterns?category=${pat.categoryId}`} className="h6-link text-[color:var(--link)]">{pat.category}</a>
            <span aria-hidden>/</span>
            <span className="text-[color:var(--text)]">{p.title}</span>
          </nav>
          <p className={`h6-rise ${mono} !text-[color:var(--link)]`}>{p.eyebrow}</p>
          <h1 className="h6-rise h6-rise--2 font-light text-[clamp(40px,5.4vw,72px)] leading-[1.04] tracking-[-0.03em] [text-wrap:balance]"><Grad className="font-semibold">{p.title}</Grad></h1>
          <p className="h6-rise h6-rise--3 max-w-[760px] text-[18px] leading-[28px] text-[color:var(--text-2)] max-md:text-[16px] max-md:leading-[26px]">{p.summary}</p>
        </div>
      </header>

      <JumpNav items={toc} />

      <div className="flex flex-col gap-[88px] pt-[56px] md:gap-[112px] md:pt-[72px]">
        <section id="preview" className={section}>
          <h2 className={h2}>Live preview</h2>
          <PatternPreview id={pat.id} name={p.title} preview={p.preview} />
        </section>

        {p.solves.length > 0 && (
          <section id="solves" className={section}>
            <h2 className={h2}>What it solves</h2>
            {p.solves.map((t, i) => <p key={i} className={body}>{t}</p>)}
          </section>
        )}

        {(p.steps?.length || p.questions?.length) ? (
          <section id="how" className={section}>
            <h2 className={h2}>How the interaction works</h2>
            {p.steps?.length ? (
              <ol className="grid grid-cols-1 gap-[24px] md:grid-cols-3">
                {p.steps.map((s) => (
                  <li key={s.n} className="flex flex-col gap-[8px] border-t border-[var(--edge-2)] pt-[16px]">
                    <span className="font-[family-name:var(--font-mono)] text-[12px] font-medium leading-[16px] text-[color:var(--link)]">{s.n}</span>
                    <h3 className="text-[18px] font-semibold leading-[26px]">{s.title}</h3>
                    <p className="text-[15px] leading-[24px] text-[color:var(--text-2)]">{s.text}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <dl className="grid max-w-[900px] grid-cols-1 gap-x-[40px] gap-y-[20px] md:grid-cols-[200px_1fr]">
                {p.questions!.map((q) => (
                  <div key={q.q} className="contents">
                    <dt className="text-[16px] font-semibold leading-[26px]">{q.q}</dt>
                    <dd className="text-[16px] leading-[26px] text-[color:var(--text-2)]">{q.a}</dd>
                  </div>
                ))}
              </dl>
            )}
          </section>
        ) : null}

        {p.who?.length ? (
          <section id="who" className={section}>
            <div className="flex flex-col gap-[8px]">
              <h2 className={h2}>Who is involved</h2>
              {p.whoIntro && <p className="text-[15px] leading-[24px] text-[color:var(--text-3)]">{p.whoIntro}</p>}
            </div>
            <ul className="flex flex-col rounded-[16px] border border-[var(--edge-2)]">
              {p.who.map((w) => (
                <li key={w.label} className={`grid grid-cols-[24px_1fr] items-start gap-x-[12px] gap-y-[4px] border-b border-[var(--edge)] px-[20px] py-[14px] last:border-0 md:grid-cols-[24px_260px_1fr] ${w.applies ? "" : "text-[color:var(--text-3)]"}`}>
                  <span aria-hidden className={`mt-[3px] flex size-[18px] items-center justify-center rounded-full ${w.applies ? "bg-[var(--cyan)] text-[color:var(--text)]" : "border border-[var(--edge-2)]"}`}>
                    {w.applies && <svg viewBox="0 0 16 16" className="size-[11px]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5l3 3 7-7" /></svg>}
                  </span>
                  <h3 className="text-[15px] font-semibold leading-[24px]">
                    {w.label}{w.marker && <span className="ml-[8px] font-[family-name:var(--font-mono)] text-[11px] font-medium uppercase tracking-[0.96px] text-[color:var(--link)]">{w.marker}</span>}
                    <span className="sr-only">{w.applies ? "Applies." : "Does not apply."}</span>
                  </h3>
                  <p className="col-start-2 text-[15px] leading-[24px] text-[color:var(--text-2)] md:col-start-3">{w.note}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {p.spec?.length ? (
          <section id="spec" className={section}>
            <h2 className={h2}>Behavior spec</h2>
            <p className="max-w-[820px] text-[18px] leading-[30px] max-md:text-[16px] max-md:leading-[26px]">
              {/* one plain sentence: no colour gradients or bold parts (19 Nov) */}
              {p.spec.map((s) => s.t).join("")}
            </p>
            {p.specMore && (
              <details open={p.specMore.open || undefined} className="group max-w-[900px]">
                {p.specMore.summary && <summary className="h6-link w-fit cursor-pointer list-none text-[14px] font-semibold text-[color:var(--link)] [&::-webkit-details-marker]:hidden">{p.specMore.summary}</summary>}
                <div className="flex flex-col gap-[28px] pt-[24px]">
                  {p.specMore.legend.length > 0 && (
                    <ul className="grid grid-cols-2 gap-[12px] md:grid-cols-3 lg:grid-cols-6">
                      {p.specMore.legend.map((l) => (
                        <li key={l.slot} className="flex flex-col gap-[4px] pt-[10px]">
                          <span aria-hidden className="-mt-[10px] mb-[6px] h-[2px] w-full rounded-full bg-[var(--edge-2)]" />
                          <strong className="w-fit text-[13px] font-semibold leading-[18px] text-[color:var(--text)]">{l.label}</strong>
                          <span className="text-[12.5px] leading-[18px] text-[color:var(--text-3)]">{l.text}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <dl className="grid grid-cols-1 gap-x-[40px] gap-y-[18px] md:grid-cols-[200px_1fr]">
                    {p.specMore.facts.map((f) => (
                      <div key={f.title} className="contents">
                        <dt className="text-[15px] font-semibold leading-[24px]">{f.title}</dt>
                        <dd className="text-[15px] leading-[24px] text-[color:var(--text-2)]">
                          {f.items ? <ul className="flex list-disc flex-col gap-[4px] pl-[18px]">{f.items.map((x) => <li key={x}>{x}</li>)}</ul> : f.text?.split("\n\n").map((t, i) => <p key={i} className={i ? "pt-[8px]" : ""}>{t}</p>)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </details>
            )}
          </section>
        ) : null}

        {p.principles?.length ? (
          <section id="principles" className={section}>
            <h2 className={h2}>Guiding principles</h2>
            <ul className="flex flex-col rounded-[16px] bg-[var(--panel)]">
              {p.principles.map((x) => (
                <li key={x.role + x.name} className="grid grid-cols-1 gap-[6px] border-b border-[var(--edge)] px-[24px] py-[18px] last:border-0 md:grid-cols-[160px_1fr] md:gap-[24px]">
                  <span className={`${mono} pt-[4px]`}>{x.role}</span>
                  <div className="flex flex-col gap-[4px]">
                    <a href="/v6#principles" className="flex w-fit items-center gap-[6px] text-[17px] font-semibold leading-[26px] text-[color:var(--link)]">
                      <span className="h6-link">{x.name}</span>
                      <svg viewBox="0 0 16 16" aria-hidden className="h6-arrow h6-arrow--up size-[14px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 11 11 5M6 5h5v5" /></svg>
                    </a>
                    <p className="text-[15px] leading-[24px] text-[color:var(--text-2)]">{x.why}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {p.code && (
          <section id="code" className={section}>
            <h2 className={h2}>Implementation example</h2>
            {p.code.intro && <p className={body}>{p.code.intro}</p>}
            <CodeBlock code={p.code.html} label="HTML" className="w-full max-w-[960px]" />
          </section>
        )}

        {related.length > 0 && (
          <section id="related" className={section}>
            <h2 className={h2}>Related patterns</h2>
            <ul className="grid grid-cols-2 gap-[10px] md:gap-[16px] lg:grid-cols-3">
              {related.map((r) => (
                <li key={r.id} className="flex">
                  <a href={patternHref(r.id)} className="h6-card flex w-full flex-col gap-[6px] rounded-[14px] border border-[var(--edge-2)] bg-white p-[14px] md:gap-[8px] md:rounded-[16px] md:p-[20px]">
                    <span className="flex items-center gap-[6px] break-words text-[14px] max-md:min-h-[40px] max-md:items-start font-semibold leading-[20px] text-[color:var(--link)] md:text-[16px] md:leading-[24px]">
                      <span className="h6-link">{r.name}</span>
                      <svg viewBox="0 0 16 16" aria-hidden className="h6-arrow h6-arrow--up size-[14px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 11 11 5M6 5h5v5" /></svg>
                    </span>
                    {r.summary && <p className="text-[13px] leading-[19px] text-[color:var(--text-2)] max-md:line-clamp-3 md:text-[14px] md:leading-[22px]">{r.summary}</p>}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </article>
  );
}
