"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  MessageCircle,
  Server,
  Terminal,
} from "lucide-react";
import { patterns } from "@/lib/patterns";

const PATTERN_COUNT = patterns.length;

// ---- Hosted MCP endpoint ---------------------------------------------------

const MCP_ENDPOINT = "https://ioc-patterns.intelligaia.com/api/mcp";
const MCP_AUTH_HEADER = "Basic Y2lzY286SEFYMi1QYXR0ZXJucy0yMDI2";
const MCP_BEARER_TOKEN = "ioc-mcp-df675e7b40fc08e4b340";

const ENDPOINT_BLOCK = `Endpoint:   ${MCP_ENDPOINT}
Transport:  MCP Streamable HTTP
Auth:       Authorization: ${MCP_AUTH_HEADER}
   or:      Authorization: Bearer ${MCP_BEARER_TOKEN}  (for Codex)`;

const CURSOR_CONFIG = `{
  "mcpServers": {
    "ioc-patterns": {
      "url": "${MCP_ENDPOINT}",
      "headers": { "Authorization": "${MCP_AUTH_HEADER}" }
    }
  }
}`;

const CLAUDE_CODE_CMD = `claude mcp add --transport http ioc-patterns ${MCP_ENDPOINT} \\
  --header "Authorization: ${MCP_AUTH_HEADER}"`;

const CODEX_CMD = `# Codex uses a Bearer token — set it as an env var, then add the server
export IOC_MCP_TOKEN="${MCP_BEARER_TOKEN}"

codex mcp add ioc-patterns --url ${MCP_ENDPOINT} \\
  --bearer-token-env-var IOC_MCP_TOKEN`;

const CLAUDE_DESKTOP_CONFIG = `{
  "mcpServers": {
    "ioc-patterns": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "${MCP_ENDPOINT}",
        "--header",
        "Authorization:\${AUTH_HEADER}"
      ],
      "env": { "AUTH_HEADER": "${MCP_AUTH_HEADER}" }
    }
  }
}`;

type ConnectMethod = {
  tool: string;
  where: string;
  note?: string;
  codeTitle: string;
  code: string;
};

const CONNECT_METHODS: ConnectMethod[] = [
  {
    tool: "Cursor",
    where: "Create .cursor/mcp.json in your project (or ~/.cursor/mcp.json for all projects).",
    codeTitle: ".cursor/mcp.json",
    code: CURSOR_CONFIG,
  },
  {
    tool: "Claude Code (CLI)",
    where: "Run this one command in your project.",
    codeTitle: "terminal",
    code: CLAUDE_CODE_CMD,
  },
  {
    tool: "Codex (CLI)",
    where: "Run these in your terminal. Codex connects to the streamable-HTTP server with a bearer token.",
    codeTitle: "terminal",
    code: CODEX_CMD,
  },
  {
    tool: "Claude Desktop",
    where: "Settings → Developer → Edit Config. Needs Node.js installed (for the mcp-remote bridge), then fully restart the app.",
    note: "Claude Desktop can't connect to a remote MCP URL directly, so this runs a small local bridge that forwards to it.",
    codeTitle: "claude_desktop_config.json",
    code: CLAUDE_DESKTOP_CONFIG,
  },
];

const MCP_TOOLS = [
  { name: "discover_patterns", desc: "Semantic search — the best-fit patterns for a described situation." },
  { name: "list_patterns", desc: "The entire catalogue (all patterns), unranked." },
  { name: "fetch_pattern", desc: "Full definition for one pattern: metadata, structure, UI spec." },
  { name: "instantiate_pattern", desc: "Create a live instance of a pattern with its own state." },
  { name: "update_instance", desc: "Merge new fields into an instance's state." },
  { name: "get_instance", desc: "Read the current snapshot of an instance." },
  { name: "list_installations", desc: "List the instances an agent has created." },
  { name: "handoff", desc: "Carry context from one pattern instance into another." },
] as const;

const TEST_PROMPT =
  "Use the ioc-patterns tools to find the right pattern for when two of my agents disagree, and show me why it fits.";

// ---- Advanced: run from source (optional) ----------------------------------

const REQUIREMENTS = [
  { label: "An MCP-capable tool (Cursor, Claude Code, or Claude Desktop)", required: true },
  { label: "The endpoint URL + auth header (shown below)", required: true },
  { label: "Node.js 18+ — only for Claude Desktop's mcp-remote bridge", required: false },
] as const;

