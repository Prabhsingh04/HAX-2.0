"use client";

import Link from "next/link";
import { Code2, LayoutGrid, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  PATTERN_INBOX,
  PATTERN_STANDALONE,
  hasPatternInbox,
  hasPatternStandalone,
} from "@/components/patterns/pattern-registry";
import type { ComponentDefinition } from "@/lib/pattern-advisor";
import { DraftParameterSummary } from "@/components/patterns/edit/EditPanelPreview";
import {
  buildInstantiateSnippet,
  buildInstanceTemplate,
} from "@/lib/pattern-preview-code";
import {
  hasUserScenario,
  resolveLivePreview,
} from "@/lib/pattern-live-preview";
import type { ConvergenceSaveRevealState } from "@/lib/convergence-save-reveal";
import { SaveProcessingOverlay } from "@/components/shared/SaveProcessingOverlay";
import {
  getGenericInterview,
  type InterviewAnswer,
} from "@/lib/patterns/generic-interview";

/** "Your scenario" card for patterns filled via the generic interview. */
function GenericScenarioCard({
  patternName,
  answers,
}: {
  patternName?: string;
  answers: InterviewAnswer[];
}) {
  return (
    <section className="mx-auto mb-4 w-full max-w-2xl overflow-hidden rounded-2xl border border-line bg-white">
      <div className="border-b border-line bg-hover/40 px-4 py-2.5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-subtle">
          Your scenario
        </h3>
        <p className="mt-0.5 text-xs text-muted">
          {patternName ?? "This pattern"}, from what you described
        </p>
      </div>
      <dl className="divide-y divide-line">
        {answers.map((a, i) => (
          <div key={i} className="px-4 py-3">
            <dt className="text-xs font-medium text-muted">{a.question}</dt>
            <dd className="mt-1 text-sm leading-relaxed text-ink">{a.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

type PatternDesignPreviewProps = {
  slug: string;
  patternName?: string;
  component?: ComponentDefinition;
  instanceState?: Record<string, unknown>;
  onClose?: () => void;
  onCustomise?: () => void;
  convergenceSaveReveal?: ConvergenceSaveRevealState;
  isSaving?: boolean;
};

type PreviewView = "design" | "code";

const VIEW_BTN =
  "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition";

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
      className="rounded-lg border border-line bg-white px-2 py-1 text-xs font-medium text-muted transition hover:bg-hover hover:text-ink"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function CodePanel({
  title,
  code,
}: {
  title: string;
  code: string;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-line bg-white">
      <div className="flex items-center justify-between gap-2 border-b border-line bg-hover/40 px-3 py-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-subtle">
          {title}
        </h3>
        <CopyButton text={code} />
      </div>
      <pre className="max-h-64 overflow-auto p-3 font-mono text-xs leading-relaxed text-ink">
        <code>{code}</code>
      </pre>
    </section>
  );
}

function PreviewCodeView({
  slug,
  patternName,
  component,
  instanceState,
}: {
  slug: string;
  patternName?: string;
  component?: ComponentDefinition;
  instanceState?: Record<string, unknown>;
}) {
  const templateJson = useMemo(
    () => JSON.stringify(buildInstanceTemplate(slug, patternName), null, 2),
    [slug, patternName],
  );

  const currentJson = useMemo(
    () =>
      instanceState ? JSON.stringify(instanceState, null, 2) : null,
    [instanceState],
  );

  const schemaJson = useMemo(
    () =>
      component
        ? JSON.stringify(component.behavior.stateSchema, null, 2)
        : null,
    [component],
  );

  const instantiateSnippet = useMemo(
    () => buildInstantiateSnippet(slug, patternName),
    [slug, patternName],
  );

  return (
    <div className="mx-auto w-full min-w-0 max-w-2xl space-y-4">
      {currentJson ? (
        <CodePanel title="Current instance" code={currentJson} />
      ) : null}
      <CodePanel title="Workspace template" code={templateJson} />
      {schemaJson ? (
        <CodePanel title="State schema" code={schemaJson} />
      ) : null}
      <CodePanel title="Instantiate (API)" code={instantiateSnippet} />
    </div>
  );
}

export function PatternDesignPreview({
  slug,
  patternName,
  component,
  instanceState,
  onClose,
  onCustomise,
  convergenceSaveReveal,
  isSaving = false,
}: PatternDesignPreviewProps) {
  const [view, setView] = useState<PreviewView>("design");
  const previewScrollRef = useRef<HTMLDivElement>(null);
  const Standalone = PATTERN_STANDALONE[slug];
  const Inbox = PATTERN_INBOX[slug];
  const hasStandalone = hasPatternStandalone(slug);
  const hasInbox = hasPatternInbox(slug);
  const genericAnswers =
    getGenericInterview(instanceState?.workspace as Record<string, unknown>)
      ?.answers ?? [];
  const live = resolveLivePreview(slug, instanceState);
  const showLiveSummary =
    !hasUserScenario(slug, live.workspace) &&
    Object.keys(live.workspace).some((key) => live.workspace[key] != null);

  useEffect(() => {
    if (!convergenceSaveReveal?.activeViewToken) {
      return;
    }

    setView("design");
    const scrollTimer = window.setTimeout(() => {
      previewScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }, 80);

    return () => window.clearTimeout(scrollTimer);
  }, [convergenceSaveReveal?.activeViewToken]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-bg font-body text-ink">
      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-line bg-white/90 px-4 py-3 backdrop-blur-sm">
        <div className="min-w-0 flex-1">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-subtle">
            Preview
          </h2>
          <p className="mt-0.5 text-xs text-muted">
            {patternName ?? slug} · your scenario in the reference design
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {onCustomise ? (
            <button
              type="button"
              onClick={onCustomise}
              disabled={isSaving}
              className="osh-cta-solid px-2.5 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-50"
            >
              Customise
            </button>
          ) : null}
          <div
            className="flex gap-0.5 rounded-lg border border-line bg-hover/50 p-0.5"
            role="tablist"
            aria-label="Preview view"
          >
            <button
              type="button"
              role="tab"
              aria-selected={view === "design"}
              className={`${VIEW_BTN} ${
                view === "design"
                  ? "bg-white text-ink shadow-sm"
                  : "text-muted hover:text-ink"
              }`}
              onClick={() => setView("design")}
            >
              <LayoutGrid size={14} aria-hidden />
              Design
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === "code"}
              className={`${VIEW_BTN} ${
                view === "code"
                  ? "bg-white text-ink shadow-sm"
                  : "text-muted hover:text-ink"
              }`}
              onClick={() => setView("code")}
            >
              <Code2 size={14} aria-hidden />
              Code
            </button>
          </div>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-line text-muted transition hover:bg-hover hover:text-ink"
              aria-label="Close preview"
            >
              <X size={14} aria-hidden />
            </button>
          ) : null}
        </div>
      </header>

      <div
        ref={previewScrollRef}
        className="relative min-h-0 flex-1 overflow-auto overscroll-contain p-4"
      >
        {isSaving ? (
          <SaveProcessingOverlay label="Processing…" />
        ) : null}
        {view !== "code" && genericAnswers.length > 0 ? (
          <GenericScenarioCard patternName={patternName} answers={genericAnswers} />
        ) : null}
        {view === "code" ? (
          <PreviewCodeView
            slug={slug}
            patternName={patternName}
            component={component}
            instanceState={instanceState}
          />
        ) : Standalone ? (
          <div className="mx-auto w-full min-w-0 max-w-2xl [&_.pattern-component-card]:max-w-none">
            <Standalone
              compact
              live={live}
              saveReveal={convergenceSaveReveal}
              key={`${slug}-${String(instanceState?.updatedAt ?? "draft")}-${convergenceSaveReveal?.activeViewToken ?? 0}`}
            />
            {showLiveSummary ? (
              <DraftParameterSummary
                patternSlug={slug}
                parameters={live.workspace}
                revision={
                  typeof instanceState?.updatedAt === "string"
                    ? instanceState.updatedAt
                    : undefined
                }
              />
            ) : null}
          </div>
        ) : Inbox ? (
          <div className="mx-auto w-full min-w-0 max-w-2xl">
            <Inbox
              compact
              live={live}
              saveReveal={convergenceSaveReveal}
              key={`${slug}-${String(instanceState?.updatedAt ?? "draft")}-${convergenceSaveReveal?.activeViewToken ?? 0}`}
            />
            {showLiveSummary ? (
              <DraftParameterSummary
                patternSlug={slug}
                parameters={live.workspace}
                revision={
                  typeof instanceState?.updatedAt === "string"
                    ? instanceState.updatedAt
                    : undefined
                }
              />
            ) : null}
          </div>
        ) : genericAnswers.length > 0 ? null : (
          <div className="flex h-full min-h-[12rem] flex-col items-center justify-center rounded-2xl border border-dashed border-line-md bg-white p-8 text-center">
            {showLiveSummary ? (
              <DraftParameterSummary
                patternSlug={slug}
                parameters={live.workspace}
                revision={
                  typeof instanceState?.updatedAt === "string"
                    ? instanceState.updatedAt
                    : undefined
                }
              />
            ) : null}
            <p className="font-heading text-sm font-semibold text-ink">
              Design preview coming soon
            </p>
            <p className="mt-2 max-w-xs text-sm text-muted">
              This pattern does not have a live reference component yet. Switch
              to Code for the workspace template and API snippet, or open the
              full pattern page.
            </p>
            <button
              type="button"
              onClick={() => setView("code")}
              className="mt-4 text-sm font-semibold text-accent hover:text-accent-h"
            >
              View code →
            </button>
            <Link
              href={`/patterns/${slug}`}
              className="mt-2 text-sm font-semibold text-accent hover:text-accent-h"
            >
              Open pattern page →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
