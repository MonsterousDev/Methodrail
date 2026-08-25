import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { gradePilotManifest } from "../src/eval/pilot.js";
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
