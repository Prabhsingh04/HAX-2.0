/**
 * Catalog validators — brief section 11, step 1: "validation checks (counts,
 * enum integrity, alias table resolves, every response.value is legal)."
 *
 * Pure functions over a catalog (`CatalogPattern[]` + `ModeDef[]`). They run on
 * whatever data the repo's data files provide, so the moment the design side
 * pushes the canonical catalog, these catch contract violations before the
 * server serves bad data to an agent.
 *
 * Errors are contract violations that must block (bad enum, wrong counts,
 * illegal responses, dangling refs). Warnings are soft (missing prose, thin
 * levels, a merged pattern without variants) — report, don't block.
 */
import {
  AUDIENCES,
  CHANNELS,
  EVIDENCE_VALUES,
  LEVELS,
  MODES,
  MODE_FAMILY,
  SOURCES,
  type CatalogPattern,
  type Level,
  type Mode,
  type ModeDef,
} from "@/lib/patterns/behavior";
import { PATTERN_ALIASES } from "@/lib/patterns/aliases";

/** Expected counts from the brief, section 6 ("use these as a validation
 *  check"). If a section-10 decision changes an assignment, update these — a
 *  mismatch then points straight at the level/mode that moved. */
export const EXPECTED_LEVEL_COUNTS: Record<Level, number> = {
  L1: 8,
  L2: 3,
  L3: 9,
  L4: 3,
};
export const EXPECTED_PRIMARY_MODE_COUNTS: Record<Mode, number> = {
  declare: 3,
  signal: 5,
  explain: 4,
  request: 0,
  propose: 2,
  delegate: 0,
  coordinate: 5,
  resolve: 2,
  commit: 2,
};

/** Modes declared intentionally empty (gaps, not errors). The brief had
 *  request + delegate; v3's Follow Up and Task Assignment now fill them. */
const EMPTY_MODES: readonly Mode[] = [];

export interface CatalogStats {
  total: number;
  byLevel: Record<Level, number>;
  byPrimaryMode: Record<Mode, number>;
}

export interface ValidationReport {
  ok: boolean; // true when there are no errors
  errors: string[];
  warnings: string[];
  stats: CatalogStats;
}

const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function zeroLevelCounts(): Record<Level, number> {
  return { L1: 0, L2: 0, L3: 0, L4: 0 };
}
function zeroModeCounts(): Record<Mode, number> {
  return {
    declare: 0, signal: 0, explain: 0, request: 0, propose: 0,
    delegate: 0, coordinate: 0, resolve: 0, commit: 0,
  };
}

