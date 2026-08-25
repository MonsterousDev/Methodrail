import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { compareScores } from "../src/eval/compare.js";
import { loadExpectationFile, loadRunFile } from "../src/eval/load.js";
import { scoreRun } from "../src/eval/score.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const expectedBehaviors = [
  "detect stale knowledge",
  "prefer repository evidence over .methodrail knowledge",
  "refresh or flag the JWT claim",
] as const;

test("T6 knowledge-freshness constructed pair: Methodrail detects stale JWT knowledge", () => {
  const expected = loadExpectationFile(
    join(root, "evals/fixtures/knowledge-freshness/expected.yaml"),
  );
  const baselineRun = loadRunFile(
    join(root, "evals/runners/examples/knowledge-freshness.baseline.json"),
  );
  const methodrailRun = loadRunFile(
    join(root, "evals/runners/examples/knowledge-freshness.methodrail.json"),
  );

  assert.equal(expected.max_expensive_skills, 0);
  assert.deepEqual(expected.forbidden_skills, ["arena", "swarm"]);
  assert.deepEqual(expected.expected_behaviors, [...expectedBehaviors]);
  assert.ok(baselineRun.notes?.includes("constructed"));
  assert.ok(methodrailRun.notes?.includes("constructed"));
  assert.ok(baselineRun.failure_modes.includes("stale-knowledge-trusted"));
  assert.deepEqual(methodrailRun.behaviors_observed, expected.expected_behaviors);

  const evidence = methodrailRun.evidence.join("\n");
  assert.match(evidence, /JWT knowledge/i);
  assert.match(evidence, /session code/i);

  const baseline = scoreRun(baselineRun, expected);
  const methodrail = scoreRun(methodrailRun, expected);

  assert.equal(baseline.passed, false);
  assert.equal(methodrail.passed, true);
  assert.equal(methodrail.metrics.expensive_skill_count, 0);
  assert.deepEqual(methodrail.forbidden_hits, []);
  assert.deepEqual(methodrail.behavior_hits, [...expectedBehaviors]);
  assert.equal(methodrail.behavior_misses.length, 0);

  const comparison = compareScores(baseline, methodrail);
  assert.equal(comparison.verdict, "helped");
  assert.equal(comparison.methodrail_helped, true);
});
