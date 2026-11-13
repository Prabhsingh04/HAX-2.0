import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/hax/v1/SiteShell";
import { PatternDetail } from "@/components/hax/v1/patterns/PatternDetail";
import { BY_PATTERN, PATTERNS } from "@/components/hax/v1/patterns/model";

// One page per interaction pattern. Not /patterns/<id>: that path belongs to the IoC research
// pages in app/(site)/patterns/[slug] (see components/hax/v1/patterns/href.ts).
export const dynamicParams = false;

export function generateStaticParams() {
  return PATTERNS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = BY_PATTERN.get(id);
  return p ? { title: `${p.name} · HAX`, description: p.summary } : { title: "Pattern not found · HAX" };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!BY_PATTERN.has(id)) notFound();
  return (
    <SiteShell>
      <PatternDetail id={id} />
    </SiteShell>
  );
}
