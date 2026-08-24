import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loadRegistry, skillsProviding, skillsUsableImplicitly } from "./registry/index.js";
import { validateRepository } from "./validation/index.js";
import { inspectWorkflow } from "./workflows/engine.js";
import { methodrailRoot } from "./paths.js";
import { runEvals } from "./evals/runner.js";

describe("repository contracts", () => {
  it("validates the Methodrail repository", () => {
    const result = validateRepository(methodrailRoot());
    assert.equal(result.ok, true, result.issues.map((i) => `${i.path}: ${i.message}`).join("\n"));
  });

  it("discovers skills and workflows", () => {
    const registry = loadRegistry();
    assert.ok(registry.skills.length >= 13, `skills=${registry.skills.map((s) => s.id).join(",")}`);
    assert.ok(registry.workflows.some((w) => w.id === "investigate"));
    assert.ok(skillsProviding(registry, "codebase-understanding").some((s) => s.id === "how"));
    assert.ok(skillsUsableImplicitly(registry).some((s) => s.id === "how"));
  });

  it("inspects the investigate workflow", () => {
    const registry = loadRegistry();
    const wf = registry.workflows.find((w) => w.id === "investigate");
    assert.ok(wf);
    const inspection = inspectWorkflow(wf);
    assert.equal(inspection.allowCodeModification, false);
    assert.ok(inspection.skillsReferenced.includes("how"));
    assert.ok(inspection.terminals.length > 0);
  });

  it("passes deterministic routing evals", () => {
    const report = runEvals({ root: methodrailRoot(), filter: { kind: "routing" } });
    const failed = report.results.filter((r) => r.status === "fail");
    assert.equal(failed.length, 0, failed.map((f) => `${f.id}: ${f.messages.join("; ")}`).join("\n"));
  });
});
