import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { compareScores } from "../src/eval/compare.js";
import { loadExpectationFile, loadRunFile } from "../src/eval/load.js";
import { scoreRun } from "../src/eval/score.js";
import type { EvalContext } from "../src/eval/types.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const ctx: EvalContext = { repoRoot: root };
const fixtureDir = join(root, "evals/fixtures/knowledge-accumulation");
const examplesDir = join(root, "evals/runners/examples");

function discoverText(run: { outcome: string; notes?: string; evidence: string[] }): string {
  return [run.outcome, run.notes ?? "", ...run.evidence].join("\n");
}

test("T8 discover trace proposes a knowledge candidate without auto-promoting", () => {
  const discover = loadRunFile(join(examplesDir, "knowledge-accumulation-discover.methodrail.json"));

  assert.equal(discover.condition, "methodrail");
  assert.equal(discover.provenance, "constructed");
  assert.deepEqual(discover.failure_modes, []);
  const evidence = discover.evidence.join("\n");
  assert.match(evidence, /eventId/);
  const text = discoverText(discover);
  assert.match(text, /knowledge candidate|reflect/i);
  assert.doesNotMatch(text, /silently (wrote|promoted)|auto-applied as standing|wrote standing (fact|rule) without/i);
});

test("T8 knowledge-accumulation Task B pair is a specification of persisted knowledge", () => {
  const expected = loadExpectationFile(join(fixtureDir, "expected.yaml"));
  const baselineRun = loadRunFile(join(examplesDir, "knowledge-accumulation.baseline.json"));
  const methodrailRun = loadRunFile(join(examplesDir, "knowledge-accumulation.methodrail.json"));

  assert.equal(baselineRun.provenance, "constructed");
  const loadedWebhooks = (paths: string[]) =>
    paths.some((path) => path.includes(".methodrail/knowledge/webhooks.md"));
  assert.ok(loadedWebhooks(methodrailRun.references_loaded));
  assert.ok(!loadedWebhooks(baselineRun.references_loaded));

  const baseline = scoreRun(baselineRun, expected, ctx);
  const methodrail = scoreRun(methodrailRun, expected, ctx);
  assert.equal(baseline.passed, false);
  assert.equal(methodrail.passed, true);

  const comparison = compareScores(baseline, methodrail);
  assert.equal(comparison.kind, "specification");
  assert.equal(comparison.specification, "passed");
  assert.equal(comparison.methodrail_helped, null);
});
