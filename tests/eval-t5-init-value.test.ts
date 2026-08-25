import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { compareScores } from "../src/eval/compare.js";
import { loadExpectationFile, loadRunFile } from "../src/eval/load.js";
import { scoreRun } from "../src/eval/score.js";
import type { EvalContext } from "../src/eval/types.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const ctx: EvalContext = { repoRoot: root };
const fixtureDir = join(root, "evals/fixtures/init-value");
const examplesDir = join(root, "evals/runners/examples");
const FORBIDDEN = ["wayfinder", "architect", "arena", "swarm", "interrogate"] as const;

test("T5 init-value is a specification that PROJECT.md prevents bad install/listen assumptions", () => {
  const expected = loadExpectationFile(join(fixtureDir, "expected.yaml"));
  const baselineRun = loadRunFile(join(examplesDir, "init-value.baseline.json"));
  const methodrailRun = loadRunFile(join(examplesDir, "init-value.methodrail.json"));

  assert.equal(baselineRun.provenance, "constructed");
  const baseline = scoreRun(baselineRun, expected, ctx);
  const methodrail = scoreRun(methodrailRun, expected, ctx);

  assert.equal(baseline.passed, false);
  assert.equal(methodrail.passed, true);
  assert.deepEqual(methodrail.forbidden_hits, []);
  for (const skill of FORBIDDEN) {
    assert.ok(!methodrailRun.skills_invoked.includes(skill), `methodrail invoked forbidden skill ${skill}`);
  }

  const comparison = compareScores(baseline, methodrail);
  assert.equal(comparison.kind, "specification");
  assert.equal(comparison.specification, "passed");
  assert.equal(comparison.methodrail_helped, null);
});

test("T5 PROJECT.md stays a short pointer index and names the durable facts", () => {
  const source = readFileSync(join(fixtureDir, ".methodrail/PROJECT.md"), "utf8");
  const lines = source.split(/\r?\n/).length;
  assert.ok(lines <= 80, `PROJECT.md must stay under 80 lines (found ${lines})`);
  assert.match(source, /npm install/);
  assert.match(source, /npm ci/);
  assert.match(source, /app\.listen/);
  assert.match(source, /library/i);
  assert.doesNotMatch(source, /```/);
});

test("T5 live Codex baseline is not failed by an rg query mentioning npm ci", () => {
  const expected = loadExpectationFile(join(root, "evals/fixtures/init-value/expected.yaml"));
  const baseline = scoreRun(
    loadRunFile(join(root, "evals/runners/examples/init-value.codex-r1-baseline.json")),
    expected,
    ctx,
  );
  const methodrail = scoreRun(
    loadRunFile(join(root, "evals/runners/examples/init-value.codex-r1-methodrail.json")),
    expected,
    ctx,
  );
  assert.equal(baseline.passed, true);
  assert.equal(methodrail.passed, true);
  assert.equal(compareScores(baseline, methodrail).empirical, "neutral");
});
