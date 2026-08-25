import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { parse } from "yaml";
import { loadExpectationFile, parseRun } from "../src/eval/load.js";
import { scoreRun } from "../src/eval/score.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const OVER_ESCALATION_SKILLS = ["wayfinder", "architect", "interrogate"] as const;

/**
 * Guardrail, not a live baseline comparison.
 *
 * Live simple-change Cursor/Codex baselines did not over-escalate
 * (inspect → edit → unit test). This suite keeps a synthetic failing
 * trace so scoreRun still refuses obvious over-engineering even when
 * real agents stay cheap.
 */
test("guardrail: scoreRun fails a synthetic over-rigor trace on simple-change", () => {
  const expected = loadExpectationFile(join(root, "evals/fixtures/simple-change/expected.yaml"));
  const scored = scoreRun(
    parseRun({
      fixture_id: "simple-change",
      condition: "baseline",
      skills_invoked: [...OVER_ESCALATION_SKILLS],
      references_loaded: [],
      tools_used: ["grep"],
      subagents_used: 3,
      verification_steps: [],
      evidence: [],
      outcome: "Renamed button text after mapping the repo, architecture review, and a product interrogation.",
      failure_modes: ["unnecessary-escalation"],
      behaviors_observed: ["started architecture process"],
    }),
    expected,
  );

  assert.equal(scored.passed, false);
  assert.deepEqual(scored.forbidden_hits, [...OVER_ESCALATION_SKILLS]);
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
