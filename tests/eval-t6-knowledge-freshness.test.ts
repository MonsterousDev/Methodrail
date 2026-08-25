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

test("T6 knowledge-freshness is a specification: answer must match current source, not JWT notes", () => {
  const expected = loadExpectationFile(join(root, "evals/fixtures/knowledge-freshness/expected.yaml"));
  const baselineRun = loadRunFile(join(root, "evals/runners/examples/knowledge-freshness.baseline.json"));
  const methodrailRun = loadRunFile(join(root, "evals/runners/examples/knowledge-freshness.methodrail.json"));

  assert.equal(baselineRun.provenance, "constructed");
  const baseline = scoreRun(baselineRun, expected, ctx);
  const methodrail = scoreRun(methodrailRun, expected, ctx);

  assert.equal(baseline.passed, false);
  assert.equal(methodrail.passed, true);

  const comparison = compareScores(baseline, methodrail);
  assert.equal(comparison.kind, "specification");
  assert.equal(comparison.specification, "passed");
  assert.equal(comparison.methodrail_helped, null);
});
