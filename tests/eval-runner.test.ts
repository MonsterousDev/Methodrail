import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { compareScores, integrityFailure } from "../src/eval/compare.js";
import { isCanonicalExampleFile, loadExpectationFile, parseRun } from "../src/eval/load.js";
import { realVerificationCount } from "../src/eval/commands.js";
import { guardrailResult, scoreRun } from "../src/eval/score.js";
import type { EvalContext } from "../src/eval/types.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const ctx: EvalContext = { repoRoot: root };

test("simple-change live traces stay cheap and do not over-escalate", () => {
  const expected = loadExpectationFile(join(root, "evals/fixtures/simple-change/expected.yaml"));
  assert.equal(expected.max_subagents, 0);
  assert.equal(expected.max_expensive_skills, 0);

  const baseline = parseRun(
    JSON.parse(readFileSync(join(root, "evals/runners/examples/simple-change.baseline.json"), "utf8")),
  );
  const methodrail = parseRun(
    JSON.parse(readFileSync(join(root, "evals/runners/examples/simple-change.methodrail.json"), "utf8")),
  );

  assert.equal(baseline.host, "cursor");
  assert.equal(methodrail.host, "cursor");
  assert.equal(baseline.capture, "operator_summary");
  assert.equal(methodrail.provenance, "live");

  const baselineScore = scoreRun(baseline, expected, ctx);
  const methodrailScore = scoreRun(methodrail, expected, ctx);

  assert.equal(baselineScore.forbidden_hits.length, 0);
  assert.equal(baselineScore.passed, true);
  assert.equal(methodrailScore.forbidden_hits.length, 0);
  assert.equal(methodrailScore.metrics.expensive_skill_count, 0);
  assert.equal(methodrailScore.metrics.subagents_used, 0);
  assert.ok(methodrailScore.metrics.verification_steps > 0);
  assert.equal(methodrailScore.passed, true);

  const comparison = compareScores(baselineScore, methodrailScore);
  assert.equal(comparison.kind, "empirical");
  assert.equal(comparison.empirical, "neutral");
  assert.equal(comparison.methodrail_helped, null);
  assert.equal(comparison.specification, undefined);
});

test("simple-change scoreRun treats over-rigor as a routing violation, not an outcome fail", () => {
  const expected = loadExpectationFile(join(root, "evals/fixtures/simple-change/expected.yaml"));
  const scored = scoreRun(
    parseRun({
      fixture_id: "simple-change",
      condition: "baseline",
      provenance: "synthetic",
      capture: "operator_summary",
      skills_invoked: ["wayfinder", "architect", "interrogate"],
      references_loaded: [],
      tools_used: ["grep"],
      subagents_used: 3,
      verification_steps: [],
      evidence: [],
      outcome: "Changed the label after an architecture review.",
      failure_modes: ["unnecessary-escalation"],
      behaviors_observed: ["inspect the current label", "edit locally", "run a cheap check if one exists"],
      artifacts: {
        overlay: "evals/runners/artifacts/simple-change/baseline/overlay",
        answer: "evals/runners/artifacts/simple-change/baseline/answer.md",
      },
    }),
    expected,
    ctx,
  );
  assert.deepEqual(scored.forbidden_hits, ["wayfinder", "architect", "interrogate"]);
  assert.equal(scored.routing.assessment, "violation");
  assert.equal(scored.operational_quality, "violating");
  assert.equal(scored.passed, true);
  assert.equal(guardrailResult(scored), "caught");
});

test("compareScores does not call a both-passed no-gain pair helped", () => {
  const expected = loadExpectationFile(join(root, "evals/fixtures/simple-change/expected.yaml"));
  const cheap = {
    fixture_id: "simple-change",
    provenance: "live",
    capture: "operator_summary",
    skills_invoked: [],
    references_loaded: [],
    tools_used: ["edit"],
    subagents_used: 0,
    verification_steps: ["npm test"],
    evidence: ["1 passed"],
    outcome: "Label changed.",
    failure_modes: [],
    behaviors_observed: ["inspect the current label", "edit locally", "run a cheap check if one exists"],
    artifacts: {
      overlay: "evals/runners/artifacts/simple-change/baseline/overlay",
      command_log: "evals/runners/artifacts/simple-change/baseline/command.log.json",
      answer: "evals/runners/artifacts/simple-change/baseline/answer.md",
    },
  };
  const comparison = compareScores(
    scoreRun(parseRun({ ...cheap, condition: "baseline" }), expected, ctx),
    scoreRun(parseRun({ ...cheap, condition: "methodrail" }), expected, ctx),
  );
  assert.equal(comparison.kind, "empirical");
  assert.equal(comparison.empirical, "neutral");
  assert.equal(comparison.methodrail_helped, null);
});

test("canonical example files exclude host extras", () => {
  assert.equal(isCanonicalExampleFile("simple-change.baseline.json"), true);
  assert.equal(isCanonicalExampleFile("simple-change.methodrail.json"), true);
  assert.equal(isCanonicalExampleFile("simple-change.codex-baseline.json"), false);
  assert.equal(isCanonicalExampleFile("simple-change.codex-methodrail.json"), false);
  assert.equal(isCanonicalExampleFile("knowledge-accumulation-discover.methodrail.json"), false);
});

test("runtime-bug rewards a working fix over source inference, not skill names", () => {
  const expected = loadExpectationFile(join(root, "evals/fixtures/runtime-bug/expected.yaml"));
  const baseline = parseRun(
    JSON.parse(readFileSync(join(root, "evals/runners/examples/runtime-bug.baseline.json"), "utf8")),
  );
  const methodrail = parseRun(
    JSON.parse(readFileSync(join(root, "evals/runners/examples/runtime-bug.methodrail.json"), "utf8")),
  );
  const comparison = compareScores(scoreRun(baseline, expected, ctx), scoreRun(methodrail, expected, ctx));
  assert.equal(comparison.kind, "empirical");
  assert.equal(comparison.methodrail.passed, true);
  assert.equal(comparison.baseline.passed, false);
  assert.equal(comparison.empirical, "helped");
  assert.equal(integrityFailure(comparison), null);
});

test("none-token verification steps count as zero", () => {
  assert.equal(realVerificationCount(["none — waiting on human"]), 0);
  assert.equal(realVerificationCount(["n/a"]), 0);
  assert.equal(realVerificationCount([{ command: "none", exit_status: null }]), 0);
  assert.equal(realVerificationCount(["npm test"]), 1);
});
