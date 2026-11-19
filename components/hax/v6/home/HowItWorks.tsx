import { Eyebrow, H2 } from "@/components/hax/v6/ui";
import { GrainBackdrop } from "@/components/hax/v6/fx";
import { StepTabs } from "@/components/hax/v6/home/StepTabs";

// v3's How it works (Figma 105:5951): a band the full width of the window, alive with a slow grainy
// gradient (React Bits Grainient, tablets and up), now in pale blue to lilac to peach for the white
// page. The words and the four steps are v1's latest (v5, Srishti's Studio v3 home, 17 Nov: "From a
// prompt to behavior in your product", one service-restart example through all four). They play as a
// story: the active step's scene fills the right side and the next takes over when it ends (StepTabs).
export function HowItWorks() {
  return (
    <section id="how-works" className="relative w-full overflow-hidden" style={{ backgroundImage: "var(--grad-band)" }} data-node-id="105:5951">
      <GrainBackdrop />
      {/* the home page's one content column: 1200 wide, 24px from the window's edges on smaller screens */}
      <div className="relative mx-auto flex max-w-[1248px] flex-col gap-[32px] px-[24px] py-[56px] md:gap-[56px] md:py-[96px]">
        <div className="h6-reveal flex max-w-[720px] flex-col gap-[16px]">
          <Eyebrow>How it works</Eyebrow>
          <H2>From a prompt to behavior<br />in your product</H2>
        </div>
        <StepTabs />
      </div>
    </section>
  );
}
