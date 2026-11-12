// Builds public/hax/v1/m3/m3.css from Prabh's HAX-2.0 Material pages (github.com/Prabhsingh04/HAX-2.0):
// site sheet + Material tokens/components + each page's inline <style>, every selector scoped under
// .hx-m3 so nothing touches the v1 header/footer. v1 tokens are then mapped onto the old variables.
import fs from "node:fs"; import postcss from "postcss";
const H = process.argv[2]; const OUT = "public/hax/v1/m3/m3.css";
const inline = (f) => [...fs.readFileSync(`${H}/${f}`, "utf8").matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join("\n");
const src = [ "css/styles.css", "css/material-tokens.css", "css/material-components.css", "css/hax-button.css" ]
  .map((f) => fs.readFileSync(`${H}/${f}`, "utf8")).join("\n") + inline("material-agentic.html") + inline("material-pattern.html");
const scope = (sel) => {
  sel = sel.trim();
  if (/^(html|:root|body)(\s|$|[.:\[])/.test(sel) || /^html\s+body/.test(sel)) return sel.replace(/^(html\s+body|html|:root|body)/, ".hx-m3");
  // skip the old global nav/footer: v1 owns them
  return `.hx-m3 ${sel}`;
};
const root = postcss.parse(src);
root.walkRules((r) => {
  if (r.parent?.type === "atrule" && /keyframes/i.test(r.parent.name)) return;
  r.selectors = r.selectors.map(scope);
});
root.walkAtRules("import", (a) => a.remove());
root.walkAtRules("font-face", (a) => a.remove());
// v1 design (Figma HAX 2.0 Foundations) mapped onto the old variables; declared last so it wins.
const v1 = `
.hx-m3.hx-m3 {
  --font-display: var(--font-ui); --font-body: var(--font-ui); --font-mono: var(--font-code); --font-serif: var(--font-ui);
  --bg: var(--surface-page); --surface: var(--surface-raised);
  --border: var(--stroke-subtle); --border-strong: var(--stroke-default);
  --fg: var(--text-primary); --fg-alt: var(--text-primary); --fg-mid: var(--text-secondary); --fg-muted: var(--text-tertiary);
  --accent: var(--text-link); --accent-hover: #0051af; --accent-soft: rgba(0,188,235,.1); --accent-ghost: rgba(0,188,235,.08);
  --ink-0:#fff; --ink-25:#fff; --ink-50:#f7f8f9; --ink-100:#eef0f2; --ink-200:#dfe2e6; --ink-300:#c3c8cf; --ink-400:#8a93a3;
  --ink-500:#67707f; --ink-600:#4a5263; --ink-700:#3a4256; --ink-800:#293247; --ink-900:#1d2433; --ink-950:#293247;
  --r-4: var(--radius-xl); --r-5: var(--radius-2xl);
  background: var(--surface-page); color: var(--text-primary); font-family: var(--font-ui);
}
.hx-m3.hx-m3 { --nav-h: 94px; }
/* site chrome in v1 style (Figma 91:9517 / 91:11332); Material previews keep their own M3 roles */
.hx-m3.hx-m3 .mh-kicker { background: rgba(0,188,235,.1); border: 1px solid rgba(0,188,235,.25); color: var(--text-link);
  font-family: var(--font-ui); font-weight: 500; font-size: 12px; letter-spacing: 0; text-transform: none; border-radius: 999px; padding: 3px 10px; }
.hx-m3.hx-m3 .lib-stage__meta, .hx-m3.hx-m3 .sidebar__title span, .hx-m3.hx-m3 .sidebar__title small { font-family: var(--font-ui);
  font-weight: 600; font-size: 11px; letter-spacing: 1.2px; text-transform: uppercase; color: var(--text-secondary); }
.hx-m3.hx-m3 .sidebar__title, .hx-m3.hx-m3 .sidebar__title * { white-space: nowrap; }
.hx-m3.hx-m3 .tree__pattern.is-current { background: var(--surface-tint); color: var(--text-primary); font-weight: 600; }
.hx-m3.hx-m3 .tree__pattern.is-current::after, .hx-m3.hx-m3 .tree__pattern.is-current::before { display: none; }
.hx-m3 .gnav, .hx-m3 .site-footer, .hx-m3 .ox-footer { display: none !important; }
`;
fs.writeFileSync(OUT, root.toString() + v1);
console.log(OUT, fs.statSync(OUT).size);
