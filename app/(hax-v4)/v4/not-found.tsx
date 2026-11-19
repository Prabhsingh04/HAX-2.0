import { SiteShell } from "@/components/hax/v6/SiteShell";

// Unknown /v4 addresses (the catch-all next to this file) and pattern ids that don't exist land here,
// inside v6's nav and footer, instead of the IoC app's plain 404.
export default function NotFound() {
  return (
    <SiteShell>
      <title>Page not found · HAX v4</title>
      <section className="flex min-h-[72vh] flex-col items-center justify-center gap-[20px] px-[24px] pb-[96px] pt-[136px] text-center">
        <p className="font-[family-name:var(--font-mono)] text-[12px] font-medium uppercase leading-[16px] tracking-[0.96px] text-[color:var(--link)]">404</p>
        <h1 className="font-light text-[clamp(36px,4.6vw,60px)] leading-[1.05] tracking-[-0.03em]">This page isn’t here.</h1>
        <p className="max-w-[520px] text-[18px] leading-[28px] text-[color:var(--text-2)] max-md:text-[16px] max-md:leading-[26px]">The address may have changed. Try the pattern library, or start again from the home page.</p>
        <div className="flex flex-wrap justify-center gap-[12px] pt-[8px]">
          <a href="/v4/patterns" className="h6-btn h6-btn--primary inline-flex items-center rounded-[8px] px-[16px] py-[8px] font-semibold leading-[24px] text-[16px]">Browse patterns</a>
          <a href="/v4" className="h6-btn h6-btn--secondary inline-flex items-center rounded-[8px] px-[16px] py-[8px] font-semibold leading-[24px] text-[16px]">Home</a>
        </div>
      </section>
    </SiteShell>
  );
}
