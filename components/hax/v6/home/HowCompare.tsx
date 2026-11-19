import AnimatedContent from "@/components/reactbits/AnimatedContent";
import { HowCompare as SharedCompare } from "../../v1/home/HowCompare";

// "See how HAX elevates the AI experience": the shared "With and without HAX" section that v1, v2
// and v3 render too (v1/home/HowCompare.tsx, built from the library's own parts), on a pale band
// across the full width of the screen (19 Nov; it was an inset rounded panel) so its white cards
// stand off the page. The band rises and settles to full size as it scrolls in (React Bits
// AnimatedContent), as on v3.
export function HowCompare() {
  return (
    <div className="py-[24px]">
      <AnimatedContent distance={64} duration={1.1} ease="power4.out" scale={0.94} initialOpacity={0} threshold={0.12}>
        <div className="hx6-compare relative overflow-clip">
          <SharedCompare />
        </div>
      </AnimatedContent>
    </div>
  );
}
