import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { gradePilotManifest, loadPilotManifest } from "../src/eval/pilot.js";
import type { EvalContext } from "../src/eval/types.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const ctx: EvalContext = { repoRoot: root };

test("live T5-T10 pilot is complete and rescored from its artifact manifest", () => {
  const grade = gradePilotManifest(join(root, "evals/pilot-t5-t10.yaml"), ctx);
  assert.deepEqual(grade.integrity_errors, []);
  assert.equal(grade.pairs.length, 15);

  const results = grade.pairs.map((pair) => ({
    key: `${pair.fixture}:${pair.host}:r${pair.repeat}`,
    result: pair.report.empirical,
  }));
  assert.equal(results.filter((item) => item.result === "neutral").length, 14);
  assert.deepEqual(results.filter((item) => item.result === "helped"), [
    { key: "human-decision:codex:r1", result: "helped" },
  ]);
  assert.equal(results.some((item) => item.result === "harmed" || item.result === "incomplete"), false);
});

test("live v0.7 knowledge pilot is complete and rescored from its artifact manifest", () => {
  const grade = gradePilotManifest(join(root, "evals/pilot-v0.7-knowledge.yaml"), ctx);
  assert.deepEqual(grade.integrity_errors, []);
  assert.equal(grade.pairs.length, 6);

  const results = Object.fromEntries(
    grade.pairs.map((pair) => [`${pair.fixture}:${pair.host}:r${pair.repeat}`, pair.report.empirical]),
  );
  assert.equal(results["knowledge-reuse:cursor:r1"], "neutral");
  assert.equal(results["knowledge-reuse:cursor:r2"], "neutral");
  assert.equal(results["knowledge-reuse:codex:r1"], "neutral");
  assert.equal(results["knowledge-refresh:cursor:r1"], "helped");
  assert.equal(results["knowledge-refresh:cursor:r2"], "helped");
  assert.equal(results["knowledge-refresh:codex:r1"], "helped");
});

test("v0.8 knowledge-governance pilot is declared and has no live extras yet", () => {
  const manifestPath = join(root, "evals/pilot-v0.8-knowledge-governance.yaml");
  const manifest = loadPilotManifest(manifestPath);
  assert.equal(manifest.id, "pilot-v0.8-knowledge-governance-2026-08-31");
  assert.equal(manifest.pairs.length, 9);
  const keys = manifest.pairs.map((pair) => `${pair.fixture}:${pair.host}:r${pair.repeat}`);
  assert.deepEqual(keys, [
    "knowledge-applicability:cursor:r1",
    "knowledge-applicability:cursor:r2",
    "knowledge-applicability:codex:r1",
    "knowledge-dispute:cursor:r1",
    "knowledge-dispute:cursor:r2",
    "knowledge-dispute:codex:r1",
    "knowledge-retired:cursor:r1",
    "knowledge-retired:cursor:r2",
    "knowledge-retired:codex:r1",
  ]);

  const grade = gradePilotManifest(manifestPath, ctx);
  assert.equal(grade.pairs.length, 0);
  assert.equal(grade.integrity_errors.length, 9);
  assert.ok(grade.integrity_errors.every((line) => /missing live pair/.test(line)));
});