export function validateCatalog(
  patterns: CatalogPattern[],
  modes: ModeDef[],
): ValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  const levelSet = new Set<string>(LEVELS);
  const modeSet = new Set<string>(MODES);
  const channelSet = new Set<string>(CHANNELS);
  const audienceSet = new Set<string>(AUDIENCES);
  const evidenceSet = new Set<string>(EVIDENCE_VALUES);
  const sourceSet = new Set<string>(SOURCES);

  // ---- Modes (ModeDef[]) -------------------------------------------------
  const modeById = new Map<string, ModeDef>();
  for (const m of modes) {
    if (!modeSet.has(m.id)) {
      errors.push(`ModeDef has unknown mode id "${m.id}"`);
      continue;
    }
    if (modeById.has(m.id)) errors.push(`Duplicate ModeDef for mode "${m.id}"`);
    modeById.set(m.id, m);
    if (MODE_FAMILY[m.id] !== m.family) {
      errors.push(
        `ModeDef "${m.id}" family is "${m.family}", expected "${MODE_FAMILY[m.id]}"`,
      );
    }
    if (!m.responses?.length) warnings.push(`ModeDef "${m.id}" has no responses`);
    if (m.not_to_confuse_with && !modeSet.has(m.not_to_confuse_with.mode)) {
      errors.push(
        `ModeDef "${m.id}" not_to_confuse_with references unknown mode "${m.not_to_confuse_with.mode}"`,
      );
    }
  }
  for (const mode of MODES) {
    if (!modeById.has(mode)) errors.push(`Missing ModeDef for mode "${mode}"`);
  }

  // ---- Patterns ----------------------------------------------------------
  const ids = new Set<string>();
  const byLevel = zeroLevelCounts();
  const byPrimaryMode = zeroModeCounts();
  let missingSpec = 0;
  let missingSummary = 0;
  let missingTriggers = 0;

  for (const p of patterns) {
    const where = p.id || "(no id)";

    if (!p.id || !KEBAB.test(p.id)) errors.push(`Pattern id "${where}" is not kebab-case`);
    if (ids.has(p.id)) errors.push(`Duplicate pattern id "${p.id}"`);
    ids.add(p.id);

    // enum integrity
    if (!modeSet.has(p.mode?.primary)) errors.push(`"${where}": bad primary mode "${p.mode?.primary}"`);
    if (p.mode?.secondary && !modeSet.has(p.mode.secondary)) errors.push(`"${where}": bad secondary mode "${p.mode.secondary}"`);
    if (!levelSet.has(p.level?.primary)) errors.push(`"${where}": bad primary level "${p.level?.primary}"`);
    for (const k of Object.keys(p.level?.notes ?? {})) {
      if (!levelSet.has(k)) errors.push(`"${where}": level.notes has unknown level "${k}"`);
    }
    if (p.level?.primary && !(p.level.primary in (p.level.notes ?? {}))) {
      warnings.push(`"${where}": level.notes missing an entry for its primary level ${p.level.primary}`);
    }
    for (const c of p.channels ?? []) {
      if (!channelSet.has(c)) errors.push(`"${where}": bad channel "${c}"`);
    }
    for (const a of p.audience ?? []) {
      if (!audienceSet.has(a)) errors.push(`"${where}": bad audience "${a}"`);
    }
    if (!evidenceSet.has(p.evidence)) errors.push(`"${where}": bad evidence "${p.evidence}"`);
    if (!sourceSet.has(p.source)) errors.push(`"${where}": bad source "${p.source}"`);

    // Per brief section 4: a pattern's `responses`, when present, ARE the
    // authoritative valid responses (concrete per-pattern labels), not a subset
    // of the mode's generic responses. So we only check they're non-empty — the
    // interaction-time rule (response.value ∈ pattern.responses else mode) is
    // enforced on write, not here.
    if (p.responses) {
      if (p.responses.length === 0) warnings.push(`"${where}": empty responses array (drop it to inherit the mode's)`);
      if (p.responses.some((r) => !r?.trim())) errors.push(`"${where}": has a blank response value`);
    }

    // variants: exactly one default, kebab ids unique, valid source
    if (p.variants?.length) {
      const seen = new Set<string>();
      let defaults = 0;
      for (const v of p.variants) {
        if (!KEBAB.test(v.id)) errors.push(`"${where}": variant id "${v.id}" is not kebab-case`);
        if (seen.has(v.id)) errors.push(`"${where}": duplicate variant id "${v.id}"`);
        seen.add(v.id);
        if (v.source !== "sdk" && v.source !== "ioc") errors.push(`"${where}": variant "${v.id}" bad source "${v.source}"`);
        if (v.default) defaults++;
      }
      if (defaults !== 1) errors.push(`"${where}": expected exactly one default variant, found ${defaults}`);
    } else if ((p.merged_from?.length ?? 0) > 1 || p.source === "sdk+ioc") {
      warnings.push(`"${where}": merged pattern (from ${p.merged_from?.join(", ") || "multiple"}) carries no variants`);
    }

    // soft content checks (aggregated to avoid 23× noise)
    if (!p.spec?.trim()) missingSpec++;
    if (!p.summary?.trim()) missingSummary++;
    if (!p.triggers?.length) missingTriggers++;

    // count only valid level/mode values
    if (levelSet.has(p.level?.primary)) byLevel[p.level.primary]++;
    if (modeSet.has(p.mode?.primary)) byPrimaryMode[p.mode.primary]++;
  }

  // ---- Referential integrity (composes_with / conflicts_with) ------------
  const resolve = (id: string) => PATTERN_ALIASES[id] ?? id;
  for (const p of patterns) {
    for (const ref of [...(p.composes_with ?? []), ...(p.conflicts_with ?? [])]) {
      if (!ids.has(resolve(ref))) {
        errors.push(`"${p.id}": references unknown pattern "${ref}"`);
      }
    }
  }

  // ---- Alias table -------------------------------------------------------
  for (const [oldId, newId] of Object.entries(PATTERN_ALIASES)) {
    if (!ids.has(newId)) errors.push(`Alias "${oldId}" → "${newId}" targets a pattern not in the catalog`);
    if (ids.has(oldId)) errors.push(`Alias key "${oldId}" is also a live pattern id (old name should be retired)`);
  }

  // ---- Counts ------------------------------------------------------------
  // The brief's section-6 counts are a baseline, but the design evolves (level/
  // mode reassignments, dropping Details Dashboard). So a mismatch is a WARNING
  // to review, not a hard error — it still surfaces an accidental mis-level.
  for (const level of LEVELS) {
    if (byLevel[level] !== EXPECTED_LEVEL_COUNTS[level]) {
      warnings.push(`Level ${level}: ${byLevel[level]} patterns (brief baseline was ${EXPECTED_LEVEL_COUNTS[level]})`);
    }
  }
  for (const mode of MODES) {
    if (byPrimaryMode[mode] !== EXPECTED_PRIMARY_MODE_COUNTS[mode]) {
      warnings.push(`Primary mode "${mode}": ${byPrimaryMode[mode]} (brief baseline was ${EXPECTED_PRIMARY_MODE_COUNTS[mode]})`);
    }
  }
  // Internal consistency IS a hard error (a count that doesn't add up = data loss).
  const levelSum = LEVELS.reduce((s, l) => s + byLevel[l], 0);
  const modeSum = MODES.reduce((s, m) => s + byPrimaryMode[m], 0);
  if (levelSum !== patterns.length) errors.push(`Level counts sum to ${levelSum}, but there are ${patterns.length} patterns`);
  if (modeSum !== patterns.length) errors.push(`Primary-mode counts sum to ${modeSum}, but there are ${patterns.length} patterns`);

  // ---- Gaps / thin levels (informational) --------------------------------
  for (const mode of MODES) {
    if (EMPTY_MODES.includes(mode)) {
      if (byPrimaryMode[mode] > 0) warnings.push(`Mode "${mode}" is documented as an empty gap but has ${byPrimaryMode[mode]} pattern(s)`);
    } else if (byPrimaryMode[mode] === 0) {
      warnings.push(`Mode "${mode}" has no patterns`);
    }
  }

  if (missingSpec) warnings.push(`${missingSpec} pattern(s) missing a spec sentence (needed before launch)`);
  if (missingSummary) warnings.push(`${missingSummary} pattern(s) missing a summary`);
  if (missingTriggers) warnings.push(`${missingTriggers} pattern(s) have no triggers`);

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    stats: { total: patterns.length, byLevel, byPrimaryMode },
  };
}
