"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { PanelLeftOpen, X } from "lucide-react";
import { FAMILIES, COMPS } from "./catalog";
import { withDS, type DS } from "./kit/ds";

// Library sidebar (Figma 98:20057 / 98:25488). The switch on top picks the design system the
// components are drawn in; below it, the components by family.
const SYSTEMS: [DS, string][] = [["shadcn", "shadcn/ui"], ["m3", "Material 3"]];

// Same page in the other system. Keeps the rest of the address (the component, a Home setup,
// Customize's options) and the scroll position, so the two can be compared in place.
function DSSwitch({ ds }: { ds: DS }) {
  const router = useRouter();
  const pick = (to: DS) => {
    if (to === ds) return;
    const u = new URL(location.href);
    if (to === "m3") u.searchParams.set("ds", "material"); else u.searchParams.delete("ds");
    router.push(u.pathname + u.search + u.hash, { scroll: false });
  };
  return (
    <div role="radiogroup" aria-label="Design system" className="hk-seg hk-seg--full">
      {SYSTEMS.map(([v, label]) => (
        <button key={v} type="button" role="radio" aria-checked={ds === v} aria-selected={ds === v} onClick={() => pick(v)}
          className={`hx-tab hk-seg-btn ${ds === v ? "font-semibold" : ""}`}>{label}</button>
      ))}
    </div>
  );
}

export function Count({ n }: { n: number | string }) {
  return <span className="bg-[var(--surface-tint-hover)] flex h-[20px] items-center px-[6px] rounded-[var(--radius-pill)] font-semibold leading-[16px] text-[12px] tracking-[0.06px]">{n}</span>;
}

// Family rows expand and collapse on click (no selected fill). Scrolling into a family opens
// it again, so the list follows the page until you change it. chips: the small-screen bar also
// shows a swipeable row of families (the library page).
export function Sidebar({ active, selected, ds = "shadcn", chips = false }: { active: string; selected?: string; ds?: DS; chips?: boolean }) {
  return (
    <>
      <nav aria-label="Components" className="sticky top-[94px] max-h-[calc(100vh-94px)] overflow-y-auto shrink-0 w-[280px] border-r border-[var(--stroke-subtle)] hidden lg:flex flex-col gap-[2px] items-start pb-[48px] pl-[20px] pr-[16px] pt-[28px] self-stretch">
        <div className="w-full pb-[24px]"><DSSwitch ds={ds} /></div>
        <FamilyList active={active} selected={selected} ds={ds} />
      </nav>
      <SmallBar active={active} selected={selected} ds={ds} chips={chips} />
    </>
  );
}

function FamilyList({ active, selected, ds, onPick }: { active: string; selected?: string; ds: DS; onPick?: () => void }) {
  const [open, setOpen] = useState([active]);
  useEffect(() => setOpen([active]), [active]);
  const toggle = (id: string) => setOpen((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));
  return (
    <>
      <div className="flex gap-[8px] items-center pb-[12px] pl-[10px]">
        <p className="font-semibold leading-[20px] text-[14px]">Components</p>
        <Count n={COMPS.length} />
      </div>
      {FAMILIES.map((f) => {
        const isOpen = open.includes(f.id);
        return (
          <div key={f.id} className="w-full flex flex-col gap-[2px]">
            <button type="button" aria-expanded={isOpen} onClick={() => toggle(f.id)}
              className="hx-side flex h-[36px] items-center justify-between px-[10px] rounded-[8px] w-full text-left">
              <span className="font-semibold leading-[20px] text-[14px]">{f.name}</span>
              <span className="flex items-center gap-[8px]">
                <span className="leading-[16px] text-[12px] text-[color:var(--text-tertiary)]">{f.comps.length}</span>
                <img alt="" src="/hax/v1/chevron-sidebar.svg" className={`size-[14px] transition-transform duration-300 ${isOpen ? "" : "-rotate-90"}`} />
              </span>
            </button>
            {isOpen && f.comps.map((c) => (
              <a key={c.id} href={withDS(`/pattern?id=${c.id}`, ds)} aria-current={selected === c.id ? "page" : undefined} onClick={onPick}
                className={`hx-side flex h-[30px] items-center pl-[18px] pr-[10px] rounded-[6px] leading-[20px] text-[13px] ${selected === c.id ? "bg-[var(--surface-tint)] font-semibold text-[color:var(--text-primary)]" : "text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"}`}>{c.name}</a>
            ))}
          </div>
        );
      })}
    </>
  );
}

