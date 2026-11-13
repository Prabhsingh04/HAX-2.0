import { HowCompare as PrabhCompare } from "../../v1/home/HowCompare";

// "See how HAX elevates the AI experience": Prabh's original "With and without HAX"
// section, the same shared component v1 and v2 render (his markup, script and scoped
// styles from public/hax/v1/compare/), so any change made there shows here too. v3 is
// always dark: .hx3-compare maps his colours onto v3's palette (tokens.css), and the
// section is see-through so it sits on the v3 page colour.
export function HowCompare() {
  return (
    <div className="hx3-compare relative">
      <PrabhCompare />
    </div>
  );
}
