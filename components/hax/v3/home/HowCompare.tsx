import AnimatedContent from "@/components/reactbits/AnimatedContent";
import { HowCompare as SharedCompare } from "../../v1/home/HowCompare";

// "See how HAX elevates the AI experience": the shared "With and without HAX" section that v1 and v2
// render too (v1/home/HowCompare.tsx, built from the library's own parts), here in its dark theme.
// The panel rises and settles to full size as it scrolls in (React Bits AnimatedContent).
export function HowCompare() {
  return (
    <div className="px-[32px] py-[24px]">
      <AnimatedContent distance={64} duration={1.1} ease="power4.out" scale={0.94} initialOpacity={0} threshold={0.12}>
        <div className="hx3-compare relative overflow-clip rounded-[40px]">
          <SharedCompare />
        </div>
      </AnimatedContent>
    </div>
  );
}
