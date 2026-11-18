"use client";
import { Children, isValidElement, useEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import SplitText from "@/components/reactbits/SplitText";
import DecryptedText from "@/components/reactbits/DecryptedText";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import ClickSpark from "@/components/reactbits/ClickSpark";
import LaserFlow from "@/components/reactbits/LaserFlow";
import GhostFibers from "@/components/reactbits/GhostFibers";
import Grainient from "@/components/reactbits/Grainient";
import AcidSquares from "@/components/reactbits/AcidSquares";

// v3's motion layer: React Bits pieces (components/reactbits) with HAX's settings. Each effect plays
// once and settles on the site's ease (GSAP's power4.out is cubic-bezier(.22,1,.36,1)). The pieces
// fall back to still text under prefers-reduced-motion, and the two canvases (dot grid, threads) only
// run from tablets up, so phones scroll light. Cyan is the person's colour, orange the agent's.
const EASE = "power4.out";
const CYAN = "#3fc6ee";
const ORANGE = "#ff8a50";

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
// first time it scrolls into view
export function RevealH2({ children, className = "" }: { children: ReactNode; className?: string }) {
  const lines = linesOf(children);
  if (!lines) return <h2 className={className}>{children}</h2>;
  return (
    <h2 className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block">
          <SplitText text={line} tag="span" splitType="words" delay={60} duration={0.9} ease={EASE} textAlign="inherit"
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

// A panel with a soft cyan light under the cursor and an edge that catches it (SpotlightCard). The
// surface comes from --spotlight-card-surface (transparent unless a caller sets it).
export function Spot({ children, className = "", style, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <SpotlightCard theme="dark" spotlightColor="rgba(63, 198, 238, 0.22)" intensity={0.18} spotlightSize={360} softness={0.8}
      borderGlow={0.35} flare={false} className={`!p-0 ${className}`}
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

// A beam of the person's cyan light pours down onto a panel and spills along its top edge
// (LaserFlow). The panel is the children; the beam is drawn in the space above it. The light lands
// on the middle 62% of the panel's edge (an invisible lip), so a wide panel doesn't turn the splash
// into a glaring slab.
export function Beam({ children, className = "" }: { children: ReactNode; className?: string }) {
  const on = useCanvas();
  const surface = useRef<HTMLDivElement>(null);
  return (
    <div className={`relative ${className}`}>
      {on && (
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <LaserFlow surfaceRef={surface} color="#3fc6ee" beamPosition={0.5} intensity={1.15} beamWidth={1.1} flare={0.9} spread={0.9} spill={0.45} fog={0.15} dust={1.1} speed={1.1} className="size-full" />
        </div>
      )}
      <div className="relative">
        <div ref={surface} aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-px w-[62%] -translate-x-1/2" />
        {children}
      </div>
    </div>
  );
}

// Purple ghost fibres drifting behind a section (GhostFibers, tablets and up). Their focus follows
// the cursor anywhere over the section, so the hover lives in the background, not on the cards.
export function FibersBackdrop() {
  const on = useCanvas();
  if (!on) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <GhostFibers glowColor="#8b5cf6" speed={0.4} vignette={0.4} pulseOnClick={false} className="size-full" />
    </div>
  );
}

// "How it works": a slow, grainy gradient in the band's blues and purples (Grainient, tablets and
// up). It doesn't stir with the cursor, so the eye stays on the step that is playing.
export function GrainBackdrop() {
  const on = useCanvas();
  if (!on) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <Grainient colors={["#0a3c8f", "#0051af", "#5b2fb8", "#9345e1"]} angle={149} speed={0.6} grainAmount={0.03} grainSize={1} interactive={false} clickSwirl={false} className="size-full" />
    </div>
  );
}

// The closing panel's floor (AcidSquares): rounded squares in the panel's own colour (--panel, written
// out because the effect reads colours through a canvas), lit from either side by the person's cyan
// and the agent's orange. They switch on from the middle outward the first time the panel is in view,
// ripples run out from under the words, and the cursor presses the surface. They fade out towards the
// panel's edges, and a 30% black layer over them keeps the words readable.
export function AcidBackdrop() {
  const on = useCanvas();
  if (!on) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <AcidSquares color="#161a21" accentColor={CYAN} secondaryColor={ORANGE} lighting="split" grain={0.08} fade={0.5} dpr={1.5} className="size-full" />
      <div className="absolute inset-0 bg-black/30" />
    </div>
  );
}
