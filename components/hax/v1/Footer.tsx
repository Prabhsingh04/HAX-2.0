// Figma: Footer 98:19910
const HAX = [
  ["Patterns", "/patterns"],
  ["Components", "/library"],
  ["Docs", "/hax-docs"],
  ["MCP", "/mcp"],
  ["Contact", "/contact"],
];
const COMPANY = [
  ["Explore Outshift", "https://outshift.cisco.com"],
  ["Explore Cisco", "https://www.cisco.com"],
];
const CONNECT = [
  ["LinkedIn", "https://www.linkedin.com/company/cisco-outshift"],
  ["YouTube", "https://www.youtube.com/@OutshiftbyCisco"],
  ["X", "https://x.com/OutshiftCisco"],
];
const LEGAL = [
  ["Website Terms of Use", "https://www.cisco.com/c/en/us/about/legal/terms-conditions.html"],
  ["Privacy Policy", "https://www.cisco.com/c/en/us/about/legal/privacy-full.html"],
  ["Cookies / Do not sell or share my personal data", "https://www.cisco.com/c/en/us/about/legal/privacy-full.html#cookies"],
  ["Trademarks", "https://www.cisco.com/c/en/us/about/legal/trademarks.html"],
];
const eyebrow = "font-semibold leading-[16px] text-[11px] tracking-[1.2px] uppercase";

function Ext({ label, href }: { label: string; href: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="flex gap-[4px] items-center px-[2px] py-px rounded-[4px] font-medium leading-[18px] text-[13px] text-[color:var(--text-link)] whitespace-nowrap">
      <span className="hx-link">{label}</span>
      <img alt="" src="/hax/v1/icon-external-link-12.svg" className="size-[12px]" />
    </a>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-[var(--stroke-subtle)] w-full" data-node-id="98:19910">
      <div className="mx-auto max-w-[1440px] flex flex-col gap-[40px] items-start pb-[40px] pt-[48px] px-[var(--hx-gutter)]">
        <div className="flex w-full flex-col items-start gap-[32px] md:flex-row md:justify-between">
          <a href="https://outshift.cisco.com" aria-label="Outshift by Cisco" className="relative block h-[49.909px] w-[122px] overflow-clip shrink-0">
            <span className="absolute inset-[0_0.58%_0_0] block" style={{ maskImage: 'url("/hax/v1/outshift-mask.svg")', maskSize: "121.289px 49.909px", maskRepeat: "no-repeat" }}>
              <img alt="" src="/hax/v1/outshift-logo-footer.svg" className="hx-light-only absolute inset-0 block size-full max-w-none" />
              <img alt="" src="/hax/v1/outshift-logo-footer-dark.svg" className="hx-dark-only absolute inset-0 block size-full max-w-none" />
            </span>
          </a>
          <nav aria-label="Footer" className="flex flex-wrap items-start gap-x-[56px] gap-y-[28px] lg:gap-x-[96px]">
            <div className="flex flex-col gap-[10px] items-start">
              <p className={eyebrow}>HAX</p>
              {HAX.map(([l, h]) => (
                <a key={l} href={h} className="hx-link leading-[20px] text-[13px] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] transition-colors">{l}</a>
              ))}
            </div>
            <div className="flex flex-col gap-[10px] items-start">
              <p className={eyebrow}>Company</p>
              {COMPANY.map(([l, h]) => <Ext key={l} label={l} href={h} />)}
            </div>
            <div className="flex flex-col gap-[10px] items-start">
              <p className={eyebrow}>Connect</p>
              {CONNECT.map(([l, h]) => <Ext key={l} label={l} href={h} />)}
            </div>
          </nav>
        </div>
        <div className="flex w-full flex-col items-start gap-[12px] leading-[18px] text-[12px] lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-x-[16px] gap-y-[6px] items-start">
            {LEGAL.map(([l, h]) => <a key={l} href={h} target="_blank" rel="noreferrer" className="hx-link whitespace-nowrap">{l}</a>)}
          </div>
          <p className="whitespace-nowrap text-[color:var(--text-secondary)]">© 2026 Outshift. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
