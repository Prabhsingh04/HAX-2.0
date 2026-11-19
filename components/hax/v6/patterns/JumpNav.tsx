"use client";
import { useEffect, useState } from "react";

// "On this page": pinned under v6's 72px nav; the section in view carries the neon underline.
export function JumpNav({ items }: { items: [string, string][] }) {
  const [cur, setCur] = useState(items[0]?.[0]);
  useEffect(() => {
    const els = items.map(([id]) => document.getElementById(id)).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver((es) => {
      const hit = es.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (hit) setCur(hit.target.id);
    }, { rootMargin: "-140px 0px -60% 0px", threshold: 0 });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [items]);
  return (
    <nav aria-label="On this page" className="sticky top-[72px] z-30 border-b border-[var(--edge)] bg-[rgba(255,255,255,.92)] backdrop-blur-[14px]">
      <div className="mx-auto flex max-w-[1200px] items-center gap-[24px] overflow-x-auto px-[24px] [scrollbar-width:none]">
        <span className="shrink-0 py-[14px] text-[13px] font-semibold leading-[20px] text-[color:var(--text-3)]">On this page</span>
        {items.map(([id, l]) => (
          <a key={id} href={`#${id}`} aria-current={cur === id ? "location" : undefined} className="h6-nav relative shrink-0 py-[14px] text-[13px] font-medium leading-[20px] whitespace-nowrap [&[aria-current]]:after:bottom-[8px]">{l}</a>
        ))}
      </div>
    </nav>
  );
}
