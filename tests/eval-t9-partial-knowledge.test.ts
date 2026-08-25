import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { compareScores } from "../src/eval/compare.js";
import { loadExpectationFile, loadRunFile, parseRun } from "../src/eval/load.js";
import { scoreRun } from "../src/eval/score.js";
import type { EvalContext } from "../src/eval/types.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const ctx: EvalContext = { repoRoot: root };

test("T9 partial-knowledge is a specification: Stripe subscriptions stay, Adyen is the gap", () => {
  const expected = loadExpectationFile(join(root, "evals/fixtures/partial-knowledge/expected.yaml"));
  const baselineRun = loadRunFile(join(root, "evals/runners/examples/partial-knowledge.baseline.json"));
  const methodrailRun = loadRunFile(join(root, "evals/runners/examples/partial-knowledge.methodrail.json"));

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

test("T9 guardrail: discard-all answer fails the grader", () => {
  const expected = loadExpectationFile(join(root, "evals/fixtures/partial-knowledge/expected.yaml"));
  const scored = scoreRun(
    parseRun({
      fixture_id: "partial-knowledge",
      condition: "baseline",
      provenance: "synthetic",
      capture: "operator_summary",
      skills_invoked: [],
      references_loaded: ["repo/src/payments.js", "repo/src/adyen.js"],
      tools_used: ["read"],
      subagents_used: 0,
      verification_steps: [],
      evidence: [],
      outcome:
        "Adyen charges one-time invoices and monthly subscriptions. Stripe is no longer in the picture.",
      failure_modes: ["knowledge-discarded"],
      behaviors_observed: expected.expected_behaviors,
    }),
    expected,
    ctx,
  );
  assert.equal(scored.passed, false);
});

test("T9 guardrail: trust-all answer fails the grader", () => {
  const expected = loadExpectationFile(join(root, "evals/fixtures/partial-knowledge/expected.yaml"));
  const scored = scoreRun(
    parseRun({
      fixture_id: "partial-knowledge",
      condition: "baseline",
      provenance: "synthetic",
      capture: "operator_summary",
      skills_invoked: [],
      references_loaded: [".methodrail/knowledge/payments.md"],
      tools_used: ["read"],
      subagents_used: 0,
      verification_steps: [],
      evidence: [],
      outcome: "Stripe charges both one-time invoice payments and monthly subscriptions.",
      failure_modes: ["knowledge-overtrusted"],
      behaviors_observed: expected.expected_behaviors,
    }),
    expected,
    ctx,
  );
  assert.equal(scored.passed, false);
});

test("T9 live answer may quote the stale all-Stripe claim before correcting it", () => {
  const expected = loadExpectationFile(join(root, "evals/fixtures/partial-knowledge/expected.yaml"));
  const scored = scoreRun(
    loadRunFile(join(root, "evals/runners/examples/partial-knowledge.cursor-r1-baseline.json")),
    expected,
    ctx,
  );
  assert.equal(scored.passed, true);
});
