"use client";
import { Children, cloneElement, createElement, isValidElement, type CSSProperties, type ReactElement, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox as UICheckbox } from "@/components/ui/checkbox";
import { Switch as UISwitch } from "@/components/ui/switch";
import { Progress as UIProgress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Kbd as UIKbd } from "@/components/ui/kbd";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import { useDS, useInert, type DS } from "@/components/hax/v6/vendor/components/hax/v1/library/kit/ds";
import { ChevronDown, X } from "@/components/hax/v6/vendor/components/hax/v1/library/kit/icons";

/* The kit's interactive parts, drawn with the real components of the design system on the
   stage: shadcn/ui (components/ui, Radix) or Material 3 (@material/web). So every button,
   chip, picker, checkbox, switch, field and menu row has that system's own hover, pressed,
   focus and disabled states, and the toggles really toggle.

   Each part also says how it is written in code (`.code`), so the component page can show
   the code for what is on the stage (see ./code.ts). */

type Base = { className?: string; style?: CSSProperties };
type Icon = ReactElement;
/** How a part is written in code: the tag or component, its props, children and imports. */
export type CodeSpec = { tag: string; attrs?: Record<string, unknown>; children?: ReactNode; imports?: { from: string; names?: string[] }[] };
type Coded<P> = ((p: P) => ReactNode) & { code: (p: P, ds: DS) => CodeSpec };
const coded = <P,>(f: (p: P) => ReactNode, code: (p: P, ds: DS) => CodeSpec): Coded<P> => Object.assign(f, { code });

// put an icon into a Material component's slot (icon, leading-icon, start, end)
const slotted = (icon: Icon | undefined | null, slot: string) =>
  icon && isValidElement(icon) ? cloneElement(icon as ReactElement<{ slot?: string }>, { slot }) : null;
// an icon in a Material icon button's default slot keeps the button's own icon size
const inButton = (icon: Icon | undefined | null) =>
  icon && isValidElement(icon) ? cloneElement(icon as ReactElement<{ "data-md"?: string }>, { "data-md": "" }) : null;
const md = (tag: string, props: Record<string, unknown>, ...children: ReactNode[]) => createElement(tag, props, ...children);
const on = (v: boolean | undefined) => (v ? true : undefined);
// plain text of a label, for Material's label="" attributes
export const textOf = (n: ReactNode): string =>
  Children.toArray(n).map((c) => (typeof c === "string" || typeof c === "number" ? String(c) : isValidElement(c) ? textOf((c.props as { children?: ReactNode }).children) : "")).join("");
const mdImport = (path: string) => ({ from: `@material/web/${path}.js` });

/* ── Button ──────────────────────────────────────────────────────────
   kind: outline (default) · main (the one primary action) · ghost (quiet) · tonal · danger
   shadcn: Button variant outline / default / ghost / secondary / destructive
   Material: outlined / filled / text / filled tonal button; danger = filled in error colours */
