import sourcePatterns from "./source-patterns.json";

/** The reference catalog's authored copy, code shape, and preview metadata. */
export type SourcePattern = {
  id: string;
  name: string;
  oneline: string;
  value?: "crit" | "high" | "med" | "low";
  what?: string;
  why?: string;
  when?: string;
  how?: string;
  composed: string[];
  code: string;
  related: string[];
  variants: { id: string; name: string; note?: string }[];
  placements: { template: string; variantId: string; note?: string }[];
  stage: string;
  cluster: string;
};

const BY_SOURCE_ID = new Map(
  (sourcePatterns as SourcePattern[]).map((pattern) => [pattern.id, pattern]),
);

// V3 keeps a few clearer URL slugs while the reference catalog uses shorter IDs.
const SOURCE_ID_OVERRIDES: Record<string, string> = {
  "nx-icons": "ai-icons",
  "nx-searching-filtering": "search-filter",
  "nx-proactive-suggestions": "proactive",
  "nx-handwriting-input": "handwriting",
  "nx-gesture-input": "gesture",
  "nx-voice-and-tone": "voice-tone",
  "nx-mcp-connectors": "mcp",
  "nx-knowledge-bases": "knowledge-base",
  "nx-preview-output": "preview",
  "nx-multimodal-output": "multimodal",
  "nx-confidence-indicators": "confidence",
  "nx-error-empty-states": "error-empty",
  "nx-incognito-mode": "incognito",
  "nx-collecting-feedback": "feedback",
  "nx-model-management": "model-mgmt",
  "nx-update-notifications": "update-notice",
  "nx-contextual-resize": "resize-context",
};

const V3_ID_OVERRIDES = new Map(
  Object.entries(SOURCE_ID_OVERRIDES).map(([v3Id, sourceId]) => [sourceId, v3Id]),
);

const NEW_AGENTIC_SOURCE_IDS = new Set([
  "stream-of-thought", "follow-up", "memory", "task-creation",
  "task-assignment", "priority-ranking", "subtask-generation",
]);

export function getSourcePatternForV3Id(v3Id: string): SourcePattern | undefined {
  const sourceId = SOURCE_ID_OVERRIDES[v3Id] ??
    (v3Id.startsWith("nx-") ? v3Id.slice(3) : v3Id);
  return BY_SOURCE_ID.get(sourceId);
}

export function getV3IdForSourcePattern(sourceId: string): string | undefined {
  if (!BY_SOURCE_ID.has(sourceId)) return undefined;
  if (NEW_AGENTIC_SOURCE_IDS.has(sourceId)) return sourceId;
  return V3_ID_OVERRIDES.get(sourceId) ?? `nx-${sourceId}`;
}
