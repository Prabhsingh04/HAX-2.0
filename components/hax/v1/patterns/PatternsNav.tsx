import { LEVEL_ORDER, LEVEL_LABEL } from "@/lib/v2/levels";
import { PATTERNS } from "./model";
import { patternHref } from "./href";

// Left rail on a pattern page: all 23 patterns, grouped by the setup each one is mainly for.
export function PatternsNav({ current }: { current?: string }) {
  return (
    <nav aria-label="Patterns" className="sticky top-[94px] max-h-[calc(100vh-94px)] overflow-y-auto shrink-0 w-[280px] border-r border-[var(--stroke-subtle)] flex flex-col gap-[2px] items-start pb-[48px] pl-[20px] pr-[16px] pt-[28px]">
      <a href="/patterns" className="hx-side flex gap-[8px] items-center h-[36px] px-[10px] rounded-[8px] w-full">
        <span className="font-semibold leading-[20px] text-[14px]">Patterns</span>
        <span className="bg-[var(--surface-tint-hover)] flex h-[20px] items-center px-[6px] rounded-[var(--radius-pill)] font-semibold leading-[16px] text-[12px] tracking-[0.06px]">{PATTERNS.length}</span>
      </a>
      {LEVEL_ORDER.map((l) => {
        const items = PATTERNS.filter((p) => p.level.primary === l);
        if (!items.length) return null;
        return (
          <div key={l} className="w-full flex flex-col gap-[2px] pt-[14px]">
            <p className="px-[10px] pb-[4px] font-semibold leading-[16px] text-[11px] text-[color:var(--text-secondary)] tracking-[1.2px] uppercase">{LEVEL_LABEL[l]}</p>
            {items.map((p) => (
              <a key={p.id} href={patternHref(p.id)} aria-current={current === p.id ? "page" : undefined}
                className={`hx-side flex min-h-[30px] items-center pl-[18px] pr-[10px] py-[5px] rounded-[6px] leading-[20px] text-[13px] ${current === p.id ? "bg-[var(--surface-tint)] font-semibold text-[color:var(--text-primary)]" : "text-[color:var(--text-secondary)]"}`}>
                {p.name}
              </a>
            ))}
          </div>
        );
      })}
    </nav>
  );
}