// Below 1024px the sidebar folds into a bar that stays under the header: the design-system
// switch, a button that opens the whole list as a drawer from the left, and on the library page
// (chips) a row of families to swipe along and jump to. The drawer closes with its X, Escape, a
// tap outside it, a swipe to the left or picking a component; the page behind it doesn't scroll.
function SmallBar({ active, selected, ds, chips }: { active: string; selected?: string; ds: DS; chips: boolean }) {
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const shut = useRef<HTMLButtonElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const x0 = useRef(0);
  const fam = FAMILIES.find((f) => f.id === active);
  // the drawer is drawn at the site root, above the header (inside this sticky bar it would sit under it)
  const [host, setHost] = useState<Element | null>(null);
  useEffect(() => setHost(btn.current?.closest(".hax-v1") ?? document.body), []);
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", esc);
    const html = document.documentElement, was = html.style.overflow;
    html.style.overflow = "hidden";
    shut.current?.focus();
    return () => { document.removeEventListener("keydown", esc); html.style.overflow = was; btn.current?.focus(); };
  }, [open]);
  // the chip of the family on screen stays in view as the page scrolls through the families
  useEffect(() => {
    const r = row.current, el = r?.querySelector<HTMLElement>(`[data-fam="${active}"]`);
    if (r && el) r.scrollTo({ left: el.offsetLeft - 20, behavior: "smooth" });
  }, [active]);
  return (
    <div className="sticky top-[64px] z-30 border-b border-[var(--stroke-subtle)] bg-[var(--surface-page)] lg:hidden">
      <div className="flex items-center gap-[8px] px-[var(--hx-gutter)] py-[10px]">
        <div className="min-w-0 flex-1"><DSSwitch ds={ds} /></div>
        <button ref={btn} type="button" aria-expanded={open} aria-controls="hk-drawer" onClick={() => setOpen(true)}
          className="hx-btn hx-btn--outline flex h-[36px] shrink-0 items-center gap-[6px] rounded-[var(--radius-pill)] border border-[var(--stroke-default)] bg-[var(--surface-page)] px-[12px] font-semibold leading-[18px] text-[13px]">
          <PanelLeftOpen size={15} aria-hidden="true" />
          {selected && fam ? fam.name : "Families"}
        </button>
      </div>
      {chips && (
        <div ref={row} className="flex gap-[6px] overflow-x-auto px-[var(--hx-gutter)] pb-[10px] [scrollbar-width:none]">
          {FAMILIES.map((f) => (
            <a key={f.id} href={`#${f.id}`} data-fam={f.id} aria-current={f.id === active ? "true" : undefined}
              className={`hx-chip flex h-[30px] shrink-0 items-center gap-[6px] rounded-[var(--radius-pill)] border px-[12px] font-medium leading-[18px] text-[13px] whitespace-nowrap ${f.id === active ? "border-[var(--surface-accent)] bg-[var(--surface-accent)] text-[color:var(--text-on-accent)]" : "border-[var(--stroke-default)] bg-[var(--surface-page)]"}`}>
              {f.name}<span className="opacity-70">{f.comps.length}</span>
            </a>
          ))}
        </div>
      )}
      {host && createPortal(
      <div className={`fixed inset-0 z-[60] transition-opacity duration-200 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}>
        <div aria-hidden="true" className="absolute inset-0 bg-[rgba(16,24,40,0.4)]" onClick={() => setOpen(false)} />
        <nav id="hk-drawer" aria-label="Components" inert={!open}
          onTouchStart={(e) => { x0.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => { if (e.changedTouches[0].clientX - x0.current < -60) setOpen(false); }}
          className={`absolute inset-y-0 left-0 flex w-[min(86vw,340px)] flex-col gap-[2px] overflow-y-auto bg-[var(--surface-page)] px-[16px] pb-[32px] pt-[10px] shadow-[8px_0_24px_rgba(16,24,40,0.12)] transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex justify-end pb-[4px]">
            <button ref={shut} type="button" aria-label="Close" onClick={() => setOpen(false)}
              className="hx-iconbtn flex size-[36px] items-center justify-center rounded-[var(--radius-pill)] text-[color:var(--text-secondary)]">
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          <FamilyList active={active} selected={selected} ds={ds} onPick={() => setOpen(false)} />
        </nav>
      </div>, host)}
    </div>
  );
}
