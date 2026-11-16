"use client";
import { useEffect, useState } from "react";

// "On this page" for a pattern page: follows the section in view.
export function Toc({ items }: { items: [string, string][] }) {
  const [on, setOn] = useState(items[0]?.[0]);
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setOn(e.target.id)), { rootMargin: "-120px 0px -65% 0px" });
    items.forEach(([k]) => { const el = document.getElementById(k); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [items]);
  return (
    <aside className="sticky top-[94px] shrink-0 w-[240px] flex flex-col gap-[4px] items-start pr-[32px] pt-[48px]">
      <p className="font-semibold leading-[16px] text-[11px] text-[color:var(--text-secondary)] tracking-[1.2px] uppercase pb-[4px]">On this page</p>
      {items.map(([k, t]) => (
        <a key={k} href={`#${k}`} className={`hx-side flex h-[30px] items-center pl-[18px] pr-[10px] rounded-[6px] w-[200px] leading-[20px] text-[13px] ${on === k ? "bg-[var(--surface-tint)] font-semibold" : "text-[color:var(--text-secondary)]"}`}>{t}</a>
      ))}
    </aside>
  );
}
