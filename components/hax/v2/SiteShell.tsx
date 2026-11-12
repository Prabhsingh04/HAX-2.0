"use client";
import { useEffect } from "react";
import "./tokens.css";
import { Nav } from "./Nav";
import { Footer } from "./Footer";

// scroll reveals, once per element, including elements that mount later (filtered lists, tab panels)
function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { threshold: 0.12 });
    const watch = (root: ParentNode) => root.querySelectorAll(".hx2-reveal:not(.is-in)").forEach((el) => io.observe(el));
    const shell = document.querySelector(".hax-v2"); if (!shell) return;
    watch(shell);
    const mo = new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((n) => {
      if (!(n instanceof Element)) return;
      if (n.matches(".hx2-reveal:not(.is-in)")) io.observe(n);
      watch(n);
    })));
    mo.observe(shell, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, []);
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  useReveal();
  return (
    <div className="hax-v2 relative min-h-screen w-full overflow-x-clip">
      <Nav />
      <main className="mx-auto w-full max-w-[1440px]">{children}</main>
      <Footer />
      <a href="/v2/contact" aria-label="Talk to us" className="hx2-btn hx2-btn--dark fixed bottom-[24px] right-[24px] z-40 flex size-[48px] items-center justify-center rounded-full bg-[color:var(--btn)] text-white shadow-[0_8px_24px_rgba(0,0,0,0.16),0_1px_2px_rgba(0,0,0,0.08)]">
        <svg viewBox="0 0 24 24" className="size-[20px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
      </a>
    </div>
  );
}
