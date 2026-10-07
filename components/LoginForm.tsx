"use client";

import { useEffect, useState } from "react";

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "sent"; message: string }
  | { kind: "devlink"; link: string }
  | { kind: "error"; message: string };

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });
  const [linkError, setLinkError] = useState<"expired" | "used" | null>(null);

  useEffect(() => {
    const err = new URLSearchParams(window.location.search).get("error");
    if (err === "expired" || err === "used") setLinkError(err);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState({ kind: "loading" });
    try {
      const res = await fetch("/api/auth/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState({ kind: "error", message: data?.error ?? "Something went wrong." });
        return;
      }
      if (data.emailed) {
        setState({ kind: "sent", message: data.message });
      } else {
        setState({ kind: "devlink", link: data.link });
      }
    } catch {
      setState({ kind: "error", message: "Network error. Please try again." });
    }
  }

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold text-ink sm:text-3xl">Sign in</h1>
        <p className="text-sm leading-relaxed text-muted">
          Sign in with your email to keep your chat history private to you and
          picked up across sessions. We&apos;ll email you a one-time sign-in link —
          no password.
        </p>
      </header>

      {linkError && state.kind === "idle" && (
        <p className="rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-800">
          {linkError === "used"
            ? "That sign-in link was already used. Request a fresh one below."
            : "That sign-in link expired or was invalid. Request a new one below."}
        </p>
      )}

      <form
        onSubmit={submit}
        className="rounded-2xl border border-line bg-white p-6 shadow-sm"
      >
        <label htmlFor="email" className="block text-sm font-semibold text-ink">
          Email
        </label>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={state.kind === "loading"}
            className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-accent disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={state.kind === "loading"}
            className="shrink-0 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-h disabled:opacity-60"
          >
            {state.kind === "loading" ? "Sending…" : "Email me a link"}
          </button>
        </div>
        {state.kind === "error" && (
          <p className="mt-3 text-sm text-red-600">{state.message}</p>
        )}
      </form>

      {state.kind === "sent" && (
        <div className="rounded-2xl border border-line bg-hover p-6">
          <p className="text-sm font-semibold text-ink">Check your inbox ✉️</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">{state.message}</p>
        </div>
      )}

      {state.kind === "devlink" && (
        <div className="space-y-3 rounded-2xl border border-line bg-hover p-6">
          <p className="text-sm font-semibold text-ink">Dev sign-in link</p>
          <p className="text-xs text-muted">
            Email isn&apos;t configured here, so use this link directly:
          </p>
          <a
            href={state.link}
            className="block break-all font-mono text-xs text-accent hover:underline"
          >
            {state.link}
          </a>
        </div>
      )}
    </div>
  );
}
