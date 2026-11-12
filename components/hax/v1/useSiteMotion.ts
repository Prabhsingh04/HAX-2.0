"use client";
import { useEffect } from "react";

// Scroll reveal on .hx-reveal.
export function useSiteMotion() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } }),
      { rootMargin: "0px 0px -10% 0px" },
    );
    document.querySelectorAll(".hx-reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}
