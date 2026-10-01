"use client";

import { GitBranch, Network } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { PatternComponentCard } from "@/components/patterns/PatternComponentCard";
import { ConvergenceTimeline } from "@/components/patterns/ConvergenceTimeline";
import { ConflictNetworkVisualization } from "@/components/patterns/ConflictNetworkVisualization";
import { DecisionTreeVisualization } from "@/components/patterns/DecisionTreeVisualization";
import { PresenceIcon } from "@/components/patterns/icons";
import { getUniqueAgentCount } from "@/lib/convergence-timeline-from-workspace";
import type { ConflictVisibilityViewId } from "@/lib/conflict-visibility-views";
import {
  CONVERGENCE_AGENT_THRESHOLD,
  type ConvergenceSaveRevealState,
} from "@/lib/convergence-save-reveal";
import type { ConvergencePointWorkspaceState } from "@/lib/workspace-defaults";
import "./convergence-viz-selector.css";

type ConvergencePointVisualizationSelectorProps = {
  workspace?: ConvergencePointWorkspaceState & Record<string, unknown>;
  isDemoData: boolean;
  compact?: boolean;
  contextLabel?: string;
  saveReveal?: ConvergenceSaveRevealState;
};

type ViewCardConfig = {
  title: string;
  patternKey: string;
  dotColor: string;
  footerLeft?: string;
  footerRight?: string;
  renderIcon: (compact?: boolean) => ReactNode;
};

const VIEW_CARDS: Record<ConflictVisibilityViewId, ViewCardConfig> = {
  timeline: {
    title: "Agent convergence timeline",
    patternKey: "ConvergencePoint",
    dotColor: "#23A06B",
    footerLeft: "Four streams · merge and pinch points",
    footerRight: "live",
    renderIcon: (compact) => <PresenceIcon size={compact ? 15 : 18} />,
  },
  network: {
    title: "Conflict Network",
    patternKey: "ConflictNetwork",
    dotColor: "#5B6FFF",
    renderIcon: (compact) => (
      <Network size={compact ? 15 : 18} strokeWidth={2} aria-hidden />
    ),
  },
  tree: {
    title: "Decision Tree",
    patternKey: "DecisionTree",
    dotColor: "#0FA998",
    renderIcon: (compact) => (
      <GitBranch size={compact ? 15 : 18} strokeWidth={2} aria-hidden />
    ),
  },
};

function VisualizationCard({
  view,
  contextLabel,
  compact,
  sectionRef,
  fadeIn = false,
  selected = false,
  footerLeftOverride,
  children,
}: {
  view: ConflictVisibilityViewId;
  contextLabel: string;
  compact?: boolean;
  sectionRef?: RefObject<HTMLDivElement | null>;
  fadeIn?: boolean;
  selected?: boolean;
  footerLeftOverride?: string;
  children: ReactNode;
}) {
  const config = VIEW_CARDS[view];

  return (
    <div
      ref={sectionRef}
      className={`cp-viz-selector__card${fadeIn ? " cp-viz-selector__card--fade-in" : ""}${selected ? " cp-viz-selector__card--selected" : ""}`}
      data-view={view}
    >
      {selected ? (
        <div className="cp-viz-selector__card-selected-label">
          <span className="cp-viz-selector__section-selected-dot" aria-hidden />
          Selected view
        </div>
      ) : null}
      <PatternComponentCard
        patternKey={config.patternKey}
        dotColor={config.dotColor}
        title={config.title}
        contextLabel={contextLabel}
        icon={config.renderIcon(compact)}
        footerLeft={footerLeftOverride ?? config.footerLeft}
        footerRight={config.footerRight}
        compact={compact}
      >
        {children}
      </PatternComponentCard>
    </div>
  );
}

