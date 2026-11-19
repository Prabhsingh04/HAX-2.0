import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HAX v4 - AI UX Pattern Library",
  description: "One pattern library for people and agents working together at scale. By Outshift.",
};

// Manrope + Geist Mono, as v3; JetBrains Mono for v1's CodeBlock, which v6 imports. v6 is light only,
// so the v1 pages it shows (the library, the pattern pages) take v1's light theme: any dark theme
// left by v1's switch or by v3 is cleared on <html> before anything paints.
export default function HaxV6Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700&family=Geist+Mono:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap" />
      <script dangerouslySetInnerHTML={{ __html: 'document.documentElement.removeAttribute("data-hax-theme")' }} />
      {children}
    </>
  );
}
