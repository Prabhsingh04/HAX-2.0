"use client";

// v3 "How it works" card picture (same as v2): v1's animated scene (HowItWorksScene, ported from
// HAX-2.0/index.html), on the soft tile colour that step had in HAX-2.0. The scene is
// laid out at its design size (W × H) and scaled to the card's width, so it keeps the
// proportions it was drawn at however narrow the card is.
import { useEffect, useRef } from "react";
import { HowItWorksScene, type SceneKind } from "../../v1/home/HowItWorksScene";

const W = 560, H = 444, PAD = 14;

// HAX-2.0's tile colours under its half-white stage (.hw-tile--n + .hw-stage)
const TINT: Record<SceneKind, string> = {
  chat: "linear-gradient(135deg, #c8d4f8 0%, #dfe6fb 48%, #eef3fd 100%)",
  map: "linear-gradient(135deg, #f2cfca 0%, #fbede9 52%, #f6dad2 100%)",
  ui: "linear-gradient(135deg, #e3e8bb 0%, #f3f6d8 52%, #ebefc5 100%)",
};

export function HowItWorksStage({ kind }: { kind: SceneKind }) {
  const box = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const b = box.current!, i = inner.current!;
    const fit = () => { i.style.transform = `scale(${b.clientWidth / W})`; };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(b);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={box}
      className="relative w-full overflow-hidden rounded-[16px]"
      style={{ aspectRatio: `${W} / ${H}`, background: `linear-gradient(rgb(255 255 255 / .5), rgb(255 255 255 / .5)), ${TINT[kind]}` }}
    >
      {/* the scenes are light UI: dark ink, not the band's light text colour */}
      <div ref={inner} className="absolute left-0 top-0 origin-top-left" style={{ width: W, height: H, padding: PAD, color: "#111" }}>
        <div className="h-full [&_.hw-scene]:h-full">
          <HowItWorksScene kind={kind} />
        </div>
      </div>
    </div>
  );
}
