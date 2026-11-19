"use client";
import "@/components/hax/v6/tokens.css";
import "@/components/hax/v6/motion.css";
import { useEffect } from "react";
import { Nav } from "@/components/hax/v6/Nav";
import { Footer } from "@/components/hax/v6/Footer";

// Scroll reveal on .h6-reveal
function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } }),
      { rootMargin: "0px 0px -10% 0px" },
    );
    document.querySelectorAll(".h6-reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  useReveal();
  return (
    <div className="hax-v6 min-h-screen w-full overflow-x-clip">
      <Nav />
      <main className="w-full">{children}</main>
      <Footer />
    </div>
  );
}
