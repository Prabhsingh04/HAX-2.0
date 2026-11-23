"use client";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Scroll parallax for the home page (23 Nov), GSAP ScrollTrigger with scrub, as in
//   gsap.to(".layer", { yPercent: -50, ease: "none", scrollTrigger: { trigger: ".section", scrub: true } })
// Any element with data-parallax="<yPercent>" moves that far over its section's pass through the
// screen: negative is faster than the page (it rises away), positive is slower (a background that
// lags behind). The move is centred on the section, so nothing is offset when it sits mid-screen;
// data-parallax-from="top" starts it at rest instead (the hero, already on screen at load).
// Elements that appear later (the hero's text after the intro) are picked up as they mount.
// New triggers are never made while ScrollTrigger is re-measuring the page (another effect on the
// page, Built by's ScrollReveal, refreshes it too): doing so throws "reading 'end'" inside GSAP, so
// binding waits for the refresh to finish. Reduced motion: no parallax.
export function Parallax() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    let alive = true, refreshing = false, since = 0, frame = 0, timer = 0;
    const bound = new WeakSet<Element>();
    const tweens: gsap.core.Tween[] = [];
    const onInit = () => { refreshing = true; since = performance.now(); };
    const onDone = () => { refreshing = false; };
    ScrollTrigger.addEventListener("refreshInit", onInit);
    ScrollTrigger.addEventListener("refresh", onDone);

    // binds layers not seen yet; tries again next frame while a refresh is running
    const bind = () => {
      frame = 0;
      if (!alive) return;
      // (a refresh that never reports back stops blocking after a second)
      if (refreshing && performance.now() - since < 1000) { frame = requestAnimationFrame(bind); return; }
      refreshing = false;
      let found = 0;
      document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
        if (bound.has(el) || !el.isConnected) return;
        const v = parseFloat(el.dataset.parallax ?? "0");
        bound.add(el);
        if (!v) return;
        const fromTop = el.dataset.parallaxFrom === "top";
        const trigger = el.closest("section") ?? el;
        try {
          tweens.push(gsap.fromTo(el, { yPercent: fromTop ? 0 : -v / 2 }, {
            yPercent: fromTop ? v : v / 2,
            ease: "none",
            scrollTrigger: { trigger, start: fromTop ? "top top" : "top bottom", end: "bottom top", scrub: true },
          }));
          found++;
        } catch {
          bound.delete(el); // caught GSAP mid-measure: try this one again shortly
          schedule();
        }
      });
      if (found) ScrollTrigger.refresh();
    };
    const schedule = () => { clearTimeout(timer); timer = window.setTimeout(() => { if (!frame) frame = requestAnimationFrame(bind); }, 150); };

    frame = requestAnimationFrame(bind);
    // later content (the hero after its intro) is picked up when it mounts
    const mo = new MutationObserver(schedule);
    mo.observe(document.body, { childList: true, subtree: true });
    const late = window.setTimeout(() => { if (!refreshing) ScrollTrigger.refresh(); }, 1500);
    return () => {
      alive = false;
      mo.disconnect(); clearTimeout(timer); clearTimeout(late); cancelAnimationFrame(frame);
      ScrollTrigger.removeEventListener("refreshInit", onInit);
      ScrollTrigger.removeEventListener("refresh", onDone);
      tweens.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); });
      gsap.set([...document.querySelectorAll("[data-parallax]")], { clearProps: "transform" });
    };
  }, []);
  return null;
}
