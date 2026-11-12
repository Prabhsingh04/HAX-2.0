// Figma: Footer 106:8954. Same links as v1's footer.
const HAX = [["Pattern library", "/v3/library"], ["Docs", "/v3/hax-docs"], ["MCP", "/v3/mcp"], ["Contact", "/v3/contact"]];
const COMPANY = [["Explore Outshift", "https://outshift.cisco.com"], ["Explore Cisco", "https://www.cisco.com"]];
const CONNECT = [["LinkedIn", "https://www.linkedin.com/company/cisco-outshift"], ["YouTube", "https://www.youtube.com/@OutshiftbyCisco"], ["X", "https://x.com/OutshiftCisco"]];
const LEGAL = [
  ["Website Terms of Use", "https://www.cisco.com/c/en/us/about/legal/terms-conditions.html"],
  ["Privacy Policy", "https://www.cisco.com/c/en/us/about/legal/privacy-full.html"],
  ["Cookies / Do not sell or share my personal data", "https://www.cisco.com/c/en/us/about/legal/privacy-full.html#cookies"],
  ["Trademarks", "https://www.cisco.com/c/en/us/about/legal/trademarks.html"],
];
const eyebrow = "font-[family-name:var(--font-mono)] font-medium leading-[16px] text-[12px] text-[color:var(--text-3)] tracking-[0.72px] uppercase";
const link = "h3-link font-medium leading-[20px] text-[14px] text-[color:var(--text)] whitespace-nowrap";

function Col({ title, items, ext }: { title: string; items: string[][]; ext?: boolean }) {
  return (
    <div className="flex flex-col gap-[12px] items-start">
      <p className={eyebrow}>{title}</p>
      {items.map(([l, h]) => ext ? (
        <a key={l} href={h} target="_blank" rel="noreferrer" className="flex gap-[4px] items-center">
          <span className={link}>{l}</span>
          <img alt="" src="/hax/v3/icon-upright-12.svg" className="size-[12px]" />
        </a>
      ) : <a key={l} href={h} className={link}>{l}</a>)}
    </div>
  );
}

export function Footer() {
  return (
    <footer className="w-full px-[40px] pb-[40px] pt-[64px]" data-node-id="106:8954">
      <div className="mx-auto flex max-w-[1360px] flex-col gap-[40px] rounded-[24px] border border-[var(--edge)] bg-[var(--panel)] px-[48px] pb-[32px] pt-[48px] shadow-[0_8px_24px_rgba(0,0,0,.4)]">
        <div className="flex flex-wrap items-start justify-between gap-[40px]">
          <a href="/v3" aria-label="HAX by Outshift, home" className="flex gap-[16px] items-center">
            <img alt="" src="/hax/v3/logo-hax-weave-dark.svg" className="h-[32px] w-[86.9px]" />
            <span className="h-[24px] w-px bg-[rgba(255,255,255,.2)]" />
            <span className="relative h-[40.32px] w-[98.556px] overflow-clip">
              <span className="absolute inset-[0_0.58%_0_0] block" style={{ maskImage: 'url("/hax/v3/outshift-mask-footer.svg")', maskSize: "97.981px 40.318px", maskRepeat: "no-repeat" }}>
                <img alt="" src="/hax/v3/outshift-logo-footer.svg" className="absolute inset-0 block size-full max-w-none" />
              </span>
            </span>
          </a>
          <nav aria-label="Footer" className="flex flex-wrap gap-[96px] items-start">
            <Col title="HAX" items={HAX} />
            <Col title="Company" items={COMPANY} ext />
            <Col title="Connect" items={CONNECT} ext />
          </nav>
        </div>
        <div className="h-px w-full" style={{ backgroundImage: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.12) 15%, rgba(255,255,255,.12) 85%, rgba(255,255,255,0) 100%)" }} />
        <div className="flex flex-wrap items-start justify-between gap-[16px] leading-[16px] text-[12px] text-[color:var(--text-2)]">
          <div className="flex flex-wrap gap-[24px]">
            {LEGAL.map(([l, h]) => <a key={l} href={h} target="_blank" rel="noreferrer" className="h3-link hover:text-[color:var(--text)]">{l}</a>)}
          </div>
          <p>© 2026 Outshift. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
