import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { compareScores } from "../src/eval/compare.js";
import { loadExpectationFile, parseRun } from "../src/eval/load.js";
import { scoreRun } from "../src/eval/score.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

test("simple-change forbids expensive operators and scores the recorded pair", () => {
  const expected = loadExpectationFile(join(root, "evals/fixtures/simple-change/expected.yaml"));
  const baseline = parseRun(
    JSON.parse(readFileSync(join(root, "evals/runners/examples/simple-change.baseline.json"), "utf8")),
  );
  const methodrail = parseRun(
    JSON.parse(readFileSync(join(root, "evals/runners/examples/simple-change.methodrail.json"), "utf8")),
  );
  const comparison = compareScores(scoreRun(baseline, expected), scoreRun(methodrail, expected));
  assert.equal(comparison.baseline.passed, false);
  assert.equal(comparison.methodrail.passed, true);
  assert.equal(comparison.verdict, "helped");
});

test("runtime-bug rewards composed diagnosis over source inference", () => {
  const expected = loadExpectationFile(join(root, "evals/fixtures/runtime-bug/expected.yaml"));
  const baseline = parseRun(
    JSON.parse(readFileSync(join(root, "evals/runners/examples/runtime-bug.baseline.json"), "utf8")),
  );
  const methodrail = parseRun(
    JSON.parse(readFileSync(join(root, "evals/runners/examples/runtime-bug.methodrail.json"), "utf8")),
  );
  const comparison = compareScores(scoreRun(baseline, expected), scoreRun(methodrail, expected));
  assert.equal(comparison.methodrail.passed, true);
  assert.equal(comparison.baseline.passed, false);
  assert.ok(comparison.methodrail.metrics.verification_steps > comparison.baseline.metrics.verification_steps);
});
