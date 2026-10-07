"use client";

import { useState } from "react";

type Result =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "emailed"; message: string }
  | { kind: "token"; token: string; endpoint: string }
  | { kind: "error"; message: string };

export function AccessSignup() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<Result>({ kind: "idle" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setResult({ kind: "loading" });
    try {
      const res = await fetch("/api/access/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ kind: "error", message: data?.error ?? "Something went wrong." });
        return;
      }
      if (data.emailed) {
        setResult({ kind: "emailed", message: data.message });
      } else {
        setResult({ kind: "token", token: data.token, endpoint: data.endpoint });
      }
    } catch {
      setResult({ kind: "error", message: "Network error. Please try again." });
    }
  }

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold text-ink sm:text-3xl">
          Get your access token
        </h1>
        <p className="text-sm leading-relaxed text-muted">
          Enter your email and we&apos;ll send you a personal token for the hosted
          IoC Patterns MCP server. Use it to connect Cursor, Claude Code, Codex,
          or Claude Desktop — no install required.
        </p>
      </header>

      <form
        onSubmit={submit}
        className="rounded-2xl border border-line bg-white p-6 shadow-sm"
      >
        <label htmlFor="email" className="block text-sm font-semibold text-ink">
          Work email
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
            disabled={result.kind === "loading"}
            className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-accent disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={result.kind === "loading"}
            className="shrink-0 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-h disabled:opacity-60"
          >
            {result.kind === "loading" ? "Sending…" : "Send my token"}
          </button>
        </div>

        {result.kind === "error" && (
          <p className="mt-3 text-sm text-red-600">{result.message}</p>
        )}
      </form>

      {result.kind === "emailed" && (
        <div className="rounded-2xl border border-line bg-hover p-6">
          <p className="text-sm font-semibold text-ink">Check your inbox ✉️</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">{result.message}</p>
        </div>
      )}

      {result.kind === "token" && (
        <div className="space-y-4 rounded-2xl border border-line bg-hover p-6">
          <div>
            <p className="text-sm font-semibold text-ink">Your access token</p>
            <p className="mt-1 text-xs text-muted">
              Email isn&apos;t configured in this environment, so here&apos;s your
              token directly. Copy it now — it won&apos;t be shown again.
            </p>
          </div>
          <code className="block break-all rounded-lg border border-line bg-white px-3.5 py-3 font-mono text-xs text-ink">
            {result.token}
          </code>
          <div>
            <p className="text-sm font-semibold text-ink">Endpoint</p>
            <code className="mt-1 block break-all rounded-lg border border-line bg-white px-3.5 py-3 font-mono text-xs text-ink">
              {result.endpoint}
            </code>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-ink">How to use it</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Send the token as a bearer token with each request:
        </p>
        <code className="mt-3 block break-all rounded-lg bg-hover px-3.5 py-3 font-mono text-xs text-ink">
          Authorization: Bearer ioc_…
        </code>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          See the{" "}
          <a href="/setup" className="font-semibold text-accent hover:underline">
            Setup Guide
          </a>{" "}
          for per-tool configuration.
        </p>
      </div>
    </div>
  );
}
