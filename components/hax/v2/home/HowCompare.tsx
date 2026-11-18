import { HowCompare as PrabhCompare } from "../../v1/home/HowCompare";

// "With and without HAX": Prabh's original section, the same shared component v1 renders (his markup, script
// and scoped styles from public/hax/v1/compare/), so any change made there shows here too. The wrapper is
// positioned and see-through so the hero weave dissolves over its top instead of stopping at its edge.
export function HowCompare() {
  return (
    <div className="hx2-compare relative">
      <PrabhCompare />
    </div>
  );
}
