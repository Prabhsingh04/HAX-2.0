"use client";

// A "How it works" picture at its design size (W × H), scaled to the card's width so it keeps the
// proportions it was drawn at, on the soft tile colour of its step (v3's stage, as in HAX-2.0).
// Steps 01 and 02 show v1's animated scenes (HowItWorksScene); 03 and 04 v1's live behavior draft and
// incident workspace (HowItWorksBehavior), fitted into the same frame.
import { useEffect, useRef, type ReactNode } from "react";

const W = 560, H = 444, PAD = 14;

export type Tint = "chat" | "map" | "draft" | "workspace";
const TINT: Record<Tint, string> = {
  chat: "linear-gradient(135deg, #c8d4f8 0%, #dfe6fb 48%, #eef3fd 100%)",
  map: "linear-gradient(135deg, #f2cfca 0%, #fbede9 52%, #f6dad2 100%)",
  draft: "linear-gradient(135deg, #e3e8bb 0%, #f3f6d8 52%, #ebefc5 100%)",
  workspace: "linear-gradient(135deg, #d9d2f6 0%, #ece8fb 52%, #e2dcf8 100%)",
};

export function HowItWorksStage({ tint, children }: { tint: Tint; children: ReactNode }) {
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
    <div ref={box} className="relative w-full overflow-hidden rounded-[16px]"
      style={{ aspectRatio: `${W} / ${H}`, background: "linear-gradient(180deg, rgb(255 255 255 / .55), rgb(255 255 255 / .28))" }}>
      {/* glass: the step's tint shows faintly through a translucent white, over the blurred page behind */}
      <div aria-hidden className="absolute inset-0 opacity-40" style={{ background: TINT[tint] }} />
      {/* the scenes are light UI with their own ink; the behavior frames fill the stage's height */}
      <div ref={inner} className="absolute left-0 top-0 origin-top-left" style={{ width: W, height: H, padding: PAD, color: "#111" }}>
        <div className="h-full [&_.hw-scene]:h-full [&>div]:!h-full [&>div]:!min-h-0">{children}</div>
      </div>
    </div>
  );
}
