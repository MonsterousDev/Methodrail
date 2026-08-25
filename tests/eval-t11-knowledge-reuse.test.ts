import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { compareScores } from "../src/eval/compare.js";
import { loadExpectationFile, loadRunFile, parseRun } from "../src/eval/load.js";
import { scoreRun } from "../src/eval/score.js";
import { materializeFixture, removeWorktree } from "../src/eval/worktree.js";
import { evaluateProjectKnowledge } from "../src/knowledge/report.js";
import type { EvalContext } from "../src/eval/types.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const ctx: EvalContext = { repoRoot: root };
const fixtureDir = join(root, "evals/fixtures/knowledge-reuse");
const examplesDir = join(root, "evals/runners/examples");

test("knowledge-reuse discover trace proposes a candidate without auto-promoting", () => {
  const discover = loadRunFile(join(examplesDir, "knowledge-reuse-discover.methodrail.json"));
  const text = [discover.outcome, discover.notes ?? "", ...discover.evidence].join("\n");
  assert.match(text, /knowledge candidate|reflect/i);
  assert.doesNotMatch(text, /silently (wrote|promoted)|auto-applied/i);

  const preapproval = materializeFixture(fixtureDir, join(root, discover.artifacts!.overlay!));
  try {
    assert.equal(existsSync(join(preapproval, ".methodrail/knowledge/notifications.md")), false);
    assert.doesNotMatch(readFileSync(join(preapproval, ".methodrail/PROJECT.md"), "utf8"), /knowledge\/notifications\.md/);
  } finally {
    removeWorktree(preapproval);
  }
});

test("approved promotion creates one valid note and an unchanged rerun produces no diff", () => {
  const approved = evaluateProjectKnowledge(fixtureDir);
  assert.equal(approved.errors.length, 0, approved.errors.map((item) => item.message).join("\n"));
  assert.equal(approved.notes.filter((note) => note.classification === "typed").length, 1);
  assert.match(readFileSync(join(fixtureDir, ".methodrail/PROJECT.md"), "utf8"), /knowledge\/notifications\.md/);

  const rerun = materializeFixture(
    fixtureDir,
    join(root, "evals/runners/artifacts/knowledge-reuse/promotion-rerun/overlay"),
  );
  try {
    assert.equal(
      readFileSync(join(rerun, ".methodrail/knowledge/notifications.md"), "utf8"),
      readFileSync(join(fixtureDir, ".methodrail/knowledge/notifications.md"), "utf8"),
    );
    assert.equal(
      readFileSync(join(rerun, ".methodrail/PROJECT.md"), "utf8"),
      readFileSync(join(fixtureDir, ".methodrail/PROJECT.md"), "utf8"),
    );
  } finally {
    removeWorktree(rerun);
  }
});

test("knowledge-reuse Task B pair is a specification of persisted typed knowledge", () => {
  const expected = loadExpectationFile(join(fixtureDir, "expected.yaml"));
  const baselineRun = loadRunFile(join(examplesDir, "knowledge-reuse.baseline.json"));
  const methodrailRun = loadRunFile(join(examplesDir, "knowledge-reuse.methodrail.json"));

  assert.equal(baselineRun.provenance, "constructed");
  assert.ok(methodrailRun.references_loaded.some((path) => path.includes("notifications.md")));
  assert.ok(!baselineRun.references_loaded.some((path) => path.includes("notifications.md")));
  assert.doesNotMatch(readTask(), /retr|duplicat|idempoten/i);

  const baseline = scoreRun(baselineRun, expected, ctx);
  const methodrail = scoreRun(methodrailRun, expected, ctx);
  assert.equal(baseline.passed, false);
  assert.equal(methodrail.passed, true);

  const comparison = compareScores(baseline, methodrail);
  assert.equal(comparison.kind, "specification");
  assert.equal(comparison.specification, "passed");
  assert.equal(comparison.methodrail_helped, null);
});

test("knowledge-reuse grader ignores behaviors_observed on a wrong overlay", () => {
  const expected = loadExpectationFile(join(fixtureDir, "expected.yaml"));
  const scored = scoreRun(
    parseRun({
      fixture_id: "knowledge-reuse",
      condition: "methodrail",
      provenance: "constructed",
      capture: "operator_summary",
      skills_invoked: [],
      references_loaded: [".methodrail/knowledge/notifications.md"],
      tools_used: [],
      subagents_used: 0,
      verification_steps: [],
      evidence: [],
      outcome: "success",
      failure_modes: [],
      behaviors_observed: expected.expected_behaviors,
      artifacts: {
        overlay: "evals/runners/artifacts/knowledge-reuse/baseline/overlay",
        command_log: "evals/runners/artifacts/knowledge-reuse/baseline/command.log.json",
        answer: "evals/runners/artifacts/knowledge-reuse/methodrail/answer.md",
      },
    }),
    expected,
    ctx,
  );
  assert.equal(scored.passed, false);
});

function readTask(): string {
  return readFileSync(join(fixtureDir, "task.md"), "utf8");
}
