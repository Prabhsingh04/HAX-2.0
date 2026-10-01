import type { FormFieldDef, Scenario } from "./shared/types";

export type ConvergenceExtracted = {
  agentRoster?: string[];
  disagreementDimension?: string;
  resolutionMechanism?: string;
  outcome?: string;
};

export type ConvergenceExtractionResult = {
  extracted: ConvergenceExtracted;
  confidence: number;
  found: string[];
  missing: string[];
};

const ROLE_KEYWORDS = [
  "policy",
  "legal",
  "security",
  "performance",
  "engineer",
  "architect",
  "finance",
  "billing",
  "support",
  "operations",
  "compliance",
  "data",
  "infrastructure",
  "platform",
  "product",
  "design",
  "leadership",
  "management",
  "executive",
  "director",
  "lead",
  "coordinator",
  "manager",
  "officer",
  "counsel",
  "reviewer",
  "approver",
  "stakeholder",
  "creator",
  "customer",
  "team",
] as const;

function normalizeAgent(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function uniqueAgents(agents: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const agent of agents) {
    const normalized = normalizeAgent(agent);
    if (normalized.length <= 2 || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(normalized);
  }
  return result;
}

const WORD_NUMBERS: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
};

/** Parse a numeric agent count from free text, e.g. "We have 5 agents". */
export function parseAgentCount(text: string): number | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const digitAgentsMatch = /\b(\d{1,2})\s*\+?\s*agents?\b/i.exec(trimmed);
  if (digitAgentsMatch) {
    return Number.parseInt(digitAgentsMatch[1]!, 10);
  }

  const agentsDigitMatch = /\bagents?\s*[:\s]+\s*(\d{1,2})\b/i.exec(trimmed);
  if (agentsDigitMatch) {
    return Number.parseInt(agentsDigitMatch[1]!, 10);
  }

  const wordAgentsMatch = /\b([a-z]+)\s*\+?\s*agents?\b/i.exec(trimmed);
  if (wordAgentsMatch) {
    const wordCount = WORD_NUMBERS[wordAgentsMatch[1]!.toLowerCase()];
    if (wordCount !== undefined && wordCount > 0) {
      return wordCount;
    }
  }

  if (/^\d{1,2}$/.test(trimmed)) {
    return Number.parseInt(trimmed, 10);
  }

  const contextualCountMatch =
    /\b(?:have|has|are|with|total|about|approximately|roughly|around)\s+(\d{1,2})\b/i.exec(
      trimmed,
    );
  if (contextualCountMatch) {
    return Number.parseInt(contextualCountMatch[1]!, 10);
  }

  return null;
}

/** Build a roster array from a declared agent count. */
export function rosterFromAgentCount(count: number): string[] {
  const normalized = Math.floor(count);
  if (!Number.isFinite(normalized) || normalized <= 0) {
    return [];
  }

  return Array.from({ length: normalized }, (_, index) => `agent-${index + 1}`);
}

