import type { Metadata } from "next";

// HAX website v2 ("Wave"): Figma page 🌐 Website v2 (98:22790), file WHKYAV3BKe6iBdrxD4mzKU.
// Same content as v1 (components/hax/v1); only the look changes.
export const metadata: Metadata = {
  title: "HAX - AI UX Pattern Library",
  description: "A pattern language for agentic products. By Outshift.",
};

export default function HaxV2Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@400;500&family=JetBrains+Mono:wght@400;500;600&display=swap" />
      {/* the saved theme, before first paint (no flash) */}
      <script dangerouslySetInnerHTML={{ __html: `try{document.documentElement.dataset.hax2Theme=localStorage.getItem("hax-v2-theme")==="dark"?"dark":"light"}catch(e){}` }} />
      {children}
    </>
  );
}
