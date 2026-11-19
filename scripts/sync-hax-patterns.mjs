/**
 * Pulls Srishti's v3 pattern draft into v6 (19 Nov 2026): https://01kxisn2.reviewa.work/v3/patterns.html
 * is the pattern list the team shared, and v6's pattern pages follow it (her layout, v6's look).
 *
 *   components/hax/v6/patterns/data.json   the list and every pattern page's words, as she shows them
 *   public/hax/v6/patterns/ref/            her standalone preview renderer for the general patterns
 *                                          (preview.html + styles.css + patterns.js + pattern.js), copied
 *                                          as is, minus the review tool's two scripts
 *   public/hax/v6/patterns/authored/       the agentic patterns' previews: one HTML file per state
 *                                          (kit × where it appears × how much to show), on her app's CSS
 *
 * Everything stays HTML, so when she changes the draft, run this again and v6 follows:
 *   node scripts/sync-hax-patterns.mjs            (all 112)
 *   node scripts/sync-hax-patterns.mjs id1,id2    (only these pages; the list is always refreshed)
 *
 * Her review notes ("To merge", "Review needed") are kept in data.json under `review` but not shown.
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = "https://01kxisn2.reviewa.work";
const DATA = "components/hax/v6/patterns/data.json";
const PUB = "public/hax/v6/patterns";
const DIMS = ["L1", "L2", "L3", "L4"]; // her "Who is involved?" options after "All patterns", in order
const only = (process.argv[2] || "").split(",").filter(Boolean);
const lib = JSON.parse(fs.readFileSync("components/hax/v1/library112/patterns.json", "utf8")); // participant dimensions
const slug = (s) => s.toLowerCase().replace(/&/g, " ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const write = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };
async function get(url) {
  for (let i = 0; i < 3; i++) {
    const r = await fetch(url).catch(() => null);
    if (r?.ok) return Buffer.from(await r.arrayBuffer());
    await new Promise((res) => setTimeout(res, 800 * (i + 1)));
  }
  throw new Error("GET failed: " + url);
}

// Playwright's own browser, else any installed headless Chromium (the package can expect a newer build)
async function launch() {
  try { return await chromium.launch(); } catch (e) {
    const cache = path.join(process.env.HOME ?? "", "Library/Caches/ms-playwright");
    const dirs = fs.existsSync(cache) ? fs.readdirSync(cache).filter((d) => d.startsWith("chromium_headless_shell-")).sort().reverse() : [];
    for (const d of dirs) {
      const exe = path.join(cache, d, "chrome-headless-shell-mac-arm64", "chrome-headless-shell");
      if (fs.existsSync(exe)) return chromium.launch({ executablePath: exe });
    }
    if (process.env.CHROMIUM_PATH) return chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
    throw e;
  }
}
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const open = async (page, url) => {
  for (let i = 0; i < 3; i++) {
    try { await page.goto(BASE + url, { waitUntil: "networkidle", timeout: 60000 }); return; } catch (e) { if (i === 2) throw e; }
  }
};

// ---------- the list ----------
const page = await ctx.newPage();
await open(page, "/v3/patterns.html");
const list = await page.evaluate(() => {
  const T = (e) => (e?.textContent ?? "").replace(/\s+/g, " ").trim();
  const head = document.querySelector(".v3-section--patterns-head");
  const labels = [...document.querySelectorAll(".v3-pattern-sidebar .v3-pattern-control-label")].map(T);
  const opts = (sel) => [...document.querySelectorAll(sel)].map((b) => [T(b.querySelector("span")), +T(b.querySelector(".v3-pattern-category-nav__count"))]);
  const cards = [...document.querySelectorAll("a.v3-pattern-card")].map((a) => {
    const meta = a.querySelector(".v3-pattern-card__meta span:not(.v3-pattern-card__link)");
    return {
      id: a.getAttribute("href").split("/").pop().replace(/\.html$/, ""),
      category: T(a.querySelector(".v3-pattern-card__category")),
      name: T(a.querySelector("h3")),
      summary: T(a.querySelector(":scope > p")),
      meta: T(meta),
      link: T(a.querySelector(".v3-pattern-card__link")).replace(/\s*↗$/, ""),
      review: [T(a.querySelector(".v3-pattern-card__badge")), T(a.querySelector(".v3-pattern-card__note"))].filter(Boolean),
    };
  });
  return {
    eyebrow: T(head.querySelector(".v3-eyebrow")), title: T(head.querySelector("h1")), intro: T(head.querySelector(".v3-patterns-intro")),
    labels, dims: opts(".v3-pattern-dimension-nav button"), cats: opts(".v3-pattern-category-nav__list button"), cards,
  };
});
console.log(`list: ${list.cards.length} patterns, ${list.cats.length} category options`);

// participant dimensions come from her data (Rishi's library112 import); check them against her counts
const byId = new Map(lib.map((p) => [p.id, p]));
DIMS.forEach((d, i) => {
  const n = list.cards.filter((c) => byId.get(c.id)?.dimensions?.includes(d)).length;
  if (n !== list.dims[i + 1][1]) console.warn(`! ${list.dims[i + 1][0]}: her count ${list.dims[i + 1][1]}, data ${n}`);
});

// ---------- every pattern page ----------
const old = fs.existsSync(DATA) ? JSON.parse(fs.readFileSync(DATA, "utf8")) : null;
const pages = Object.fromEntries((old?.patterns ?? []).map((p) => [p.id, p.page]));
let css = null; // her app's stylesheets, for the authored previews

const READ_AGENTIC = () => {
  const T = (e) => (e?.textContent ?? "").replace(/\s+/g, " ").trim();
  const idOf = (a) => a.getAttribute("href").split("/").pop().replace(/\.html$/, "");
  const slotOf = (e) => (e.getAttribute("style") || "").match(/--v2-slot-([a-z]+)/)?.[1] ?? null;
  const hero = document.querySelector("header.v2-pattern-hero");
  const levels = document.querySelector("section.v2-pattern-levels");
  const det = document.querySelector("details.v2-pattern-spec__details");
  return {
    kind: "agentic",
    eyebrow: T(hero.querySelector(".v2-pattern-hero__eyebrow")),
    title: T(hero.querySelector("h1")),
    summary: T(hero.querySelector(".v2-pattern-hero__summary")),
    toc: [...document.querySelectorAll("nav.v2-pattern-jump a")].map((a) => [a.getAttribute("href").replace(/^#/, ""), T(a)]),
    solves: [...document.querySelectorAll("section.v2-pattern-prose p")].map(T).filter(Boolean),
    steps: [...document.querySelectorAll("ol.v2-pattern-interaction__steps > li")].map((li) => ({ n: T(li.querySelector(".v2-pattern-interaction__number")), title: T(li.querySelector("h3")), text: T(li.querySelector("p")) })),
    whoIntro: T(levels?.querySelector(".v2-pattern-section-head p")),
    who: [...(levels?.querySelectorAll("ul.v2-pattern-levels__grid > li") ?? [])].map((li) => {
      const h3 = li.querySelector("h3"), mark = h3.querySelector("span");
      return { label: T(h3).replace(T(mark), "").trim(), marker: T(mark).replace(/^·\s*/, ""), applies: li.dataset.applies === "true", note: T(li.querySelector("p")) };
    }),
    spec: [...(document.querySelector(".v2-spec")?.childNodes ?? [])].map((n) => n.nodeType === 3 ? { t: n.textContent } : n.nodeType === 1 ? { t: n.textContent, slot: slotOf(n) } : null).filter((x) => x && x.t),
    specMore: det ? {
      summary: T(det.querySelector("summary")),
      legend: [...det.querySelectorAll(".v2-pattern-slot-legend li")].map((li) => ({ slot: slotOf(li), label: T(li.querySelector("strong")), text: T(li.querySelector("span")) })),
      facts: [...det.querySelectorAll(".v2-pattern-fact")].map((f) => {
        const items = [...f.querySelectorAll("li")].map(T);
        return items.length ? { title: T(f.querySelector("h3")), items } : { title: T(f.querySelector("h3")), text: [...f.querySelectorAll("p")].map(T).join("\n\n") };
      }),
    } : null,
    principles: [...document.querySelectorAll(".v2-pattern-principles__row")].map((r) => {
      const a = r.querySelector("a");
      return { role: T(r.querySelector(":scope > span")), name: T(a).replace(/\s*↗$/, ""), slug: a?.getAttribute("href").split("/").pop().replace(/\.html$/, ""), why: T(r.querySelector("p")) };
    }),
    related: [...document.querySelectorAll("section.v2-pattern-related > ul > li")].filter((li) => li.querySelector("a")).map((li) => ({ id: idOf(li.querySelector("a")), name: T(li.querySelector("a")).replace(/\s*↗$/, ""), summary: T(li.querySelector("p")) })),
    review: [...document.querySelectorAll(".v2-pattern-review")].map(T),
  };
};
// the 7 agentic patterns that came from Nucleux use her v3 detail template: same sections, a dimension
// table, the spec as one sentence with its facts open, related links with a line each
const READ_NX = () => {
  const T = (e) => (e?.textContent ?? "").replace(/\s+/g, " ").trim();
  const idOf = (a) => a.getAttribute("href").split("/").pop().replace(/\.html$/, "");
  const hero = document.querySelector("header.v3-pattern-detail__hero");
  const sec = (id) => document.getElementById(id);
  const dd = (d) => { const items = [...(d?.querySelectorAll("li") ?? [])].map(T); return items.length ? { items } : { text: [...(d?.querySelectorAll("p") ?? [])].map(T).join("\n\n") || T(d) }; };
  return {
    kind: "agentic", template: "nucleux",
    eyebrow: T(hero.querySelector(".v3-pattern-detail__eyebrow")),
    title: T(hero.querySelector("h1")),
    summary: T(hero.querySelector(".v3-pattern-detail__summary")),
    toc: [...document.querySelectorAll("nav.v2-pattern-jump a")].map((a) => [a.getAttribute("href").replace(/^#/, ""), T(a)]),
    solves: [...(sec("pattern-what")?.querySelectorAll("p") ?? [])].map(T).filter(Boolean),
    steps: [...(sec("pattern-interaction")?.querySelectorAll("ol > li") ?? [])].map((li) => ({ n: T(li.querySelector("span")), title: T(li.querySelector("h3")), text: T(li.querySelector("p")) })),
    whoIntro: T(sec("pattern-who")?.querySelector(":scope > p")),
    who: [...(sec("pattern-who")?.querySelectorAll(".v3-dimension-table__row") ?? [])].map((r) => ({ label: T(r.querySelector("strong")), marker: r.dataset.primary === "true" ? "primary setting" : "", applies: r.dataset.active === "true", note: T(r.querySelector(".v3-dimension-table__note")) })),
    spec: [{ t: T(sec("pattern-spec")?.querySelector(".v3-pattern-spec__sentence")) }],
    specMore: { summary: "", legend: [], open: true, facts: [...(sec("pattern-spec")?.querySelectorAll(".v3-pattern-spec__fact") ?? [])].map((f) => ({ title: T(f.querySelector("dt")), ...dd(f.querySelector("dd")) })) },
    principles: [...(sec("pattern-principles")?.querySelectorAll(".v3-pattern-principles__row") ?? [])].map((r) => {
      const a = r.querySelector("a");
      return { role: T(r.querySelector(".v3-pattern-principles__relation")), name: T(a).replace(/\s*↗$/, ""), slug: a?.getAttribute("href").split("/").pop().replace(/\.html$/, ""), why: T(r.querySelector("p")) };
    }),
    related: [...(sec("pattern-related")?.querySelectorAll(".v3-pattern-related a") ?? [])].map((a) => ({ id: idOf(a), name: (a.childNodes[0]?.textContent ?? "").trim(), summary: T(a.querySelector("small")) })),
  };
};
const READ_GENERAL = () => {
  const T = (e) => (e?.textContent ?? "").replace(/\s+/g, " ").trim();
  const hero = document.querySelector("header.v3-source-detail__hero");
  const sec = (id) => document.getElementById(id);
  const src = sec("source-preview")?.querySelector("iframe")?.getAttribute("src") ?? "";
  return {
    kind: "general",
    eyebrow: T(hero.querySelector(".v3-eyebrow")),
    title: T(hero.querySelector("h1")),
    summary: T(hero.querySelector(".v3-source-detail__summary")),
    solves: [...(sec("source-description")?.querySelectorAll("p") ?? [])].map(T).filter(Boolean),
    questions: [...(sec("source-interaction")?.querySelectorAll("dl > div") ?? [])].map((d) => ({ q: T(d.querySelector("dt")), a: T(d.querySelector("dd")) })),
    code: sec("source-code") ? { intro: T(sec("source-code").querySelector("p")), html: sec("source-code").querySelector("pre")?.textContent ?? "" } : null,
    related: [...(sec("source-related")?.querySelectorAll(".v3-source-detail__related a") ?? [])].map((a) => ({ id: a.getAttribute("href").split("/").pop().replace(/\.html$/, ""), name: T(a).replace(/\s*↗$/, "") })),
    review: [...document.querySelectorAll(".v3-pattern-review")].map(T),
    previewSrc: src,
  };
};

// her app's CSS (href sheets + inline styles, in order), with its fonts copied next to it
async function grabCss(p) {
  const sheets = await p.evaluate(() => [...document.styleSheets].map((s) => (s.href ? { href: s.href } : { text: s.ownerNode?.textContent ?? "" })));
  let out = "";
  for (const s of sheets) {
    let text = s.href ? (await get(s.href)).toString("utf8") : s.text;
    const baseUrl = s.href ?? BASE + "/";
    const urls = [...new Set([...text.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)].map((m) => m[1]).filter((u) => !u.startsWith("data:")))];
    for (const u of urls) {
      const abs = new URL(u, baseUrl).href, name = path.basename(new URL(abs).pathname);
      const dest = `${PUB}/authored/media/${name}`;
      if (!fs.existsSync(dest)) write(dest, await get(abs));
      text = text.split(u).join(`media/${name}`);
    }
    out += `/* ${s.href ? new URL(s.href).pathname : "inline"} */\n${text}\n`;
  }
  return out;
}

// one authored preview state: the preview card inside its ancestors (their classes carry the kit and
// font variables), with the ancestors' layout neutralised, posting its height to the page
async function snapshot(p) {
  return p.evaluate(() => {
    const pv = document.querySelector(".v3-authored-preview .v2-preview");
    const chain = []; for (let e = pv.parentElement; e && e !== document.body; e = e.parentElement) chain.unshift(e);
    const attrs = (e) => [...e.attributes].filter((a) => a.name === "class" || a.name === "style" || a.name.startsWith("data-") || a.name === "lang").map((a) => ` ${a.name}="${a.value.replace(/&/g, "&amp;").replace(/"/g, "&quot;")}"`).join("");
    return {
      html: attrs(document.documentElement), body: attrs(document.body),
      inner: chain.map((e) => `<${e.tagName.toLowerCase()}${attrs(e)}>`).join("") + pv.outerHTML + chain.map((e) => `</${e.tagName.toLowerCase()}>`).reverse().join(""),
    };
  });
}
const SNAP = (s) => `<!doctype html>
<html${s.html}><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="../app.css">
<style>
html,body{margin:0;padding:0;background:transparent;min-height:0;overflow:hidden}
:has(.v2-preview){margin:0!important;padding:0!important;max-width:none!important;width:auto!important;min-height:0!important;height:auto!important;border:0!important;background:none!important;box-shadow:none!important;display:block!important;position:static!important;transform:none!important;overflow:visible!important;opacity:1!important}
.v2-preview{margin:0!important}
</style>
<script>addEventListener("DOMContentLoaded",function(){var r=function(){parent!==window&&parent.postMessage({type:"hax-pattern-preview-height",height:Math.ceil(document.body.getBoundingClientRect().height)},location.origin)};new ResizeObserver(r).observe(document.body);r();setTimeout(r,300)})</script>
</head><body${s.body}>${s.inner}</body></html>
`;

async function authoredStates(p, id) {
  const mark = () => p.evaluate(() => {
    const root = document.querySelector(".v3-authored-preview");
    const T = (e) => (e?.textContent ?? "").replace(/\s+/g, " ").trim();
    const groups = { kit: [], channel: [], detail: [] };
    let channelLabel = "", detailLabel = "";
    for (const b of root.querySelectorAll("button")) {
      if (b.closest(".v2-preview")) continue;
      const g = b.closest(".v3-theme-toggle") ? "kit" : b.closest(".v2-preview-channel-group") ? "channel" : "detail";
      b.dataset.syncGroup = g; b.dataset.syncIndex = String(groups[g].length); groups[g].push(T(b));
      if (g === "channel") channelLabel = T(b.closest(".v2-preview-channel-group").querySelector(":scope > span"));
      if (g === "detail") detailLabel = T(b.parentElement.parentElement.querySelector(".v2-eyebrow"));
    }
    return { ...groups, channelLabel, detailLabel };
  });
  const click = async (g, i) => { await mark(); await p.locator(`.v3-authored-preview button[data-sync-group="${g}"][data-sync-index="${i}"]`).click(); await p.waitForTimeout(160); };
  const first = await snapshot(p), g0 = await mark();
  const out = { kits: g0.kit, channelLabel: g0.channelLabel, channels: g0.channel, details: [], states: [], default: null };
  for (let k = 0; k < Math.max(1, g0.kit.length); k++) {
    if (g0.kit.length) await click("kit", k);
    for (let c = 0; c < Math.max(1, g0.channel.length); c++) {
      if (g0.channel.length) await click("channel", c);
      const g = await mark();
      out.details[c] = g.detail.length ? { label: g.detailLabel, options: g.detail } : null;
      for (let d = 0; d < Math.max(1, g.detail.length); d++) {
        if (g.detail.length) await click("detail", d);
        const s = await snapshot(p), key = `${k}-${c}-${g.detail.length ? d : "x"}`;
        write(`${PUB}/authored/${id}/${key}.html`, SNAP(s));
        out.states.push(key);
        if (!out.default && s.inner === first.inner) out.default = key;
      }
    }
  }
  out.default ??= out.states[0];
  return out;
}

const queue = list.cards.map((c) => c.id).filter((id) => !only.length || only.includes(id));
const failed = [];
await Promise.all([0, 1, 2].map(async () => {
  const p = await ctx.newPage();
  while (queue.length) {
    const id = queue.shift();
    try {
      await open(p, `/v3/patterns/${id}.html`);
      const tpl = await p.evaluate(() => document.querySelector("header.v2-pattern-hero") ? "v2" : document.querySelector("header.v3-pattern-detail__hero") ? "nx" : "general");
      if (tpl !== "general") {
        await p.evaluate(() => { const d = document.querySelector("details.v2-pattern-spec__details"); if (d) d.open = true; });
        const pg = await p.evaluate(tpl === "v2" ? READ_AGENTIC : READ_NX);
        if (!css) css = await grabCss(p);
        fs.rmSync(`${PUB}/authored/${id}`, { recursive: true, force: true });
        pg.preview = { type: "authored", ...(await authoredStates(p, id)) };
        pages[id] = pg;
      } else {
        const pg = await p.evaluate(READ_GENERAL);
        // where it appears: each tab swaps the renderer's template; read them all
        const tabs = p.locator("#source-preview .v2-preview-tab");
        const n = await tabs.count(), templates = [];
        for (let i = 0; i < n; i++) {
          await tabs.nth(i).click(); await p.waitForTimeout(120);
          const s = await p.locator("#source-preview iframe").getAttribute("src");
          templates.push({ label: (await tabs.nth(i).textContent()).trim(), params: s.split("?")[1] });
        }
        const params = new URLSearchParams(pg.previewSrc.split("?")[1]);
        pg.preview = { type: "ref", channelLabel: "Appears in", templates, default: Math.max(0, templates.findIndex((t) => new URLSearchParams(t.params).get("template") === params.get("template"))), params: pg.previewSrc.split("?")[1] };
        delete pg.previewSrc;
        pages[id] = pg;
      }
      process.stdout.write(".");
    } catch (e) { failed.push(`${id}: ${String(e.message).split("\n")[0]}`); }
  }
}));
console.log("");
if (css) write(`${PUB}/authored/app.css`, css);

// ---------- her standalone preview renderer, for the general patterns ----------
const REF = "/v3-pattern-reference/";
let html = (await get(BASE + REF + "preview.html")).toString("utf8");
html = html.replace(/<script id="reviewa-v3-navigation">[\s\S]*?<\/script>/, "").replace(/<script[^>]*__reviewa\/embed\.js[^>]*><\/script>/, "");
write(`${PUB}/ref/preview.html`, html);
for (const f of ["styles.css", "patterns.js", "pattern.js"]) {
  let text = (await get(BASE + REF + f)).toString("utf8");
  // root-relative images (avatars, app icons) are copied here and made relative to the renderer
  const assets = [...new Set([...text.matchAll(/["'(]\/((?:[a-z0-9_-]+\/)*[a-z0-9_.-]+\.(?:svg|png|jpe?g|webp|gif))["')]/gi)].map((m) => m[1]))];
  for (const a of assets) {
    const dest = `${PUB}/ref/${a}`;
    if (!fs.existsSync(dest)) {
      const buf = await get(`${BASE}/${a}`).catch(() => get(BASE + REF + a)).catch(() => null);
      // a few (aria-avatar.svg, icons/*.svg) 404 on her site too; leave those references as they are
      if (!buf) { console.warn(`! not on her site either: /${a}`); continue; }
      write(dest, buf);
    }
    text = text.split(`"/${a}"`).join(`"${a}"`).split(`'/${a}'`).join(`'${a}'`).split(`(/${a})`).join(`(${a})`);
  }
  write(`${PUB}/ref/${f}`, text);
}

// ---------- data ----------
// a related link can use another id than the list (memory → agent-memory): match it by name
const idByName = new Map(list.cards.map((c) => [c.name.toLowerCase(), c.id]));
const ids = new Set(list.cards.map((c) => c.id));
for (const pg of Object.values(pages)) for (const r of pg?.related ?? []) if (!ids.has(r.id) && idByName.has(r.name.toLowerCase())) r.id = idByName.get(r.name.toLowerCase());
const patterns = list.cards.map((c) => ({
  ...c,
  categoryId: slug(c.category),
  dims: byId.get(c.id)?.dimensions ?? [],
  page: pages[c.id] ?? null,
}));
write(DATA, JSON.stringify({
  source: BASE + "/v3/patterns.html", synced: new Date().toISOString(),
  list: { eyebrow: list.eyebrow, title: list.title, intro: list.intro, labels: list.labels, dims: list.dims.map(([l], i) => [i ? DIMS[i - 1] : "all", l]), cats: list.cats.map(([l]) => [l === "All categories" ? "all" : slug(l), l]) },
  patterns,
}, null, 1) + "\n");
console.log(`data: ${patterns.length} patterns, ${patterns.filter((p) => p.page).length} with pages`);
if (failed.length) { console.log("failed:\n " + failed.join("\n ")); process.exitCode = 1; }
await browser.close();