export type BtnKind = "outline" | "main" | "ghost" | "tonal" | "danger";
export type BtnProps = Base & { kind?: BtnKind; size?: "sm" | "md"; icon?: Icon; trailing?: Icon; disabled?: boolean; label?: string; children?: ReactNode };
const SH_BTN = { outline: "outline", main: "default", ghost: "ghost", tonal: "secondary", danger: "destructive" } as const;
const MD_BTN = { outline: "md-outlined-button", main: "md-filled-button", ghost: "md-text-button", tonal: "md-filled-tonal-button", danger: "md-filled-button" } as const;
const MD_BTN_FILE = { outline: "button/outlined-button", main: "button/filled-button", ghost: "button/text-button", tonal: "button/filled-tonal-button", danger: "button/filled-button" } as const;
export const Btn = coded<BtnProps>(function Btn({ kind = "outline", size = "md", icon, trailing, disabled, label, className, style, children }) {
  const ds = useDS();
  if (ds === "m3") {
    return md(MD_BTN[kind], {
      className: cn("hk-mdb", size === "sm" && "hk-mdb--sm", kind === "danger" && "hk-mdb--danger", className), style,
      disabled: on(disabled), "trailing-icon": !icon && trailing ? "" : undefined, "aria-label": label,
    }, slotted(icon ?? trailing, "icon"), <span key="l" className="hk-mdlabel">{children}{icon && trailing ? trailing : null}</span>);
  }
  return (
    <Button type="button" variant={SH_BTN[kind]} size={size === "sm" ? "sm" : "default"} disabled={disabled} aria-label={label} className={className} style={style}>
      {icon}{children}{trailing}
    </Button>
  );
}, ({ kind = "outline", size = "md", icon, trailing, disabled, label, className, style, children }, ds) => ds === "m3"
  ? { tag: MD_BTN[kind], attrs: { "trailing-icon": !icon && trailing ? true : undefined, disabled: on(disabled), "aria-label": label, style: { ...(size === "sm" ? MD_SM_STYLE(MD_BTN[kind]) : {}), ...(kind === "danger" ? MD_DANGER_STYLE : {}), ...style }, className },
      children: [slotted(icon ?? trailing, "icon"), children, icon && trailing ? trailing : null], imports: [mdImport(MD_BTN_FILE[kind])] }
  : { tag: "Button", attrs: { variant: kind === "main" ? undefined : SH_BTN[kind], size: size === "sm" ? "sm" : undefined, disabled: on(disabled), "aria-label": label, className, style },
      children: [icon, children, trailing], imports: [{ from: "@/components/ui/button", names: ["Button"] }] });
// Material's small (32 dp) button, written as its tokens
const MD_SM_STYLE = (tag: string) => {
  const t = tag.replace(/^md-/, "--md-");
  return { [`${t}-container-height`]: "32px", [`${t}-leading-space`]: "16px", [`${t}-trailing-space`]: "16px", [`${t}-with-leading-icon-leading-space`]: "12px", [`${t}-with-leading-icon-trailing-space`]: "16px" } as CSSProperties;
};
const MD_DANGER_STYLE = { "--md-filled-button-container-color": "var(--md-sys-color-error)", "--md-filled-button-label-text-color": "var(--md-sys-color-on-error)", "--md-filled-button-icon-color": "var(--md-sys-color-on-error)" } as CSSProperties;

/* ── Icon button ─────────────────────────────────────────────────────
   kind: ghost (default, muted) · outline · on (toggled on) · main
   size: md (shadcn 36 / Material 40) · sm (32) · xs (an inline close or more button, no room of its own)
   shadcn: Button size icon / icon-sm, variant ghost / outline (rounded) / default; on = bg-accent
   Material: icon button / outlined / filled tonal (on) / filled */
export type IconBtnProps = Base & { icon: Icon; label: string; kind?: "ghost" | "outline" | "on" | "main"; size?: "md" | "sm" | "xs"; disabled?: boolean };
const MD_IB = { ghost: "md-icon-button", outline: "md-outlined-icon-button", on: "md-filled-tonal-icon-button", main: "md-filled-icon-button" } as const;
const MD_IB_FILE = { ghost: "iconbutton/icon-button", outline: "iconbutton/outlined-icon-button", on: "iconbutton/filled-tonal-icon-button", main: "iconbutton/filled-icon-button" } as const;
const ibClass = (kind: IconBtnProps["kind"], size: IconBtnProps["size"]) =>
  cn(kind === "ghost" && "text-muted-foreground", kind === "on" && "bg-accent text-accent-foreground", kind === "outline" && "rounded-full", size === "xs" && "size-7 -m-1.5");
