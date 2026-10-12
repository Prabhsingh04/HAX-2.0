/**
 * Validates the pattern catalog against the brief's contract (counts, enum
 * integrity, alias resolution, response legality, variants, refs).
 * Run: npx tsx scripts/validate-catalog.ts   (exits 1 on any hard error)
 *
 * Use this as the gate when the design side pushes catalog data — it fails
 * fast on contract violations before they reach the server.
 */
import { loadCatalog } from "../lib/patterns/catalog";

const { report } = loadCatalog();
const { stats, errors, warnings } = report;

console.log(`Catalog: ${stats.total} patterns`);
console.log(`  by level:  ${JSON.stringify(stats.byLevel)}`);
console.log(`  by mode:   ${JSON.stringify(stats.byPrimaryMode)}`);

if (warnings.length) {
  console.log(`\nWarnings (${warnings.length}):`);
  for (const w of warnings) console.log(`  • ${w}`);
}

if (errors.length) {
  console.log(`\nErrors (${errors.length}):`);
  for (const e of errors) console.log(`  ✗ ${e}`);
  console.log("\nFAILED — catalog has contract errors.");
  process.exit(1);
}

console.log("\nOK — no contract errors.");
