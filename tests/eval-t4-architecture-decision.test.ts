import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { compareScores } from "../src/eval/compare.js";
import { loadExpectationFile, loadRunFile } from "../src/eval/load.js";
import { scoreRun } from "../src/eval/score.js";
import { EXPENSIVE_SKILLS, type EvalContext } from "../src/eval/types.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const ctx: EvalContext = { repoRoot: root };
const requiredSkills = ["how", "domain-modeling", "architect"] as const;
const forbiddenSkills = ["wayfinder", "arena", "swarm", "interrogate"] as const;

test("T4 architecture-decision is a specification, not empirical helped", () => {
  assert.ok(EXPENSIVE_SKILLS.includes("architect"));
  const expected = loadExpectationFile(join(root, "evals/fixtures/architecture-decision/expected.yaml"));
  assert.deepEqual(expected.required_skills, [...requiredSkills]);
  assert.deepEqual(expected.forbidden_skills, [...forbiddenSkills]);

  const baselineRun = loadRunFile(join(root, "evals/runners/examples/architecture-decision.baseline.json"));
  const methodrailRun = loadRunFile(join(root, "evals/runners/examples/architecture-decision.methodrail.json"));
  assert.equal(baselineRun.provenance, "constructed");
  assert.equal(methodrailRun.provenance, "constructed");

  const baseline = scoreRun(baselineRun, expected, ctx);
  const methodrail = scoreRun(methodrailRun, expected, ctx);

  assert.equal(baseline.passed, false);
  assert.equal(methodrail.passed, true);
  for (const skill of requiredSkills) {
    assert.ok(methodrail.skill_hits.includes(skill), `methodrail missed required skill: ${skill}`);
  }
  assert.equal(methodrail.routing.assessment, "appropriate");
  assert.deepEqual(methodrail.forbidden_hits, []);

  const comparison = compareScores(baseline, methodrail);
  assert.equal(comparison.kind, "specification");
  assert.equal(comparison.specification, "passed");
  assert.equal(comparison.empirical, undefined);
  assert.equal(comparison.methodrail_helped, null);
});
