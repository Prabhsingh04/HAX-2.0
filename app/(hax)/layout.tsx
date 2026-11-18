import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HAX - AI UX Pattern Library",
  description: "A pattern language for agentic products. By Outshift.",
};

// The v3 branch has no theme switch, so no saved theme is applied: these pages stay light.
export default function HaxLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap" />
      {children}
    </>
  );
}
