import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/hax/v6/SiteShell";
import { PatternPage } from "@/components/hax/v6/patterns/PatternPage";
import { BY_ID, DATA } from "@/components/hax/v6/patterns/data";

// One page per pattern, Srishti's structure and her live previews (scripts/sync-hax-patterns.mjs).
export const dynamicParams = false;

export function generateStaticParams() {
  return DATA.patterns.filter((p) => p.page).map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = BY_ID.get(id);
  return p ? { title: `${p.name} · HAX v6`, description: p.summary } : { title: "Pattern not found · HAX v6" };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!BY_ID.get(id)?.page) notFound();
  return (
    <SiteShell>
      <PatternPage id={id} />
    </SiteShell>
  );
}
