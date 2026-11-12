// Copies Prabh's "With and without HAX" section (index.html #how, github.com/Prabhsingh04/HAX-2.0) into
// public/hax/v1/compare/: vs.html (section markup), vs.js (its script, as-is), vs.css (styles.css +
// hax-button.css + index.html's inline <style>s, every selector scoped under .hx-vs, no @font-face/@import).
// Usage: node scripts/build-hax-compare.mjs ~/Documents/GitHub/HAX-2.0
import fs from "node:fs"; import postcss from "postcss";
const H = process.argv[2]; const OUT = "public/hax/v1/compare";
const page = fs.readFileSync(`${H}/index.html`, "utf8");
const sec = page.match(/<section class="ln-sec ln-ag-sec" id="how"[\s\S]*?<\/section>/)[0];
const js = [...page.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]).find((s) => s.includes("Without vs with HAX"));
const css = ["css/styles.css", "css/hax-button.css"].map((f) => fs.readFileSync(`${H}/${f}`, "utf8")).join("\n")
  + [...page.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join("\n");
const scope = (sel) => {
  sel = sel.trim();
  if (/^(html|:root|body)(\s|$|[.:\[])/.test(sel) || /^html\s+body/.test(sel)) return sel.replace(/^(html(\.[\w-]+|:not\([^)]*\))*\s+body|html|:root|body)/, (m) => {
    const cls = (m.match(/(\.[\w-]+|:not\([^)]*\))/g) || []).join(""); return `.hx-vs${cls}`; }).replace(/^\.hx-vs((?:\.[\w-]+|:not\([^)]*\))*)\s+body/, ".hx-vs$1");
  return `.hx-vs ${sel}`;
};
const root = postcss.parse(css);
root.walkRules((r) => { if (r.parent?.type === "atrule" && /keyframes/i.test(r.parent.name)) return; r.selectors = r.selectors.map(scope); });
root.walkAtRules("import", (a) => a.remove());
root.walkAtRules("font-face", (a) => a.remove());
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(`${OUT}/vs.css`, root.toString());
fs.writeFileSync(`${OUT}/vs.html`, sec);
fs.writeFileSync(`${OUT}/vs.js`, js);
console.log("vs.css", fs.statSync(`${OUT}/vs.css`).size, "vs.html", sec.length, "vs.js", js.length);
