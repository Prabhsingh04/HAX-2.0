import { PRINCIPLES, PRINCIPLE_LABEL, type PrincipleId } from "../patterns/model";

// "Five principles guide HAX" from Srishti's Studio v3 home (lib/v2/principles.ts, word for word),
// added on her call of 17 Nov ("we missed the principles"). The count is how many patterns name the
// principle as primary or also-supports (patterns/model.ts PRINCIPLES), so it follows the library.
const ORDER: [PrincipleId, string][] = [
  ["control", "People set an agent's boundaries, preferences, and goals; the agent adapts its autonomy to that direction."],
  ["clarity", "Agents make their reasoning, context, and confidence visible so people can assess decisions."],
  ["recovery", "People can undo agent actions, correct errors, and guide a safer next attempt."],
  ["collaboration", "People and agents share context, exchange input, and shape work together."],
  ["traceability", "Agent decisions and actions stay visible, searchable, and open to review."],
];
const related = (id: PrincipleId) =>
  Object.values(PRINCIPLES).filter((p) => p.primary[0] === id || p.also?.[0] === id).length;

export function Principles() {
  return (
    <section id="principles" className="flex w-full flex-col items-center px-[var(--hx-gutter)] py-[72px] md:py-[96px]">
      <div className="hx-reveal flex flex-col items-center gap-[16px] text-center">
        <h2 className="font-extralight leading-[42px] text-[34px] [text-wrap:balance] md:leading-[52px] md:text-[42px] xl:leading-[60px] xl:text-[50px] xl:whitespace-nowrap">Five principles guide HAX</h2>
        <p className="max-w-[640px] leading-[26px] text-[16px] text-[color:var(--text-secondary)] [text-wrap:balance]">
          They set the standard for trustworthy agent experiences. Each pattern shows which principle its behavior puts into practice.
        </p>
      </div>
      <div className="hx-reveal mt-[40px] grid w-full max-w-[1152px] grid-cols-1 gap-x-[32px] gap-y-[32px] sm:grid-cols-2 lg:grid-cols-5 xl:mt-[48px]">
        {ORDER.map(([id, line], i) => (
          <article key={id} className="flex flex-col gap-[10px] border-t-2 border-[color-mix(in_srgb,var(--hx-human)_45%,var(--stroke-default))] pt-[16px]">
            <p className="font-[family-name:var(--font-code)] leading-[16px] text-[12px] text-[color:var(--text-tertiary)]">{String(i + 1).padStart(2, "0")}</p>
            <h3 className="font-semibold leading-[30px] text-[22px] tracking-[-0.3px]">{PRINCIPLE_LABEL[id]}</h3>
            <p className="leading-[22px] text-[14px] text-[color:var(--text-secondary)]">{line}</p>
            <p className="mt-auto pt-[6px] font-[family-name:var(--font-code)] leading-[16px] text-[11.5px] text-[color:var(--text-secondary)]">{related(id)} related patterns</p>
          </article>
        ))}
      </div>
    </section>
  );
}
