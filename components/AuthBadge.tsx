"use client";

import { useEffect, useState } from "react";

/**
 * Compact sign-in state for the chat. Shows "Sign in to save chats" when the
 * visitor is a guest, or their email + Sign out when signed in. Pinned to the
 * top-right of the advisor so it doesn't disturb the chat layout.
 */
export function AuthBadge() {
  const [email, setEmail] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setEmail(d.email ?? null))
      .catch(() => setEmail(null));
  }, []);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    window.location.reload();
  }

  if (email === undefined) return null; // still loading — render nothing

  return (
    <div className="pointer-events-auto absolute right-4 top-3 z-20 flex items-center gap-2 text-xs">
      {email ? (
        <>
          <span
            className="hidden rounded-full border border-line bg-white px-2.5 py-1 font-medium text-muted sm:inline"
            title="Your chats are private to this account"
          >
            {email}
          </span>
          <button
            type="button"
            onClick={signOut}
            className="rounded-full border border-line bg-white px-2.5 py-1 font-semibold text-muted transition hover:bg-hover"
          >
            Sign out
          </button>
        </>
      ) : (
        <a
          href="/login"
          className="rounded-full border border-line bg-white px-3 py-1 font-semibold text-accent transition hover:bg-hover"
        >
          Sign in to save chats
        </a>
      )}
    </div>
  );
}
