import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { compareScores } from "../src/eval/compare.js";
import { loadExpectationFile, loadRunFile, parseRun } from "../src/eval/load.js";
import { scoreRun } from "../src/eval/score.js";
import type { EvalContext } from "../src/eval/types.js";
import { evaluateProjectKnowledge } from "../src/knowledge/report.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const ctx: EvalContext = { repoRoot: root };
const examplesDir = join(root, "evals/runners/examples");

function scoreFixture(id: string, condition: "baseline" | "methodrail") {
  const expected = loadExpectationFile(join(root, "evals/fixtures", id, "expected.yaml"));
  return scoreRun(loadRunFile(join(examplesDir, `${id}.${condition}.json`)), expected, ctx);
}

function synthetic(
  fixture_id: string,
  extras: {
    outcome: string;
    overlay: string;
    command_log: string;
    answer: string;
    behaviors?: string[];
  },
) {
  return parseRun({
    fixture_id,
    condition: "methodrail",
    provenance: "synthetic",
    capture: "operator_summary",
    skills_invoked: [],
    references_loaded: [],
    tools_used: [],
    subagents_used: 0,
    verification_steps: [],
    evidence: [],
    outcome: extras.outcome,
    failure_modes: [],
    behaviors_observed: extras.behaviors ?? [],
    artifacts: {
      overlay: extras.overlay,
      command_log: extras.command_log,
      answer: extras.answer,
    },
  });
}

test("C6 knowledge fixtures parse without governance errors", () => {
  for (const id of ["knowledge-applicability", "knowledge-dispute", "knowledge-retired"] as const) {
    const report = evaluateProjectKnowledge(join(root, "evals/fixtures", id));
    assert.equal(report.errors.length, 0, `${id}: ${report.errors.map((item) => item.message).join("\n")}`);
  }
});

test("knowledge-applicability is a specification: honor the legacy exclusion", () => {
  const expected = loadExpectationFile(join(root, "evals/fixtures/knowledge-applicability/expected.yaml"));
  const baseline = scoreFixture("knowledge-applicability", "baseline");
  const methodrail = scoreFixture("knowledge-applicability", "methodrail");
  assert.equal(baseline.passed, false);
  assert.equal(methodrail.passed, true);
  const comparison = compareScores(baseline, methodrail);
  assert.equal(comparison.kind, "specification");
  assert.equal(comparison.specification, "passed");
  assert.equal(comparison.methodrail_helped, null);
  assert.doesNotMatch(readFileSync(join(root, "evals/fixtures/knowledge-applicability/task.md"), "utf8"), /exclud/i);
  const claimed = scoreRun(
    synthetic("knowledge-applicability", {
      outcome: "success",
      overlay: "evals/runners/artifacts/knowledge-applicability/baseline/overlay",
      command_log: "evals/runners/artifacts/knowledge-applicability/baseline/command.log.json",
      answer: "evals/runners/artifacts/knowledge-applicability/methodrail/answer.md",
      behaviors: expected.expected_behaviors,
    }),
    expected,
    ctx,
  );
  assert.equal(claimed.passed, false);
});

test("knowledge-applicability guardrail: empty overlay and crash fail", () => {
  const expected = loadExpectationFile(join(root, "evals/fixtures/knowledge-applicability/expected.yaml"));
  const empty = scoreRun(
    synthetic("knowledge-applicability", {
      outcome: "Preserved the local legacy mechanism.",
      overlay: "evals/runners/artifacts/knowledge-applicability/empty/overlay",
      command_log: "evals/runners/artifacts/knowledge-applicability/empty/command.log.json",
      answer: "evals/runners/artifacts/knowledge-applicability/empty/answer.md",
    }),
    expected,
    ctx,
  );
  assert.equal(empty.passed, false);
  assert.ok(empty.outcome.failures.some((line) => /legacy-fanout/i.test(line)));

  const crash = scoreRun(
    synthetic("knowledge-applicability", {
      outcome: "legacy.ping is routed.",
      overlay: "evals/runners/artifacts/knowledge-applicability/crash/overlay",
      command_log: "evals/runners/artifacts/knowledge-applicability/crash/command.log.json",
      answer: "evals/runners/artifacts/knowledge-applicability/crash/answer.md",
    }),
    expected,
    ctx,
  );
  assert.equal(crash.passed, false);

  const missing = scoreRun(
    parseRun({
      fixture_id: "knowledge-applicability",
      condition: "methodrail",
      provenance: "constructed",
      capture: "operator_summary",
      skills_invoked: [],
      references_loaded: [],
      tools_used: [],
      subagents_used: 0,
      verification_steps: [],
      evidence: [],
      outcome: "success",
      failure_modes: [],
    }),
    expected,
    ctx,
  );
  assert.equal(missing.passed, false);
  assert.equal(missing.outcome.incomplete, true);
});

