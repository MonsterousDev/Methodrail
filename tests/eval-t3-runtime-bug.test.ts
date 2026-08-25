import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { compareScores } from "../src/eval/compare.js";
import { loadExpectationFile, parseRun } from "../src/eval/load.js";
import { scoreRun } from "../src/eval/score.js";
import type { EvalRun } from "../src/eval/types.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const examples = join(root, "evals/runners/examples");
const REQUIRED_SKILLS = ["debug", "diagnosing-bugs", "verify-change"] as const;
const RUNTIME_EVIDENCE = /observ|drive|\/dashboard|\/login|REPRO|runtime/i;
const REGRESSION_EVIDENCE = /regression|node --test|red|green/i;
const FINAL_VERIFICATION = /post-fix|verify|green|DRIVE_EXIT|pass/i;

function loadExample(name: string): EvalRun {
  return parseRun(JSON.parse(readFileSync(join(examples, name), "utf8")));
}

function someMatch(items: string[], pattern: RegExp): boolean {
  return items.some((item) => pattern.test(item));
}

function inferredFromSource(run: EvalRun): boolean {
  return (run.behaviors_observed ?? []).some((item) => /infer/i.test(item) && /source/i.test(item));
}

test("runtime-bug canonical Cursor traces discriminate source inference from composed diagnosis", () => {
  const expected = loadExpectationFile(join(root, "evals/fixtures/runtime-bug/expected.yaml"));
  const baseline = loadExample("runtime-bug.baseline.json");
  const methodrail = loadExample("runtime-bug.methodrail.json");
  const baselineScore = scoreRun(baseline, expected);
  const methodrailScore = scoreRun(methodrail, expected);

  assert.equal(baselineScore.passed, false);
  assert.equal(baseline.verification_steps.length, 0);
  assert.equal(baseline.evidence.length, 0);
  assert.ok(
    baseline.failure_modes.includes("source-as-runtime") || inferredFromSource(baseline),
    "baseline must record source-as-runtime or inferring from source",
  );

  assert.equal(methodrailScore.passed, true);
  assert.ok(
    someMatch(methodrail.evidence, RUNTIME_EVIDENCE),
    "methodrail evidence must include a runtime observation",
  );
  assert.ok(
    someMatch(methodrail.verification_steps, REGRESSION_EVIDENCE) ||
      someMatch(methodrail.evidence, REGRESSION_EVIDENCE),
    "methodrail must include regression evidence",
  );
  assert.ok(
    someMatch(methodrail.verification_steps, FINAL_VERIFICATION),
    "methodrail must include a final verification step",
  );
  for (const skill of REQUIRED_SKILLS) {
    assert.ok(methodrailScore.skill_hits.includes(skill), `methodrail must hit required skill ${skill}`);
  }

  const comparison = compareScores(baselineScore, methodrailScore);
  assert.equal(comparison.verdict, "helped");
});

test("runtime-bug Codex extras score independently and stay out of canonical compare", () => {
  const expected = loadExpectationFile(join(root, "evals/fixtures/runtime-bug/expected.yaml"));
  const baselinePath = join(examples, "runtime-bug.codex-baseline.json");
  const methodrailPath = join(examples, "runtime-bug.codex-methodrail.json");

  if (existsSync(baselinePath)) {
    const baselineScore = scoreRun(loadExample("runtime-bug.codex-baseline.json"), expected);
    assert.equal(baselineScore.passed, false);
    for (const skill of REQUIRED_SKILLS) {
      assert.ok(
        baselineScore.skill_misses.includes(skill),
        `codex baseline must miss required skill ${skill}`,
      );
    }
  }

  if (existsSync(methodrailPath)) {
    const methodrailScore = scoreRun(loadExample("runtime-bug.codex-methodrail.json"), expected);
    assert.equal(methodrailScore.passed, true);
  }
});
