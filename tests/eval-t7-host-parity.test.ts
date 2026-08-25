import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { compareScores } from "../src/eval/compare.js";
import { loadExpectationFile, loadRunFile } from "../src/eval/load.js";
import { scoreRun } from "../src/eval/score.js";
import type { EvalContext, EvalRun } from "../src/eval/types.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const ctx: EvalContext = { repoRoot: root };
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

test("simple-change: Cursor and Codex both outcome-pass; both compares are empirical neutral", () => {
  const expected = loadExpectationFile(join(root, "evals/fixtures/simple-change/expected.yaml"));

  const cursorBaseline = example("simple-change.baseline.json");
  const cursorMethodrail = example("simple-change.methodrail.json");
  const codexBaseline = example("simple-change.codex-baseline.json");
  const codexMethodrail = example("simple-change.codex-methodrail.json");

  assert.equal(cursorBaseline.host, "cursor");
  assert.equal(codexBaseline.host, "codex");
  assert.equal(cursorBaseline.capture, "operator_summary");

  const cursorCompare = compareScores(
    scoreRun(cursorBaseline, expected, ctx),
    scoreRun(cursorMethodrail, expected, ctx),
  );
  const codexCompare = compareScores(
    scoreRun(codexBaseline, expected, ctx),
    scoreRun(codexMethodrail, expected, ctx),
  );
  assert.equal(cursorCompare.kind, "empirical");
  assert.equal(codexCompare.kind, "empirical");
  assert.equal(cursorCompare.empirical, "neutral");
  assert.equal(codexCompare.empirical, "neutral");
});

test("runtime-bug: Cursor empirical helped from outcome; Codex extras outcome-neutral with Methodrail routing hits", () => {
  const expected = loadExpectationFile(join(root, "evals/fixtures/runtime-bug/expected.yaml"));
  const required = expected.required_skills ?? [];
  assert.deepEqual(required, ["debug", "diagnosing-bugs", "verify-change"]);

  const cursorCompare = compareScores(
    scoreRun(example("runtime-bug.baseline.json"), expected, ctx),
    scoreRun(example("runtime-bug.methodrail.json"), expected, ctx),
  );
  assert.equal(cursorCompare.kind, "empirical");
  assert.equal(cursorCompare.empirical, "helped");
  assert.equal(cursorCompare.baseline.passed, false);
  assert.equal(cursorCompare.methodrail.passed, true);

  const codexBaseline = scoreRun(example("runtime-bug.codex-baseline.json"), expected, ctx);
  const codexMethodrail = scoreRun(example("runtime-bug.codex-methodrail.json"), expected, ctx);
  assert.equal(codexBaseline.passed, true);
  assert.equal(codexMethodrail.passed, true);
  assert.equal(compareScores(codexBaseline, codexMethodrail).empirical, "neutral");
  for (const skill of required) {
    assert.ok(codexMethodrail.skill_hits.includes(skill), `codex methodrail missing ${skill}`);
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
