"use client";
import { useMemo, useState } from "react";
import { Weave } from "./Weave";
import { POSTS, TOPICS } from "./content";

// Figma: HAX v2 · Blog 102:2659 (🌐 Website v2). Search and topics filter the five posts, as on v1.
export function BlogPage() {
  const [q, setQ] = useState("");
  const [on, setOn] = useState<string[]>([]);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return POSTS.filter((p) => (!on.length || on.some((t) => p.tags.includes(t))) && (!s || `${p.title} ${p.body} ${p.author}`.toLowerCase().includes(s)));
  }, [q, on]);
  const toggle = (t: string) => setOn((o) => (o.includes(t) ? o.filter((x) => x !== t) : [...o, t]));
  return (
    <>
      <section className="relative flex h-[512px] flex-col items-center px-[120px] pt-[168px]">
        <Weave row0={0} fade={{ top: 140, bottom: 200 }} />
        <div className="relative flex flex-col items-center gap-[24px]">
          <h1 className="hx2-h1 hx2-rise text-center text-[72px] font-semibold leading-[72px] tracking-[-0.03em]">Insights &amp; Perspectives</h1>
          <p className="hx2-rise hx2-rise--2 w-[560px] text-center text-[18px] leading-[28px] text-[color:var(--grey)] [text-wrap:balance]">Explore our latest thoughts on design, research, and innovation in the world of product development.</p>
          <label className="hx2-rise hx2-rise--3 flex w-[560px] items-center gap-[12px] rounded-[12px] border border-[color:var(--line)] bg-[color:var(--card)] px-[16px] py-[12px] transition-colors focus-within:border-[#999]">
            <svg viewBox="0 0 24 24" className="size-[20px] text-[color:var(--grey)]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search articles..." aria-label="Search articles" className="w-full bg-transparent text-[16px] leading-[24px] outline-none placeholder:text-[color:var(--grey)]" />
          </label>
          <div className="hx2-rise hx2-rise--3 flex flex-wrap justify-center gap-[8px]">
            {TOPICS.map((t) => { const sel = on.includes(t); return (
              <button key={t} type="button" aria-pressed={sel} onClick={() => toggle(t)}
                className={`rounded-full border px-[14px] py-[6px] text-[14px] font-medium leading-[20px] transition-colors duration-300 ${sel ? "border-[color:var(--btn)] bg-[color:var(--btn)] text-[color:var(--btn-ink)]" : "border-[color:var(--line)] bg-[color:var(--card)] text-[color:var(--ink)] hover:border-[color:var(--line-strong)]"}`}>{t}</button>
            ); })}
          </div>
        </div>
      </section>
      <section className="px-[120px] pb-[96px] pt-[24px]">
        {list.length ? (
          <div className="grid grid-cols-3 gap-[24px]">
            {list.map((p) => (
              <a key={p.slug} href={`https://outshift.design/blog/${p.slug}`} target="_blank" rel="noreferrer"
                className="hx2-reveal group flex flex-col overflow-hidden rounded-[16px] border border-[color:var(--line)] bg-[color:var(--card)] transition-shadow duration-300 hover:shadow-[0_12px_32px_rgba(17,17,17,0.08)]">
                <span className="block h-[216px] overflow-hidden"><img alt="" loading="lazy" src={`/hax/v1/blog/${p.slug}.jpg`} className="block size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" /></span>
                <span className="flex flex-1 flex-col gap-[12px] p-[24px]">
                  <span className="flex gap-[6px]">
                    {p.tags.slice(0, 2).map((t) => <span key={t} className="rounded-[6px] bg-[color:var(--fill)] px-[8px] py-[4px] font-[family-name:var(--font-mono)] text-[12px] leading-[16px]">{t}</span>)}
                    {p.tags.length > 2 && <span className="rounded-[6px] bg-[color:var(--fill)] px-[8px] py-[4px] font-[family-name:var(--font-mono)] text-[12px] leading-[16px]">+{p.tags.length - 2}</span>}
                  </span>
                  <span className="line-clamp-2 h-[56px] text-[18px] font-semibold leading-[28px]">{p.title}</span>
                  <span className="line-clamp-3 h-[60px] text-[14px] leading-[20px] text-[color:var(--grey)]">{p.body}</span>
                  <span className="flex gap-[16px] text-[13px] leading-[20px] text-[color:var(--grey)]">
                    <span className="flex items-center gap-[6px]"><svg viewBox="0 0 24 24" className="size-[14px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>{p.author}</span>
                    <span className="flex items-center gap-[6px]"><svg viewBox="0 0 24 24" className="size-[14px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /></svg>{p.date}</span>
                  </span>
                  <span className="h-px w-full bg-[color:var(--line)]" />
                  <span className="flex items-center justify-between">
                    <span className="font-[family-name:var(--font-mono)] text-[12px] uppercase leading-[16px] tracking-[0.04em] text-[color:var(--grey)]">{p.kind}</span>
                    <span className="flex items-center gap-[6px] text-[14px] font-medium leading-[20px]">Read more<svg viewBox="0 0 24 24" className="size-[16px] transition-transform duration-300 group-hover:translate-x-[3px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg></span>
                  </span>
                </span>
              </a>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-[12px] rounded-[16px] bg-[color:var(--fill)] px-[24px] py-[64px] text-center">
            <p className="text-[18px] font-semibold leading-[28px]">No articles match.</p>
            <button type="button" onClick={() => { setQ(""); setOn([]); }} className="hx2-link text-[14px] font-medium">Clear the search and topics</button>
          </div>
        )}
      </section>
    </>
  );
}
