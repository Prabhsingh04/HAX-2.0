# HAX — AI UX Pattern Library (local site)

HAX by Outshift Design (Cisco). It is a rebrand of Nucleux. The live reference is https://nucleux.in/home; the site is password-protected.

## Ground rules
- All work happens in this folder. `index.html` is the working home page.
- Run it locally with `python3 serve.py 8970`, then open http://localhost:8970/ (`/` serves `index.html`).
- Pages are at the top level. Assets live in `css/`, `js/`, `img/`, `assets/` and `thumbs/`.
- The shared brand and nav CSS is in `css/styles.css`. The type is InterVariable (rsms Inter, variable) with "calt" and "liga" on, matching outshift.design. It is set through `--font-display` and `--font-body` in `css/styles.css`. Most home-page CSS and JS is inline in `index.html`.
- Copy is "HAX" and packages are `@hax/*`. The MCP command is `claude mcp add --transport http hax https://nucleux.in/mcp`.

## Home page sections, in order
1. Nav, in Outshift Design style: the HAX and Outshift lockup on the left; every tab on the right, all identical (16px regular #293247, no hover animation; the split-flap in `js/nav-splitflap.js` is switched off). The tabs are Initiatives ▾, Research ▾, Blog, Components ▾, Docs and MCP, followed by search. All three dropdowns use the same `.ox-dd` click-to-open card (click handling at the end of `js/global.js`). The Components card groups its links under ShadCN and Material 3.0. The old Components mega flyout is no longer used. Scenarios was removed from the nav. On phones the menu groups links under small headings.
2. The intro logo animation, which clones `.brand__mark`.
3. The iPhone Duo banner.
4. Hero. The page background is the Outshift Design blobs (`img/round-violet|orange|blue.svg`, `.ox-blobs` and `.ox-blob`; 10s, 15s and 8s alternating drift), copied from outshift.design/hax. They sit in a fixed layer behind the whole home page, so they stay in view and keep moving while you scroll. The page base is #fff and section backgrounds are transparent.
5. `#how`: Without HAX vs With HAX. The right-hand card is built natively; the `.hx__*` CSS and the `hx()` function sit inside the `#vs` script.
6. `#how-works`: three sticky tiles, built natively. Classes are `.hw-*`; the script is the "How HAX works" block above the footer.
7. `#start`: One library, two ways in.
8. `#patterns`: four tiles with native previews. Classes are `.mo-*`; the script is "Four moments".
9. `#developers`.
10. Footer: the makers card with `img/hax-logo.svg`, then the Outshift lockup.

The `pg-preview/` folder was deleted, so do not reference it. Sections that used its iframes were rebuilt natively.

## Known leftovers
- `assets/hero.mp4` gives a 404; it is an optional video.
- Two thumbnails are missing (search-filter.webp) on the library and material-agentic pages.
- The "Aria · Intelligaia agent" demo persona and the intelligaia.com/contact links were intentionally left as they are.
