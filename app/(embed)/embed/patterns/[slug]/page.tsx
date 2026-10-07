import { notFound } from "next/navigation";
import {
  PATTERN_STANDALONE,
  hasPatternStandalone,
} from "@/components/patterns/pattern-registry";
import { EmbedFrame } from "./EmbedFrame";

/**
 * Bare, header-less render of a pattern's standalone reference component.
 * Meant to be iframed by other apps: /embed/patterns/<slug>
 *
 * Pre-rendered (SSG) for the slugs that have a standalone component, so the
 * route also works in the static export (reviewa).
 */
export function generateStaticParams() {
  return Object.keys(PATTERN_STANDALONE).map((slug) => ({ slug }));
}
export default async function EmbedPatternPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!hasPatternStandalone(slug)) {
    notFound();
  }

  const Standalone = PATTERN_STANDALONE[slug]!;

  return (
    <EmbedFrame slug={slug}>
      <Standalone />
    </EmbedFrame>
  );
}
