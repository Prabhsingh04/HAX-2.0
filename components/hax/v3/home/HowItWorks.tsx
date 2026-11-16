import { Eyebrow, H2 } from "../ui";
import { GrainBackdrop } from "../fx";
import { StepTabs } from "./StepTabs";

// Figma: How it works 105:5951, reworked: the page's one colour moment, a blue to purple band that
// runs the full width of the window, alive with a slow grainy gradient in the same colours (React
// Bits Grainient, tablets and up; phones keep the still band). Inside, the three steps play as a
// story: the active step's scene fills the right side and the next takes over when it ends (StepTabs).
export function HowItWorks() {
  return (
    <section id="how-works" className="relative w-full overflow-hidden" style={{ backgroundImage: "var(--grad-band)" }} data-node-id="105:5951">
      <GrainBackdrop />
      <div className="relative mx-auto flex max-w-[1200px] flex-col gap-[32px] px-[20px] py-[56px] md:gap-[56px] md:px-[56px] md:py-[96px] xl:px-[24px]">
        <div className="h3-reveal flex max-w-[680px] flex-col gap-[16px]">
          <Eyebrow tone="ice">How it works</Eyebrow>
          <H2 className="text-white">From one sentence to<br />screens you can ship</H2>
          <p className="leading-[28px] text-[18px] text-[rgba(255,255,255,.72)] max-md:text-[16px] max-md:leading-[24px]">Describe what you need. HAX helps your agent build it.</p>
        </div>
        <StepTabs />
      </div>
    </section>
  );
}
