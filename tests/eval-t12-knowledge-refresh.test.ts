import assert from "node:assert/strict";
import { cpSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { compareScores } from "../src/eval/compare.js";
import { loadExpectationFile, loadRunFile, parseRun } from "../src/eval/load.js";
import { scoreRun } from "../src/eval/score.js";
import type { EvalContext } from "../src/eval/types.js";
import { evaluateFreshness } from "../src/knowledge/freshness.js";
import { loadKnowledgeNotes } from "../src/knowledge/load.js";
import { prepareKnowledgeRefreshFixture } from "../evals/runners/prepare-v0.7-fixture.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const ctx: EvalContext = { repoRoot: root };

test("knowledge-refresh preparation creates a resolvable review-required revision", () => {
  const fixture = join(root, "evals/fixtures/knowledge-refresh");
  const destination = mkdtempSync(join(tmpdir(), "methodrail-refresh-fixture-"));
  try {
    cpSync(join(fixture, "repo"), join(destination, "repo"), { recursive: true });
    cpSync(join(fixture, ".methodrail"), join(destination, ".methodrail"), { recursive: true });
    const revision = prepareKnowledgeRefreshFixture(fixture, destination);
    const note = loadKnowledgeNotes(destination)[0];
    assert.ok(note);
    assert.equal(note.frontmatter?.validated_at, revision);
    const freshness = evaluateFreshness(note, destination);
    assert.equal(freshness.state, "review-required");
    assert.match(freshness.evidence, /repo\/src\/outbox\.js/);
  } finally {
    rmSync(destination, { recursive: true, force: true });
  }
});

test("knowledge-refresh is a specification: keep the true half, reject the stale half", () => {
  const expected = loadExpectationFile(join(root, "evals/fixtures/knowledge-refresh/expected.yaml"));
  const baseline = scoreRun(
    loadRunFile(join(root, "evals/runners/examples/knowledge-refresh.baseline.json")),
    expected,
    ctx,
  );
  const methodrail = scoreRun(
    loadRunFile(join(root, "evals/runners/examples/knowledge-refresh.methodrail.json")),
    expected,
    ctx,
  );
  assert.equal(baseline.passed, false);
  assert.equal(methodrail.passed, true);
  const comparison = compareScores(baseline, methodrail);
  assert.equal(comparison.kind, "specification");
  assert.equal(comparison.specification, "passed");
  assert.equal(comparison.methodrail_helped, null);
});

test("knowledge-refresh guardrail: trust-stale delete-on-fail fails", () => {
  const expected = loadExpectationFile(join(root, "evals/fixtures/knowledge-refresh/expected.yaml"));
  const scored = scoreRun(
    parseRun({
      fixture_id: "knowledge-refresh",
      condition: "baseline",
      provenance: "synthetic",
      capture: "operator_summary",
      skills_invoked: [],
      references_loaded: [".methodrail/knowledge/mail.md"],
      tools_used: [],
      subagents_used: 0,
      verification_steps: [],
      evidence: [],
      outcome: "Followed the mail note, including delete-on-fail.",
      failure_modes: ["knowledge-overtrusted"],
      artifacts: {
        overlay: "evals/runners/artifacts/knowledge-refresh/trust-stale/overlay",
        command_log: "evals/runners/artifacts/knowledge-refresh/trust-stale/command.log.json",
        answer: "evals/runners/artifacts/knowledge-refresh/trust-stale/answer.md",
      },
    }),
    expected,
    ctx,
  );
  assert.equal(scored.passed, false);
  assert.ok(scored.outcome.failures.some((line) => /kept-row|delete/i.test(line)));
});

test("knowledge-refresh guardrail: discard-all drops the event-id key", () => {
  const expected = loadExpectationFile(join(root, "evals/fixtures/knowledge-refresh/expected.yaml"));
  const scored = scoreRun(
    parseRun({
      fixture_id: "knowledge-refresh",
      condition: "baseline",
      provenance: "synthetic",
      capture: "operator_summary",
      skills_invoked: [],
      references_loaded: ["repo/src/mailer.js"],
      tools_used: [],
      subagents_used: 0,
      verification_steps: [],
      evidence: [],
      outcome: "Rewrote the mailer from source only and dropped event-id keying.",
      failure_modes: ["knowledge-discarded"],
      artifacts: {
        overlay: "evals/runners/artifacts/knowledge-refresh/baseline/overlay",
        command_log: "evals/runners/artifacts/knowledge-refresh/discard-all/command.log.json",
        answer: "evals/runners/artifacts/knowledge-refresh/discard-all/answer.md",
      },
    }),
    expected,
    ctx,
  );
  assert.equal(scored.passed, false);
  assert.ok(scored.outcome.failures.some((line) => /event-id-key/i.test(line)));
});

test("knowledge-refresh grader requires artifacts", () => {
  const expected = loadExpectationFile(join(root, "evals/fixtures/knowledge-refresh/expected.yaml"));
  const scored = scoreRun(
    parseRun({
      fixture_id: "knowledge-refresh",
      condition: "methodrail",
      provenance: "constructed",
      capture: "operator_summary",
      skills_invoked: [],
      references_loaded: [],
      tools_used: [],
      subagents_used: 0,
      verification_steps: [],
      evidence: [],
      outcome: "",
      failure_modes: [],
    }),
    expected,
    ctx,
  );
  assert.equal(scored.outcome.incomplete, true);
});

test("knowledge-refresh guardrail: a crashing driver cannot pass by omitting known error phrases", () => {
  const expected = loadExpectationFile(join(root, "evals/fixtures/knowledge-refresh/expected.yaml"));
  const scored = scoreRun(
    parseRun({
      fixture_id: "knowledge-refresh",
      condition: "methodrail",
      provenance: "synthetic",
      capture: "operator_summary",
      skills_invoked: [],
      references_loaded: [".methodrail/knowledge/mail.md"],
      tools_used: [],
      subagents_used: 0,
      verification_steps: [],
      evidence: [],
      outcome: "Proposed note update after reconciling the stale claim.",
      failure_modes: [],
      artifacts: {
        overlay: "evals/runners/artifacts/knowledge-refresh/crash/overlay",
        command_log: "evals/runners/artifacts/knowledge-refresh/crash/command.log.json",
        answer: "evals/runners/artifacts/knowledge-refresh/crash/answer.md",
      },
    }),
    expected,
    ctx,
  );
  assert.equal(scored.passed, false);
  assert.ok(scored.outcome.failures.some((line) => /event-id-key|kept-row|driver/i.test(line)));
});

test("knowledge-refresh guardrail: mentioning delete-on-fail is not a note-update proposal", () => {
  const expected = loadExpectationFile(join(root, "evals/fixtures/knowledge-refresh/expected.yaml"));
  const scored = scoreRun(
    parseRun({
      fixture_id: "knowledge-refresh",
      condition: "methodrail",
      provenance: "synthetic",
      capture: "operator_summary",
      skills_invoked: [],
      references_loaded: [],
      tools_used: [],
      subagents_used: 0,
      verification_steps: [],
      evidence: [],
      outcome: "Implemented ticket.resolved without delete-on-fail behavior.",
      failure_modes: [],
      artifacts: {
        overlay: "evals/runners/artifacts/knowledge-refresh/methodrail/overlay",
        command_log: "evals/runners/artifacts/knowledge-refresh/methodrail/command.log.json",
        answer: "evals/runners/artifacts/knowledge-refresh/nonproposal/answer.md",
      },
    }),
    expected,
    ctx,
  );
  assert.equal(scored.passed, false);
  assert.ok(scored.outcome.failures.some((line) => /propose-update/i.test(line)));
});
