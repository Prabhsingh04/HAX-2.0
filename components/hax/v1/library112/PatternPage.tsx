import { CodeBlock } from "../CodeBlock";
import { patternHref } from "../patterns/href";
import { MODE_LABEL } from "@/lib/v2/modes";
import type { Mode } from "@/lib/v2/types";
import { appearsIn, BY_ID, CATEGORY_LABEL, DIMS, PRINCIPLE_NAME, PREVIEW_SIZE, SETUP_LABEL, TEMPLATE_LABEL, previewSrc, previewSrcSet, type Pattern } from "./library";

// One structure for every pattern (Srishti, 17 Nov: "make sure the structure of a pattern page is
// the same"), in the order of her v3 draft: preview, what it solves, how the interaction works, then
// who is involved, behavior spec and guiding principles where a pattern has a behavior spec
// (agentic), or an implementation example where it has code (general), and related patterns.
const eyebrow = "font-semibold leading-[16px] text-[11px] text-[color:var(--text-secondary)] tracking-[1.2px] uppercase";
const h2 = "font-semibold leading-[34px] text-[26px] tracking-[-0.2px] md:leading-[36px] md:text-[29px]";
const body = "max-w-[720px] leading-[26px] text-[16px] text-[color:var(--text-secondary)]";
// Sticky offsets follow the header the page sits under: v1's own (64px, 94px from lg) unless a host
// sets --hx-sticky / --hx-sticky-lg (v6's V1Embed: its 72px nav). Anchors land below header + bar.
const section = "scroll-mt-[calc(var(--hx-sticky-lg,94px)_+_56px)] flex w-full flex-col gap-[16px]";
const chip = "rounded-full border border-[var(--stroke-default)] px-[10px] py-[3px] text-[12.5px] leading-[18px] text-[color:var(--text-primary)]";

function sections(p: Pattern): [string, string][] {
  const s: [string, string][] = [["preview", "Preview"], ["solves", "What it solves"], ["how", "How the interaction works"]];
  if (p.kind === "agentic") s.push(["who", "Who is involved"], ["spec", "Behavior spec"]);
  if (p.kind === "agentic" && p.principles.length) s.push(["principles", "Guiding principles"]);
  if (p.kind === "general" && p.code) s.push(["code", "Implementation example"]);
  if (p.related.length) s.push(["related", "Related patterns"]);
  return s;
}