export function extractAgents(text: string): string[] {
  // Named agents beat a declared count: "2 agents: finance and customer
  // success" should yield the names, not a generic agent-1/agent-2 roster.
  const explicitRegex = /(?:agents?|roles?|teams?|involving)[:\s]+([^.;]+)/i;
  const explicitMatch = explicitRegex.exec(text);
  if (explicitMatch?.[1]) {
    const agents = explicitMatch[1]
      .split(/,|;|\/|\band\b|&/i)
      .map((part) => part.trim())
      .filter(
        (part) =>
          part.length > 2 && !part.includes("?") && !/^\d+$/.test(part),
      );
    const normalized = uniqueAgents(agents);
    if (normalized.length > 0) return normalized;
  }

  const andRegex =
    /(?:with|among|between|involving|have)\s+([a-z][\w\s,-]*(?:\band\b[\w\s,-]+)+)/i;
  const andMatch = andRegex.exec(text);
  if (andMatch?.[1]) {
    const agents = andMatch[1]
      .split(/\band\b|,|\//i)
      .map((part) => part.trim())
      .filter((part) => part.length > 2);
    const normalized = uniqueAgents(agents);
    if (normalized.length > 0) return normalized;
  }

  const textLower = text.toLowerCase();
  const foundRoles: string[] = [];
  for (const role of ROLE_KEYWORDS) {
    const regex = new RegExp(`\\b${role}\\b`, "i");
    if (regex.test(textLower)) {
      const label = role === "team" ? role : `${role}-team`;
      if (!foundRoles.includes(label)) foundRoles.push(label);
    }
  }
  const roleAgents = uniqueAgents(foundRoles);
  if (roleAgents.length > 0) return roleAgents;

  // Last resort: no names anywhere, fall back to a generic roster sized by
  // the declared count ("5 agents" -> agent-1..agent-5).
  const declaredCount = parseAgentCount(text);
  if (declaredCount !== null && declaredCount > 0) {
    return rosterFromAgentCount(declaredCount);
  }

  return [];
}

export function extractDisagreement(text: string): string | null {
  const vsRegex = /(.+?)(?:\s+vs\.?|\s+versus)\s+(.+?)(?:[.!?]|$)/i;
  const vsMatch = vsRegex.exec(text);
  if (vsMatch) {
    const agent1 = vsMatch[1].trim().slice(-30);
    const agent2 = vsMatch[2].trim().slice(0, 50);
    return `${agent1} vs. ${agent2}`;
  }

  const contrastRegex =
    /(\w+)\s+(?:wants?|says|advocates?|favors?|prefers?|argues?)\s+([^,]+),\s+(\w+)\s+(?:wants?|says|advocates?|favors?|prefers?|argues?)\s+([^.!?]+)/i;
  const contrastMatch = contrastRegex.exec(text);
  if (contrastMatch) {
    return `${contrastMatch[1]} advocates for ${contrastMatch[2].trim()}. ${contrastMatch[3]} advocates for ${contrastMatch[4].trim()}.`;
  }

  const conflictRegex =
    /(?:conflict|disagreement|debate|divide|split|tension).*?(?:about|over|on|regarding)\s+([^.!?]+)/i;
  const conflictMatch = conflictRegex.exec(text);
  if (conflictMatch?.[1]) {
    return `Disagreement over: ${conflictMatch[1].trim()}`;
  }

  const butRegex = /([^.!?]+)\.\s+(?:But|However|Yet)\s+([^.!?]+)/i;
  const butMatch = butRegex.exec(text);
  if (butMatch) {
    return `${butMatch[1].trim()} However, ${butMatch[2].trim()}`;
  }

  const saysRegex =
    /(\w[\w\s-]{0,24})\s+(?:says|wants|flags|argues)\s+([^.!?]+)/gi;
  const sayMatches = [...text.matchAll(saysRegex)];
  if (sayMatches.length >= 2) {
    const parts = sayMatches
      .slice(0, 4)
      .map((match) => `${match[1].trim()}: ${match[2].trim()}`);
    return parts.join(" · ");
  }

  return null;
}

export function extractResolution(text: string): string | null {
  const decisionRegex =
    /(\w+(?:\s+\w+)?)\s+(?:decided?|chose?|resolved?)\s+(?:to\s+|:)?([^.!?]+)/i;
  const decisionMatch = decisionRegex.exec(text);
  if (decisionMatch) {
    const decider = decisionMatch[1].trim();
    const action = decisionMatch[2].trim();
    return `${decider} decided to ${action}`;
  }

  const settlementRegex =
    /(?:we|they|team|legal|policy)\s+(?:went with|chose|settled on|agreed to)\s+([^.!?]+)/i;
  const settlementMatch = settlementRegex.exec(text);
  if (settlementMatch?.[1]) {
    return `Chose: ${settlementMatch[1].trim()}`;
  }

  const prevailRegex =
    /(?:decided|chose|agreed)\s+(?:that\s+)?(\w+).{0,30}(?:won|prevail|succeed|priority|overrides?)/i;
  const prevailMatch = prevailRegex.exec(text);
  if (prevailMatch?.[1]) {
    return `Decided that ${prevailMatch[1]}'s position prevailed`;
  }

  if (/\blegal(?:\s+\w+){0,3}\s+(?:risk|position)\s+(?:takes|wins|overrides?)\s+priority\b/i.test(text)) {
    return "Legal risk assessment overrides immediate approval";
  }

  return null;
}

export function extractOutcome(text: string): string | null {
  const outcomeRegex =
    /(?:approved?|adopted?|implemented?|rejected?|denied?|accepted?)(?:\s+(?:with|including|subject to))?\s+([^.!?]+[.!?]?)/i;
  const outcomeMatch = outcomeRegex.exec(text);
  if (outcomeMatch) {
    return outcomeMatch[0].trim();
  }

  const resultRegex = /(?:result|outcome|finally|ended\s+up)\s+(?:was|is)\s+([^.!?]+)/i;
  const resultMatch = resultRegex.exec(text);
  if (resultMatch?.[1]) {
    return resultMatch[1].trim();
  }

  const decidedToRegex = /decided?\s+to\s+([^.!?]+)/i;
  const decidedMatch = decidedToRegex.exec(text);
  if (decidedMatch?.[1]) {
    return `Decided to ${decidedMatch[1].trim()}`;
  }

  return null;
}

export function extractConvergencePoint(text: string): ConvergenceExtractionResult {
  const extracted: ConvergenceExtracted = {};
  let confidence = 0;
  const found: string[] = [];
  const missing: string[] = [];

  const agents = extractAgents(text);
  if (agents.length >= 2) {
    extracted.agentRoster = agents;
    found.push(`Agents (${agents.length})`);
    confidence += 30;
  } else if (agents.length === 1) {
    extracted.agentRoster = agents;
    found.push("1 agent (need at least 2)");
  } else {
    missing.push("Agents or roles (need at least 2)");
  }

  const disagreement = extractDisagreement(text);
  if (disagreement) {
    extracted.disagreementDimension = disagreement;
    found.push("Disagreement dimension");
    confidence += 30;
  } else {
    missing.push("Disagreement or conflict");
  }

  const resolution = extractResolution(text);
  if (resolution) {
    extracted.resolutionMechanism = resolution;
    found.push("Resolution mechanism");
    confidence += 20;
  } else {
    missing.push("How was it resolved?");
  }

  const outcome = extractOutcome(text);
  if (outcome) {
    extracted.outcome = outcome;
    found.push("Outcome/decision");
    confidence += 20;
  } else {
    missing.push("Final outcome or decision");
  }

  if (!extracted.agentRoster || agents.length < 2 || !extracted.disagreementDimension) {
    confidence = Math.min(confidence, 49);
  }

  return {
    extracted,
    confidence: Math.min(100, confidence),
    found,
    missing,
  };
}

export const CONVERGENCE_SCENARIOS: Scenario[] = [
  {
    id: "content-moderation-appeal",
    title: "Content Moderation Appeal",
    description:
      "Creator has significant following. Legal involvement due to GDPR and reputational concerns. " +
      "Policy review wants to approve the appeal, but legal team flags compliance risks.",
    template: {
      agentRoster: [
        "appeal-coordinator",
        "policy-reviewer",
        "legal-counsel",
        "creator-support",
      ],
      disagreementDimension:
        "Policy reviewer says: Appeal should be approved (policy violation was marginal). " +
        "Legal counsel says: Approval creates GDPR liability and reputational exposure. " +
        "Creator support wants to reinstate immediately (media coverage).",
      resolutionMechanism:
        "Chief architect made the decision: Legal risk assessment overrides immediate approval. " +
        "Phased reinstatement with compliance measures.",
      outcome:
        "Approved with mandatory GDPR compliance review, phased reinstatement over 48 hours, " +
        "and external legal audit before full public restoration.",
    },
  },
  {
    id: "auth-service-rollout",
    title: "Auth Service Rollout Decision",
    description:
      "Performance team wants immediate rollout of Auth v4.2 to reduce latency. " +
      "Security team wants additional testing gates. Timeline pressure from product due to customer commitments.",
    template: {
      agentRoster: [
        "performance-engineer",
        "security-lead",
        "infrastructure-architect",
        "product-manager",
      ],
      disagreementDimension:
        "Performance engineer: Rollout now (tested in staging, fixes known latency issue). " +
        "Security lead: Need staged rollout with security gates (new auth flow requires additional validation). " +
        "Product manager: Customer expectations require deployment by Friday.",
      resolutionMechanism:
        "VP of Engineering decided: Staged rollout with compromise on timeline. " +
        "Accepted security team's gates as requirement, not suggestion.",
      outcome:
        "Staged rollout with security gate checks: 10% → 50% → 100% over 3 days. " +
        "Security gates non-negotiable. Friday deadline extended to Monday.",
    },
  },
  {
    id: "billing-refund-decision",
    title: "Billing Refund Appeal",
    description:
      "Customer claims double charge on recurring subscription. " +
      "Billing sees valid charge. Finance concerned about revenue impact. Legal has no fraud signal.",
    template: {
      agentRoster: [
        "billing-coordinator",
        "finance-lead",
        "legal-counsel",
        "customer-success",
      ],
      disagreementDimension:
        "Billing: Transaction is valid per our records. Finance: Full refund impacts quarterly revenue target. " +
        "Legal: No fraud indicator, but customer threatens negative media coverage. " +
        "Customer success: Relationship risk, customer is VIP account.",
      resolutionMechanism:
        "Billing director decided: Investigate charge pattern for root cause, " +
        "then decide based on findings rather than on revenue pressure.",
      outcome:
        "Issued full refund pending investigation. Found billing system bug affecting 0.3% of customers. " +
        "Proactive outreach to affected accounts.",
    },
  },
  {
    id: "feature-deprecation",
    title: "Legacy Feature Deprecation",
    description:
      "Platform team wants to deprecate legacy API (maintenance burden). " +
      "Customer success reports major customer using it heavily. Product wants to keep it for backward compatibility.",
    template: {
      agentRoster: [
        "platform-architect",
        "customer-success",
        "product-manager",
        "legal-counsel",
      ],
      disagreementDimension:
        "Platform: Deprecate (maintenance cost too high, security burden). " +
        "Customer success: One major account depends on it (migration cost for customer is high). " +
        "Product: Support it for one more year (contract obligation).",
      resolutionMechanism:
        "CTO decided: Support with sunset plan. Give customer 18-month migration window. " +
        "Platform team can reduce maintenance but not remove.",
      outcome:
        "Announced 18-month sunset. Offered customer free migration assistance. " +
        "Platform team reduced scope to maintenance-only mode.",
    },
  },
];

export const CONVERGENCE_FIELDS: FormFieldDef[] = [
  {
    name: "agentRoster",
    type: "tags",
    label: "Agent Roster",
    description: "Roles or agents involved in this decision. No personas (use role names).",
    placeholder: "e.g., policy-reviewer, legal-counsel, creator-support",
    required: true,
  },
  {
    name: "disagreementDimension",
    type: "textarea",
    label: "Disagreement",
    description: "What are they disagreeing on? Describe each agent's position.",
    placeholder:
      "e.g., Policy says yes, Legal flags GDPR risk, Creator Support wants immediate action",
    required: true,
  },
  {
    name: "resolutionMechanism",
    type: "textarea",
    label: "Resolution Mechanism",
    description: "How was the disagreement resolved? Who decided? Why?",
    placeholder: "e.g., Chief architect decided: Legal risk overrides approval",
    required: false,
  },
  {
    name: "outcome",
    type: "textarea",
    label: "Outcome",
    description: "What was the final decision? What was adopted or implemented?",
    placeholder: "e.g., Approved with mandatory GDPR review and phased rollout",
    required: false,
  },
];

const FILE_EXTENSIONS = [".txt", ".json", ".md", ".csv"];

export async function extractFromFile(
  file: File,
): Promise<{ text: string; error?: string }> {
  const validTypes = [
    "text/plain",
    "application/json",
    "text/markdown",
    "text/csv",
  ];
  const ext = file.name.includes(".")
    ? file.name.slice(file.name.lastIndexOf(".")).toLowerCase()
    : "";

  if (!validTypes.includes(file.type) && !FILE_EXTENSIONS.includes(ext)) {
    return { text: "", error: "Only text, JSON, and markdown files supported" };
  }

  try {
    const text = await file.text();
    return { text };
  } catch {
    return { text: "", error: "Could not read file" };
  }
}

export function convergenceFormToWorkspace(
  form: Record<string, unknown>,
): Record<string, unknown> {
  const roster = Array.isArray(form.agentRoster)
    ? (form.agentRoster as string[])
        .map((item) => String(item).trim())
        .filter(Boolean)
        .filter((item, index, list) => {
          const key = item.toLowerCase();
          return list.findIndex((other) => other.toLowerCase() === key) === index;
        })
    : [];

  const positions = roster.map((agent) => ({
    agent,
    stance: "",
    evidence: [] as string[],
  }));

  return {
    agentRoster: roster,
    agentCount: roster.length,
    disagreement: String(form.disagreementDimension ?? ""),
    resolutionMechanism: String(form.resolutionMechanism ?? ""),
    resolutionRationale: String(form.resolutionMechanism ?? ""),
    decision: String(form.outcome ?? ""),
    positions,
  };
}

export function workspaceToConvergenceForm(
  workspace: Record<string, unknown>,
): Record<string, unknown> {
  const roster = Array.isArray(workspace.agentRoster)
    ? (workspace.agentRoster as string[])
    : Array.isArray(workspace.positions)
      ? (workspace.positions as { agent?: string }[])
          .map((row) => row.agent?.trim())
          .filter(Boolean)
      : [];

  return {
    agentRoster: roster,
    disagreementDimension: String(workspace.disagreement ?? ""),
    resolutionMechanism: String(workspace.resolutionMechanism ?? ""),
    outcome: String(workspace.decision ?? ""),
  };
}

export function markAutoFilledFields(
  autoFilledKeys: Set<string>,
): FormFieldDef[] {
  return CONVERGENCE_FIELDS.map((field) => ({
    ...field,
    autoFilled: autoFilledKeys.has(field.name),
  }));
}

const REFINEMENT_FIELD_ALIASES: Record<string, keyof ConvergenceExtracted> = {
  roster: "agentRoster",
  agents: "agentRoster",
  agent_roster: "agentRoster",
  disagreement: "disagreementDimension",
  disagreement_dimension: "disagreementDimension",
  resolution: "resolutionMechanism",
  resolution_mechanism: "resolutionMechanism",
  outcome: "outcome",
  decision: "outcome",
};

export function applyConvergenceRefinement(
  formState: Record<string, unknown>,
  parsed: { field: string; action: "add" | "remove" | "change"; value: string },
): Record<string, unknown> {
  const next = { ...formState };
  const targetField =
    REFINEMENT_FIELD_ALIASES[parsed.field] ?? (parsed.field as keyof ConvergenceExtracted);

  if (parsed.action === "change") {
    next[targetField] = parsed.value;
    return next;
  }

  if (targetField !== "agentRoster") {
    return next;
  }

  const current = Array.isArray(next.agentRoster)
    ? [...(next.agentRoster as string[])]
    : [];

  if (parsed.action === "add") {
    const value = normalizeAgent(parsed.value);
    if (value && !current.includes(value)) {
      next.agentRoster = [...current, value];
    }
  }

  if (parsed.action === "remove") {
    next.agentRoster = current.filter(
      (item) => item.toLowerCase() !== parsed.value.toLowerCase(),
    );
  }

  return next;
}
