import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { compareScores } from "../src/eval/compare.js";
import { loadExpectationFile, loadRunFile } from "../src/eval/load.js";
import { scoreRun } from "../src/eval/score.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const fixtureDir = join(root, "evals/fixtures/knowledge-accumulation");
const examplesDir = join(root, "evals/runners/examples");

const expectedBehaviors = [
  "apply the eventId idempotency invariant",
  "skip rediscovery of the already-learned webhook rule",
  "verify credits are not doubled",
] as const;

function discoverText(run: { outcome: string; notes?: string; evidence: string[] }): string {
  return [run.outcome, run.notes ?? "", ...run.evidence].join("\n");
}

test("T8 discover trace proposes a knowledge candidate without auto-promoting", () => {
  const discover = loadRunFile(join(examplesDir, "knowledge-accumulation-discover.methodrail.json"));

  assert.equal(discover.condition, "methodrail");
  assert.equal(discover.fixture_id, "knowledge-accumulation");
  assert.ok(discover.notes?.includes("constructed"));
  assert.deepEqual(discover.failure_modes, []);

  const evidence = discover.evidence.join("\n");
  assert.match(evidence, /eventId/);

  const text = discoverText(discover);
  assert.match(text, /knowledge candidate|reflect/i);
  assert.doesNotMatch(text, /silently (wrote|promoted)|auto-applied as standing|wrote standing (fact|rule) without/i);
});

test("T8 knowledge-accumulation Task B pair: baseline fails, methodrail reuses promoted knowledge", () => {
  const expected = loadExpectationFile(join(fixtureDir, "expected.yaml"));
  const baselineRun = loadRunFile(join(examplesDir, "knowledge-accumulation.baseline.json"));
  const methodrailRun = loadRunFile(join(examplesDir, "knowledge-accumulation.methodrail.json"));

  assert.equal(expected.max_expensive_skills, 0);
  assert.deepEqual(expected.required_skills, []);
  assert.deepEqual(expected.forbidden_skills, ["arena", "swarm", "interrogate"]);
  assert.deepEqual(expected.expected_behaviors, [...expectedBehaviors]);

  assert.ok(baselineRun.notes?.includes("constructed"));
  assert.ok(methodrailRun.notes?.includes("constructed"));
  assert.equal(baselineRun.condition, "baseline");
  assert.equal(methodrailRun.condition, "methodrail");

  assert.ok(
    baselineRun.failure_modes.includes("rediscovery") ||
      baselineRun.failure_modes.includes("missed-idempotency"),
  );
  assert.deepEqual(methodrailRun.behaviors_observed, [...expectedBehaviors]);

  const loadedWebhooks = (paths: string[]) =>
    paths.some((path) => path.includes(".methodrail/knowledge/webhooks.md"));
  assert.ok(loadedWebhooks(methodrailRun.references_loaded));
  assert.ok(!loadedWebhooks(baselineRun.references_loaded));

  const baseline = scoreRun(baselineRun, expected);
  const methodrail = scoreRun(methodrailRun, expected);

  assert.equal(baseline.passed, false);
  assert.equal(methodrail.passed, true);
  assert.equal(methodrail.metrics.expensive_skill_count, 0);
  assert.deepEqual(methodrail.forbidden_hits, []);
  assert.deepEqual(methodrail.behavior_hits, [...expectedBehaviors]);
  assert.equal(methodrail.behavior_misses.length, 0);
  assert.ok(!methodrailRun.skills_invoked.includes("wayfinder"));

  const cheaperSkills = methodrail.metrics.skill_count < baseline.metrics.skill_count;
  const knowledgeWithoutWayfinder =
    loadedWebhooks(methodrailRun.references_loaded) &&
    !methodrailRun.skills_invoked.includes("wayfinder");
  assert.ok(cheaperSkills || knowledgeWithoutWayfinder);

  const baselineExplored =
    baselineRun.skills_invoked.includes("how") ||
    baselineRun.tools_used.includes("grep") ||
    baseline.metrics.skill_count > methodrail.metrics.skill_count;
  assert.ok(baselineExplored, "baseline should show more exploration (how, grep, or higher skill_count)");

  const comparison = compareScores(baseline, methodrail);
  assert.equal(comparison.verdict, "helped");
  assert.equal(comparison.methodrail_helped, true);
});
