import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HAX v3 - AI UX Pattern Library",
  description: "A pattern language for agentic products. By Outshift.",
};

// Manrope + Geist Mono for v3; JetBrains Mono for v1's CodeBlock, which v3 imports.
export default function HaxV3Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700&family=Geist+Mono:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap" />
      {children}
    </>
  );
}