export function PatternPage({ id }: { id: string }) {
  const p = BY_ID.get(id)!;
  const toc = sections(p);
  const where = appearsIn(p);
  const solves = p.kind === "agentic" ? p.whatItSolves || p.summary : p.why;
  const related = p.related.filter((r) => BY_ID.has(r.id));

  return (
    <article className="flex w-full flex-col pb-[96px]">
      <header className="flex flex-col gap-[14px] px-[var(--hx-gutter)] pb-[28px] pt-[40px] md:pt-[56px]">
        <nav aria-label="Breadcrumb" className="flex flex-wrap gap-[8px] leading-[18px] text-[12px]">
          <a href="/patterns" className="hx-link text-[color:var(--text-link)]">Pattern library</a>
          <span className="text-[color:var(--text-tertiary)]">/</span>
          <a href={`/patterns?category=${p.category}`} className="hx-link text-[color:var(--text-link)]">{CATEGORY_LABEL[p.category]}</a>
          <span className="text-[color:var(--text-tertiary)]">/</span>
          <span>{p.name}</span>
        </nav>
        <p className={eyebrow}>{p.kind === "agentic" ? "Agentic interaction pattern" : "Interaction pattern"}</p>
        <h1 className="font-semibold leading-[44px] text-[38px] tracking-[-0.5px] md:leading-[58px] md:text-[50px] md:tracking-[-0.6px]">{p.name}</h1>
        <p className="max-w-[720px] leading-[26px] text-[16px] text-[color:var(--text-secondary)] md:text-[18px] md:leading-[28px]">{p.summary}</p>
      </header>

      <nav aria-label="On this page" className="sticky top-[var(--hx-sticky,64px)] z-10 border-y border-[var(--stroke-subtle)] bg-[var(--surface-page)] lg:top-[var(--hx-sticky-lg,94px)]">
        <ul className="flex gap-[20px] overflow-x-auto whitespace-nowrap px-[var(--hx-gutter)] py-[12px] text-[13px] leading-[18px]">
          <li className="font-semibold text-[color:var(--text-secondary)]">On this page</li>
          {toc.map(([k, l]) => <li key={k}><a href={`#${k}`} className="hx-link text-[color:var(--text-primary)]">{l}</a></li>)}
        </ul>
      </nav>

      <div className="flex flex-col gap-[64px] px-[var(--hx-gutter)] pt-[40px]">
        <section id="preview" className={section}>
          <h2 className={h2}>Preview</h2>
          {where.length > 0 && (
            <p className="flex flex-wrap items-center gap-[8px] text-[13px] text-[color:var(--text-secondary)]">
              <span className={eyebrow}>Appears in</span>
              {where.map((w) => <span key={w} className={chip}>{w}</span>)}
            </p>
          )}
          <figure className="w-full overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--stroke-subtle)] bg-white">
            {/* the first thing on the page: load it now, at the size the screen needs, with its space held */}
            <img src={previewSrc(p.id)} srcSet={previewSrcSet(p.id)} sizes="(min-width: 1440px) 1152px, (min-width: 1280px) calc(100vw - 288px), 92vw"
              width={PREVIEW_SIZE[p.id]?.[0]} height={PREVIEW_SIZE[p.id]?.[1]} decoding="async"
              alt={`${p.name}: example of the pattern in use`} className="block h-auto w-full" />
          </figure>
          {p.kind === "general" && p.placements && p.placements.length > 0 && (
            <ul className="grid w-full grid-cols-1 gap-[12px] md:grid-cols-2">
              {p.placements.map((x, i) => (
                <li key={i} className="flex flex-col gap-[4px] rounded-[var(--radius-xl)] bg-[var(--surface-tint)] px-[16px] py-[12px]">
                  <span className="font-semibold text-[13px] leading-[18px]">{TEMPLATE_LABEL[x.template] ?? x.template}</span>
                  {x.note && <span className="text-[13.5px] leading-[20px] text-[color:var(--text-secondary)]">{x.note}</span>}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section id="solves" className={section}>
          <h2 className={h2}>What it solves</h2>
          <p className={body}>{solves}</p>
          {p.kind === "general" && p.what && <p className={body}>{p.what}</p>}
        </section>

        <section id="how" className={section}>
          <h2 className={h2}>How the interaction works</h2>
          {p.kind === "agentic" ? (
            p.interactionSteps?.length ? (
              <ol className="grid w-full grid-cols-1 gap-[16px] md:grid-cols-3">
                {p.interactionSteps.map((s, i) => (
                  <li key={i} className="flex flex-col gap-[8px] border-t-2 border-[color-mix(in_srgb,var(--hx-human)_45%,var(--stroke-default))] pt-[14px]">
                    <span className="font-[family-name:var(--font-code)] text-[12px] text-[color:var(--text-tertiary)]">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="font-semibold leading-[24px] text-[17px]">{s.title}</h3>
                    <p className="leading-[22px] text-[14px] text-[color:var(--text-secondary)]">{s.description}</p>
                  </li>
                ))}
              </ol>
            ) : <p className={body}>{p.interactionModel}</p>
          ) : (
            <dl className="grid w-full max-w-[900px] grid-cols-1 gap-x-[40px] gap-y-[16px] md:grid-cols-[200px_1fr]">
              <dt className="font-semibold text-[15px] leading-[24px]">When it happens</dt>
              <dd className="leading-[24px] text-[15px] text-[color:var(--text-secondary)]">{p.when}</dd>
              <dt className="font-semibold text-[15px] leading-[24px]">What happens</dt>
              <dd className="leading-[24px] text-[15px] text-[color:var(--text-secondary)]">{p.how}</dd>
            </dl>
          )}
          {p.kind === "agentic" && p.whereItEmbeds && (
            <p className={`${body} border-l-2 border-[var(--stroke-default)] pl-[16px] text-[15px]`}><strong className="text-[color:var(--text-primary)]">Where it appears. </strong>{p.whereItEmbeds}</p>
          )}
        </section>

        {p.kind === "agentic" && (
          <section id="who" className={section}>
            <h2 className={h2}>Who is involved</h2>
            <p className={body}>Where the pattern applies as agents and people take part.</p>
            <ul className="grid w-full grid-cols-1 gap-[12px] sm:grid-cols-2 xl:grid-cols-4">
              {DIMS.map((d) => {
                const note = p.level.notes[d], primary = p.level.primary === d;
                return (
                  <li key={d} className={`flex flex-col gap-[6px] rounded-[var(--radius-xl)] border px-[16px] py-[14px] ${primary ? "border-[var(--hx-human)]" : "border-[var(--stroke-subtle)]"} ${note ? "" : "opacity-60"}`}>
                    <span className="font-semibold text-[14px] leading-[20px]">{SETUP_LABEL[d]}</span>
                    <span className={`${eyebrow} ${primary ? "text-[color:var(--hx-human)]" : ""}`}>{primary ? "Primary setting" : note ? "Applies" : "Not applicable"}</span>
                    {note && <span className="text-[13.5px] leading-[20px] text-[color:var(--text-secondary)]">{note}</span>}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {p.kind === "agentic" && (
          <section id="spec" className={section}>
            <h2 className={h2}>Behavior spec</h2>
            {p.spec && <p className="max-w-[820px] rounded-[var(--radius-xl)] bg-[var(--surface-tint)] px-[20px] py-[16px] leading-[26px] text-[16px]">{p.spec}</p>}
            <dl className="grid w-full max-w-[900px] grid-cols-1 gap-x-[40px] gap-y-[12px] md:grid-cols-[200px_1fr]">
              <dt className="font-semibold text-[14px] leading-[22px]">What the agent does</dt>
              <dd className="text-[14px] leading-[22px] text-[color:var(--text-secondary)]">{MODE_LABEL[p.mode.primary as Mode] ?? p.mode.primary}{p.mode.secondary ? `, also ${(MODE_LABEL[p.mode.secondary as Mode] ?? p.mode.secondary).toLowerCase()}` : ""}</dd>
              {p.triggers?.length ? (<>
                <dt className="font-semibold text-[14px] leading-[22px]">When it starts</dt>
                <dd><ul className="flex list-disc flex-col gap-[4px] pl-[18px] text-[14px] leading-[22px] text-[color:var(--text-secondary)]">{p.triggers.map((t) => <li key={t}>{t}</li>)}</ul></dd>
              </>) : null}
              <dt className="font-semibold text-[14px] leading-[22px]">Shows up in</dt>
              <dd className="text-[14px] leading-[22px] text-[color:var(--text-secondary)]">{where.join(" · ")}</dd>
            </dl>
          </section>
        )}

        {p.kind === "agentic" && p.principles.length > 0 && (
          <section id="principles" className={section}>
            <h2 className={h2}>Guiding principles</h2>
            <ul className="grid w-full grid-cols-1 gap-[16px] md:grid-cols-2">
              {p.principles.map((x) => (
                <li key={x.id} className="flex flex-col gap-[6px] rounded-[var(--radius-xl)] border border-[var(--stroke-subtle)] px-[18px] py-[16px]">
                  <span className={eyebrow}>{x.role}</span>
                  <span className="font-semibold text-[18px] leading-[26px]">{PRINCIPLE_NAME[x.id] ?? x.id}</span>
                  <span className="text-[14px] leading-[22px] text-[color:var(--text-secondary)]">{x.why}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {p.kind === "general" && p.code && (
          <section id="code" className={section}>
            <h2 className={h2}>Implementation example</h2>
            <p className={body}>An optional starting point to adapt to your product.</p>
            <CodeBlock code={p.code} label="HTML" className="w-full max-w-[960px]" />
          </section>
        )}

        {related.length > 0 && (
          <section id="related" className={section}>
            <h2 className={h2}>Related patterns</h2>
            <ul className="flex flex-wrap gap-[10px]">
              {related.map((r) => (
                <li key={r.id}>
                  <a href={patternHref(r.id)} className="hx-btn hx-btn--outline flex h-[34px] items-center gap-[6px] rounded-[var(--radius-pill)] border border-[var(--stroke-default)] bg-[var(--surface-page)] px-[14px] text-[13px] font-semibold">
                    {r.name}
                    <img alt="" src="/hax/v1/icon-arrow-right-14.svg" className="hx-arrow size-[14px]" />
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
