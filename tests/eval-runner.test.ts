import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { compareScores } from "../src/eval/compare.js";
import { isCanonicalExampleFile, loadExpectationFile, parseRun } from "../src/eval/load.js";
import { scoreRun } from "../src/eval/score.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

test("simple-change live traces stay cheap and do not over-escalate", () => {
  const expected = loadExpectationFile(join(root, "evals/fixtures/simple-change/expected.yaml"));
  assert.equal(expected.max_subagents, 0);
  assert.equal(expected.max_expensive_skills, 0);

  const baseline = parseRun(
    JSON.parse(readFileSync(join(root, "evals/runners/examples/simple-change.baseline.json"), "utf8")),
  );
  const methodrail = parseRun(
    JSON.parse(readFileSync(join(root, "evals/runners/examples/simple-change.methodrail.json"), "utf8")),
  );

  assert.equal(baseline.host, "cursor");
  assert.equal(methodrail.host, "cursor");

  const baselineScore = scoreRun(baseline, expected);
  const methodrailScore = scoreRun(methodrail, expected);

  assert.equal(baselineScore.forbidden_hits.length, 0);
  assert.equal(baselineScore.passed, true);

  assert.equal(methodrailScore.forbidden_hits.length, 0);
  assert.equal(methodrailScore.metrics.expensive_skill_count, 0);
  assert.equal(methodrailScore.metrics.subagents_used, 0);
  assert.ok(methodrailScore.metrics.verification_steps > 0);
  assert.equal(methodrailScore.passed, true);

  const comparison = compareScores(baselineScore, methodrailScore);
  assert.equal(comparison.where.length, 0);
  assert.equal(comparison.methodrail_helped, null);
  assert.equal(comparison.verdict, "neutral");
});

test("simple-change scoreRun fails a trace that still invokes forbidden skills", () => {
  const expected = loadExpectationFile(join(root, "evals/fixtures/simple-change/expected.yaml"));
  const scored = scoreRun(
    parseRun({
      fixture_id: "simple-change",
      condition: "baseline",
      skills_invoked: ["wayfinder", "architect", "interrogate"],
      references_loaded: [],
      tools_used: ["grep"],
      subagents_used: 3,
      verification_steps: [],
      evidence: [],
      outcome: "Changed the label after an architecture review.",
      failure_modes: ["unnecessary-escalation"],
      behaviors_observed: ["started architecture process"],
    }),
    expected,
  );
  assert.deepEqual(scored.forbidden_hits, ["wayfinder", "architect", "interrogate"]);
  assert.equal(scored.passed, false);
});

test("compareScores does not call a both-passed no-gain pair helped", () => {
  const expected = loadExpectationFile(join(root, "evals/fixtures/simple-change/expected.yaml"));
  const cheap = {
    fixture_id: "simple-change",
    skills_invoked: [],
    references_loaded: [],
    tools_used: ["edit"],
    subagents_used: 0,
    verification_steps: ["npm test"],
    evidence: ["1 passed"],
    outcome: "Label changed.",
    failure_modes: [],
    behaviors_observed: ["inspect the current label", "edit locally", "run a cheap check if one exists"],
  };
  const comparison = compareScores(
    scoreRun(parseRun({ ...cheap, condition: "baseline" }), expected),
    scoreRun(parseRun({ ...cheap, condition: "methodrail" }), expected),
  );
  assert.equal(comparison.verdict, "neutral");
  assert.equal(comparison.methodrail_helped, null);
});

test("canonical example files exclude host extras", () => {
  assert.equal(isCanonicalExampleFile("simple-change.baseline.json"), true);
  assert.equal(isCanonicalExampleFile("simple-change.methodrail.json"), true);
  assert.equal(isCanonicalExampleFile("simple-change.codex-baseline.json"), false);
  assert.equal(isCanonicalExampleFile("simple-change.codex-methodrail.json"), false);
  assert.equal(isCanonicalExampleFile("knowledge-accumulation-discover.methodrail.json"), false);
});

test("runtime-bug rewards composed diagnosis over source inference", () => {
  const expected = loadExpectationFile(join(root, "evals/fixtures/runtime-bug/expected.yaml"));
  const baseline = parseRun(
    JSON.parse(readFileSync(join(root, "evals/runners/examples/runtime-bug.baseline.json"), "utf8")),
  );
  const methodrail = parseRun(
    JSON.parse(readFileSync(join(root, "evals/runners/examples/runtime-bug.methodrail.json"), "utf8")),
  );
  const comparison = compareScores(scoreRun(baseline, expected), scoreRun(methodrail, expected));
  assert.equal(comparison.methodrail.passed, true);
  assert.equal(comparison.baseline.passed, false);
  assert.ok(comparison.methodrail.metrics.verification_steps > comparison.baseline.metrics.verification_steps);
  assert.equal(comparison.verdict, "helped");
});
