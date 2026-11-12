import { Lockup } from "./Nav";

// Figma: Footer 99:28941 (🌐 Website v2). The 80px weave edge strip (99:28938) is dropped: under Built by it
// read as a stray horizontal band; the section's own weave dissolves into the footer instead. Links as v1's footer, routes inside /v2.
const HAX = [["Pattern library", "/v2/library"], ["Docs", "/v2/hax-docs"], ["MCP", "/v2/mcp"], ["Contact", "/v2/contact"]];
const COMPANY = [["Explore Outshift", "https://outshift.cisco.com"], ["Explore Cisco", "https://www.cisco.com"]];
const CONNECT = [["LinkedIn", "https://www.linkedin.com/company/cisco-outshift"], ["YouTube", "https://www.youtube.com/@OutshiftbyCisco"], ["X", "https://x.com/OutshiftCisco"]];
const LEGAL = [
  ["Website Terms of Use", "https://www.cisco.com/c/en/us/about/legal/terms-conditions.html"],
  ["Privacy Policy", "https://www.cisco.com/c/en/us/about/legal/privacy-full.html"],
  ["Cookies / Do not sell or share my personal data", "https://www.cisco.com/c/en/us/about/legal/privacy-full.html#cookies"],
  ["Trademarks", "https://www.cisco.com/c/en/us/about/legal/trademarks.html"],
];
const head = "font-[family-name:var(--font-mono)] text-[12px] uppercase leading-[16px] tracking-[0.04em] text-[color:var(--nav-muted)]";
const link = "hx2-link text-[14px] leading-[20px] text-[color:var(--nav-ink)]";

export function Footer() {
  return (
    <footer className="hx2-band w-full" style={{ background: "var(--mcp)" }}>
      <div className="mx-auto flex max-w-[1440px] flex-col gap-[48px] px-[120px] pb-[48px] pt-[96px]">
        <div className="flex items-start justify-between">
          <a href="/v2" aria-label="HAX by Outshift, home"><Lockup footer /></a>
          <nav aria-label="Footer" className="flex gap-[96px]">
            <div className="flex flex-col gap-[12px]"><p className={head}>HAX</p>{HAX.map(([l, h]) => <a key={l} href={h} className={link}>{l}</a>)}</div>
            <div className="flex flex-col gap-[12px]"><p className={head}>Company</p>{COMPANY.map(([l, h]) => <a key={l} href={h} target="_blank" rel="noreferrer" className={link}>{l} ↗</a>)}</div>
            <div className="flex flex-col gap-[12px]"><p className={head}>Connect</p>{CONNECT.map(([l, h]) => <a key={l} href={h} target="_blank" rel="noreferrer" className={link}>{l} ↗</a>)}</div>
          </nav>
        </div>
        <div className="h-px w-full bg-[color:var(--nav-line)]" />
        <div className="flex items-center justify-between text-[12px] leading-[16px] text-[color:var(--nav-muted)]">
          <div className="flex gap-[24px]">{LEGAL.map(([l, h]) => <a key={l} href={h} target="_blank" rel="noreferrer" className="hx2-link">{l}</a>)}</div>
          <p>© 2026 Outshift. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
