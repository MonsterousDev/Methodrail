import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { compareScores } from "../src/eval/compare.js";
import { loadExpectationFile, loadRunFile } from "../src/eval/load.js";
import { scoreRun } from "../src/eval/score.js";
import type { EvalRun } from "../src/eval/types.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const examplesDir = join(root, "evals/runners/examples");

function example(name: string): EvalRun {
  return loadRunFile(join(examplesDir, name));
}

function tracesDiffer(a: EvalRun, b: EvalRun): boolean {
  return (
    a.model !== b.model ||
    a.latency_ms !== b.latency_ms ||
    JSON.stringify(a.tools_used) !== JSON.stringify(b.tools_used)
  );
}

test("simple-change: Cursor and Codex both pass the same expected.yaml; both compares are neutral", () => {
  const expected = loadExpectationFile(join(root, "evals/fixtures/simple-change/expected.yaml"));

  const cursorBaseline = example("simple-change.baseline.json");
  const cursorMethodrail = example("simple-change.methodrail.json");
  const codexBaseline = example("simple-change.codex-baseline.json");
  const codexMethodrail = example("simple-change.codex-methodrail.json");

  assert.equal(cursorBaseline.host, "cursor");
  assert.equal(cursorMethodrail.host, "cursor");
  assert.equal(codexBaseline.host, "codex");
  assert.equal(codexMethodrail.host, "codex");

  const cursorBaselineScore = scoreRun(cursorBaseline, expected);
  const cursorMethodrailScore = scoreRun(cursorMethodrail, expected);
  const codexBaselineScore = scoreRun(codexBaseline, expected);
  const codexMethodrailScore = scoreRun(codexMethodrail, expected);

  assert.equal(cursorBaselineScore.passed, true);
  assert.equal(cursorMethodrailScore.passed, true);
  assert.equal(codexBaselineScore.passed, true);
  assert.equal(codexMethodrailScore.passed, true);

  const cursorCompare = compareScores(cursorBaselineScore, cursorMethodrailScore);
  const codexCompare = compareScores(codexBaselineScore, codexMethodrailScore);
  assert.equal(cursorCompare.verdict, "neutral");
  assert.equal(codexCompare.verdict, "neutral");
});

test("runtime-bug: both hosts baseline fail, methodrail pass, compare helped; evidence and required skills", () => {
  const expected = loadExpectationFile(join(root, "evals/fixtures/runtime-bug/expected.yaml"));
  const required = expected.required_skills ?? [];
  assert.deepEqual(required, ["debug", "diagnosing-bugs", "verify-change"]);

  const cursorBaseline = example("runtime-bug.baseline.json");
  const cursorMethodrail = example("runtime-bug.methodrail.json");
  const codexBaseline = example("runtime-bug.codex-baseline.json");
  const codexMethodrail = example("runtime-bug.codex-methodrail.json");

  const cursorBaselineScore = scoreRun(cursorBaseline, expected);
  const cursorMethodrailScore = scoreRun(cursorMethodrail, expected);
  const codexBaselineScore = scoreRun(codexBaseline, expected);
  const codexMethodrailScore = scoreRun(codexMethodrail, expected);

  assert.equal(cursorBaselineScore.passed, false);
  assert.equal(codexBaselineScore.passed, false);
  assert.equal(cursorMethodrailScore.passed, true);
  assert.equal(codexMethodrailScore.passed, true);

  assert.equal(compareScores(cursorBaselineScore, cursorMethodrailScore).verdict, "helped");
  assert.equal(compareScores(codexBaselineScore, codexMethodrailScore).verdict, "helped");

  assert.ok(cursorMethodrail.evidence.length > 0);
  assert.ok(codexMethodrail.evidence.length > 0);
  assert.ok(cursorMethodrail.verification_steps.length > 0);
  assert.ok(codexMethodrail.verification_steps.length > 0);

  for (const skill of required) {
    assert.ok(cursorMethodrail.skills_invoked.includes(skill), `cursor methodrail missing ${skill}`);
    assert.ok(codexMethodrail.skills_invoked.includes(skill), `codex methodrail missing ${skill}`);
  }
});

test("host traces are not copied blobs", () => {
  const pairs: Array<[string, string, string]> = [
    ["simple-change.baseline.json", "simple-change.codex-baseline.json", "simple-change baseline"],
    ["simple-change.methodrail.json", "simple-change.codex-methodrail.json", "simple-change methodrail"],
    ["runtime-bug.baseline.json", "runtime-bug.codex-baseline.json", "runtime-bug baseline"],
    ["runtime-bug.methodrail.json", "runtime-bug.codex-methodrail.json", "runtime-bug methodrail"],
  ];
  for (const [cursorName, codexName, label] of pairs) {
    const cursor = example(cursorName);
    const codex = example(codexName);
    assert.ok(
      tracesDiffer(cursor, codex),
      `${label}: Cursor and Codex traces must differ in model, tools_used, or latency_ms`,
    );
  }
});

test("Claude Code traces are absent", () => {
  const names = readdirSync(examplesDir);
  const claudeFiles = names.filter((name) => /claude/i.test(name));
  assert.deepEqual(claudeFiles, []);
});
