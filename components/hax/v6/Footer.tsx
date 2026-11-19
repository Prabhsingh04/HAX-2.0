// v3's footer (Figma Footer 106:8954) with v1's latest links (v5: the nav says Patterns;
// components stay here in the footer). 19 Nov: full width, edge to edge, in the footer's own pale
// panel colour with a hairline on top (it was an inset rounded panel). No background animation:
// Lightfall was tried behind it and removed ("keep it normal default"). The content lines up with
// the nav.
const HAX = [["Patterns", "/v4/patterns"], ["Components", "/v4/library"], ["Docs", "/v4/hax-docs"], ["MCP", "/v4/mcp"], ["Contact", "/v4/contact"]];
const COMPANY = [["Explore Outshift", "https://outshift.cisco.com"], ["Explore Cisco", "https://www.cisco.com"]];
const CONNECT = [["LinkedIn", "https://www.linkedin.com/company/cisco-outshift"], ["YouTube", "https://www.youtube.com/@OutshiftbyCisco"], ["X", "https://x.com/OutshiftCisco"]];
const LEGAL = [
  ["Website Terms of Use", "https://www.cisco.com/c/en/us/about/legal/terms-conditions.html"],
  ["Privacy Policy", "https://www.cisco.com/c/en/us/about/legal/privacy-full.html"],
  ["Cookies / Do not sell or share my personal data", "https://www.cisco.com/c/en/us/about/legal/privacy-full.html#cookies"],
  ["Trademarks", "https://www.cisco.com/c/en/us/about/legal/trademarks.html"],
];
const eyebrow = "font-[family-name:var(--font-mono)] font-medium leading-[16px] text-[12px] text-[color:var(--text-3)] tracking-[0.72px] uppercase";
const link = "h6-link font-medium leading-[20px] text-[14px] text-[color:var(--text)] whitespace-nowrap";
const Up = () => <svg viewBox="0 0 12 12" aria-hidden className="size-[12px] text-[color:var(--text-3)]" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 8.5l5-5M4.5 3.5h4v4" /></svg>;

function Col({ title, items, ext }: { title: string; items: string[][]; ext?: boolean }) {
  return (
    <div className="flex flex-col items-start gap-[12px]">
      <p className={eyebrow}>{title}</p>
      {items.map(([l, h]) => ext ? (
        <a key={l} href={h} target="_blank" rel="noreferrer" className="flex items-center gap-[4px]">
          <span className={link}>{l}</span>
          <Up />
        </a>
      ) : <a key={l} href={h} className={link}>{l}</a>)}
    </div>
  );
}

export function Footer() {
  return (
    <footer className="w-full border-t border-[var(--edge)] bg-[var(--panel)]" data-node-id="106:8954">
      {/* phones: tighter padding and the link groups two by two, so the footer stays short */}
      <div className="mx-auto flex max-w-[1440px] flex-col gap-[32px] px-[24px] pb-[28px] pt-[56px] md:gap-[48px] xl:px-[40px] md:pb-[40px] md:pt-[80px]">
        <div className="flex flex-wrap items-start justify-between gap-[40px]">
          <div className="flex items-center gap-[14px]">
            <a href="/v4" aria-label="Outshift design, HAX home" className="flex items-center">
              <span className="relative h-[40px] w-[97.6px] overflow-clip">
                <span className="absolute inset-[0_0.58%_0_0] block" style={{ maskImage: 'url("/hax/v1/outshift-mask.svg")', maskSize: "97.03px 39.93px", maskRepeat: "no-repeat" }}>
                  <img alt="" src="/hax/v1/outshift-logo.svg" className="absolute inset-0 block size-full max-w-none" />
                </span>
              </span>
              <span className="pl-[6.4px] font-extralight text-[23.04px] text-[color:var(--text)]">design</span>
            </a>
            <span className="h-[24px] w-px bg-[var(--edge-2)]" />
            <a href="/v4" aria-label="HAX home"><img alt="" src="/hax/v1/logo-hax-weave.svg" className="h-[32px] w-[86.9px]" /></a>
          </div>
          <nav aria-label="Footer" className="grid w-full grid-cols-2 items-start gap-x-[24px] gap-y-[32px] sm:flex sm:w-auto sm:flex-wrap sm:gap-[96px]">
            <Col title="HAX" items={HAX} />
            <Col title="Company" items={COMPANY} ext />
            <Col title="Connect" items={CONNECT} ext />
          </nav>
        </div>
        <div className="h-px w-full" style={{ backgroundImage: "linear-gradient(90deg, rgba(15,17,23,0) 0%, rgba(15,17,23,.1) 15%, rgba(15,17,23,.1) 85%, rgba(15,17,23,0) 100%)" }} />
        <div className="flex flex-wrap items-start justify-between gap-[16px] leading-[16px] text-[12px] text-[color:var(--text-2)]">
          <div className="flex flex-wrap gap-x-[16px] gap-y-[8px] md:gap-[24px]">
            {LEGAL.map(([l, h]) => <a key={l} href={h} target="_blank" rel="noreferrer" className="h6-link hover:text-[color:var(--text)]">{l}</a>)}
          </div>
          <p>© 2026 Outshift. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
