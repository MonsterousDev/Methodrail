import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { compareScores } from "../src/eval/compare.js";
import { loadExpectationFile, loadRunFile } from "../src/eval/load.js";
import { scoreRun } from "../src/eval/score.js";
import { EXPENSIVE_SKILLS } from "../src/eval/types.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const expectedBehaviors = [
  "understand the current implementation",
  "consider domain ownership",
  "record a decision",
  "prototype only if empirical uncertainty remains",
] as const;

const requiredSkills = ["how", "domain-modeling", "architect"] as const;
const forbiddenSkills = ["wayfinder", "arena", "swarm", "interrogate"] as const;
const ceremonySkills = ["wayfinder", "arena", "swarm", "interrogate", "prototype"] as const;

test("T4 architecture-decision scores decision quality, not maximum ceremony", () => {
  assert.ok(EXPENSIVE_SKILLS.includes("architect"));
  assert.ok(EXPENSIVE_SKILLS.includes("wayfinder"));

  const expected = loadExpectationFile(join(root, "evals/fixtures/architecture-decision/expected.yaml"));
  assert.deepEqual(expected.required_skills, [...requiredSkills]);
  assert.deepEqual(expected.forbidden_skills, [...forbiddenSkills]);
  assert.deepEqual(expected.expected_behaviors, [...expectedBehaviors]);
  assert.equal(expected.max_expensive_skills, 2);
  assert.deepEqual(expected.expensive_skills, [...forbiddenSkills]);

  const baselineRun = loadRunFile(join(root, "evals/runners/examples/architecture-decision.baseline.json"));
  const methodrailRun = loadRunFile(join(root, "evals/runners/examples/architecture-decision.methodrail.json"));

  assert.match(baselineRun.notes ?? "", /constructed/i);
  assert.match(methodrailRun.notes ?? "", /constructed/i);
  assert.equal(baselineRun.condition, "baseline");
  assert.equal(methodrailRun.condition, "methodrail");

  const baseline = scoreRun(baselineRun, expected);
  const methodrail = scoreRun(methodrailRun, expected);

  assert.equal(baseline.passed, false);
  assert.ok(baseline.skill_misses.includes("how"));
  assert.ok(baseline.skill_misses.includes("domain-modeling"));
  assert.ok(
    baseline.behavior_misses.includes("record a decision") ||
      baselineRun.failure_modes.includes("unrecorded-decision"),
  );

  assert.equal(methodrail.passed, true);
  for (const skill of requiredSkills) {
    assert.ok(methodrail.skill_hits.includes(skill), `methodrail missed required skill: ${skill}`);
  }
  assert.ok(!methodrailRun.skills_invoked.includes("wayfinder"));
  for (const skill of ceremonySkills) {
    assert.ok(!methodrailRun.skills_invoked.includes(skill), `methodrail invoked ceremony skill: ${skill}`);
  }
  assert.deepEqual(methodrail.forbidden_hits, []);
  assert.equal(methodrail.metrics.expensive_skill_count, 0);
  assert.deepEqual(methodrailRun.behaviors_observed, [...expectedBehaviors]);
  assert.deepEqual(methodrail.behavior_hits, [...expectedBehaviors]);
  assert.equal(methodrail.behavior_misses.length, 0);
  assert.ok(methodrail.metrics.verification_steps > 0);
  assert.ok(
    methodrailRun.verification_steps.some((step) => /decision/i.test(step)),
    "methodrail should verify the recorded decision, not a platform rewrite",
  );

  const comparison = compareScores(baseline, methodrail);
  assert.equal(comparison.verdict, "helped");
  assert.equal(comparison.methodrail_helped, true);
});
