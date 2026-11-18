"use client";
import { useMemo, useState } from "react";
import { H1, WorldHero } from "./ui";

// Figma: HAX v3 · Blog 106:8325 (hero 106:8326, posts 106:8457). Posts are v1's
// (components/hax/v1/BlogPage.tsx keeps them unexported); images are v1's /hax/v1/blog.
const TOPICS = ["Research", "AI", "AI Ethics", "Product Design", "Design", "Workflow", "Agents", "Case Study"];
const POSTS = [
  { slug: "human-agent-hermeneutics", title: "Human-agent hermeneutics: designing for understanding, not instruction.", body: "Why the unit of design is the evolving interpretation between a person and an agent, not the prompt or the action.", author: "Marc Scibelli", date: "August 2026", kind: "16 min read", tags: ["Design", "AI", "Agents", "Research"] },
  { slug: "button-is-no-longer-the-point", title: "The Button Is No Longer the Point", body: "As AI systems begin to reason, adapt, and act, design shifts from perfecting interfaces to shaping behavior and the human–AI relationship — putting HAX principles like Control, Clarity, Recovery, Collaboration, and Traceability at the center of the craft.", author: "Krystelle Gonzalez Papaux", date: "June 2026", kind: "6 min read", tags: ["Design", "AI", "Product Design", "AI Ethics"] },
  { slug: "navigating-multi-agent-future", title: "Navigating the Multi-Agent Future: Expert Perspectives on Human-Agent Interaction", body: "The shifting landscape of work and interaction. This report presents key findings and actionable insights drawn from leading industry and academic experts on the future of human agent interaction.", author: "Krystelle Gonzalez Papaux", date: "April 2026", kind: "Whitepaper", tags: ["Research", "AI", "Agents"] },
  { slug: "making-room-agents", title: "Making Room for Agents in Expert Tools", body: "How agents need to map onto the grammar of expert tools — not just add a chat panel, but participate in the work without displacing the structure that makes expert fluency possible.", author: "Marc Scibelli", date: "May 2026", kind: "Article", tags: ["Design", "AI", "Agents"] },
  { slug: "augmented-designer", title: "The Augmented Designer: How Agents are Reshaping the Design Workflow", body: "Reflections on AI-augmented design at Outshift — from the dangers of plausible noise to the CASA project case study and a week of record-breaking fidelity.", author: "Valentina Esposito", date: "June 2026", kind: "8 min read", tags: ["Design", "AI", "Workflow", "Case Study", "Agents"] },
];
type Post = (typeof POSTS)[number];
const tag = "rounded-[6px] bg-[var(--panel-2)] px-[8px] py-[4px] font-[family-name:var(--font-mono)] leading-[16px] text-[12px] text-[color:var(--text)] whitespace-nowrap";

function Tags({ p }: { p: Post }) {
  return (
    <span className="flex gap-[6px]">
      {p.tags.slice(0, 2).map((t) => <span key={t} className={tag}>{t}</span>)}
      {p.tags.length > 2 && <span className={tag} title={p.tags.slice(2).join(", ")}>+{p.tags.length - 2}</span>}
    </span>
  );
}
function Meta({ p }: { p: Post }) {
  return (
    <span className="flex flex-wrap items-center gap-[16px] leading-[20px] text-[14px] text-[color:var(--text-2)]">
      <span className="flex items-center gap-[6px]"><img alt="" src="/hax/v1/icon-user.svg" className="size-[14px] opacity-70 invert" />{p.author}</span>
      <span className="flex items-center gap-[6px]"><img alt="" src="/hax/v1/icon-calendar.svg" className="size-[14px] opacity-70 invert" />{p.date}</span>
    </span>
  );
}
function Foot({ p }: { p: Post }) {
  return (
    <>
      <span className="font-[family-name:var(--font-mono)] leading-[16px] text-[12px] tracking-[0.96px] text-[color:var(--text-3)] uppercase">{p.kind}</span>
      <span className="flex items-center gap-[6px] font-semibold leading-[20px] text-[14px] text-white">
        Read more<img alt="" src="/hax/v3/icon-right-16-light.svg" className="h3-arrow size-[16px]" />
      </span>
    </>
  );
}
const href = (p: Post) => `https://outshift.design/blog/${p.slug}`;

