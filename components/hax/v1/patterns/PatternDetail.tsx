import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { MODE_LABEL } from "@/lib/v2/modes";
import { AUDIENCE_LABEL, CHANNEL_LABEL, LEVEL_LABEL, LEVEL_ORDER } from "@/lib/v2/levels";
import { BY_PATTERN, PATTERNS, PRINCIPLE_LABEL, PRINCIPLES, appliesAt, canOf, doesOf, plain, repliesOf, setupsOf, type PrincipleId } from "./model";
import { patternHref } from "./href";
import { PatternsNav } from "./PatternsNav";
import { SetupArt } from "./SetupArt";
import { Toc } from "./Toc";

// One interaction pattern, laid out like the component pages (library/PatternPage.tsx): the
// patterns rail, the article, then "On this page". Every section shows only when the catalog
// (lib/v2/catalog.ts) or the Studio-only lines in model.ts have something for it. Studio's
// "How it looks" demos aren't ported yet.
const h2 = "font-semibold leading-[36px] text-[29px] tracking-[-0.2px] whitespace-nowrap";
const sub = "leading-[22px] text-[14px] text-[color:var(--text-secondary)] max-w-[640px]";
const eyebrow = "font-semibold leading-[16px] text-[11px] text-[color:var(--text-secondary)] tracking-[1.2px] uppercase";
const tile = "bg-[var(--surface-tint)] border border-[var(--stroke-subtle)] rounded-[var(--radius-xl)]";
const body = "leading-[26px] text-[16px] max-w-[680px]";
const section = "scroll-mt-[110px] flex flex-col gap-[14px] items-start w-full";
const reply = "inline-flex items-center h-[26px] px-[10px] rounded-[var(--radius-pill)] border border-[var(--stroke-default)] bg-[var(--surface-page)] font-medium leading-[16px] text-[12px] whitespace-nowrap";
const fact = "inline-flex items-center h-[30px] px-[12px] rounded-[var(--radius-pill)] border border-[var(--stroke-subtle)] bg-[var(--surface-tint)] leading-[18px] text-[13px] whitespace-nowrap";
const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

function Fact({ label, value, line }: { label: string; value: string; line?: string }) {
  return (
    <div className="flex flex-col gap-[6px] px-[20px] py-[16px] first:pl-0">
      <dt className={eyebrow}>{label}</dt>
      <dd className="flex flex-col gap-[2px]">
        <span className="font-semibold leading-[22px] text-[15px]">{value}</span>
        {line && <span className="leading-[20px] text-[13px] text-[color:var(--text-secondary)]">{line}</span>}
      </dd>
    </div>
  );
}

function SpecRow({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[200px_minmax(0,1fr)] gap-x-[24px] border-t border-[var(--stroke-subtle)] py-[14px]">
      <dt className="font-semibold leading-[22px] text-[14px]">{term}</dt>
      <dd className="flex flex-col items-start gap-[10px] leading-[22px] text-[14px]">{children}</dd>
    </div>
  );
}