export const IconBtn = coded<IconBtnProps>(function IconBtn({ icon, label, kind = "ghost", size = "md", disabled, className, style }) {
  const ds = useDS();
  if (ds === "m3") return md(MD_IB[kind], { className: cn("hk-mdi", size !== "md" && `hk-mdi--${size}`, className), style, disabled: on(disabled), "aria-label": label }, inButton(icon));
  return (
    <Button type="button" variant={kind === "main" ? "default" : kind === "outline" ? "outline" : "ghost"} size={size === "md" ? "icon" : "icon-sm"} disabled={disabled} aria-label={label}
      className={cn(ibClass(kind, size), className)} style={style}>{icon}</Button>
  );
}, ({ icon, label, kind = "ghost", size = "md", disabled, className, style }, ds) => ds === "m3"
  ? { tag: MD_IB[kind], attrs: { "aria-label": label, disabled: on(disabled), className, style: { ...(size !== "md" ? { "--md-icon-button-state-layer-height": "32px", "--md-icon-button-state-layer-width": "32px", "--md-icon-button-icon-size": "20px" } : {}), ...style } }, children: icon, imports: [mdImport(MD_IB_FILE[kind])] }
  : { tag: "Button", attrs: { variant: kind === "main" ? undefined : kind === "outline" ? "outline" : "ghost", size: size === "md" ? "icon" : "icon-sm", "aria-label": label, disabled: on(disabled), className: cn(ibClass(kind, size), className), style }, children: icon, imports: [{ from: "@/components/ui/button", names: ["Button"] }] });

/* ── Send ────────────────────────────────────────────────────────────
   The composer's submit. on = ready · off = nothing to send yet (disabled) · stop = the agent
   is working, so it stops the run. shadcn: Button size icon-sm, rounded-full (InputGroup chat
   example, AI Elements PromptInputSubmit). Material: filled icon button. */
export type SendProps = Base & { state?: "on" | "off" | "stop"; icon: Icon; stopIcon: Icon; label?: string };
export const SendBtn = coded<SendProps>(function SendBtn({ state = "on", icon, stopIcon, label: name, className, style }) {
  const ds = useDS();
  const label = name ?? (state === "stop" ? "Stop" : "Send");
  if (ds === "m3") return md("md-filled-icon-button", { className: cn("hk-mdi hk-mdsend", className), style, disabled: on(state === "off"), "aria-label": label }, inButton(state === "stop" ? stopIcon : icon));
  return (
    <Button type="submit" size="icon-sm" disabled={state === "off"} aria-label={label} className={cn("rounded-full", className)} style={style}>
      {state === "stop" ? stopIcon : icon}
    </Button>
  );
}, ({ state = "on", icon, stopIcon, className, style }, ds) => ds === "m3"
  ? { tag: "md-filled-icon-button", attrs: { "aria-label": state === "stop" ? "Stop" : "Send", disabled: on(state === "off"), className, style }, children: state === "stop" ? stopIcon : icon, imports: [mdImport("iconbutton/filled-icon-button")] }
  : { tag: "Button", attrs: { type: "submit", size: "icon-sm", "aria-label": state === "stop" ? "Stop" : "Send", disabled: on(state === "off"), className: cn("rounded-full", className), style }, children: state === "stop" ? stopIcon : icon, imports: [{ from: "@/components/ui/button", names: ["Button"] }] });

/* ── Chip ────────────────────────────────────────────────────────────
   kind: suggestion (default: a ready-made ask) · filter (one of a set you narrow by; can be
   selected) · assist (an action with an icon) · input (something chosen, removable)
   shadcn: AI Elements Suggestion (Button outline sm, rounded-full); selected = Button default
   Material: suggestion / filter / assist / input chip. The label is plain text. */
export type ChipProps = Base & { kind?: "suggestion" | "filter" | "assist" | "input"; selected?: boolean; icon?: Icon; removable?: boolean; children: ReactNode };
const MD_CHIP = (kind: ChipProps["kind"], selected?: boolean) =>
  kind === "filter" || (selected && kind !== "input") ? "filter-chip" : kind === "assist" ? "assist-chip" : kind === "input" ? "input-chip" : "suggestion-chip";
