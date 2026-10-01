"use client";

import { useEffect, useRef } from "react";

/**
 * Wraps an embedded pattern component and reports its rendered height to the
 * parent window (cross-origin) so a host iframe can size itself to content.
 */
export function EmbedFrame({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const post = () => {
      const height = Math.ceil(el.getBoundingClientRect().height);
      window.parent?.postMessage({ type: "ioc-embed-height", slug, height }, "*");
    };

    post();
    const ro = new ResizeObserver(post);
    ro.observe(el);
    const t = window.setInterval(post, 1000); // catch late async layout
    return () => {
      ro.disconnect();
      window.clearInterval(t);
    };
  }, [slug]);

  return (
    <div ref={ref} className="embed-frame">
      {children}
    </div>
  );
}
