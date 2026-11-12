import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HAX - AI UX Pattern Library",
  description: "A pattern language for agentic products. By Outshift.",
};

// Applies a saved dark theme before the page paints, so it never flashes light first.
// The header's theme switch writes "hax-theme"; light needs no attribute.
const THEME_SCRIPT = `try{if(localStorage.getItem("hax-theme")==="dark")document.documentElement.dataset.haxTheme="dark"}catch(e){}`;

export default function HaxLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap" />
      <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      {children}
    </>
  );
}
