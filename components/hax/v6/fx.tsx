"use client";
import { Children, isValidElement, useEffect, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import SplitText from "@/components/reactbits/SplitText";
import DecryptedText from "@/components/reactbits/DecryptedText";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import ClickSpark from "@/components/reactbits/ClickSpark";
import GhostFibers from "@/components/reactbits/GhostFibers";
import Grainient from "@/components/reactbits/Grainient";
import AcidSquares from "@/components/reactbits/AcidSquares";

// v6's motion layer: v3's React Bits pieces (components/reactbits) with the same settings, retuned
// for white. Each effect plays once and settles on the site's ease (GSAP's power4.out is
// cubic-bezier(.22,1,.36,1)). The pieces fall back to still text under prefers-reduced-motion, and
// the canvases only run from tablets up, so phones scroll light. Blue is the person, orange the agent.
const EASE = "power4.out";
export const CYAN = "#3fc6ee";
export const ORANGE = "#ff8a50";

// true once the page is on the client and the query matches
export function useMedia(query: string) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const m = matchMedia(query);
    const sync = () => setOn(m.matches);
    sync();
    m.addEventListener("change", sync);
    return () => m.removeEventListener("change", sync);
  }, [query]);
  return on;
}
// the canvases: tablets and up, never when motion is reduced
export const useCanvas = () => useMedia("(min-width: 768px) and (prefers-reduced-motion: no-preference)");

// "line one<br />line two" as ["line one", "line two"]; null when the heading holds anything else
function linesOf(children: ReactNode): string[] | null {
  const out = [""];
  for (const c of Children.toArray(children)) {
    if (typeof c === "string" || typeof c === "number") out[out.length - 1] += String(c);
    else if (isValidElement(c) && c.type === "br") out.push("");
    else return null;
  }
  const lines = out.map((l) => l.trim()).filter(Boolean);
  return lines.length ? lines : null;
}

// Section heading (SplitText): its words rise into place one after another, line after line, the
// first time it scrolls into view. SplitText clips each line to mask the rise; at the headings' tight
// leading that cut off descenders ("guide" read "quide"), so the clip reaches 0.2em lower (padding)
// without moving anything (the same negative margin).
export function RevealH2({ children, className = "" }: { children: ReactNode; className?: string }) {
  const lines = linesOf(children);
  if (!lines) return <h2 className={className}>{children}</h2>;
  return (
    <h2 className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block">
          <SplitText text={line} tag="span" splitType="words" className="-mb-[0.2em] pb-[0.2em]" delay={60} duration={0.9} ease={EASE} textAlign="inherit"
            threshold={0.2} rootMargin="-40px" from={{ opacity: 0, y: 28 }} to={{ opacity: 1, y: 0, delay: i * 0.14 }} />
        </span>
      ))}
    </h2>
  );
}

// Mono labels (DecryptedText): scrambled characters settle into the words, left to right, once in view
export function DecodeText({ text, className = "" }: { text: string; className?: string }) {
  return (
    <DecryptedText text={text} animateOn="view" sequential revealDirection="start" speed={32} useOriginalCharsOnly={false}
      characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789" className={className} encryptedClassName="opacity-40" />
  );
}

// A panel with a soft blue light under the cursor and an edge that catches it (SpotlightCard).
// The surface comes from --spotlight-card-surface (transparent unless a caller sets it).
export function Spot({ children, className = "", style, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <SpotlightCard theme="light" spotlightColor="rgba(63, 198, 238, 0.2)" intensity={0.16} spotlightSize={360} softness={0.8}
      borderGlow={0.4} flare={false} className={`!p-0 ${className}`}
      style={{ "--spotlight-card-surface": "transparent", "--spotlight-card-shadow": "none", ...style } as CSSProperties} {...rest}>
      {children}
    </SpotlightCard>
  );
}

// Click sparks in the person's and the agent's colours round a call to action (ClickSpark)
export function Spark({ children }: { children: ReactNode }) {
  return (
    <ClickSpark sparkColor={[CYAN, ORANGE]} sparkCount={10} sparkRadius={28} sparkSize={9} duration={480} className="!inline-flex !h-auto !w-auto">
      {children}
    </ClickSpark>
  );
}

// Ghost fibres drifting behind a section (GhostFibers, tablets and up), drawn as ink on the white
// page (its light mode): the person's blue running into the agent's orange. Their focus follows the
// cursor anywhere over the section, so the hover lives in the background, not on the cards.
export function FibersBackdrop() {
  const on = useCanvas();
  if (!on) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <GhostFibers lightMode glowColor="#3fc6ee" lineColor="#5a8de8" secondaryColor="#ff8a50" speed={0.4} vignette={0.5} brightness={0.9} pulseOnClick={false} className="size-full" />
    </div>
  );
}

// How it works: a slow, grainy gradient in pale versions of the band's colours (Grainient, tablets
// and up). It doesn't stir with the cursor, so the eye stays on the step that is playing.
export function GrainBackdrop() {
  const on = useCanvas();
  if (!on) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <Grainient colors={["#d9eefb", "#e3eafd", "#ece4fb", "#fbe8dc"]} angle={149} speed={0.6} grainAmount={0.025} grainSize={1} interactive={false} clickSwirl={false} className="size-full" />
    </div>
  );
}

// The closing panel's floor (AcidSquares): rounded squares in the panel's own pale colour (written
// out because the effect reads colours through a canvas), lit from either side by the person's cyan
// and the agent's orange. They switch on from the middle outward the first time the panel is in
// view, ripples run out from under the words, and the cursor presses the surface. They fade toward
// the panel's edges, and a 30% white layer over them keeps the words readable (v3 used black).
export function AcidBackdrop({ dpr = 1.5 }: { dpr?: number }) {
  const on = useCanvas();
  if (!on) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <AcidSquares color="#eef1f6" accentColor={CYAN} secondaryColor={ORANGE} lighting="split" grain={0.06} fade={0.5} dpr={dpr} className="size-full" />
      <div className="absolute inset-0 bg-white/30" />
    </div>
  );
}
