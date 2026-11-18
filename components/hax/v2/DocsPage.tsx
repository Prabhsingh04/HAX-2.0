import { CodeBlock } from "../v1/CodeBlock";
import { Weave } from "./Weave";
import { INSTALL, TW, CSS, CHAT, PACKAGES } from "./content";

// Figma: HAX v2 · Docs 102:2134 (🌐 Website v2)
const h2 = "text-[36px] font-semibold leading-[40px] tracking-[-0.01em] text-[color:var(--ink)]";
const desc = "max-w-[760px] text-[16px] leading-[24px] text-[color:var(--grey)] [text-wrap:pretty]";

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="hx2-reveal px-[120px]">
      <div className="h-px w-full bg-[color:var(--line)]" />
      <div className="flex gap-[64px] pb-[80px] pt-[56px]">
        <h2 className={`${h2} w-[256px] shrink-0 [text-wrap:balance]`}>{title}</h2>
        <div className="flex w-[880px] flex-col gap-[24px]">{children}</div>
      </div>
    </section>
  );
}

export function DocsPage() {
  return (
    <>
      <section className="relative h-[600px] px-[120px] pt-[168px]">
        <Weave row0={0} fade={{ top: 140, bottom: 300 }} />
        <div className="relative flex max-w-[760px] flex-col gap-[24px]">
          <nav aria-label="Breadcrumb" className="hx2-rise flex w-fit items-center gap-[8px] rounded-full border border-[color:var(--line)] bg-[color:var(--card)] px-[12px] py-[4px] font-[family-name:var(--font-mono)] text-[12px] font-medium uppercase leading-[16px] tracking-[0.04em]">
            <span className="size-[8px] rounded-full bg-[color:var(--orange)]" />
            <a href="/v2/hax-docs" className="hx2-link text-[color:var(--grey)]">Docs</a>
            <span aria-hidden className="text-[color:var(--grey)]">/</span>
            <span className="text-[color:var(--ink)]">React</span>
          </nav>
          <h1 className="hx2-h1 hx2-rise hx2-rise--2 text-[72px] font-semibold leading-[72px] tracking-[-0.03em]">The agentic UI library<br />for React.</h1>
          <p className="hx2-rise hx2-rise--3 w-[640px] text-[18px] leading-[28px] text-[color:var(--grey)]">
            HAX ships every pattern in this library as a real, installable React component. One umbrella package, about 50 focused sub-packages, Tailwind-native theming, TypeScript throughout. The same components the Meeting Summariser is built from.
          </p>
        </div>
      </section>
      <Section id="install" title="Install">
        <p className={desc}>The umbrella package re-exports every component; you can also install any sub-package on its own.</p>
        <CodeBlock code={INSTALL} className="w-[880px]" />
      </Section>
      <Section id="theming" title="Set up theming">
        <p className={desc}>Components are styled with Tailwind utilities bound to design tokens in @hax/tokens. Add the preset, scan the compiled components, and import the token stylesheet.</p>
        <CodeBlock code={TW} label="tailwind.config.js" className="w-[880px]" />
        <CodeBlock code={CSS} label="index.css" className="w-[880px]" />
        <p className={desc}>Toggle dark mode with a .dark class on a parent element. Tokens cover colour, radius, and the keyframes for caret blink, typing dots and fade in.</p>
      </Section>
      <Section id="quick-start" title="Quick start: an agent chat">
        <p className={desc}>A scrolling transcript with auto-pin, streamed assistant messages, and a composer that submits on Enter.</p>
        <CodeBlock code={CHAT} label="Chat.jsx" className="w-[880px]" />
      </Section>
      <Section id="packages" title="Packages">
        <p className={desc}>About 50 sub-packages under the @hax/* scope. Import from the umbrella (@hax/react) or per package. Every export is typed.</p>
        <div className="grid grid-cols-2 gap-[24px]">
          {PACKAGES.map(([t, d, pk]) => (
            <div key={t} className="flex flex-col gap-[8px] rounded-[16px] bg-[color:var(--fill)] p-[24px]">
              <h3 className="text-[18px] font-semibold leading-[28px]">{t}</h3>
              <p className="text-[14px] leading-[20px] text-[color:var(--grey)]">{d}</p>
              <div className="mt-[8px] flex flex-wrap gap-[6px]">
                {pk.map((p) => <code key={p} className="rounded-[6px] border border-[color:var(--line)] bg-[color:var(--card)] px-[8px] py-[4px] font-[family-name:var(--font-mono)] text-[12px] leading-[16px]">{p}</code>)}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