export const Chip = coded<ChipProps>(function Chip({ kind = "suggestion", selected, icon, removable, className, style, children }) {
  const ds = useDS();
  if (ds === "m3") {
    const t = MD_CHIP(kind, selected);
    return md(`md-${t}`, { label: textOf(children), selected: on(selected), removable: on(removable && t !== "input-chip" ? removable : undefined), className: cn("hk-mdc", className), style }, slotted(icon, "icon"));
  }
  return (
    <Button type="button" variant={selected ? "default" : "outline"} size="sm" aria-pressed={kind === "filter" ? !!selected : undefined} className={cn("rounded-full px-4", className)} style={style}>
      {icon}{children}{removable && <X size={12} strokeWidth={2.25} />}
    </Button>
  );
}, ({ kind = "suggestion", selected, icon, removable, className, style, children }, ds) => {
  if (ds === "m3") {
    const t = MD_CHIP(kind, selected);
    return { tag: `md-${t}`, attrs: { label: textOf(children), selected: on(selected), removable: on(removable && t !== "input-chip" ? removable : undefined), className, style }, children: slotted(icon, "icon"), imports: [mdImport(`chips/${t}`)] };
  }
  return kind === "suggestion" && !selected
    ? { tag: "Suggestion", attrs: { className, style }, children: [icon, children], imports: [{ from: "@/components/ai-elements/suggestion", names: ["Suggestion"] }] }
    : { tag: "Button", attrs: { variant: selected ? undefined : "outline", size: "sm", "aria-pressed": kind === "filter" ? !!selected : undefined, className: cn("rounded-full px-4", className), style }, children: [icon, children, removable ? <X size={12} strokeWidth={2.25} /> : null], imports: [{ from: "@/components/ui/button", names: ["Button"] }] };
});

/* ── Picker ──────────────────────────────────────────────────────────
   A menu button inside a composer or toolbar: the model, the mode, a folder, a branch.
   variant: ghost (default: quiet, muted text) · box (a boxed select; also the look while its
   menu is open) · on (a tool that is switched on; removable shows its ×)
   shadcn: AI Elements PromptInputButton (Button ghost sm) / SelectTrigger (sm) / Button secondary sm
   Material: text button / outlined button / filled tonal button, small (32 dp) */
export type PickProps = Base & { variant?: "ghost" | "box" | "on"; icon?: Icon; chevron?: boolean; removable?: boolean; expanded?: boolean; children?: ReactNode };
export const SELECT_TRIGGER = "border-input [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50 hover:bg-accent/50 flex w-fit items-center justify-between gap-1.5 rounded-md border bg-transparent px-2.5 text-sm font-medium whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] h-8 shrink-0 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";
const MD_PICK = { ghost: "md-text-button", box: "md-outlined-button", on: "md-filled-tonal-button" } as const;
export const Pick = coded<PickProps>(function Pick({ variant = "ghost", icon, chevron, removable, expanded, className, style, children }) {
  const ds = useDS();
  const trail = removable ? <X size={12} strokeWidth={2.25} /> : chevron ? <ChevronDown size={13} strokeWidth={2} /> : null;
  if (ds === "m3") {
    return md(MD_PICK[variant], {
      className: cn("hk-mdb hk-mdb--sm hk-mdp", `hk-mdp--${variant}`, className), style, "aria-haspopup": chevron ? "menu" : undefined, "aria-expanded": chevron ? !!expanded : undefined,
      "trailing-icon": !icon && trail ? "" : undefined,
    }, slotted(icon ?? trail, "icon"), <span key="l" className="hk-mdlabel">{children}{icon && trail ? trail : null}</span>);
  }
  if (variant === "box") {
    return <button type="button" aria-haspopup={chevron ? "menu" : undefined} aria-expanded={chevron ? !!expanded : undefined} className={cn(SELECT_TRIGGER, className)} style={style}>{icon}{children}{trail}</button>;
  }
  return (
    <Button type="button" variant={variant === "on" ? "secondary" : "ghost"} size="sm" aria-haspopup={chevron ? "menu" : undefined} aria-expanded={chevron ? !!expanded : undefined}
      className={cn("gap-1.5 px-2.5 has-[>svg]:px-2.5", variant === "ghost" && "text-muted-foreground", className)} style={style}>
      {icon}{children}{trail}
    </Button>
  );
}, ({ variant = "ghost", icon, chevron, removable, className, style, children }, ds) => {
  const trail = removable ? <X size={12} strokeWidth={2.25} /> : chevron ? <ChevronDown size={13} strokeWidth={2} /> : null;
  if (ds === "m3") return { tag: MD_PICK[variant], attrs: { "trailing-icon": !icon && trail ? true : undefined, className, style: { ...MD_SM_STYLE(MD_PICK[variant]), ...style } }, children: [slotted(icon ?? trail, "icon"), children, icon && trail ? trail : null], imports: [mdImport(MD_BTN_FILE[variant === "ghost" ? "ghost" : variant === "box" ? "outline" : "tonal"])] };
  // a boxed picker prints as the outline Button that opens its menu (a DropdownMenuTrigger asChild in an app)
  if (variant === "box") return { tag: "Button", attrs: { variant: "outline", size: "sm", className: cn("gap-1.5 px-2.5 font-medium", className), style }, children: [icon, children, trail], imports: [{ from: "@/components/ui/button", names: ["Button"] }] };
  return { tag: "Button", attrs: { variant: variant === "on" ? "secondary" : "ghost", size: "sm", className: cn(variant === "ghost" && "text-muted-foreground", className), style }, children: [icon, children, trail], imports: [{ from: "@/components/ui/button", names: ["Button"] }] };
});

