import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { compareScores } from "../src/eval/compare.js";
import { loadExpectationFile, loadRunFile, REQUIRED_COMPOSITION_FIXTURES } from "../src/eval/load.js";
import { scoreRun } from "../src/eval/score.js";
import type { EvalContext } from "../src/eval/types.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const ctx: EvalContext = { repoRoot: root };
const examples = join(root, "evals/runners/examples");

const SPEC_FIXTURES = ["medium-feature", "review-risk", "project-init"] as const;

test("constructed spec pairs pass as specification, never empirical helped", () => {
  for (const id of SPEC_FIXTURES) {
    const expected = loadExpectationFile(join(root, "evals/fixtures", id, "expected.yaml"));
    const baseline = scoreRun(loadRunFile(join(examples, `${id}.baseline.json`)), expected, ctx);
    const methodrail = scoreRun(loadRunFile(join(examples, `${id}.methodrail.json`)), expected, ctx);
    const comparison = compareScores(baseline, methodrail);
    assert.equal(comparison.kind, "specification", id);
    assert.equal(comparison.specification, "passed", id);
    assert.equal(comparison.methodrail_helped, null, id);
    assert.equal(comparison.empirical, undefined, id);
  }
});

test("every required composition fixture has a canonical pair", () => {
  for (const id of REQUIRED_COMPOSITION_FIXTURES) {
    const baseline = loadRunFile(join(examples, `${id}.baseline.json`));
    const methodrail = loadRunFile(join(examples, `${id}.methodrail.json`));
    assert.equal(baseline.fixture_id, id);
    assert.equal(methodrail.fixture_id, id);
    assert.ok(baseline.artifacts, `${id} baseline missing artifacts`);
    assert.ok(methodrail.artifacts, `${id} methodrail missing artifacts`);
  }
});