export function PatternDetail({ id }: { id: string }) {
  const p = BY_PATTERN.get(id)!;
  const i = PATTERNS.indexOf(p);
  const prev = PATTERNS[i - 1];
  const next = PATTERNS[i + 1];
  const setups = setupsOf(p);
  const does = doesOf(p);
  const can = canOf(p);
  const pr = PRINCIPLES[p.id];
  const principles: [string, [PrincipleId, string]][] = pr ? [["Primary", pr.primary], ...(pr.also ? [["Also supports", pr.also] as [string, [PrincipleId, string]]] : [])] : [];
  const related = p.composes_with.map((r) => BY_PATTERN.get(r)).filter((r): r is NonNullable<typeof r> => !!r);
  const has = {
    solves: !!p.whatItSolves,
    how: !!(p.interactionModel || p.interactionSteps?.length),
    example: !!(p.example || p.factChips?.length || p.whereItEmbeds),
    variants: !!p.variants?.length,
    related: related.length > 0,
  };
  const toc: [string, string][] = [];
  if (has.solves) toc.push(["solves", "What it solves"]);
  if (has.how) toc.push(["how", "How it works"]);
  toc.push(["who", "Who is involved"], ["spec", "Behavior spec"]);
  if (has.example) toc.push(["example", "Example"]);
  if (has.variants) toc.push(["variants", "Variants"]);
  if (has.related) toc.push(["related", "Related patterns"]);
  const reach = setups.length === 4 ? "Applies in all four setups" : setups.length === 1 ? "Applies only in this setup" : `Applies in ${setups.length} of the four setups`;

  return (
    <div className="flex w-full items-start">
      <PatternsNav current={p.id} />
      <article className="flex min-w-0 flex-1 flex-col items-start gap-[56px] pb-[96px] pl-[64px] pr-[48px] pt-[40px]">
        <div className="flex w-full flex-col gap-[28px]">
          <header className="grid w-full grid-cols-[minmax(0,1fr)_224px] gap-x-[40px]">
            <div className="flex min-w-0 flex-col items-start gap-[14px]">
              <nav aria-label="Breadcrumb" className="flex gap-[8px] whitespace-nowrap leading-[18px] text-[12px]">
                <a href="/patterns" className="hx-link text-[color:var(--text-link)]">Patterns</a>
                <span className="text-[color:var(--text-tertiary)]">/</span>
                <span>{p.name}</span>
              </nav>
              <p className={eyebrow}>Interaction pattern</p>
              <h1 className="font-semibold leading-[58px] text-[50px] tracking-[-0.6px]">{p.name}</h1>
              <p className="max-w-[560px] leading-[26px] text-[16px] text-[color:var(--text-secondary)]">{p.summary}</p>
            </div>
            <div className={`su-live ${tile} flex items-center justify-center self-stretch px-[16px] py-[20px]`}>
              <SetupArt level={p.level.primary} />
            </div>
          </header>
          <dl className="grid w-full grid-cols-3 divide-x divide-[var(--stroke-subtle)] border-y border-[var(--stroke-subtle)]">
            <Fact label="What it does" value={MODE_LABEL[p.mode.primary]} line={plain(p.mode.primary)} />
            <Fact label="Main setup" value={LEVEL_LABEL[p.level.primary]} line={reach} />
            <Fact label="Shows up in" value={p.channels.map((c) => CHANNEL_LABEL[c]).join(" · ")} />
          </dl>
        </div>

        {has.solves && (
          <section id="solves" className={section}>
            <h2 className={h2}>What it solves</h2>
            <p className={body}>{p.whatItSolves}</p>
            {principles.length > 0 && (
              <div className={`${tile} mt-[10px] flex w-full flex-col gap-[12px] pb-[18px] pt-[18px]`}>
                <p className={`${eyebrow} px-[22px]`}>Principles at work</p>
                <div className={`grid ${principles.length > 1 ? "grid-cols-2 divide-x divide-[var(--stroke-subtle)]" : "grid-cols-1"}`}>
                  {principles.map(([k, [pid, text]]) => (
                    <div key={k} className="flex flex-col gap-[4px] px-[22px]">
                      <p className="leading-[18px] text-[12px] text-[color:var(--text-secondary)]">{k}</p>
                      <p className="font-semibold leading-[24px] text-[16px]">{PRINCIPLE_LABEL[pid]}</p>
                      <p className="leading-[22px] text-[14px] text-[color:var(--text-secondary)]">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {has.how && (
          <section id="how" className={section}>
            <h2 className={h2}>How the interaction works</h2>
            {p.interactionModel && <p className={body}>{p.interactionModel}</p>}
            {!!p.interactionSteps?.length && (
              <ol className="mt-[10px] grid w-full grid-cols-3 gap-[16px]">
                {p.interactionSteps.map((s, k) => (
                  <li key={s.title} className={`${tile} flex flex-col gap-[10px] px-[20px] py-[18px]`}>
                    <span className="grid size-[24px] place-items-center rounded-full border border-[var(--stroke-default)] bg-[var(--surface-page)] font-semibold leading-none text-[12px]">{k + 1}</span>
                    <p className="font-semibold leading-[22px] text-[15px]">{s.title}</p>
                    <p className="leading-[22px] text-[14px] text-[color:var(--text-secondary)]">{s.description}</p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        )}

        <section id="who" className={section}>
          <h2 className={h2}>Who is involved</h2>
          <p className={sub}>Where the pattern applies as agents and people take part.</p>
          <ul className="mt-[10px] w-full border-b border-[var(--stroke-subtle)]">
            {LEVEL_ORDER.map((l) => {
              const on = appliesAt(p, l);
              return (
                <li key={l} className="su-live grid grid-cols-[120px_220px_minmax(0,1fr)] items-center gap-x-[24px] border-t border-[var(--stroke-subtle)] py-[12px]">
                  <SetupArt level={l} muted={!on} />
                  <p className={`leading-[22px] text-[14px] ${on ? "font-semibold" : "font-medium text-[color:var(--text-secondary)]"}`}>
                    {LEVEL_LABEL[l]}
                    {l === p.level.primary && <span className="font-normal text-[color:var(--text-secondary)]"> · main setup</span>}
                  </p>
                  <p className={`leading-[22px] text-[14px] ${on ? "" : "text-[color:var(--text-tertiary)]"}`}>
                    {on ? p.level.notes[l] : "Does not apply here."}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>

        <section id="spec" className={section}>
          <h2 className={h2}>Behavior spec</h2>
          <p className={`${tile} w-full px-[24px] py-[20px] leading-[28px] text-[18px]`}>{p.spec}</p>
          <dl className="mt-[10px] w-full border-b border-[var(--stroke-subtle)]">
            <SpecRow term="When it happens">
              <ul className="flex flex-col gap-[6px]">
                {p.triggers.map((t) => (
                  <li key={t} className="flex gap-[10px]">
                    <span aria-hidden="true" className="mt-[9px] size-[4px] shrink-0 rounded-full bg-[var(--text-tertiary)]" />
                    {t}
                  </li>
                ))}
              </ul>
            </SpecRow>
            <SpecRow term="What the agent does">
              {does.mode ? (
                <span className="flex flex-col"><b className="font-semibold">{does.mode}</b>{does.text}</span>
              ) : does.text}
            </SpecRow>
            <SpecRow term="Who receives it">{p.audience.map((a) => AUDIENCE_LABEL[a]).join(" · ")}</SpecRow>
            <SpecRow term="Where it shows up">{p.channels.map((c) => CHANNEL_LABEL[c]).join(" · ")}</SpecRow>
            <SpecRow term={can.label}>
              {can.text && <span>{can.text}</span>}
              <ul aria-label="Replies" className="flex flex-wrap gap-[8px]">
                {repliesOf(p).map((r) => <li key={r} className={reply}>{r}</li>)}
              </ul>
            </SpecRow>
          </dl>
        </section>

        {has.example && (
          <section id="example" className={section}>
            <h2 className={h2}>Example</h2>
            {p.example && <p className={body}>{p.example}</p>}
            {!!p.factChips?.length && (
              <ul className="flex flex-wrap gap-[8px]">
                {p.factChips.map((c) => <li key={c} className={fact}>{c}</li>)}
              </ul>
            )}
            {p.whereItEmbeds && (
              <div className={`${tile} mt-[10px] flex w-full flex-col gap-[6px] px-[22px] py-[18px]`}>
                <p className={eyebrow}>Where it fits</p>
                <p className="leading-[22px] text-[14px]">{p.whereItEmbeds}</p>
              </div>
            )}
          </section>
        )}

        {has.variants && (
          <section id="variants" className={section}>
            <h2 className={h2}>Variants</h2>
            {p.variant_axis && <p className={sub}>They differ only in {lowerFirst(p.variant_axis)}. The mode and the replies stay the same.</p>}
            <ul className="flex flex-wrap gap-[8px]">
              {p.variants!.map((v) => (
                <li key={v.id} className={fact}>
                  {v.label}
                  {v.default && <span className="text-[color:var(--text-secondary)]">&nbsp;· default</span>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {has.related && (
          <section id="related" className={section}>
            <h2 className={h2}>Related patterns</h2>
            <p className={sub}>Patterns this one works with.</p>
            <ul className="mt-[10px] grid w-full grid-cols-2 gap-[16px]">
              {related.map((r) => (
                <li key={r.id} className="flex">
                  <a href={patternHref(r.id)} className={`hx-card ${tile} flex w-full flex-col gap-[6px] px-[22px] py-[18px]`}>
                    <span className="flex items-center justify-between gap-[12px]">
                      <span className="font-semibold leading-[24px] text-[16px]">{r.name}</span>
                      <ArrowRight size={16} aria-hidden="true" className="hx-arrow shrink-0 text-[color:var(--text-tertiary)]" />
                    </span>
                    <span className="leading-[20px] text-[13px] text-[color:var(--text-secondary)]">{r.summary}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <nav aria-label="Previous and next pattern" className="grid w-full grid-cols-2 gap-[16px] border-t border-[var(--stroke-subtle)] pt-[32px]">
          {prev ? (
            <a href={patternHref(prev.id)} className={`hx-card ${tile} flex flex-col items-start gap-[4px] px-[22px] py-[16px]`}>
              <span className={eyebrow}>Previous</span>
              <span className="flex items-center gap-[8px] font-semibold leading-[24px] text-[16px]">
                <ArrowLeft size={16} aria-hidden="true" className="shrink-0 text-[color:var(--text-tertiary)]" />
                {prev.name}
              </span>
            </a>
          ) : <span />}
          {next ? (
            <a href={patternHref(next.id)} className={`hx-card ${tile} flex flex-col items-end gap-[4px] px-[22px] py-[16px] text-right`}>
              <span className={eyebrow}>Next</span>
              <span className="flex items-center gap-[8px] font-semibold leading-[24px] text-[16px]">
                {next.name}
                <ArrowRight size={16} aria-hidden="true" className="hx-arrow shrink-0 text-[color:var(--text-tertiary)]" />
              </span>
            </a>
          ) : <span />}
        </nav>
      </article>
      <Toc items={toc} />
    </div>
  );
}
