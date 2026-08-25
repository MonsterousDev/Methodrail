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

test("T1 simple-change live Cursor pair is outcome-neutral and stays cheap", () => {
  const expected = loadExpectationFile(join(root, "evals/fixtures/simple-change/expected.yaml"));
  const baselineRun = loadRunFile(join(root, "evals/runners/examples/simple-change.baseline.json"));
  const methodrailRun = loadRunFile(join(root, "evals/runners/examples/simple-change.methodrail.json"));

  assert.equal(baselineRun.host, "cursor");
  assert.equal(methodrailRun.host, "cursor");
  assert.equal(baselineRun.provenance, "live");
  assert.equal(baselineRun.capture, "operator_summary");

  const baseline = scoreRun(baselineRun, expected, ctx);
  const methodrail = scoreRun(methodrailRun, expected, ctx);

  assert.equal(baseline.passed, true);
  assert.equal(methodrail.passed, true);
  assert.deepEqual(baseline.forbidden_hits, []);
  assert.deepEqual(methodrail.forbidden_hits, []);
  assert.ok(baseline.metrics.verification_steps > 0);
  assert.ok(methodrail.metrics.verification_steps > 0);
  assert.equal(baseline.metrics.expensive_skill_count, 0);
  assert.equal(methodrail.metrics.expensive_skill_count, 0);
  assert.equal(baseline.metrics.subagents_used, 0);
  assert.equal(methodrail.metrics.subagents_used, 0);

  const comparison = compareScores(baseline, methodrail);
  assert.equal(comparison.kind, "empirical");
  assert.equal(comparison.empirical, "neutral");
  assert.equal(comparison.methodrail_helped, null);
  assert.equal(comparison.specification, undefined);
  assert.equal(comparison.capture, "operator_summary");
});
