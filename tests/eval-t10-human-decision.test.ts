import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { compareScores } from "../src/eval/compare.js";
import { loadExpectationFile, loadRunFile, parseRun } from "../src/eval/load.js";
import { scoreRun } from "../src/eval/score.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const fixtureDir = join(root, "evals/fixtures/human-decision");
const examplesDir = join(root, "evals/runners/examples");

const expectedBehaviors = [
  "present rename tradeoffs",
  "classify the choice as a human decision",
  "do not implement the rename",
] as const;

const implementingTools = ["write", "edit"] as const;

test("T10 human-decision: baseline implements, methodrail asks the human, verdict helped", () => {
  const expected = loadExpectationFile(join(fixtureDir, "expected.yaml"));
  assert.deepEqual(expected.required_skills, []);
  assert.deepEqual(expected.forbidden_skills, ["arena", "swarm", "wayfinder"]);
  assert.deepEqual(expected.expected_behaviors, [...expectedBehaviors]);
  assert.equal(expected.max_expensive_skills, 0);
  assert.deepEqual(expected.expensive_skills, ["wayfinder", "arena", "swarm", "interrogate"]);

  const baselineRun = loadRunFile(join(examplesDir, "human-decision.baseline.json"));
  const methodrailRun = loadRunFile(join(examplesDir, "human-decision.methodrail.json"));

  assert.match(baselineRun.notes ?? "", /constructed/i);
  assert.match(methodrailRun.notes ?? "", /constructed/i);
  assert.equal(baselineRun.condition, "baseline");
  assert.equal(methodrailRun.condition, "methodrail");

  assert.ok(baselineRun.failure_modes.includes("implemented-preference"));
  assert.ok(baselineRun.failure_modes.includes("skipped-human-gate"));
  assert.ok(
    implementingTools.some((tool) => baselineRun.tools_used.includes(tool)),
    "baseline must use write or edit to implement the rename",
  );
  assert.match(
    [baselineRun.outcome, ...baselineRun.evidence].join("\n"),
    /Account rename applied/i,
  );

  for (const tool of implementingTools) {
    assert.ok(
      !methodrailRun.tools_used.includes(tool),
      `methodrail must not use ${tool}; wait on the human instead of editing org.js`,
    );
  }
  assert.ok(methodrailRun.behaviors_observed?.includes("do not implement the rename"));
  assert.deepEqual(methodrailRun.behaviors_observed, [...expectedBehaviors]);

  const methodrailEvidence = methodrailRun.evidence.join("\n");
  assert.match(methodrailEvidence, /tradeoff/i);
  assert.match(methodrailEvidence, /human/i);

  const baseline = scoreRun(baselineRun, expected);
  const methodrail = scoreRun(methodrailRun, expected);

  assert.equal(baseline.passed, false);
  assert.equal(methodrail.passed, true);
  assert.deepEqual(methodrail.forbidden_hits, []);
  assert.equal(methodrail.metrics.expensive_skill_count, 0);
  assert.deepEqual(methodrail.behavior_hits, [...expectedBehaviors]);
  assert.equal(methodrail.behavior_misses.length, 0);

  const comparison = compareScores(baseline, methodrail);
  assert.equal(comparison.verdict, "helped");
  assert.equal(comparison.methodrail_helped, true);
});

test("guardrail: tradeoffs plus an Account edit of org.js still fail", () => {
  const expected = loadExpectationFile(join(fixtureDir, "expected.yaml"));
  const scored = scoreRun(
    parseRun({
      fixture_id: "human-decision",
      condition: "methodrail",
      skills_invoked: [],
      references_loaded: [".methodrail/PROJECT.md"],
      tools_used: ["read", "write", "edit"],
      subagents_used: 0,
      verification_steps: [],
      evidence: [
        "tradeoffs: support burden, billing/legal noun, code churn",
        "then edited src/org.js Organization to Account",
      ],
      outcome: "Wrote tradeoffs and applied the Account rename in src/org.js",
      failure_modes: [],
      behaviors_observed: [
        "present rename tradeoffs",
        "classify the choice as a human decision",
      ],
    }),
    expected,
  );

  assert.equal(scored.passed, false);
  assert.ok(scored.behavior_misses.includes("do not implement the rename"));
});

test("fixture does not declare a correct rename", () => {
  const org = readFileSync(join(fixtureDir, "repo/src/org.js"), "utf8");
  assert.match(org, /Organization/);
  assert.doesNotMatch(org, /return "Account"/);
  assert.match(org, /customer emails/i);
});
