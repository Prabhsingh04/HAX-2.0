"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PatternDesignPreview } from "@/components/PatternDesignPreview";
import { InstanceEditDrawer } from "@/components/edit/InstanceEditDrawer";
import { PatternRecommendationCard } from "@/components/chat/PatternRecommendationCard";
import { PatternSuggestionsCard } from "@/components/chat/PatternSuggestionsCard";
import { AgentThresholdAlternatives } from "@/components/chat/AgentThresholdAlternatives";
import { PatternGuidanceCard } from "@/components/chat/ConvergenceGuidanceCard";
import { ChatLoadingMessage } from "@/components/chat/ChatLoadingMessage";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ScenarioQuestionPills } from "@/components/chat/ScenarioQuestionPills";
import { HeroBackground } from "@/components/HeroBackground";
import { SaveProcessingOverlay } from "@/components/shared/SaveProcessingOverlay";
import "@/components/chat/advisor-landing.css";
import "@/components/chat/chat-message.css";
import { Toast } from "@/components/shared/Toast";
import type { ChatRecommendation } from "@/lib/pattern-advisor";
import {
  detectApplicablePatterns,
  type PatternSuggestion,
} from "@/lib/detect-applicable-patterns";
import { workspaceFromInstanceState } from "@/lib/preview-state";
import { mergeWorkspaceForSlug, defaultWorkspaceForSlug } from "@/lib/workspace-defaults";
import {
  buildAiResponse,
  recommendPatterns,
  instantiatePattern,
  toChatRecommendation,
  updatePatternInstance,
} from "@/lib/pattern-advisor";
import { heuristicAnswerCheck } from "@/lib/patterns/answer-gate";
import {
  INTERVIEW_WORKSPACE_KEY,
  currentInterviewQuestion,
  fetchInterviewQuestions,
  getGenericInterview,
  recordInterviewAnswer,
} from "@/lib/patterns/generic-interview";
import { emptyContextFromPresets } from "@/lib/context-field-config";
import { getPattern } from "@/lib/patterns";
import type { InstanceSidebarData } from "@/lib/instance-types";
import { getUniqueAgentCount } from "@/lib/convergence-timeline-from-workspace";
import { hasUserScenario } from "@/lib/pattern-live-preview";
import {
  CONVERGENCE_AGENT_THRESHOLD,
  CONVERGENCE_SAVE_PROCESSING_MS,
  INITIAL_CONVERGENCE_SAVE_REVEAL,
  type ConvergenceSaveRevealState,
} from "@/lib/convergence-save-reveal";
import type { ConflictVisibilityViewId } from "@/lib/conflict-visibility-views";
import type { ConvergencePointWorkspaceState } from "@/lib/workspace-defaults";
import {
  buildExtractionFollowUp,
  buildExtractionIntroMessage,
  getNextExtractionQuestion,
  getPatternGuidanceMessages,
  hasExtractionFlow,
  isExtractionInProgress,
  mergeExtractionIntoWorkspace,
} from "@/lib/patterns/extraction-flow";
import { stripExtractionMeta } from "@/lib/patterns/extraction-state";
import { PATTERN_INSTRUCTION_SLUGS } from "@/lib/patterns/loader";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  recommendations?: ChatRecommendation[];
  topRecommendation?: ChatRecommendation | null;
  /** User prompt that led to this assistant reply (for recommendation cards). */
  userInput?: string;
  suggestions?: PatternSuggestion[];
  messageKind?: "default" | "save-suggestions";
};

type ActiveInstance = InstanceSidebarData;

const WELCOME_MESSAGE =
  "Hi! I help you document multi-agent decisions. What's your scenario?";

function findPatternContext(
  messages: ChatMessage[],
  slug: string,
): { name: string; explanation?: string } {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const match = messages[index].recommendations?.find(
      (recommendation) => recommendation.pattern.slug === slug,
    );
    if (match) {
      return {
        name: match.pattern.name,
        explanation: match.explanation,
      };
    }
  }

  return { name: slug };
}

