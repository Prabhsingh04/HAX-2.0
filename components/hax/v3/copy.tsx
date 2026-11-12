"use client";
import { useState } from "react";

export function useCopy(ms = 1400) {
  const [copied, setCopied] = useState(false);
  const copy = (text: string) => navigator.clipboard?.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), ms); }, () => {});
  return [copied, copy] as const;
}

// copy icon that turns into a tick
export function CopyIcon({ copied, src, size = 16 }: { copied: boolean; src: string; size?: number }) {
  return (
    <span className="relative shrink-0" style={{ width: size, height: size }}>
      <img alt="" src={src} className={`absolute inset-0 size-full transition-all duration-200 ${copied ? "opacity-0 scale-50" : ""}`} />
      <svg viewBox="0 0 24 24" className={`absolute inset-0 size-full transition-all duration-300 ${copied ? "opacity-100" : "opacity-0 scale-50"}`} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
    </span>
  );
}
