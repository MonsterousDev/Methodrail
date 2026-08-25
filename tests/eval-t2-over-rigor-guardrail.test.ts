import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { parse } from "yaml";
import { loadExpectationFile, parseRun } from "../src/eval/load.js";
import { guardrailResult, scoreRun } from "../src/eval/score.js";
import type { EvalContext } from "../src/eval/types.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const ctx: EvalContext = { repoRoot: root };
const OVER_ESCALATION_SKILLS = ["wayfinder", "architect", "interrogate"] as const;

test("guardrail: over-rigor is caught as a routing violation even when the patch is correct", () => {
  const expected = loadExpectationFile(join(root, "evals/fixtures/simple-change/expected.yaml"));
  const scored = scoreRun(
    parseRun({
      fixture_id: "simple-change",
      condition: "baseline",
      provenance: "synthetic",
      capture: "operator_summary",
      skills_invoked: [...OVER_ESCALATION_SKILLS],
      references_loaded: [],
      tools_used: ["grep"],
      subagents_used: 3,
      verification_steps: [],
      evidence: [],
      outcome: "Renamed button text after mapping the repo, architecture review, and a product interrogation.",
      failure_modes: ["unnecessary-escalation"],
      behaviors_observed: ["started architecture process"],
      artifacts: {
        overlay: "evals/runners/artifacts/simple-change/baseline/overlay",
        answer: "evals/runners/artifacts/simple-change/baseline/answer.md",
      },
    }),
    expected,
    ctx,
  );

  assert.equal(scored.passed, true);
  assert.equal(scored.routing.assessment, "violation");
  assert.equal(scored.operational_quality, "violating");
  assert.deepEqual(scored.forbidden_hits, [...OVER_ESCALATION_SKILLS]);
  assert.equal(guardrailResult(scored), "caught");
});

test("guardrail: button-text complexity spec still forbids those operators", () => {
  const spec = parse(readFileSync(join(root, "evals/complexity/button-text.yaml"), "utf8")) as {
    expected?: { skills?: { forbidden?: string[] } };
  };
  const forbidden = spec.expected?.skills?.forbidden ?? [];
  for (const skill of OVER_ESCALATION_SKILLS) {
    assert.ok(forbidden.includes(skill), `button-text.yaml must forbid ${skill}`);
  }
});