const LOCAL_STEPS = [
  {
    title: "Clone and install",
    command: "git clone <repo-url> && cd ioc-patterns && npm install",
    body: "Pull the source and install dependencies, including the pattern registry and tooling.",
  },
  {
    title: "Verify the registry",
    command: "npm run mcp",
    body: `Loads the registry and prints one line per pattern. Expect "Registry initialized with ${PATTERN_COUNT} patterns".`,
  },
  {
    title: "Run the stdio MCP server",
    command: "npm run mcp:stdio",
    body: "Serves the same tools over stdio — point a local MCP client at this process instead of the hosted URL.",
  },
  {
    title: "Or run the full web app",
    command: "npm run dev",
    body: "Starts the Next.js app (advisor chat, gallery, and the HTTP API) on http://localhost:3000.",
  },
] as const;

const TROUBLESHOOTING = [
  {
    question: "Connects but shows 401 / Unauthorized",
    answer:
      "The Authorization header is missing or wrong. Make sure it's exactly \"Authorization: Basic …\" with the token above. GUI connectors that only accept a URL (no header field) will 401 — use Cursor, Claude Code, or the Claude Desktop bridge instead.",
  },
  {
    question: "Claude Desktop won't connect",
    answer:
      "It needs Node.js installed (for npx mcp-remote) and a full quit-and-reopen after editing the config. If it still fails, clear the bridge cache with rm -rf ~/.mcp-auth and restart.",
  },
  {
    question: "The tool list is empty",
    answer:
      "Confirm the server shows Connected in your client, then re-list. In Claude Code: claude mcp list. In Cursor: Settings → MCP.",
  },
  {
    question: "\"all patterns\" only returns some",
    answer:
      "discover_patterns is a ranked search (top results only). To load the whole catalogue, call list_patterns instead.",
  },
  {
    question: "Header value gets split (mcp-remote)",
    answer:
      "Older mcp-remote splits the header on spaces. The config above passes the value via an env var (Authorization:${AUTH_HEADER}) to avoid that.",
  },
] as const;

const NEXT_STEPS = [
  {
    label: "Open the advisor",
    href: "/advisor",
    description: "Describe a situation in plain language and get a recommended pattern.",
    icon: MessageCircle,
  },
  {
    label: "Browse the patterns",
    href: "/gallery",
    description: `Explore all ${PATTERN_COUNT} research-backed patterns.`,
    icon: BookOpen,
  },
] as const;

