"use client";

import { useState } from "react";

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ready"; prompt: string }
  | { kind: "error"; message: string };

export function ConnectPanel() {
  const [label, setLabel] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });
  const [copied, setCopied] = useState(false);

  async function generate() {
    setState({ kind: "loading" });
    setCopied(false);
    try {
      const res = await fetch("/api/connect/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, email }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setState({ kind: "error", message: data?.error ?? "Something went wrong." });
        return;
      }
      setState({ kind: "ready", prompt: data.prompt });
    } catch {
      setState({ kind: "error", message: "Network error. Please try again." });
    }
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard may be blocked; the user can select manually */
    }
  }

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold text-ink sm:text-3xl">
          Connect your AI tool
        </h1>
        <p className="text-sm leading-relaxed text-muted">
          Generate a one-time prompt, paste it into your coding agent (Cursor,
          Claude Code, Codex, or any MCP client), and it sets itself up — it
          provisions its own access token and wires up the HAX pattern server
          for you. No config files, no token-copying.
        </p>
      </header>

      <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="label" className="block text-sm font-semibold text-ink">
              Your name or team <span className="font-normal text-muted">(optional)</span>
            </label>
            <input
              id="label"
              type="text"
              placeholder="e.g. Maya / Cloud Control"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="mt-2 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-accent"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-ink">
              Email <span className="font-normal text-muted">(optional)</span>
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-accent"
            />
          </div>
        </div>
        <p className="mt-3 text-xs text-muted">
          Both are optional — they just help attribute usage. Your tool can also
          fill in your email automatically when it runs the prompt.
        </p>
        <button
          type="button"
          onClick={generate}
          disabled={state.kind === "loading"}
          className="mt-4 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-h disabled:opacity-60"
        >
          {state.kind === "loading" ? "Generating…" : "Generate connect prompt"}
        </button>
        {state.kind === "error" && (
          <p className="mt-3 text-sm text-red-600">{state.message}</p>
        )}
      </div>

      {state.kind === "ready" && (
        <div className="space-y-3 rounded-2xl border border-line bg-hover p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink">Your connect prompt</p>
              <p className="mt-1 text-xs text-muted">
                Copy it, paste it into your coding agent, and let it run. It will
                set up the MCP server and confirm the tools are connected.
              </p>
            </div>
            <button
              type="button"
              onClick={() => copy(state.prompt)}
              className="shrink-0 rounded-lg border border-line bg-white px-3.5 py-2 text-sm font-semibold text-ink transition hover:bg-hover"
            >
              {copied ? "Copied ✓" : "Copy"}
            </button>
          </div>
          <pre className="max-h-96 overflow-auto rounded-lg border border-line bg-white p-4 font-mono text-xs leading-relaxed text-ink">
            {state.prompt}
          </pre>
          <p className="text-xs text-muted">
            This prompt contains a key unique to you — anyone who runs it provisions
            a token tied to your name, so keep it to yourself.
          </p>
        </div>
      )}
    </div>
  );
}
