import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { compareScores } from "../src/eval/compare.js";
import { loadExpectationFile, parseRun } from "../src/eval/load.js";
import { scoreRun } from "../src/eval/score.js";
import type { EvalContext, EvalRun } from "../src/eval/types.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const ctx: EvalContext = { repoRoot: root };
const examples = join(root, "evals/runners/examples");
const REQUIRED_SKILLS = ["debug", "diagnosing-bugs", "verify-change"] as const;

function loadExample(name: string): EvalRun {
  return parseRun(JSON.parse(readFileSync(join(examples, name), "utf8")));
}

test("runtime-bug canonical Cursor traces discriminate a broken expiry patch from a working one", () => {
  const expected = loadExpectationFile(join(root, "evals/fixtures/runtime-bug/expected.yaml"));
  const baseline = loadExample("runtime-bug.baseline.json");
  const methodrail = loadExample("runtime-bug.methodrail.json");
  const baselineScore = scoreRun(baseline, expected, ctx);
  const methodrailScore = scoreRun(methodrail, expected, ctx);

  assert.equal(baseline.provenance, "live");
  assert.equal(baseline.capture, "operator_summary");
  assert.equal(baselineScore.passed, false);
  assert.equal(methodrailScore.passed, true);
  for (const skill of REQUIRED_SKILLS) {
    assert.ok(methodrailScore.skill_hits.includes(skill), `methodrail routing must hit ${skill}`);
  }
  assert.equal(baselineScore.routing.assessment, "appropriate");

  const comparison = compareScores(baselineScore, methodrailScore);
  assert.equal(comparison.kind, "empirical");
  assert.equal(comparison.empirical, "helped");
  assert.equal(comparison.capture, "operator_summary");
});

test("runtime-bug Codex extras: baseline can outcome-pass without Methodrail skills", () => {
  const expected = loadExpectationFile(join(root, "evals/fixtures/runtime-bug/expected.yaml"));
  const baselinePath = join(examples, "runtime-bug.codex-baseline.json");
  const methodrailPath = join(examples, "runtime-bug.codex-methodrail.json");

  if (existsSync(baselinePath)) {
    const baselineScore = scoreRun(loadExample("runtime-bug.codex-baseline.json"), expected, ctx);
    assert.equal(baselineScore.passed, true);
    assert.equal(baselineScore.routing.assessment, "appropriate");
    assert.deepEqual(baselineScore.skill_hits, []);
  }

  if (existsSync(methodrailPath)) {
    const methodrailScore = scoreRun(loadExample("runtime-bug.codex-methodrail.json"), expected, ctx);
    assert.equal(methodrailScore.passed, true);
    for (const skill of REQUIRED_SKILLS) {
      assert.ok(methodrailScore.skill_hits.includes(skill), `codex methodrail must hit ${skill}`);
    }
  }

  if (existsSync(baselinePath) && existsSync(methodrailPath)) {
    const comparison = compareScores(
      scoreRun(loadExample("runtime-bug.codex-baseline.json"), expected, ctx),
      scoreRun(loadExample("runtime-bug.codex-methodrail.json"), expected, ctx),
    );
    assert.equal(comparison.kind, "empirical");
    assert.equal(comparison.empirical, "neutral");
  }
});