/* ── Tag (a label, not a control) ────────────────────────────────────
   tone: neutral · blue · ok · warn · bad. shadcn: Badge secondary / default / tinted / destructive.
   Material has no badge with a label; it is drawn as a small tonal container. */
export type TagProps = Base & { tone?: "neutral" | "blue" | "ok" | "warn" | "bad"; icon?: Icon; children?: ReactNode };
const tagClass = (tone: TagProps["tone"]) => cn(tone === "ok" && "bg-success-soft text-success", tone === "warn" && "bg-warning-soft text-warning");
export const Tag = coded<TagProps>(function Tag({ tone = "neutral", icon, className, style, children }) {
  const ds = useDS();
  if (ds === "m3") return <span className={cn("hk-tag", tone !== "neutral" && `hk-tag--${tone}`, className)} style={style}>{icon}{children}</span>;
  return <Badge variant={tone === "blue" ? "default" : tone === "bad" ? "destructive" : "secondary"} className={cn(tagClass(tone), className)} style={style}>{icon}{children}</Badge>;
}, ({ tone = "neutral", icon, className, style, children }, ds) => ds === "m3"
  ? { tag: "span", attrs: { className: cn("hk-tag", tone !== "neutral" && `hk-tag--${tone}`, className), style }, children: [icon, children] }
  : { tag: "Badge", attrs: { variant: tone === "blue" ? undefined : tone === "bad" ? "destructive" : "secondary", className: cn(tagClass(tone), className), style }, children: [icon, children], imports: [{ from: "@/components/ui/badge", names: ["Badge"] }] });

/* ── Checkbox · Switch ───────────────────────────────────────────────
   Real controls: they toggle when clicked. `on` is where they start. */
export type ToggleProps = Base & { on?: boolean; label?: string; disabled?: boolean };
export const Checkbox = coded<ToggleProps>(function Checkbox({ on: v, label, disabled, className, style }) {
  const ds = useDS();
  if (ds === "m3") return md("md-checkbox", { checked: on(v), disabled: on(disabled), "aria-label": label, className: cn("hk-mdx", className), style });
  return <UICheckbox key={String(!!v)} defaultChecked={!!v} disabled={disabled} aria-label={label} className={className} style={style} />;
}, ({ on: v, label, disabled, className, style }, ds) => ds === "m3"
  ? { tag: "md-checkbox", attrs: { checked: on(v), disabled: on(disabled), "aria-label": label, className, style }, imports: [mdImport("checkbox/checkbox")] }
  : { tag: "Checkbox", attrs: { defaultChecked: on(v), disabled: on(disabled), "aria-label": label, className, style }, imports: [{ from: "@/components/ui/checkbox", names: ["Checkbox"] }] });

export const Switch = coded<ToggleProps>(function Switch({ on: v, label, disabled, className, style }) {
  const ds = useDS();
  if (ds === "m3") return md("md-switch", { selected: on(v), disabled: on(disabled), "aria-label": label, className: cn("hk-mds", className), style });
  return <UISwitch key={String(!!v)} defaultChecked={!!v} disabled={disabled} aria-label={label} className={className} style={style} />;
}, ({ on: v, label, disabled, className, style }, ds) => ds === "m3"
  ? { tag: "md-switch", attrs: { selected: on(v), disabled: on(disabled), "aria-label": label, className, style }, imports: [mdImport("switch/switch")] }
  : { tag: "Switch", attrs: { defaultChecked: on(v), disabled: on(disabled), "aria-label": label, className, style }, imports: [{ from: "@/components/ui/switch", names: ["Switch"] }] });

