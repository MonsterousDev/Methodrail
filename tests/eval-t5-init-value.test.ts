import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { compareScores } from "../src/eval/compare.js";
import { loadExpectationFile, loadRunFile } from "../src/eval/load.js";
import { scoreRun } from "../src/eval/score.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const fixtureDir = join(root, "evals/fixtures/init-value");
const examplesDir = join(root, "evals/runners/examples");
const FORBIDDEN = ["wayfinder", "architect", "arena", "swarm", "interrogate"] as const;

function mentionsWrongAssumption(outcome: string, failureModes: string[]): boolean {
  const text = [outcome, ...failureModes].join("\n");
  return /npm ci|wrong install|app\.listen|listen|service/i.test(text);
}

test("T5 init-value: PROJECT.md helps later work; baseline fails, methodrail passes, verdict helped", () => {
  const expected = loadExpectationFile(join(fixtureDir, "expected.yaml"));
  assert.deepEqual(expected.required_skills, []);
  assert.equal(expected.max_expensive_skills, 0);

  const baselineRun = loadRunFile(join(examplesDir, "init-value.baseline.json"));
  const methodrailRun = loadRunFile(join(examplesDir, "init-value.methodrail.json"));

  assert.match(baselineRun.notes ?? "", /constructed/i);
  assert.match(methodrailRun.notes ?? "", /constructed/i);

  const baseline = scoreRun(baselineRun, expected);
  const methodrail = scoreRun(methodrailRun, expected);

  assert.equal(baseline.passed, false);
  assert.equal(methodrail.passed, true);

  assert.ok(
    mentionsWrongAssumption(baselineRun.outcome, baselineRun.failure_modes),
    "baseline outcome/failure_modes must mention wrong install, listen, or service",
  );

  assert.ok(
    methodrailRun.references_loaded.some((path) => path.includes("PROJECT.md")),
    "methodrail must load .methodrail/PROJECT.md",
  );

  assert.ok(
    methodrailRun.skills_invoked.length <= baselineRun.skills_invoked.length,
    "methodrail must not invoke more skills than baseline",
  );
  assert.ok(
    methodrailRun.subagents_used <= baselineRun.subagents_used,
    "methodrail must not use more subagents than baseline",
  );
  assert.deepEqual(methodrail.forbidden_hits, []);
  for (const skill of FORBIDDEN) {
    assert.ok(!methodrailRun.skills_invoked.includes(skill), `methodrail invoked forbidden skill ${skill}`);
  }

  const comparison = compareScores(baseline, methodrail);
  assert.equal(comparison.verdict, "helped");
  assert.equal(comparison.methodrail_helped, true);
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
