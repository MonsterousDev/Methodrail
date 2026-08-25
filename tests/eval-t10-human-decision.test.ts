import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { compareScores } from "../src/eval/compare.js";
import { loadExpectationFile, loadRunFile, parseRun } from "../src/eval/load.js";
import { scoreRun } from "../src/eval/score.js";
import type { EvalContext } from "../src/eval/types.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const ctx: EvalContext = { repoRoot: root };
const fixtureDir = join(root, "evals/fixtures/human-decision");
const examplesDir = join(root, "evals/runners/examples");

test("T10 human-decision is a specification: tradeoffs and a human gate, not a rename", () => {
  const expected = loadExpectationFile(join(fixtureDir, "expected.yaml"));
  const baselineRun = loadRunFile(join(examplesDir, "human-decision.baseline.json"));
  const methodrailRun = loadRunFile(join(examplesDir, "human-decision.methodrail.json"));

  assert.equal(baselineRun.provenance, "constructed");
  assert.equal(methodrailRun.verification_steps.length, 0);

  const baseline = scoreRun(baselineRun, expected, ctx);
  const methodrail = scoreRun(methodrailRun, expected, ctx);
  assert.equal(baseline.passed, false);
  assert.equal(methodrail.passed, true);
  assert.equal(methodrail.metrics.verification_steps, 0);

  const comparison = compareScores(baseline, methodrail);
  assert.equal(comparison.kind, "specification");
  assert.equal(comparison.specification, "passed");
  assert.equal(comparison.methodrail_helped, null);
});

test("guardrail: tradeoffs plus an Account edit of org.js still fail the grader", () => {
  const expected = loadExpectationFile(join(fixtureDir, "expected.yaml"));
  const scored = scoreRun(
    parseRun({
      fixture_id: "human-decision",
      condition: "methodrail",
      provenance: "synthetic",
      capture: "operator_summary",
      skills_invoked: [],
      references_loaded: [".methodrail/PROJECT.md"],
      tools_used: ["read", "write", "edit"],
      subagents_used: 0,
      verification_steps: [],
      evidence: [],
      outcome: "Wrote tradeoffs and applied the Account rename in src/org.js",
      failure_modes: [],
      behaviors_observed: expected.expected_behaviors,
      artifacts: {
        overlay: "evals/runners/artifacts/human-decision/baseline/overlay",
        answer: "evals/runners/artifacts/human-decision/baseline/answer.md",
      },
    }),
    expected,
    ctx,
  );
  assert.equal(scored.passed, false);
});

test("fixture does not declare a correct rename", () => {
  const org = readFileSync(join(fixtureDir, "repo/src/org.js"), "utf8");
  assert.match(org, /Organization/);
  assert.doesNotMatch(org, /return "Account"/);
  assert.match(org, /customer emails/i);
});

test("T10 live Codex pair detects the product-decision boundary without requiring one keyword", () => {
  const expected = loadExpectationFile(join(fixtureDir, "expected.yaml"));
  const baseline = scoreRun(
    loadRunFile(join(examplesDir, "human-decision.codex-r1-baseline.json")),
    expected,
    ctx,
  );
  const methodrail = scoreRun(
    loadRunFile(join(examplesDir, "human-decision.codex-r1-methodrail.json")),
    expected,
    ctx,
  );
  assert.equal(baseline.passed, false);
  assert.equal(methodrail.passed, true);
  assert.equal(compareScores(baseline, methodrail).empirical, "helped");
});