/* ── Text field ──────────────────────────────────────────────────────
   A real input: people can click in and type. value = what it holds, placeholder = the hint.
   focus draws it focused · ai = the agent filled it · invalid = it needs fixing ·
   dense = the short one inside a menu or panel.
   shadcn: Input, or InputGroup with an addon when it has an icon. Material: outlined text field. */
export type FieldProps = Base & { value?: string; placeholder?: string; label?: string; icon?: Icon; trailing?: Icon; focus?: boolean; ai?: boolean; invalid?: boolean; dense?: boolean; readOnly?: boolean };
const fieldRing = (p: FieldProps) => cn(p.focus && "border-ring ring-ring/50 ring-[3px]", p.ai && "border-primary/30 bg-primary/[0.03]", p.invalid && "border-destructive ring-destructive/20");
export const Field = coded<FieldProps>(function Field(p) {
  const ds = useDS();
  const { value, placeholder, label, icon, trailing, focus, ai, invalid, dense, readOnly, className, style } = p;
  if (ds === "m3") {
    return md("md-outlined-text-field", {
      value: value ?? "", placeholder, "aria-label": label ?? placeholder, error: on(invalid), readOnly: on(readOnly),
      className: cn("hk-mdf", dense && "hk-mdf--dense", ai && "hk-mdf--ai", focus && "hk-mdf--focus", className), style,
    }, slotted(icon, "leading-icon"), slotted(trailing, "trailing-icon"));
  }
  const input = { defaultValue: value, placeholder, readOnly, "aria-label": label ?? placeholder, "aria-invalid": on(invalid) };
  if (icon || trailing) {
    return (
      <InputGroup className={cn(dense && "h-8", fieldRing(p), className)} style={style}>
        <InputGroupInput {...input} />
        {icon && <InputGroupAddon>{icon}</InputGroupAddon>}
        {trailing && <InputGroupAddon align="inline-end">{trailing}</InputGroupAddon>}
      </InputGroup>
    );
  }
  return <Input {...input} className={cn(dense && "h-8", fieldRing(p), className)} style={style} />;
}, (p, ds) => {
  const { value, placeholder, label, icon, trailing, invalid, dense, readOnly, className, style } = p;
  if (ds === "m3") return { tag: "md-outlined-text-field", attrs: { value, placeholder, "aria-label": label, error: on(invalid), readOnly: on(readOnly), className, style }, children: [slotted(icon, "leading-icon"), slotted(trailing, "trailing-icon")], imports: [mdImport("textfield/outlined-text-field")] };
  const attrs = { defaultValue: value, placeholder, readOnly: on(readOnly), "aria-label": label, "aria-invalid": on(invalid) };
  if (icon || trailing) {
    return {
      tag: "InputGroup", attrs: { className: cn(dense && "h-8", fieldRing(p), className), style },
      children: [<code-el key="i" tag="InputGroupInput" {...attrs} />, icon ? <code-el key="a" tag="InputGroupAddon">{icon}</code-el> : null, trailing ? <code-el key="t" tag="InputGroupAddon" align="inline-end">{trailing}</code-el> : null],
      imports: [{ from: "@/components/ui/input-group", names: ["InputGroup", "InputGroupAddon", "InputGroupInput"] }],
    };
  }
  return { tag: "Input", attrs: { ...attrs, className: cn(dense && "h-8", fieldRing(p), className), style }, imports: [{ from: "@/components/ui/input", names: ["Input"] }] };
});

/* ── Menu ────────────────────────────────────────────────────────────
   An open menu drawn in place (the page shows it open). MenuItem rows highlight on hover and
   can be focused. Pass icon + title (+ sub, + end), or children for a custom row.
   shadcn: DropdownMenuContent / DropdownMenuItem / DropdownMenuLabel recipes.
   Material: a menu surface with md-menu-item rows (start, headline, supporting text, end). */
