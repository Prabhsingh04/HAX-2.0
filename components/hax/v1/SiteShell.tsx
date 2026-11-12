"use client";
import "./tokens.css";
import "./motion.css";
import { Header, AnnouncementBar } from "./Header";
import { Footer } from "./Footer";
import { ChatButton } from "./ChatButton";
import { useSiteMotion } from "./useSiteMotion";

export function SiteShell({ children, announcement = false }: { children: React.ReactNode; announcement?: boolean }) {
  useSiteMotion();
  return (
    <div className="hax-v1 min-h-screen w-full">
      <Header />
      {announcement && <AnnouncementBar />}
      <main className="mx-auto w-full max-w-[1440px]">{children}</main>
      <Footer />
      <ChatButton />
    </div>
  );
}
