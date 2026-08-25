import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { compareScores } from "../src/eval/compare.js";
import { loadExpectationFile, loadRunFile, parseRun } from "../src/eval/load.js";
import { scoreRun } from "../src/eval/score.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const expectedBehaviors = [
  "retain the true Stripe subscriptions fact",
  "detect Adyen for one-time payments",
  "reconcile partial knowledge rather than discard or fully trust it",
] as const;

test("T9 partial-knowledge constructed pair: Methodrail reconciles Stripe/Adyen", () => {
  const expected = loadExpectationFile(
    join(root, "evals/fixtures/partial-knowledge/expected.yaml"),
  );
  const baselineRun = loadRunFile(
    join(root, "evals/runners/examples/partial-knowledge.baseline.json"),
  );
  const methodrailRun = loadRunFile(
    join(root, "evals/runners/examples/partial-knowledge.methodrail.json"),
  );

  assert.equal(expected.max_expensive_skills, 0);
  assert.deepEqual(expected.forbidden_skills, ["arena", "swarm"]);
  assert.deepEqual(expected.expected_behaviors, [...expectedBehaviors]);
  assert.ok(baselineRun.notes?.includes("constructed"));
  assert.ok(methodrailRun.notes?.includes("constructed"));

  const baselineModes = baselineRun.failure_modes;
  assert.ok(
    baselineModes.includes("knowledge-overtrusted") || baselineModes.includes("knowledge-discarded"),
    "baseline failure_modes must include knowledge-overtrusted or knowledge-discarded",
  );
  assert.ok(!methodrailRun.failure_modes.includes("knowledge-discarded"));
  assert.deepEqual(methodrailRun.behaviors_observed, expected.expected_behaviors);

  const evidence = methodrailRun.evidence.join("\n");
  assert.match(evidence, /Stripe/);
  assert.match(evidence, /Adyen/);
  assert.match(evidence, /(all payments|stale|reconcil)/i);

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

test("T9 guardrail: discard-all synthetic trace fails scoreRun", () => {
  const expected = loadExpectationFile(
    join(root, "evals/fixtures/partial-knowledge/expected.yaml"),
  );
  const scored = scoreRun(
    parseRun({
      fixture_id: "partial-knowledge",
      condition: "baseline",
      skills_invoked: [],
      references_loaded: ["repo/src/payments.js", "repo/src/adyen.js"],
      tools_used: ["read"],
      subagents_used: 0,
      verification_steps: [],
      evidence: [
        "Ignored the payments note. Rediscovered processors from code and merged them into one Adyen path.",
      ],
      outcome:
        "Adyen charges one-time invoices and monthly subscriptions. Stripe is no longer in the picture.",
      failure_modes: ["knowledge-discarded"],
      behaviors_observed: ["detect Adyen for one-time payments"],
    }),
    expected,
  );

  assert.equal(scored.passed, false);
  assert.ok(scored.behavior_misses.includes("retain the true Stripe subscriptions fact"));
});

test("T9 guardrail: trust-all synthetic trace fails scoreRun", () => {
  const expected = loadExpectationFile(
    join(root, "evals/fixtures/partial-knowledge/expected.yaml"),
  );
  const scored = scoreRun(
    parseRun({
      fixture_id: "partial-knowledge",
      condition: "baseline",
      skills_invoked: [],
      references_loaded: [
        ".methodrail/PROJECT.md",
        ".methodrail/knowledge/payments.md",
      ],
      tools_used: ["read"],
      subagents_used: 0,
      verification_steps: [],
      evidence: [".methodrail/knowledge/payments.md says all customer payments go through Stripe"],
      outcome: "Stripe charges both one-time invoice payments and monthly subscriptions.",
      failure_modes: ["knowledge-overtrusted"],
      behaviors_observed: ["retain the true Stripe subscriptions fact"],
    }),
    expected,
  );

  assert.equal(scored.passed, false);
  assert.ok(scored.behavior_misses.includes("detect Adyen for one-time payments"));
  assert.ok(
    scored.behavior_misses.includes(
      "reconcile partial knowledge rather than discard or fully trust it",
    ),
  );
});