export type MenuProps = Base & { label?: string; children?: ReactNode };
export const Menu = coded<MenuProps>(function Menu({ label, className, style, children }) {
  return <div role="menu" aria-label={label} className={cn("hk-pop", className)} style={style}>{children}</div>;
}, ({ label, className, style, children }, ds) => ({ tag: "div", attrs: { role: "menu", "aria-label": label, className: cn("hk-pop", className), style }, children, imports: ds === "m3" ? [] : [] }));

export const MENU_ITEM = "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";
export type MenuItemProps = Base & { icon?: Icon; title?: ReactNode; sub?: ReactNode; end?: ReactNode; on?: boolean; children?: ReactNode };
export const MenuItem = coded<MenuItemProps>(function MenuItem({ icon, title, sub, end, on: sel, className, style, children }) {
  const ds = useDS();
  if (ds === "m3") {
    return md("md-menu-item", { selected: on(sel), className: cn("hk-mdm", className), style },
      slotted(icon, "start"),
      <div slot="headline">{title ?? children}</div>,
      sub ? <div slot="supporting-text">{sub}</div> : null,
      end ? <span slot="end" className="hk-row">{end}</span> : null);
  }
  return (
    <div role="menuitem" tabIndex={-1} data-state={sel ? "checked" : undefined} className={cn(MENU_ITEM, sel && "bg-accent text-accent-foreground", className)} style={style}>
      {icon}
      {title !== undefined ? <span className="flex min-w-0 flex-1 flex-col"><span className="font-medium">{title}</span>{sub && <span className="text-muted-foreground text-xs">{sub}</span>}</span> : children}
      {end}
    </div>
  );
}, ({ icon, title, sub, end, on: sel, className, style, children }, ds) => ds === "m3"
  ? { tag: "md-menu-item", attrs: { selected: on(sel), className, style }, children: [slotted(icon, "start"), <div key="h" slot="headline">{title ?? children}</div>, sub ? <div key="s" slot="supporting-text">{sub}</div> : null, end ? <span key="e" slot="end">{end}</span> : null], imports: [mdImport("menu/menu-item")] }
  // drawn open in place, so it prints as the DropdownMenuItem recipe on a plain row (inside a DropdownMenuContent in an app)
  : { tag: "div", attrs: { role: "menuitem", className: cn(MENU_ITEM, sel && "bg-accent text-accent-foreground", className), style }, children: [icon, title !== undefined ? <span key="t" className="flex min-w-0 flex-1 flex-col"><span className="font-medium">{title}</span>{sub ? <span className="text-muted-foreground text-xs">{sub}</span> : null}</span> : children, end] });

/* ── Progress ───────────────────────────────────────────────────────
   value 0–100. tone warn / bad recolours the bar. shadcn: Progress. Material: linear progress. */
export type ProgressProps = Base & { value: number; tone?: "warn" | "bad"; label?: string };
const progClass = (tone: ProgressProps["tone"]) => cn(tone === "warn" && "[&>[data-slot=progress-indicator]]:bg-warning", tone === "bad" && "[&>[data-slot=progress-indicator]]:bg-destructive");
export const Progress = coded<ProgressProps>(function Progress({ value, tone, label, className, style }) {
  const ds = useDS();
  if (ds === "m3") return md("md-linear-progress", { value: value / 100, "aria-label": label, className: cn("hk-mdl", tone && `hk-mdl--${tone}`, className), style });
  return <UIProgress value={value} aria-label={label} className={cn(progClass(tone), className)} style={style} />;
}, ({ value, tone, label, className, style }, ds) => ds === "m3"
  ? { tag: "md-linear-progress", attrs: { value: value / 100, "aria-label": label, className, style }, imports: [mdImport("progress/linear-progress")] }
  : { tag: "Progress", attrs: { value, "aria-label": label, className: cn(progClass(tone), className), style }, imports: [{ from: "@/components/ui/progress", names: ["Progress"] }] });

/* ── Divider ─────────────────────────────────────────────────────────
   shadcn: Separator. Material: divider. */
