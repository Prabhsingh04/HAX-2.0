import ScrollReveal from "@/components/reactbits/ScrollReveal";
import { Sub, btn } from "../ui";
import { AcidBackdrop, Spark } from "../fx";

// Figma: Built by 106:7304. The page's closing statement: its words light up one by one, from a dim
// grey to full white, once it comes into view (React Bits ScrollReveal), over a floor of rounded
// squares lit in the person's cyan and the agent's orange (AcidSquares, tablets and up). The button
// throws sparks when pressed.
export function BuiltBy() {
  return (
    <section className="px-[24px] py-[64px] md:py-[96px]" data-node-id="106:7304">
      <div className="h3-reveal relative mx-auto max-w-[1200px] overflow-hidden rounded-[32px] border border-[var(--edge)] bg-[var(--panel)]">
        <AcidBackdrop />
        <div className="relative flex flex-col items-center gap-[24px] px-[24px] py-[64px] text-center md:px-[96px] md:py-[96px]">
          {/* "enter": the words light up one after another once the heading is in view and stay lit;
              scrubbing them to the scroll left them dim at the foot of the page, which can't scroll far */}
          <ScrollReveal mode="enter" duration={0.9} stagger={0.12} baseOpacity={0.22} enableBlur={false} baseRotation={0}
            containerClassName="!my-0 w-full"
            textClassName="mx-auto max-w-[15ch] !font-light !text-[clamp(36px,5vw,60px)] !leading-[1.05] tracking-[-0.02em] text-[color:var(--text)] [text-wrap:balance]">
            Built by people who design agentic products
          </ScrollReveal>
          <Sub className="max-w-[680px] max-md:text-[16px] max-md:leading-[24px]">Outshift Design works with teams building AI-native software on the human–agent experience. HAX is a public artifact of that practice — open to use, free to adapt, and updated as the practice evolves.</Sub>
          <Spark>
            <a href="https://outshift.cisco.com" target="_blank" rel="noreferrer" className={`${btn} h3-btn--primary`}>
              Explore Outshift
              <img alt="" src="/hax/v3/icon-upright-16-ink.svg" className="h3-arrow h3-arrow--up size-[16px]" />
            </a>
          </Spark>
        </div>
      </div>
    </section>
  );
}
