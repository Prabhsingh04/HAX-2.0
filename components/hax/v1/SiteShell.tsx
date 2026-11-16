"use client";
import "./tokens.css";
import "./motion.css";
import { Header, AnnouncementBar } from "./Header";
import { Footer } from "./Footer";
import { ChatButton } from "./ChatButton";
import { useSiteMotion } from "./useSiteMotion";
import { BlobLayer } from "./BlobLayer";

// `blobs`: the drifting gradient background (BlobLayer). Only the home page uses it.
export function SiteShell({ children, announcement = false, blobs = false }: { children: React.ReactNode; announcement?: boolean; blobs?: boolean }) {
  useSiteMotion();
  return (
    // overflow-x clip (not hidden) keeps the sticky header and steps working, and stops full-width
    // sections (Four ways in) adding a sideways scroll
    <div className="hax-v1 min-h-screen w-full overflow-x-clip">
      {blobs && <BlobLayer drive />}
      <Header />
      {/* above the fixed blob layer (z-0) */}
      <div className="relative z-[1]">
        {announcement && <AnnouncementBar />}
        <main className="mx-auto w-full max-w-[1440px]">{children}</main>
        <Footer />
      </div>
      <ChatButton />
    </div>
  );
}