export function ConvergencePointVisualizationSelector({
  workspace,
  isDemoData,
  compact = false,
  contextLabel = "Convergence Point",
  saveReveal,
}: ConvergencePointVisualizationSelectorProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const agentCount = workspace ? getUniqueAgentCount(workspace) : 0;
  const savedAgentCount = saveReveal?.savedAgentCount ?? 0;
  const activeView = saveReveal?.activeView ?? null;
  const activeViewToken = saveReveal?.activeViewToken ?? 0;
  const showAlternatives = Boolean(saveReveal?.showAlternatives);
  const showStackedVisuals = Boolean(saveReveal?.showStackedVisuals);

  const meetsThreshold =
    agentCount >= CONVERGENCE_AGENT_THRESHOLD ||
    savedAgentCount >= CONVERGENCE_AGENT_THRESHOLD;

  const alternateViewsEnabled =
    Boolean(workspace) &&
    meetsThreshold &&
    (showAlternatives || showStackedVisuals || Boolean(activeView));

  const allowAlternateViews =
    alternateViewsEnabled && (!isDemoData || showAlternatives);

  const [showNetwork, setShowNetwork] = useState(false);
  const [showTree, setShowTree] = useState(false);
  const isProcessing = Boolean(saveReveal?.isProcessing);

  useEffect(() => {
    if (!allowAlternateViews) {
      setShowNetwork(false);
      setShowTree(false);
    }
  }, [allowAlternateViews]);

  useEffect(() => {
    const token = saveReveal?.revealToken ?? 0;
    if (!allowAlternateViews || token === 0 || activeView) {
      return;
    }

    setShowNetwork(false);
    setShowTree(false);

    const networkRevealTimer = window.setTimeout(() => {
      setShowNetwork(true);
    }, 0);

    const networkScrollTimer = window.setTimeout(() => {
      networkRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);

    const treeRevealTimer = window.setTimeout(() => {
      setShowTree(true);
    }, 400);

    const treeScrollTimer = window.setTimeout(() => {
      treeRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 500);

    return () => {
      window.clearTimeout(networkRevealTimer);
      window.clearTimeout(networkScrollTimer);
      window.clearTimeout(treeRevealTimer);
      window.clearTimeout(treeScrollTimer);
    };
  }, [activeView, allowAlternateViews, saveReveal?.revealToken]);

  useEffect(() => {
    if (!activeView || activeViewToken === 0) {
      return;
    }

    if (activeView === "network") {
      setShowNetwork(true);
    }
    if (activeView === "tree") {
      setShowTree(true);
    }

    const scrollTimer = window.setTimeout(() => {
      rootRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      const targetRef =
        activeView === "timeline"
          ? timelineRef
          : activeView === "network"
            ? networkRef
            : treeRef;

      window.setTimeout(() => {
        targetRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 150);
    }, 50);

    return () => window.clearTimeout(scrollTimer);
  }, [activeView, activeViewToken]);

  const renderView = (
    view: ConflictVisibilityViewId,
    fadeIn = false,
    selected = false,
  ) => {
    if (!workspace && view !== "timeline") return null;

    const cardProps = {
      view,
      contextLabel,
      compact,
      fadeIn,
      selected,
    };

    switch (view) {
      case "timeline": {
        // Caption reflects the actual roster; the static "Four streams" copy
        // only fits the demo data.
        const STREAM_WORDS = [
          "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven",
          "Eight", "Nine",
        ];
        const footerLeftOverride =
          agentCount > 0
            ? `${STREAM_WORDS[agentCount] ?? agentCount} stream${agentCount === 1 ? "" : "s"} · merge and pinch points`
            : undefined;
        return (
          <VisualizationCard
            {...cardProps}
            sectionRef={timelineRef}
            footerLeftOverride={footerLeftOverride}
          >
            <ConvergenceTimeline compact={compact} workspace={workspace} />
          </VisualizationCard>
        );
      }
      case "network":
        return (
          <VisualizationCard {...cardProps} sectionRef={networkRef}>
            <ConflictNetworkVisualization workspace={workspace!} />
          </VisualizationCard>
        );
      case "tree":
        return (
          <VisualizationCard {...cardProps} sectionRef={treeRef}>
            <DecisionTreeVisualization workspace={workspace!} />
          </VisualizationCard>
        );
    }
  };

  const cardSelectedView = Boolean(activeView && activeViewToken > 0);

  if (activeView && (cardSelectedView || allowAlternateViews)) {
    return (
      <div
        ref={rootRef}
        className="cp-viz-selector cp-viz-selector--single cp-viz-selector--relative"
        data-active-view={activeView}
      >
        {renderView(activeView, true, true)}
      </div>
    );
  }

  if (!allowAlternateViews) {
    return (
      <div ref={rootRef} className="cp-viz-selector cp-viz-selector--relative">
        {isProcessing ? (
          <div className="cp-viz-selector__processing" aria-live="polite" aria-busy="true">
            <span className="cp-viz-selector__processing-spinner" aria-hidden />
            <span className="cp-viz-selector__processing-label">Processing…</span>
          </div>
        ) : null}
        {renderView("timeline")}
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className="cp-viz-selector cp-viz-selector--stacked cp-viz-selector--relative"
    >
      {isProcessing ? (
        <div className="cp-viz-selector__processing" aria-live="polite" aria-busy="true">
          <span className="cp-viz-selector__processing-spinner" aria-hidden />
          <span className="cp-viz-selector__processing-label">Processing…</span>
        </div>
      ) : null}

      {renderView("timeline")}

      {showNetwork ? renderView("network", true) : null}

      {showTree ? renderView("tree", true) : null}
    </div>
  );
}
