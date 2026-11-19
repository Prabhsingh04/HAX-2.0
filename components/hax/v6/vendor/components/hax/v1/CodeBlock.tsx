"use client";
import { useState } from "react";

// Figma: Code block 94:19152 (header On) / 94:19158 (header Off)
export function CodeBlock({ code, label = "Terminal", header = true, className = "w-full", icon = "/hax/v1/icon-copy-tertiary.svg" }: { code: string; label?: string; header?: boolean; className?: string; icon?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className={`relative bg-[var(--surface-code)] flex min-w-0 max-w-full flex-col gap-[12px] items-start pb-[22px] pt-[18px] px-[24px] rounded-[var(--radius-xl)] ${className}`}>
      <div className={header ? "flex items-center justify-between w-full" : "absolute right-[20px] top-[22px]"}>
        {header && <p className="font-semibold leading-[16px] text-[11px] text-[color:var(--text-tertiary)] tracking-[1.2px] uppercase">{label}</p>}
        <button type="button" aria-label="Copy code" className="hx-copy relative size-[14px]"
          onClick={() => { navigator.clipboard?.writeText(code).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1400); }}>
          <img alt="" src={icon} className={`absolute inset-0 size-[14px] transition-all duration-200 ${copied ? "opacity-0 scale-50" : ""}`} />
          <svg viewBox="0 0 24 24" className={`absolute inset-0 size-[14px] text-[#00bceb] transition-all duration-300 ${copied ? "opacity-100" : "opacity-0 scale-50"}`} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        </button>
      </div>
      <pre className="m-0 w-full overflow-x-auto font-[family-name:var(--font-code)] leading-[22px] text-[13px] text-[color:var(--text-code)] tracking-[0.2px] whitespace-pre">{code}</pre>
    </div>
  );
}

