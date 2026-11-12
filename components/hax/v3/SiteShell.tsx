"use client";
import "./tokens.css";
import "./motion.css";
import { useEffect } from "react";
import { Nav } from "./Nav";
import { Footer } from "./Footer";

// Scroll reveal on .h3-reveal
function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } }),
      { rootMargin: "0px 0px -10% 0px" },
    );
    document.querySelectorAll(".h3-reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  useReveal();
  return (
    <div className="hax-v3 min-h-screen w-full overflow-x-clip">
      <Nav />
      <main className="w-full">{children}</main>
      <Footer />
    </div>
  );
}