// ---- UI helpers ------------------------------------------------------------

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      type="button"
      onClick={() => void copy()}
      className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs font-semibold text-muted transition hover:bg-hover"
    >
      <Copy className="h-3.5 w-3.5" />
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function CodeBlock({
  code,
  title,
  showCopy = true,
}: {
  code: string;
  title?: string;
  showCopy?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-hover">
      {title ? (
        <div className="flex items-center justify-between gap-3 border-b border-line bg-white px-4 py-2.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-subtle">
            {title}
          </span>
          {showCopy ? <CopyButton text={code} /> : null}
        </div>
      ) : null}
      <div className="relative">
        {!title && showCopy ? (
          <div className="absolute right-3 top-3">
            <CopyButton text={code} />
          </div>
        ) : null}
        <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed text-ink">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-1 font-heading text-2xl font-bold text-ink sm:text-3xl">
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function ConnectCard({ method }: { method: ConnectMethod }) {
  return (
    <article className="rounded-2xl border border-line bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-ink">{method.tool}</h3>
      <p className="mt-1 text-sm text-muted">{method.where}</p>
      {method.note ? (
        <p className="mt-3 rounded-lg bg-hover px-3 py-2 text-sm leading-relaxed text-muted">
          {method.note}
        </p>
      ) : null}
      <div className="mt-4">
        <CodeBlock code={method.code} title={method.codeTitle} />
      </div>
    </article>
  );
}

function LocalStepCard({
  step,
  title,
  command,
  body,
}: {
  step: number;
  title: string;
  command: string;
  body: string;
}) {
  return (
    <article className="rounded-2xl border border-line bg-white p-6 shadow-sm">
      <div className="flex gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
          {step}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-ink">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
          <div className="mt-4">
            <CodeBlock code={command} />
          </div>
        </div>
      </div>
    </article>
  );
}

function Checklist({
  items,
  requiredFlags,
}: {
  items: readonly string[];
  requiredFlags?: readonly boolean[];
}) {
  return (
    <ul className="space-y-3">
      {items.map((item, index) => {
        const optional = requiredFlags?.[index] === false;
        return (
          <li key={item} className="flex items-start gap-3 text-sm text-muted">
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ring-1 ${
                optional
                  ? "bg-hover text-slate-400 ring-slate-200"
                  : "bg-emerald-50 text-emerald-600 ring-emerald-200"
              }`}
            >
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
            <span>
              {item}
              {optional ? (
                <span className="ml-1.5 text-xs text-subtle">(optional)</span>
              ) : null}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function AccordionItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-line last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
        aria-expanded={open}
      >
        <span className="font-medium text-ink">{question}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="pb-4 text-sm leading-relaxed text-muted">{answer}</p>
        </div>
      </div>
    </div>
  );
}

function ArchitectureDiagram() {
  const layers = [
    { label: "Your AI tool", sub: "Cursor · Claude Code · Claude Desktop", tone: "bg-white" },
    { label: "IoC MCP endpoint", sub: "/api/mcp · Streamable HTTP + Basic auth", tone: "bg-[var(--color-tag-bg)]" },
    { label: "Pattern engine", sub: "8 tools: discover · fetch · instantiate · …", tone: "bg-[var(--color-tag-bg)]" },
    { label: "Pattern library", sub: `${PATTERN_COUNT} research-backed patterns`, tone: "bg-hover" },
  ];

  return (
    <div className="rounded-2xl border border-line bg-white p-6">
      <div className="space-y-2">
        {layers.map((layer, index) => (
          <div key={layer.label}>
            <div className={`rounded-xl border border-line px-4 py-3 ${layer.tone}`}>
              <p className="font-semibold text-ink">{layer.label}</p>
              <p className="mt-0.5 text-sm text-muted">{layer.sub}</p>
            </div>
            {index < layers.length - 1 ? (
              <div className="flex justify-center py-1" aria-hidden>
                <ArrowRight className="h-4 w-4 rotate-90 text-slate-300" />
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        Your tool talks to one URL. The MCP server does the rest — it holds the
        patterns and exposes them as tools. Your app or editor never needs the
        pattern source; it just calls the endpoint.
      </p>
    </div>
  );
}

// ---- Page ------------------------------------------------------------------

export function SetupGuide() {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-line bg-gradient-to-b from-[var(--color-tag-bg)] to-bg">
        <div className="mx-auto max-w-4xl px-6 py-16 sm:px-8 sm:py-20">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent text-white shadow-lg shadow-[var(--color-shadow)]">
              <Terminal className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-accent">
                Setup guide
              </p>
              <h1 className="mt-1 font-heading text-4xl font-bold tracking-tight text-ink sm:text-5xl">
                Connect to the IoC MCP server
              </h1>
              <p className="mt-3 max-w-2xl text-lg text-muted">
                Point your AI tool at one hosted URL and get research-backed
                interaction patterns — discover, fetch, and instantiate them,
                right inside your editor. No install, no repo to clone.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-20 px-6 py-16 sm:px-8 sm:py-20">
        <Section eyebrow="Overview" title="What this is">
          <div className="rounded-2xl border border-line bg-hover p-6">
            <div className="flex gap-4">
              <Server className="mt-0.5 h-6 w-6 shrink-0 text-accent" />
              <div className="space-y-4 text-sm leading-relaxed text-muted sm:text-base">
                <p>
                  The <strong className="font-semibold text-ink">IoC MCP server</strong> is a
                  hosted library of {PATTERN_COUNT} research-backed human–agent interaction
                  patterns, exposed over the Model Context Protocol. Any MCP-capable tool
                  can connect by URL and ask it which pattern fits a situation, then fetch
                  the pattern&apos;s structure and spin up live instances.
                </p>
                <p>
                  It has <strong className="font-semibold text-ink">no UI of its own</strong> — it
                  returns structured data, so your app or editor renders it in your own
                  design system.
                </p>
              </div>
            </div>
          </div>
        </Section>

        <Section eyebrow="Before you begin" title="What you need">
          <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
            <Checklist
              items={REQUIREMENTS.map((item) => item.label)}
              requiredFlags={REQUIREMENTS.map((item) => item.required)}
            />
          </div>
        </Section>

        <Section eyebrow="Endpoint" title="The connection details">
          <CodeBlock code={ENDPOINT_BLOCK} title="ioc-patterns MCP" />
          <p className="mt-3 text-sm text-muted">
            Auth is a shared token for now. GUI &ldquo;add connector&rdquo; flows that only
            take a URL (no header field) won&apos;t work — use one of the methods below,
            which all pass the header.
          </p>
        </Section>

        <Section eyebrow="Connect" title="Connect your AI tool">
          <p className="-mt-2 mb-6 text-sm text-muted">
            Pick the tool you use. Each takes under a minute.
          </p>
          <div className="space-y-4">
            {CONNECT_METHODS.map((method) => (
              <ConnectCard key={method.tool} method={method} />
            ))}
          </div>
        </Section>

        <Section eyebrow="Verify" title="Try it">
          <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
            <p className="text-sm leading-relaxed text-muted">
              Once connected, ask your tool to use the pattern tools — for example:
            </p>
            <div className="mt-4">
              <CodeBlock code={TEST_PROMPT} />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              It should call <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">discover_patterns</code>,
              return a match (e.g. Convergence Point), and explain why it fits.
            </p>
          </div>
        </Section>

        <Section eyebrow="Reference" title="The tools">
          <div className="grid gap-3 sm:grid-cols-2">
            {MCP_TOOLS.map((tool) => (
              <div
                key={tool.name}
                className="rounded-xl border border-line bg-white p-4 shadow-sm"
              >
                <code className="font-mono text-sm font-semibold text-ink">
                  {tool.name}
                </code>
                <p className="mt-1 text-sm leading-relaxed text-muted">{tool.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section eyebrow="How it works" title="The flow">
          <ArchitectureDiagram />
        </Section>

        <Section eyebrow="Advanced" title="Run it from source (optional)">
          <button
            type="button"
            onClick={() => setAdvancedOpen((value) => !value)}
            className="flex w-full items-center justify-between gap-4 rounded-2xl border border-line bg-white px-6 py-4 text-left shadow-sm transition hover:bg-hover"
            aria-expanded={advancedOpen}
          >
            <span className="text-sm text-muted">
              Most people just connect to the hosted URL above. If you want to run the
              server yourself (locally or on your own host), expand this.
            </span>
            <ChevronDown
              className={`h-5 w-5 shrink-0 text-slate-400 transition ${advancedOpen ? "rotate-180" : ""}`}
            />
          </button>
          {advancedOpen ? (
            <div className="mt-4 space-y-4">
              {LOCAL_STEPS.map((step, index) => (
                <LocalStepCard
                  key={step.title}
                  step={index + 1}
                  title={step.title}
                  command={step.command}
                  body={step.body}
                />
              ))}
            </div>
          ) : null}
        </Section>

        <Section eyebrow="Help" title="Troubleshooting">
          <div className="rounded-2xl border border-line bg-white px-6 shadow-sm">
            {TROUBLESHOOTING.map((item) => (
              <AccordionItem
                key={item.question}
                question={item.question}
                answer={item.answer}
              />
            ))}
          </div>
        </Section>

        <Section eyebrow="Next" title="Where to go next">
          <div className="grid gap-4 sm:grid-cols-2">
            {NEXT_STEPS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group flex items-start gap-4 rounded-2xl border border-line bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <item.icon className="mt-0.5 h-6 w-6 shrink-0 text-accent" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 font-semibold text-ink">
                    {item.label}
                    <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-accent" />
                  </div>
                  <p className="mt-1 text-sm text-muted">{item.description}</p>
                </div>
              </Link>
            ))}
            <a
              href="https://github.com/intelligaia/ioc-mcp-demo"
              target="_blank"
              rel="noreferrer"
              className="group flex items-start gap-4 rounded-2xl border border-line bg-white p-6 shadow-sm transition hover:shadow-md sm:col-span-2"
            >
              <ExternalLink className="mt-0.5 h-6 w-6 shrink-0 text-accent" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 font-semibold text-ink">
                  Example: ioc-mcp-demo
                </div>
                <p className="mt-1 text-sm text-muted">
                  A standalone app that connects to this endpoint and renders a pattern
                  with a real design system — none of the IoC source inside it.
                </p>
              </div>
            </a>
          </div>
        </Section>
      </div>
    </div>
  );
}
