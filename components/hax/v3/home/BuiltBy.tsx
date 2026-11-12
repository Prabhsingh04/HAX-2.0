import { H2, Sub, btn } from "../ui";

// Figma: Built by 106:7304
export function BuiltBy() {
  return (
    <section className="px-[24px] py-[96px]" data-node-id="106:7304">
      <div className="h3-reveal mx-auto flex max-w-[1200px] flex-col items-center gap-[24px] rounded-[32px] border border-[var(--edge)] bg-[var(--panel)] px-[24px] py-[80px] text-center md:px-[96px]">
        <H2>Built by people who design<br />agentic products</H2>
        <Sub className="max-w-[680px]">Outshift Design works with teams building AI-native software on the human–agent experience. HAX is a public artifact of that practice — open to use, free to adapt, and updated as the practice evolves.</Sub>
        <a href="https://outshift.cisco.com" target="_blank" rel="noreferrer" className={`${btn} h3-btn--primary`}>
          Explore Outshift
          <img alt="" src="/hax/v3/icon-upright-16-ink.svg" className="h3-arrow h3-arrow--up size-[16px]" />
        </a>
      </div>
    </section>
  );
}
