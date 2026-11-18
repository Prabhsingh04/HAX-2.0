import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/hax/v1/SiteShell";
import { PatternPage } from "@/components/hax/v1/library112/PatternPage";
import { BY_ID, LIBRARY } from "@/components/hax/v1/library112/library";

// One page per pattern, all 112 in the same structure (library112/PatternPage). Not
// /patterns/<id>: that path belongs to the IoC research pages (see patterns/href.ts).
export const dynamicParams = false;

export function generateStaticParams() {
  return LIBRARY.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = BY_ID.get(id);
  return p ? { title: `${p.name} · HAX`, description: p.summary } : { title: "Pattern not found · HAX" };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!BY_ID.has(id)) notFound();
  return (
    <SiteShell>
      <PatternPage id={id} />
    </SiteShell>
  );
}