test("knowledge-dispute is a specification: name both processors, do not patch", () => {
  const expected = loadExpectationFile(join(root, "evals/fixtures/knowledge-dispute/expected.yaml"));
  const baseline = scoreFixture("knowledge-dispute", "baseline");
  const methodrail = scoreFixture("knowledge-dispute", "methodrail");
  assert.equal(baseline.passed, false);
  assert.equal(methodrail.passed, true);
  const comparison = compareScores(baseline, methodrail);
  assert.equal(comparison.kind, "specification");
  assert.equal(comparison.specification, "passed");
  assert.equal(comparison.methodrail_helped, null);
  assert.doesNotMatch(readFileSync(join(root, "evals/fixtures/knowledge-dispute/task.md"), "utf8"), /stripe|adyen|disput/i);
});

test("knowledge-dispute guardrail: generic deferral and a picked winner fail", () => {
  const expected = loadExpectationFile(join(root, "evals/fixtures/knowledge-dispute/expected.yaml"));
  const generic = scoreRun(
    synthetic("knowledge-dispute", {
      outcome: "Please decide.",
      overlay: "evals/runners/artifacts/knowledge-dispute/generic-deferral/overlay",
      command_log: "evals/runners/artifacts/knowledge-dispute/generic-deferral/command.log.json",
      answer: "evals/runners/artifacts/knowledge-dispute/generic-deferral/answer.md",
      behaviors: expected.expected_behaviors,
    }),
    expected,
    ctx,
  );
  assert.equal(generic.passed, false);
  assert.ok(generic.outcome.failures.some((line) => /both-alternatives|generic/i.test(line)));

  const picked = scoreRun(
    synthetic("knowledge-dispute", {
      outcome: "Named Stripe vs Adyen and implemented Stripe.",
      overlay: "evals/runners/artifacts/knowledge-dispute/baseline/overlay",
      command_log: "evals/runners/artifacts/knowledge-dispute/baseline/command.log.json",
      answer: "evals/runners/artifacts/knowledge-dispute/methodrail/answer.md",
      behaviors: expected.expected_behaviors,
    }),
    expected,
    ctx,
  );
  assert.equal(picked.passed, false);
  assert.ok(picked.outcome.failures.some((line) => /protected-files/i.test(line)));
});

test("knowledge-retired is a specification: successor API, not the retired claim", () => {
  const expected = loadExpectationFile(join(root, "evals/fixtures/knowledge-retired/expected.yaml"));
  const baseline = scoreFixture("knowledge-retired", "baseline");
  const methodrail = scoreFixture("knowledge-retired", "methodrail");
  assert.equal(baseline.passed, false);
  assert.equal(methodrail.passed, true);
  const comparison = compareScores(baseline, methodrail);
  assert.equal(comparison.kind, "specification");
  assert.equal(comparison.specification, "passed");
  assert.equal(comparison.methodrail_helped, null);
  assert.doesNotMatch(readFileSync(join(root, "evals/fixtures/knowledge-retired/task.md"), "utf8"), /retir|migrat|v1|enqueue/i);
});

test("knowledge-retired guardrail: obsolete API and note rewrite fail", () => {
  const expected = loadExpectationFile(join(root, "evals/fixtures/knowledge-retired/expected.yaml"));
  const obsolete = scoreRun(
    synthetic("knowledge-retired", {
      outcome: "Used enqueueMail.",
      overlay: "evals/runners/artifacts/knowledge-retired/baseline/overlay",
      command_log: "evals/runners/artifacts/knowledge-retired/baseline/command.log.json",
      answer: "evals/runners/artifacts/knowledge-retired/methodrail/answer.md",
      behaviors: expected.expected_behaviors,
    }),
    expected,
    ctx,
  );
  assert.equal(obsolete.passed, false);
  assert.ok(obsolete.outcome.failures.some((line) => /successor-api/i.test(line)));

  const rewrite = scoreRun(
    synthetic("knowledge-retired", {
      outcome: "Added password-reset through enqueueMail.",
      overlay: "evals/runners/artifacts/knowledge-retired/rewrite-note/overlay",
      command_log: "evals/runners/artifacts/knowledge-retired/rewrite-note/command.log.json",
      answer: "evals/runners/artifacts/knowledge-retired/rewrite-note/answer.md",
    }),
    expected,
    ctx,
  );
  assert.equal(rewrite.passed, false);
  assert.ok(rewrite.outcome.failures.some((line) => /notes-untouched/i.test(line)));
});
