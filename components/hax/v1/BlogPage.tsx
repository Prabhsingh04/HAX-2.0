"use client";
import { useMemo, useState } from "react";

// Figma: HAX · Blog 101:4547 (hero 101:4621, posts 101:4669)
const TOPICS = ["Research", "AI", "AI Ethics", "Product Design", "Design", "Workflow", "Agents", "Case Study"];
// `tags`: the first two are shown (as in Figma), the rest collapse into "+N". Hidden tags are our best guess from the topic list.
const POSTS = [
  { slug: "human-agent-hermeneutics", title: "Human-agent hermeneutics: designing for understanding, not instruction.", body: "Why the unit of design is the evolving interpretation between a person and an agent, not the prompt or the action.", author: "Marc Scibelli", date: "August 2026", kind: "16 min read", tags: ["Design", "AI", "Agents", "Research"] },
  { slug: "button-is-no-longer-the-point", title: "The Button Is No Longer the Point", body: "As AI systems begin to reason, adapt, and act, design shifts from perfecting interfaces to shaping behavior and the human–AI relationship — putting HAX principles like Control, Clarity, Recovery, Collaboration, and Traceability at the center of the craft.", author: "Krystelle Gonzalez Papaux", date: "June 2026", kind: "6 min read", tags: ["Design", "AI", "Product Design", "AI Ethics"] },
  { slug: "navigating-multi-agent-future", title: "Navigating the Multi-Agent Future: Expert Perspectives on Human-Agent Interaction", body: "The shifting landscape of work and interaction. This report presents key findings and actionable insights drawn from leading industry and academic experts on the future of human agent interaction.", author: "Krystelle Gonzalez Papaux", date: "April 2026", kind: "Whitepaper", tags: ["Research", "AI", "Agents"] },
  { slug: "making-room-agents", title: "Making Room for Agents in Expert Tools", body: "How agents need to map onto the grammar of expert tools — not just add a chat panel, but participate in the work without displacing the structure that makes expert fluency possible.", author: "Marc Scibelli", date: "May 2026", kind: "Article", tags: ["Design", "AI", "Agents"] },
  { slug: "augmented-designer", title: "The Augmented Designer: How Agents are Reshaping the Design Workflow", body: "Reflections on AI-augmented design at Outshift — from the dangers of plausible noise to the CASA project case study and a week of record-breaking fidelity.", author: "Valentina Esposito", date: "June 2026", kind: "8 min read", tags: ["Design", "AI", "Workflow", "Case Study", "Agents"] },
];
const tag = "bg-[var(--surface-tint)] border border-[var(--stroke-default)] px-[8px] py-[2px] rounded-[var(--radius-pill)] font-medium leading-[16px] text-[12px] whitespace-nowrap";

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
      <section className="flex flex-col gap-[16px] items-center pb-[40px] pt-[56px] px-[144px] relative w-full overflow-hidden" data-node-id="101:4621">
        <h1 className="hx-rise relative font-semibold leading-[48px] text-[40px] text-center tracking-[-0.5px] whitespace-nowrap">Insights &amp; Perspectives</h1>
        <p className="hx-rise hx-rise--2 relative leading-[22px] text-[14px] text-[color:var(--text-secondary)] text-center whitespace-nowrap">Explore our latest thoughts on design, research, and innovation in the world of product development.</p>
        <div className="relative pb-[8px] pt-[12px] w-[520px]">
          <label className="hx-field bg-[var(--surface-page)] border border-[var(--stroke-default)] flex gap-[8px] h-[40px] items-center px-[12px] rounded-[var(--radius-md)] w-full focus-within:border-[var(--text-link)]">
            <img alt="" src="/hax/v1/icon-search.svg" className="size-[16px]" />
            <span className="sr-only">Search articles</span>
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search articles..." className="flex-1 min-w-px bg-transparent outline-none leading-[22px] text-[14px] placeholder:text-[color:var(--text-tertiary)]" />
          </label>
        </div>
        <div role="group" aria-label="Topics" className="relative flex flex-wrap gap-[8px] justify-center w-[720px]">
          {TOPICS.map((t) => {
            const sel = on.includes(t);
            return (
              <button key={t} type="button" aria-pressed={sel} onClick={() => toggle(t)}
                className={`hx-chip border flex h-[28px] items-center px-[12px] rounded-[var(--radius-pill)] font-medium leading-[18px] text-[13px] whitespace-nowrap ${sel ? "bg-[var(--surface-accent)] border-[var(--surface-accent)] text-[color:var(--text-on-accent)]" : "bg-[var(--surface-page)] border-[var(--stroke-default)]"}`}>{t}</button>
            );
          })}
        </div>
      </section>
      <section className="flex flex-col items-start pb-[96px] pt-[24px] px-[144px] w-full" data-node-id="101:4669">
        {list.length === 0 && <p className="leading-[22px] text-[14px] text-[color:var(--text-secondary)]">No articles match that search. Try another topic or clear the filters.</p>}
        <div className="flex flex-wrap gap-[24px] items-start w-full">
          {list.map((p) => (
            <a key={p.slug} href={`https://outshift.design/blog/${p.slug}`} target="_blank" rel="noreferrer" className="hx-card group bg-[var(--surface-raised)] border border-[var(--stroke-subtle)] flex flex-col overflow-clip rounded-[var(--radius-xl)] w-[368px]">
              <span className="block h-[206px] w-full overflow-hidden"><img alt="" loading="lazy" src={`/hax/v1/blog/${p.slug}.jpg`} className="block h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" /></span>
              <span className="flex flex-col gap-[10px] pb-[18px] pt-[16px] px-[16px] w-full">
                <span className="flex gap-[6px]">
                  {p.tags.slice(0, 2).map((t) => <span key={t} className={tag}>{t}</span>)}
                  {p.tags.length > 2 && <span className={tag} title={p.tags.slice(2).join(", ")}>+{p.tags.length - 2}</span>}
                </span>
                <span className="font-semibold h-[48px] leading-[24px] overflow-hidden text-[16px] line-clamp-2">{p.title}</span>
                <span className="h-[60px] leading-[20px] overflow-hidden text-[13px] text-[color:var(--text-secondary)] line-clamp-3">{p.body}</span>
                <span className="flex gap-[14px] items-center leading-[18px] text-[12px] text-[color:var(--text-secondary)] whitespace-nowrap">
                  <span className="flex gap-[5px] items-center"><img alt="" src="/hax/v1/icon-user.svg" className="size-[12px]" />{p.author}</span>
                  <span className="flex gap-[5px] items-center"><img alt="" src="/hax/v1/icon-calendar.svg" className="size-[12px]" />{p.date}</span>
                </span>
                <span className="flex items-center justify-between w-full">
                  <span className="leading-[18px] text-[12px] text-[color:var(--text-secondary)]">{p.kind}</span>
                  <span className="flex gap-[4px] items-center px-[2px] py-px font-medium leading-[18px] text-[13px] text-[color:var(--text-link)]">
                    Read more
                    <img alt="" src="/hax/v1/icon-arrow-right-link-12.svg" className="hx-arrow size-[12px]" />
                  </span>
                </span>
              </span>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
