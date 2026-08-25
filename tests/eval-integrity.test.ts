import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { compareScores, integrityFailure } from "../src/eval/compare.js";
import { realVerificationCount } from "../src/eval/commands.js";
import { loadExpectationFile, parseRun } from "../src/eval/load.js";
import { scoreRun } from "../src/eval/score.js";
import { materializeFixture, removeWorktree } from "../src/eval/worktree.js";
import type { EvalContext } from "../src/eval/types.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const ctx: EvalContext = { repoRoot: root };

test("self-reported behaviors_observed cannot pass a wrong overlay", () => {
  const expected = loadExpectationFile(join(root, "evals/fixtures/simple-change/expected.yaml"));
  const scored = scoreRun(
    parseRun({
      fixture_id: "simple-change",
      condition: "methodrail",
      provenance: "constructed",
      capture: "operator_summary",
      skills_invoked: [],
      references_loaded: [],
      tools_used: ["edit"],
      subagents_used: 0,
      verification_steps: [],
      evidence: [],
      outcome: "success",
      failure_modes: ["catastrophic"],
      behaviors_observed: expected.expected_behaviors,
      artifacts: {
        overlay: "evals/runners/artifacts/medium-feature/baseline/overlay",
        answer: "evals/runners/artifacts/simple-change/methodrail/answer.md",
      },
    }),
    expected,
    ctx,
  );
  assert.equal(scored.passed, false);
  assert.ok(scored.outcome.failures.some((line) => /label|test/.test(line)));
});

test("a valid empirical harmed result is not an integrity failure", () => {
  const expected = loadExpectationFile(join(root, "evals/fixtures/simple-change/expected.yaml"));
  const methodrailFail = parseRun({
    fixture_id: "simple-change",
    condition: "methodrail",
    provenance: "live",
    capture: "runner_captured",
    skills_invoked: [],
    references_loaded: [],
    tools_used: [],
    subagents_used: 0,
    verification_steps: [],
    evidence: [],
    outcome: "did not change the label",
    failure_modes: [],
    artifacts: {
      overlay: "evals/runners/artifacts/medium-feature/baseline/overlay",
      answer: "evals/runners/artifacts/simple-change/baseline/answer.md",
    },
  });
  const baselinePass = parseRun({
    fixture_id: "simple-change",
    condition: "baseline",
    provenance: "live",
    capture: "runner_captured",
    skills_invoked: [],
    references_loaded: [],
    tools_used: [],
    subagents_used: 0,
    verification_steps: ["npm test"],
    evidence: [],
    outcome: "label changed",
    failure_modes: [],
    artifacts: {
      overlay: "evals/runners/artifacts/simple-change/baseline/overlay",
      command_log: "evals/runners/artifacts/simple-change/baseline/command.log.json",
      answer: "evals/runners/artifacts/simple-change/baseline/answer.md",
    },
  });
  const comparison = compareScores(scoreRun(baselinePass, expected, ctx), scoreRun(methodrailFail, expected, ctx));
  assert.equal(comparison.kind, "empirical");
  assert.equal(comparison.empirical, "harmed");
  assert.equal(integrityFailure(comparison), null);
});

test("verification metrics count verification phases, not every command", () => {
  assert.equal(
    realVerificationCount([], [
      { command: "rg -n TODO .", phase: "other", exit_status: 0 },
      { command: "git status --short", phase: "other", exit_status: 128 },
      { command: "node repro.mjs", phase: "repro", exit_status: 1 },
      { command: "npm test", phase: "verify", exit_status: 0 },
    ]),
    2,
  );
});

test("eval score exits nonzero for a completed outcome failure", () => {
  const result = spawnSync(
    process.execPath,
    [
      "--import",
      "tsx",
      "evals/runners/cli.ts",
      "score",
      "evals/runners/examples/init-value.baseline.json",
    ],
    { cwd: root, encoding: "utf8" },
  );
  assert.equal(result.status, 1, result.stdout + result.stderr);
});

test("overlay manifests reproduce deleted files", () => {
  const worktree = materializeFixture(
    join(root, "evals/fixtures/human-decision"),
    join(root, "evals/runners/artifacts/human-decision/codex-r1-baseline/overlay"),
  );
  try {
    assert.equal(existsSync(join(worktree, "repo/src/org.js")), false);
    assert.equal(existsSync(join(worktree, "repo/src/org.test.js")), false);
    assert.equal(existsSync(join(worktree, "repo/src/account.js")), true);
  } finally {
    removeWorktree(worktree);
  }
});