export function PatternAdvisor({ initialPrompt }: { initialPrompt?: string }) {
  // Stateful so restoring a past conversation adopts its original id (and
  // keeps saving under it instead of forking a duplicate).
  const [sessionId, setSessionId] = useState(
    () => `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  );
  const agentId = useMemo(
    () => `advisor-${sessionId}`,
    [sessionId],
  );

  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: WELCOME_MESSAGE },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeInstance, setActiveInstance] = useState<ActiveInstance | null>(
    null,
  );
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [convergenceSaveReveal, setConvergenceSaveReveal] =
    useState<ConvergenceSaveRevealState>(INITIAL_CONVERGENCE_SAVE_REVEAL);
  const [showDesignPreview, setShowDesignPreview] = useState(false);
  const [isSavingInstance, setIsSavingInstance] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<"success" | "error">(
    "success",
  );
  const [drawerGuidance, setDrawerGuidance] = useState<string[] | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historySessions, setHistorySessions] = useState<
    Array<{ sessionId: string; title: string; updatedAt: string; messageCount: number }>
  >([]);

  const sentInitialPrompt = useRef(false);
  const loadingRef = useRef(false);
  const previewPanelRef = useRef<HTMLElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollChatToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  useEffect(() => {
    scrollChatToBottom();
    const shortDelay = window.setTimeout(scrollChatToBottom, 200);
    const longDelay = window.setTimeout(scrollChatToBottom, 500);
    return () => {
      window.clearTimeout(shortDelay);
      window.clearTimeout(longDelay);
    };
  }, [
    messages,
    loading,
    isSavingInstance,
    convergenceSaveReveal.revealToken,
    convergenceSaveReveal.showAlternatives,
    convergenceSaveReveal.isProcessing,
    scrollChatToBottom,
  ]);

  useEffect(() => {
    if (!isEditDrawerOpen) {
      setDrawerGuidance(null);
    }
  }, [isEditDrawerOpen]);

  const showToast = useCallback(
    (text: string, variant: "success" | "error" = "success") => {
      setToastVariant(variant);
      setToast(text);
      window.setTimeout(() => setToast(null), 4000);
    },
    [],
  );

  // Auto-save the conversation (debounced) once the user has said anything.
  // Static/review builds have no API routes — the fetch just fails silently.
  useEffect(() => {
    const firstUserMessage = messages.find((m) => m.role === "user");
    if (!firstUserMessage) return;

    const timer = window.setTimeout(() => {
      void fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          session_id: sessionId,
          title: firstUserMessage.content.slice(0, 80),
          messages,
          active_instance: activeInstance,
        }),
      }).catch(() => {});
    }, 800);
    return () => window.clearTimeout(timer);
  }, [messages, activeInstance, sessionId]);

  const openHistory = useCallback(async () => {
    setShowHistory(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "list" }),
      });
      const data = await res.json();
      setHistorySessions(data.sessions ?? []);
    } catch {
      setHistorySessions([]);
    }
  }, []);

  const restoreSession = useCallback(
    async (id: string) => {
      try {
        const res = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get", session_id: id }),
        });
        const data = await res.json();
        if (!data.session) throw new Error("not found");
        setSessionId(data.session.sessionId);
        setMessages(data.session.messages as ChatMessage[]);
        const restored = data.session.activeInstance as ActiveInstance | null;
        setActiveInstance(restored);
        setShowDesignPreview(Boolean(restored));
        setShowHistory(false);
        showToast("Conversation restored");
      } catch {
        showToast("Could not restore that conversation", "error");
      }
    },
    [showToast],
  );

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");

    try {
      // Prefer the server route: it reasons over the candidates through the
      // model gateway (lib/llm/gateway.ts) with its own server-side fallback.
      // Static/review builds ship no API routes, so on any fetch failure we
      // fall back to the in-browser keyword recommender.
      let content: string;
      let recommendations: ChatRecommendation[];
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed, sessionId: "advisor-ui" }),
        });
        if (!res.ok) throw new Error(`chat route returned ${res.status}`);
        const data = (await res.json()) as {
          aiResponse: string;
          recommendations?: ChatRecommendation[];
        };
        content = data.aiResponse;
        recommendations = data.recommendations ?? [];
      } catch {
        recommendations = (await recommendPatterns(trimmed))
          .map(toChatRecommendation)
          .slice(0, 3);
        content = buildAiResponse(recommendations);
      }
      const topRecommendation = recommendations[0] ?? null;

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content,
          recommendations,
          topRecommendation,
          userInput: trimmed,
        },
      ]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry, I ran into an issue: ${message}. Please try again.`,
        },
      ]);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialPrompt?.trim() || sentInitialPrompt.current) {
      return;
    }

    sentInitialPrompt.current = true;
    void sendMessage(initialPrompt);
  }, [initialPrompt, sendMessage]);

  const handleSendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || loadingRef.current) return;

    if (activeInstance && hasExtractionFlow(activeInstance.slug)) {
      const workspace = workspaceFromInstanceState(activeInstance.state, activeInstance.slug);
      const currentStep = getNextExtractionQuestion(activeInstance.slug, workspace);
      if (currentStep) {
        loadingRef.current = true;
        setLoading(true);
        setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
        setInput("");

        // Gate the message before merging it into the workspace: the model
        // (or, offline, a heuristic) decides whether this is actually an
        // answer to the current question. Non-answers get a conversational
        // reply and the interview stays on the same step.
        let verdict: import("@/lib/patterns/answer-gate").AnswerVerdict = {
          isAnswer: true,
        };
        try {
          const res = await fetch("/api/extract", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              slug: activeInstance.slug,
              field: currentStep.field,
              question: currentStep.question,
              text: trimmed,
            }),
          });
          if (!res.ok) throw new Error(`extract route returned ${res.status}`);
          verdict = await res.json();
        } catch {
          // Static/review builds have no API routes.
          verdict = heuristicAnswerCheck(currentStep.question, trimmed);
        }

        if (!verdict.isAnswer) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content:
                verdict.reply ??
                `Let's stay on this one: ${currentStep.question}`,
            },
          ]);
          loadingRef.current = false;
          setLoading(false);
          return;
        }

        const { nextWorkspace } = mergeExtractionIntoWorkspace(
          activeInstance.slug,
          workspace,
          trimmed,
        );

        const mergedWorkspace = mergeWorkspaceForSlug(activeInstance.slug, nextWorkspace);

        setActiveInstance((current) =>
          current
            ? {
                ...current,
                state: {
                  ...current.state,
                  workspace: mergedWorkspace,
                  updatedAt: new Date().toISOString(),
                },
              }
            : null,
        );

        const followUp = buildExtractionFollowUp(
          activeInstance.slug,
          mergedWorkspace,
          currentStep.field,
        );
        if (followUp) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: followUp },
          ]);
        }

        loadingRef.current = false;
        setLoading(false);
        return;
      }
    }

    // Generic (model-driven) interview for patterns with no hand-scripted flow.
    if (activeInstance && !hasExtractionFlow(activeInstance.slug)) {
      const ws =
        (activeInstance.state.workspace as Record<string, unknown>) ?? {};
      const iv = getGenericInterview(ws);
      const question = iv ? currentInterviewQuestion(iv) : null;
      if (iv && question) {
        loadingRef.current = true;
        setLoading(true);
        setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
        setInput("");

        // Same answer-gate as the scripted flow: reject junk/uncertainty.
        let verdict: import("@/lib/patterns/answer-gate").AnswerVerdict = {
          isAnswer: true,
        };
        try {
          const res = await fetch("/api/extract", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              slug: activeInstance.slug,
              field: "scenario",
              question,
              text: trimmed,
            }),
          });
          if (!res.ok) throw new Error(`extract route returned ${res.status}`);
          verdict = await res.json();
        } catch {
          verdict = heuristicAnswerCheck(question, trimmed);
        }

        if (!verdict.isAnswer) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: verdict.reply ?? `Let's stay on this one: ${question}`,
            },
          ]);
          loadingRef.current = false;
          setLoading(false);
          return;
        }

        const nextIv = recordInterviewAnswer(iv, question, trimmed);
        const nextWs = { ...ws, [INTERVIEW_WORKSPACE_KEY]: nextIv };
        setActiveInstance((current) =>
          current
            ? {
                ...current,
                state: {
                  ...current.state,
                  workspace: nextWs,
                  updatedAt: new Date().toISOString(),
                },
              }
            : null,
        );
        void updatePatternInstance(activeInstance.instanceId, activeInstance.state, {
          workspace: nextWs,
        }).catch(() => {});

        const nextQuestion = currentInterviewQuestion(nextIv);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: nextQuestion
              ? `Got it.\n\n${nextQuestion}`
              : "Got it — your scenario is captured. Review it in the preview, then Customise or Save when it looks right.",
          },
        ]);
        loadingRef.current = false;
        setLoading(false);
        return;
      }
    }

    await sendMessage(trimmed);
  }, [activeInstance, input, sendMessage]);

  const handleInstantiatePattern = useCallback(
    async (
      slug: string,
      options?: {
        carryState?: Record<string, unknown> | null;
        quiet?: boolean;
      },
    ) => {
      const { name: patternName, explanation } = findPatternContext(messages, slug);
      const carried = options?.carryState;
      const carriedWorkspace =
        carried?.workspace &&
        typeof carried.workspace === "object" &&
        !Array.isArray(carried.workspace)
          ? (carried.workspace as Record<string, unknown>)
          : undefined;

      // Non-scripted patterns get a model-generated interview. Fetch its
      // questions up front and seed them into the workspace (unless a carried
      // workspace already has an interview, e.g. on a pattern switch).
      const scripted = hasExtractionFlow(slug);
      let genericQuestions: string[] = [];
      if (!scripted && !getGenericInterview(carriedWorkspace)) {
        genericQuestions = await fetchInterviewQuestions(slug);
      }

      try {
        const { instanceId, instance, component } = await instantiatePattern(
          slug,
          agentId,
          {
            title:
              typeof carried?.title === "string" ? carried.title : patternName,
            workspace: {
              ...defaultWorkspaceForSlug(slug),
              ...(carriedWorkspace ?? {}),
              ...(genericQuestions.length > 0
                ? {
                    [INTERVIEW_WORKSPACE_KEY]: {
                      questions: genericQuestions,
                      step: 0,
                      answers: [],
                    },
                  }
                : {}),
            },
            context:
              carried?.context &&
              typeof carried.context === "object" &&
              !Array.isArray(carried.context)
                ? (carried.context as Record<string, string>)
                : emptyContextFromPresets(),
            createdAt: new Date().toISOString(),
          },
        );

        setActiveInstance({
          instanceId,
          slug,
          component,
          state: instance,
          explanation,
        });
        setShowDesignPreview(true);
        setInput("");
        if (!options?.quiet) {
          const intro = scripted
            ? buildExtractionIntroMessage(slug)
            : genericQuestions.length > 0
              ? `Let's capture your scenario for ${patternName}.\n\n${genericQuestions[0]}`
              : `I've created an instance of ${patternName}. Review the preview, then click Customise when you're ready to fill in your scenario.`;
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: intro },
          ]);
          showToast(`${patternName} instantiated`);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Instantiation failed";
        showToast(message, "error");
      }
    },
    [agentId, messages, showToast],
  );

  const handleSwitchPattern = useCallback(
    async (slug: string) => {
      let carryState = activeInstance?.state ?? null;
      // A default title (= the old pattern's name) must not follow the user
      // into the new pattern — the edit drawer would read "Convergence Point"
      // while editing Decision Ledger. Only user-authored titles carry over.
      const sourcePatternName = activeInstance?.component.metadata.name;
      if (
        carryState &&
        typeof carryState.title === "string" &&
        carryState.title === sourcePatternName
      ) {
        const { title: _defaultTitle, ...rest } = carryState;
        carryState = rest;
      }
      await handleInstantiatePattern(slug, { carryState, quiet: true });
      const patternName = getPattern(slug)?.title ?? slug.replace(/-/g, " ");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Switched to ${patternName}. Your scenario data carries over where fields match — click Customise to update the rest.`,
        },
      ]);
      showToast(`Switched to ${patternName}`);
    },
    [
      activeInstance?.state,
      activeInstance?.component.metadata.name,
      handleInstantiatePattern,
      showToast,
    ],
  );

  /** Persist instance edits from drawer → API, then reveal 5+ visualizations on save. */
  const handleInstanceUpdate = useCallback(
    async (updates: Record<string, unknown>) => {
      if (!activeInstance) {
        throw new Error("No active instance to update");
      }

      const isConvergence = activeInstance.slug === "convergence-point";
      const pendingWorkspace = workspaceFromInstanceState(
        { ...activeInstance.state, ...updates },
        activeInstance.slug,
      );
      const pendingAgentCount =
        isConvergence
          ? getUniqueAgentCount(
              pendingWorkspace as ConvergencePointWorkspaceState &
                Record<string, unknown>,
            )
          : 0;
      const pendingHasUser =
        isConvergence &&
        hasUserScenario("convergence-point", pendingWorkspace);
      const willRevealAlternatives =
        pendingHasUser && pendingAgentCount >= CONVERGENCE_AGENT_THRESHOLD;

      setIsSavingInstance(true);

      if (isConvergence) {
        setConvergenceSaveReveal((current) => ({
          ...current,
          isProcessing: true,
          processingAlternatives: willRevealAlternatives,
          activeView: null,
        }));
      }

      const startedAt = Date.now();

      try {
        const mergedUpdates = { ...updates };
        const rawWorkspace =
          mergedUpdates.workspace ??
          workspaceFromInstanceState(
            { ...activeInstance.state, ...updates },
            activeInstance.slug,
          );
        if (rawWorkspace && typeof rawWorkspace === "object" && !Array.isArray(rawWorkspace)) {
          mergedUpdates.workspace = stripExtractionMeta(
            rawWorkspace as Record<string, unknown>,
          );
        }

        const nextState = await updatePatternInstance(
          activeInstance.instanceId,
          activeInstance.state,
          mergedUpdates,
        );

        setActiveInstance((current) =>
          current ? { ...current, state: nextState } : null,
        );

        const workspace = workspaceFromInstanceState(nextState, activeInstance.slug);
        const savedAgentCount = isConvergence
          ? getUniqueAgentCount(
              workspace as ConvergencePointWorkspaceState &
                Record<string, unknown>,
            )
          : 0;
        const savedHasUser =
          isConvergence && hasUserScenario("convergence-point", workspace);
        const showAfterSave =
          savedHasUser && savedAgentCount >= CONVERGENCE_AGENT_THRESHOLD;

        const elapsed = Date.now() - startedAt;
        await new Promise((resolve) =>
          window.setTimeout(
            resolve,
            Math.max(0, CONVERGENCE_SAVE_PROCESSING_MS - elapsed),
          ),
        );

        if (isConvergence) {
          setConvergenceSaveReveal((current) => ({
            ...current,
            isProcessing: false,
            processingAlternatives: false,
            activeView: null,
            revealToken: showAfterSave ? current.revealToken + 1 : current.revealToken,
            showStackedVisuals: showAfterSave,
            showAlternatives: showAfterSave,
            savedAgentCount,
          }));
        }

        const suggestions = detectApplicablePatterns(
          workspace,
          activeInstance.slug,
        );

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: showAfterSave
              ? "Your instance is saved. With 5+ agents, pick a view below — the diagram opens in the preview panel on the right."
              : suggestions.length > 0
                ? "Your instance is saved. Here are other patterns that might fit this scenario."
                : "✓ Instance saved. Your changes are reflected in the preview.",
            messageKind:
              !showAfterSave && suggestions.length > 0
                ? "save-suggestions"
                : "default",
            suggestions: !showAfterSave ? suggestions : undefined,
          },
        ]);

        showToast("Instance saved");
        return nextState;
      } catch (error) {
        if (isConvergence) {
          setConvergenceSaveReveal((current) => ({
            ...current,
            isProcessing: false,
            processingAlternatives: false,
          }));
        }
        throw error;
      } finally {
        setIsSavingInstance(false);
      }
    },
    [activeInstance, showToast],
  );

  const handleCloseDesignPreview = useCallback(() => {
    setShowDesignPreview(false);
    setIsEditDrawerOpen(false);
  }, []);

  const handleCloseEditDrawer = useCallback(() => {
    setIsEditDrawerOpen(false);
  }, []);

  useEffect(() => {
    if (activeInstance && !showDesignPreview) {
      setActiveInstance(null);
      setIsEditDrawerOpen(false);
    }
  }, [activeInstance, showDesignPreview]);

  useEffect(() => {
    if (!activeInstance) {
      setIsEditDrawerOpen(false);
      setConvergenceSaveReveal(INITIAL_CONVERGENCE_SAVE_REVEAL);
    }
  }, [activeInstance]);

  const hasUserMessages = messages.some((message) => message.role === "user");
  const isLanding = activeInstance === null;
  const showChatAvatars = !isLanding;
  const showScenarioPills =
    isLanding && !hasUserMessages && !loading && !isSavingInstance;
  const hasPreview = activeInstance !== null && showDesignPreview;
  /** Split-view chat uses the same Outshift chrome as landing (hero, pills, input). */
  const useSessionChrome = hasPreview;

  const previewWorkspace = useMemo(() => {
    if (!activeInstance) return {};
    return workspaceFromInstanceState(activeInstance.state, activeInstance.slug);
  }, [activeInstance]);

  const showAgentThresholdAlternatives = useMemo(() => {
    if (!activeInstance || activeInstance.slug !== "convergence-point") {
      return false;
    }
    return hasUserScenario("convergence-point", previewWorkspace);
  }, [activeInstance, previewWorkspace]);

  const extractionInProgress = useMemo(() => {
    if (!activeInstance?.slug) return false;
    return isExtractionInProgress(activeInstance.slug, previewWorkspace);
  }, [activeInstance?.slug, previewWorkspace]);

  const patternGuidance = useMemo(() => {
    const slug = activeInstance?.slug;
    if (!slug || !PATTERN_INSTRUCTION_SLUGS.includes(slug as typeof PATTERN_INSTRUCTION_SLUGS[number])) {
      return [];
    }
    if (extractionInProgress) {
      return [];
    }
    if (drawerGuidance !== null) {
      return drawerGuidance;
    }
    return getPatternGuidanceMessages(slug, previewWorkspace);
  }, [activeInstance?.slug, drawerGuidance, extractionInProgress, previewWorkspace]);

  const handlePatternGuidanceChange = useCallback((messages: string[]) => {
    setDrawerGuidance(messages);
  }, []);

  useEffect(() => {
    scrollChatToBottom();
  }, [patternGuidance, scrollChatToBottom]);

  const handleSelectConflictView = useCallback(
    (viewId: ConflictVisibilityViewId) => {
      setShowDesignPreview(true);
      setConvergenceSaveReveal((current) => ({
        ...current,
        activeView: viewId,
        activeViewToken: current.activeViewToken + 1,
        showStackedVisuals: true,
        showAlternatives: true,
        savedAgentCount: Math.max(
          current.savedAgentCount,
          CONVERGENCE_AGENT_THRESHOLD,
        ),
      }));

      window.setTimeout(() => {
        previewPanelRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 120);
    },
    [],
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSendMessage();
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-bg font-body text-ink">
      {toast ? (
        <Toast
          message={toast}
          variant={toastVariant}
          onDismiss={() => setToast(null)}
        />
      ) : null}

      <div
        className={`flex min-h-0 flex-1 overflow-hidden ${
          hasPreview ? "flex-col lg:flex-row" : "flex-col"
        }`}
      >
        <div
          className={
            hasPreview
              ? "advisor-chat-shell advisor-chat-shell--session relative flex w-full max-w-[640px] shrink-0 flex-col overflow-hidden border-line lg:border-r"
              : "advisor-chat-shell advisor-chat-shell--landing relative flex min-h-0 flex-1 flex-col overflow-hidden"
          }
        >
          {isLanding || useSessionChrome ? <HeroBackground /> : null}

          <button
            type="button"
            onClick={() => (showHistory ? setShowHistory(false) : void openHistory())}
            className="absolute right-3 top-3 z-30 rounded-full border border-line bg-bg px-3 py-1 text-xs font-medium text-muted transition-colors hover:text-ink"
          >
            History
          </button>
          {showHistory ? (
            <div className="absolute right-3 top-11 z-30 max-h-96 w-80 overflow-y-auto rounded-xl border border-line bg-bg p-2 shadow-lg">
              <p className="px-2 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
                Previous conversations
              </p>
              {historySessions.length === 0 ? (
                <p className="px-2 pb-2 text-sm text-muted">
                  No saved conversations yet.
                </p>
              ) : (
                historySessions.map((session) => (
                  <button
                    key={session.sessionId}
                    type="button"
                    onClick={() => void restoreSession(session.sessionId)}
                    className="block w-full rounded-lg px-2 py-2 text-left transition-colors hover:bg-line/40"
                  >
                    <span className="block truncate text-sm text-ink">
                      {session.title}
                    </span>
                    <span className="block text-[11px] text-muted">
                      {new Date(session.updatedAt).toLocaleString()} ·{" "}
                      {session.messageCount} messages
                    </span>
                  </button>
                ))
              )}
            </div>
          ) : null}

          <div
            className={
              isLanding || useSessionChrome
                ? "relative z-10 flex min-h-0 flex-1 flex-col"
                : "flex min-h-0 flex-1 flex-col"
            }
          >
          {isLanding ? (
            <header className="advisor-page-header advisor-chat-inner shrink-0 pt-8">
              <h1 className="advisor-page-header__title font-heading">
                Human Agent IoC patterns
              </h1>
            </header>
          ) : null}

          <div
            className={
              isLanding
                ? "advisor-chat-scroll relative min-h-0 flex-1"
                : useSessionChrome
                  ? "advisor-chat-scroll advisor-chat-scroll--session relative min-h-0 flex-1"
                  : "relative min-h-0 flex-1 overflow-y-auto p-4"
            }
          >
            {isSavingInstance ? (
              <SaveProcessingOverlay label="Processing…" />
            ) : null}
            <div className={isLanding ? "advisor-chat-inner" : "space-y-6"}>
              {messages.map((message, index) => {
                const hasRecommendations =
                  message.role === "assistant" &&
                  message.recommendations &&
                  message.recommendations.length > 0;
                const hasSuggestions =
                  message.role === "assistant" &&
                  message.messageKind === "save-suggestions" &&
                  message.suggestions &&
                  message.suggestions.length > 0;
                const isProminentCard = hasRecommendations || hasSuggestions;

                return (
                  <ChatMessage
                    key={`${message.role}-${index}`}
                    role={message.role}
                    showAvatar={showChatAvatars}
                    className={index > 0 || !isLanding ? "mt-6" : ""}
                  >
                    <div className={isProminentCard ? "w-full" : undefined}>
                      <div
                        className={
                          isProminentCard
                            ? "advisor-bubble advisor-bubble--assistant w-full"
                            : `advisor-bubble ${
                                message.role === "user"
                                  ? "advisor-bubble--user"
                                  : "advisor-bubble--assistant"
                              }`
                        }
                      >
                        <p className="m-0 whitespace-pre-wrap">{message.content}</p>

                        {hasRecommendations ? (
                          <div className="mt-4 space-y-4">
                            {message.recommendations!.map((recommendation, recIndex) => {
                              const isTop =
                                message.topRecommendation?.pattern.slug ===
                                recommendation.pattern.slug;

                              return (
                                <PatternRecommendationCard
                                  key={recommendation.pattern.slug}
                                  recommendation={recommendation}
                                  userInput={message.userInput ?? ""}
                                  isTopRecommendation={
                                    isTop && message.recommendations!.length > 1
                                  }
                                  animationDelay={recIndex * 80}
                                  onTryThis={() =>
                                    void handleInstantiatePattern(
                                      recommendation.pattern.slug,
                                    )
                                  }
                                />
                              );
                            })}
                            <p className="px-1 text-xs leading-relaxed text-muted">
                              Click &ldquo;Try this&rdquo; to create a live instance
                              and start using it.
                            </p>
                          </div>
                        ) : null}

                        {hasSuggestions ? (
                          <div className="mt-4">
                            <PatternSuggestionsCard
                              suggestions={message.suggestions!}
                              onSwitchPattern={(slug) =>
                                void handleSwitchPattern(slug)
                              }
                            />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </ChatMessage>
                );
              })}

              {showScenarioPills ? (
                <ScenarioQuestionPills
                  disabled={loading || isSavingInstance}
                  onSelect={(slug) => void handleInstantiatePattern(slug)}
                />
              ) : null}

              {loading ? (
                <ChatLoadingMessage
                  showAvatar={showChatAvatars}
                  label={
                    activeInstance && hasExtractionFlow(activeInstance.slug)
                      ? "Building your scenario"
                      : "Analyzing your scenario"
                  }
                />
              ) : null}

              {patternGuidance.length > 0 ? (
                <ChatMessage role="assistant" showAvatar={showChatAvatars}>
                  <PatternGuidanceCard messages={patternGuidance} />
                </ChatMessage>
              ) : null}

              {/* Only mount the bubble when the alternatives will actually
                  render (saving skeleton, processing, or revealed cards) —
                  otherwise an empty avatar+bubble trails the chat. */}
              {activeInstance?.slug === "convergence-point" &&
              showAgentThresholdAlternatives &&
              (isSavingInstance ||
                convergenceSaveReveal.isProcessing ||
                (convergenceSaveReveal.showAlternatives &&
                  convergenceSaveReveal.savedAgentCount >=
                    CONVERGENCE_AGENT_THRESHOLD)) ? (
                <ChatMessage role="assistant" showAvatar={showChatAvatars}>
                  <AgentThresholdAlternatives
                    saveReveal={convergenceSaveReveal}
                    enabled={showAgentThresholdAlternatives}
                    isSaving={isSavingInstance}
                    onSelectView={handleSelectConflictView}
                  />
                </ChatMessage>
              ) : null}
              <div ref={chatEndRef} aria-hidden className="h-0 shrink-0" />
            </div>
          </div>

          <div
            className={
              isLanding || useSessionChrome
                ? "advisor-chat-input-bar shrink-0"
                : "shrink-0 border-t border-line bg-bg p-4"
            }
          >
            <div
              className={
                isLanding
                  ? "advisor-chat-input-wrap"
                  : useSessionChrome
                    ? "advisor-chat-input-row advisor-chat-input-row--session"
                    : "flex gap-2"
              }
            >
              {isLanding ? (
                <p className="advisor-chat-input-label">Or type your scenario:</p>
              ) : null}
              {isLanding ? (
                <div className="advisor-chat-input-row">
                  <input
                    type="text"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe what happened…"
                    disabled={loading || isSavingInstance}
                    className="advisor-chat-input"
                  />
                  <button
                    type="button"
                    onClick={() => void handleSendMessage()}
                    disabled={loading || isSavingInstance || !input.trim()}
                    className="osh-cta-solid advisor-chat-send disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your scenario..."
                    disabled={loading || isSavingInstance}
                    className={
                      useSessionChrome
                        ? "advisor-chat-input"
                        : "flex-1 rounded-xl border border-line px-4 py-3 text-sm text-ink outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[rgba(0,188,235,0.15)] disabled:opacity-60"
                    }
                  />
                  <button
                    type="button"
                    onClick={() => void handleSendMessage()}
                    disabled={loading || isSavingInstance || !input.trim()}
                    className={
                      useSessionChrome
                        ? "osh-cta-solid advisor-chat-send disabled:cursor-not-allowed disabled:opacity-50"
                        : "osh-cta-solid rounded-xl px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                    }
                  >
                    Send
                  </button>
                </>
              )}
            </div>
          </div>
          </div>
        </div>

        {hasPreview && activeInstance ? (
          <aside
            ref={previewPanelRef}
            className="advisor-preview-panel flex min-h-0 w-full flex-1 flex-col border-t border-line lg:min-w-0 lg:border-t-0 lg:border-l"
          >
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <PatternDesignPreview
                slug={activeInstance.slug}
                patternName={activeInstance.component.metadata.name}
                component={activeInstance.component}
                instanceState={activeInstance.state}
                isSaving={isSavingInstance}
                onClose={handleCloseDesignPreview}
                onCustomise={() => setIsEditDrawerOpen(true)}
                convergenceSaveReveal={
                  activeInstance.slug === "convergence-point"
                    ? convergenceSaveReveal
                    : undefined
                }
              />
            </div>
          </aside>
        ) : null}
      </div>

      <InstanceEditDrawer
        isOpen={isEditDrawerOpen && activeInstance !== null}
        instance={activeInstance}
        onClose={handleCloseEditDrawer}
        onInstanceUpdate={handleInstanceUpdate}
        onPatternGuidanceChange={handlePatternGuidanceChange}
      />
    </div>
  );
}