export type RuleProps = Base & { vertical?: boolean };
export const Rule = coded<RuleProps>(function Rule({ vertical, className, style }) {
  const ds = useDS();
  if (ds === "m3") return md("md-divider", { className: cn("hk-mdd", vertical && "hk-mdd--v", className), style, role: "separator" });
  return <Separator orientation={vertical ? "vertical" : "horizontal"} className={cn("data-[orientation=horizontal]:w-auto self-stretch", className)} style={style} />;
}, ({ vertical, className, style }, ds) => ds === "m3"
  ? { tag: "md-divider", attrs: { className, style }, imports: [mdImport("divider/divider")] }
  : { tag: "Separator", attrs: { orientation: vertical ? "vertical" : undefined, className, style }, imports: [{ from: "@/components/ui/separator", names: ["Separator"] }] });

/* ── Kbd ──────────────────────────────────────────────────────────── */
export type KbdProps = Base & { children?: ReactNode };
export const Kbd = coded<KbdProps>(function Kbd({ className, style, children }) {
  const ds = useDS();
  if (ds === "m3") return <kbd className={cn("hk-kbd", className)} style={style}>{children}</kbd>;
  return <UIKbd className={className} style={style}>{children}</UIKbd>;
}, ({ className, style, children }, ds) => ds === "m3"
  ? { tag: "kbd", attrs: { className: cn("hk-kbd", className), style }, children }
  : { tag: "Kbd", attrs: { className, style }, children, imports: [{ from: "@/components/ui/kbd", names: ["Kbd"] }] });

/* ── Text link ───────────────────────────────────────────────────────
   "See all", "View the full log": a real link with a hover. */
export type LinkProps = Base & { children?: ReactNode };
export const TextLink = coded<LinkProps>(function TextLink({ className, style, children }) {
  if (useInert()) return <span className={cn("hk-link", className)} style={style}>{children}</span>;
  return <a href="#" onClick={(e) => e.preventDefault()} className={cn("hk-link", className)} style={style}>{children}</a>;
}, ({ className, style, children }) => ({ tag: "a", attrs: { href: "#", className: cn("hk-link", className), style }, children }));

/* ── Pressable ───────────────────────────────────────────────────────
   Any custom surface people click: a choice row, an option card, a suggested-prompt row, a
   gallery tile. selected marks the chosen one.
   shadcn: hover = accent at 50% (the Item / choice card recipe), focus = the 3 px ring.
   Material: its own state layer and focus ring (md-ripple + md-focus-ring), the way Material
   makes a custom surface interactive. */
// hover draws it hovered (for a "Hover" state on the page); real hover works either way
export type PressableProps = Base & { selected?: boolean; hover?: boolean; label?: string; as?: "div" | "span" | "li"; children?: ReactNode };
const PRESS = "cursor-pointer transition-colors outline-none [&:not([aria-pressed=true])]:hover:bg-accent/50 data-[hover]:bg-accent/50 focus-visible:ring-[3px] focus-visible:ring-ring/50";
export const Pressable = coded<PressableProps>(function Pressable({ selected, hover, label, as = "div", className, style, children }) {
  const ds = useDS();
  const props = { role: "button", tabIndex: 0, "aria-pressed": selected === undefined ? undefined : selected, "aria-label": label, "data-hover": hover ? "" : undefined, style };
  if (ds === "m3") return createElement(as, { ...props, className: cn("hk-press", className) }, md("md-focus-ring", { key: "f" }), md("md-ripple", { key: "r" }), children);
  return createElement(as, { ...props, className: cn(PRESS, className) }, children);
}, ({ selected, hover, label, as = "div", className, style, children }, ds) => ds === "m3"
  ? { tag: as, attrs: { role: "button", tabIndex: 0, "aria-pressed": selected, "aria-label": label, "data-hover": hover || undefined, className: cn("relative", className), style }, children: [<md-focus-ring key="f" />, <md-ripple key="r" />, children], imports: [mdImport("ripple/ripple"), mdImport("focus/md-focus-ring")] }
  : { tag: as, attrs: { role: "button", tabIndex: 0, "aria-pressed": selected, "aria-label": label, "data-hover": hover || undefined, className: cn(PRESS, className), style }, children });

// code.ts: a placeholder element that is printed as the component named by `tag`
declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements { "code-el": { tag: string; children?: ReactNode; [k: string]: unknown } }
  }
}
