import type { ComponentType, CSSProperties, ReactNode } from "react";
import { ArrowUp, LoaderCircle, Sparkle, Square, type LucideIcon } from "@/components/hax/v6/vendor/components/hax/v1/library/kit/icons";
import { Checkbox, SendBtn } from "@/components/hax/v6/vendor/components/hax/v1/library/kit/parts";

// Each kit entry: the component, the options it takes (shown as controls on its page) and
// the products we studied for it. Option values are plain strings or booleans so they can
// be passed straight from the page's controls.
export type Opt =
  | { key: string; label: string; kind: "toggle"; def: boolean }
  | { key: string; label: string; kind: "select"; values: string[]; def: string };
export type Props = Record<string, string | boolean>;
// card: scale for the library card when the component is wider than 578 x 362 (default 0.5)
// states: how to show each of the component's states (the names in ../details.ts, in that
//   order), as the option values that draw it. The page's Customize panel lists them; options
//   a state sets are shown there, not among the properties.
export type State = { name: string; set: Props };
export type Entry = { C: ComponentType<{ o: Props }>; opts: Opt[]; refs: string[]; card?: number; states?: State[] };
export const st = (name: string, set: Props): State => ({ name, set });

export const tog = (key: string, label: string, def = true): Opt => ({ key, label, kind: "toggle", def });
export const sel = (key: string, label: string, values: string[], def = values[0]): Opt => ({ key, label, kind: "select", values, def });
export const defaults = (opts: Opt[]): Props => Object.fromEntries(opts.map((o) => [o.key, o.def]));

export const Ag = ({ icon: Icon = Sparkle, size, dot }: { icon?: LucideIcon; size?: "sm" | "lg"; dot?: string }) => (
  <span className={`hk-ag ${size ? `hk-ag--${size}` : ""}`}>
    <Icon size={size === "lg" ? 18 : size === "sm" ? 11 : 13} strokeWidth={2.25} />
    {dot && <b style={{ background: dot }} />}
  </span>
);
export const Me = ({ i = "MR" }: { i?: string }) => <span className="hk-me">{i}</span>;
export const Spin = ({ s = 16 }: { s?: number }) => <LoaderCircle size={s} strokeWidth={2.25} className="hk-spin" />;
// the composer's submit (a real button: shadcn Button / Material filled icon button)
export const Send = ({ state = "on", className, style }: { state?: "on" | "off" | "stop"; className?: string; style?: CSSProperties }) => (
  <SendBtn state={state} className={className} style={style} icon={<ArrowUp size={17} strokeWidth={2.25} />} stopIcon={<Square size={11} fill="currentColor" strokeWidth={0} />} />
);
export const Typing = () => <span className="hk-typing hk-blue"><i /><i /><i /></span>;
export const Caret = () => <span className="hk-caret" />;
// a real checkbox (shadcn Checkbox / Material checkbox) that toggles when clicked
export const Chk = ({ on, label, className, style }: { on?: boolean; label?: string; className?: string; style?: CSSProperties }) => <Checkbox on={on} label={label} className={className} style={style} />;
export const Wave = ({ n = 22, h = 22 }: { n?: number; h?: number }) => (
  <span className="hk-wave hk-row !gap-[3px]" style={{ height: h }}>
    {Array.from({ length: n }, (_, i) => <i key={i} style={{ height: h * (0.35 + ((i * 37) % 10) / 15), animationDelay: `${(i % 7) * 0.11}s` }} />)}
  </span>
);
export const Bullets = ({ items }: { items: ReactNode[] }) => (
  <ul className="hk-col gap-[6px]">
    {items.map((t, i) => <li key={i} className="hk-row !items-start gap-[10px] hk-b"><span className="mt-[8px] size-[5px] shrink-0 rounded-full bg-[var(--k-blue)]" />{t}</li>)}
  </ul>
);
// the agent's turn header: mark + name + what it is doing
export const AgentHead = ({ name = "Atlas", note }: { name?: string; note?: ReactNode }) => (
  <div className="hk-row"><Ag size="sm" /><span className="hk-t">{name}</span>{note && <span className="hk-s hk-row gap-[6px]">{note}</span>}</div>
);