export function BlogPage() {
  const [q, setQ] = useState("");
  const [on, setOn] = useState<string[]>([]);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return POSTS.filter((p) => (!on.length || on.some((t) => p.tags.includes(t))) && (!s || `${p.title} ${p.body} ${p.author}`.toLowerCase().includes(s)));
  }, [q, on]);
  const toggle = (t: string) => setOn((o) => (o.includes(t) ? o.filter((x) => x !== t) : [...o, t]));
  const [first, ...rest] = list;
  return (
    <>
      <WorldHero nodeId="106:8326">
        <H1 line1="Insights &" line2="Perspectives" />
        <p className="h3-rise h3-rise--3 max-w-[460px] leading-[28px] text-[18px] text-[rgba(255,255,255,.86)]">Explore our latest thoughts on design, research, and innovation in the world of product development.</p>
        <label className="h3-field h3-rise h3-rise--4 flex h-[50px] w-[560px] max-w-full items-center gap-[10px] rounded-[10px] border border-[rgba(255,255,255,.3)] bg-[rgba(255,255,255,.12)] px-[16px] backdrop-blur-[6px]">
          <img alt="" src="/hax/v1/icon-search.svg" className="size-[18px] invert" />
          <span className="sr-only">Search articles</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search articles..."
            className="min-w-0 flex-1 bg-transparent leading-[24px] text-[16px] text-white outline-none placeholder:text-[rgba(255,255,255,.6)]" />
        </label>
        <div role="group" aria-label="Topics" className="h3-rise h3-rise--4 flex max-w-[780px] flex-wrap justify-center gap-[8px]">
          {TOPICS.map((t) => {
            const sel = on.includes(t);
            return (
              <button key={t} type="button" aria-pressed={sel} onClick={() => toggle(t)}
                className={`h3-chip rounded-[9999px] border px-[14px] py-[6px] font-medium leading-[20px] text-[14px] whitespace-nowrap ${sel ? "border-white bg-white text-[color:var(--bg)]" : "border-[rgba(255,255,255,.3)] bg-[rgba(255,255,255,.1)] text-white"}`}>{t}</button>
            );
          })}
        </div>
      </WorldHero>

      <section className="mx-auto flex max-w-[1248px] flex-col gap-[32px] px-[24px] pb-[96px] pt-[32px]" data-node-id="106:8457">
        {!first && <p className="leading-[24px] text-[16px] text-[color:var(--text-2)]">No articles match that search. Try another topic or clear the filters.</p>}
        {first && (
          <div className="h3-glow">
            <a key={first.slug} href={href(first)} target="_blank" rel="noreferrer" className="h3-neon group grid grid-cols-1 overflow-clip rounded-[24px] md:grid-cols-[640fr_560fr]">
              <span className="block aspect-[16/9] overflow-hidden"><img alt="" src={`/hax/v1/blog/${first.slug}.jpg`} className="block size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" /></span>
              <span className="flex flex-col gap-[16px] p-[40px]">
                <Tags p={first} />
                <span className="font-light leading-[36px] text-[32px] tracking-[-0.3px] text-white">{first.title}</span>
                <span className="leading-[24px] text-[16px] text-[color:var(--text-2)]">{first.body}</span>
                <Meta p={first} />
                <span className="flex items-center justify-between"><Foot p={first} /></span>
              </span>
            </a>
          </div>
        )}
        {rest.length > 0 && (
          <div className="overflow-clip rounded-[24px] border border-[var(--edge)] bg-[var(--panel)]">
            {rest.map((p, i) => (
              <a key={p.slug} href={href(p)} target="_blank" rel="noreferrer" className={`group flex flex-wrap gap-[32px] p-[24px] transition-colors hover:bg-[rgba(255,255,255,.02)] ${i ? "border-t border-[var(--edge)]" : ""}`}>
                <span className="block aspect-[16/9] w-[320px] max-w-full shrink-0 overflow-hidden rounded-[12px]"><img alt="" loading="lazy" src={`/hax/v1/blog/${p.slug}.jpg`} className="block size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" /></span>
                <span className="flex min-w-[280px] flex-1 flex-col gap-[12px] py-[4px]">
                  <Tags p={p} />
                  <span className="font-semibold leading-[28px] text-[20px] text-white">{p.title}</span>
                  <span className="line-clamp-2 leading-[20px] text-[14px] text-[color:var(--text-2)]">{p.body}</span>
                  <span className="mt-auto flex flex-wrap items-center justify-between gap-[12px]">
                    <Meta p={p} />
                    <span className="flex items-center gap-[24px]"><Foot p={p} /></span>
                  </span>
                </span>
              </a>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
