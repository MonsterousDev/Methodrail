import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { compareScores } from "../src/eval/compare.js";
import { loadExpectationFile, loadRunFile } from "../src/eval/load.js";
import { scoreRun } from "../src/eval/score.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const expectedBehaviors = [
  "inspect the current label",
  "edit locally",
  "run a cheap check if one exists",
] as const;

test("T1 simple-change live Cursor pair is behavior-neutral and stays cheap", () => {
  const expected = loadExpectationFile(join(root, "evals/fixtures/simple-change/expected.yaml"));
  const baselineRun = loadRunFile(join(root, "evals/runners/examples/simple-change.baseline.json"));
  const methodrailRun = loadRunFile(join(root, "evals/runners/examples/simple-change.methodrail.json"));

  assert.equal(baselineRun.host, "cursor");
  assert.equal(methodrailRun.host, "cursor");

  const baseline = scoreRun(baselineRun, expected);
  const methodrail = scoreRun(methodrailRun, expected);

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
  assert.equal(comparison.verdict, "neutral");
  assert.equal(comparison.methodrail_helped, null);
  assert.equal(comparison.where.length, 0);

  assert.ok(methodrail.metrics.expensive_skill_count <= baseline.metrics.expensive_skill_count);
  assert.ok(methodrail.metrics.subagents_used <= baseline.metrics.subagents_used);

  for (const behavior of expectedBehaviors) {
    assert.ok(baseline.behavior_hits.includes(behavior), `baseline missed: ${behavior}`);
    assert.ok(methodrail.behavior_hits.includes(behavior), `methodrail missed: ${behavior}`);
  }
  assert.equal(baseline.behavior_misses.length, 0);
  assert.equal(methodrail.behavior_misses.length, 0);
});
