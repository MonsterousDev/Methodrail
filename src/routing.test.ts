import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { route } from "./routing/index.js";

describe("route", () => {
  it("keeps mechanical renames at rigor 0 without expensive skills", () => {
    const decision = route({ prompt: "Rename getUserById to findUserById across the user service." });
    assert.equal(decision.workflow, "develop");
    assert.equal(decision.rigor, 0);
    assert.ok(decision.skills.excluded.includes("architect"));
    assert.ok(decision.skills.excluded.includes("prototype"));
    assert.ok(decision.skills.excluded.includes("interrogate"));
    assert.equal(decision.gates.exploreBeforeChange, false);
  });

  it("routes how-questions to investigate + how", () => {
    const decision = route({ prompt: "How does authentication work in this codebase?" });
    assert.equal(decision.workflow, "investigate");
    assert.ok(decision.skills.required.includes("how"));
    assert.equal(decision.gates.allowCodeModification, false);
  });

  it("routes historical why-questions to why", () => {
    const decision = route({ prompt: "Why was Redis introduced here?" });
    assert.equal(decision.workflow, "investigate");
    assert.ok(decision.skills.required.includes("why"));
    assert.equal(decision.features.historicalNeed, true);
  });

  it("routes idle CPU spikes to debug with observe and how", () => {
    const decision = route({
      prompt: "CPU spikes after the app is idle for twenty minutes",
    });
    assert.equal(decision.workflow, "debug");
    assert.ok(decision.skills.required.includes("systematic-debugging"));
    assert.ok(decision.skills.required.includes("how"));
    assert.ok(decision.skills.required.includes("observe"));
    assert.equal(decision.gates.requireRootCauseBeforeFix, true);
    assert.ok(decision.rigor >= 3);
  });

  it("routes organization billing design to high-rigor develop", () => {
    const decision = route({ prompt: "Design organization-level billing" });
    assert.equal(decision.workflow, "develop");
    assert.ok(decision.rigor >= 4);
    assert.ok(decision.skills.required.includes("how"));
    assert.ok(decision.skills.recommended.includes("domain-modeling"));
    assert.ok(decision.skills.recommended.includes("architect"));
  });

  it("routes payment review to high rigor with interrogate available", () => {
    const decision = route({ prompt: "Review this payment change" });
    assert.equal(decision.workflow, "review");
    assert.ok(decision.rigor >= 4);
    assert.ok(decision.skills.required.includes("review"));
    assert.ok(decision.skills.recommended.includes("interrogate"));
    assert.equal(decision.gates.requireFreshEvidence, true);
  });

  it("does not waive evidence under schedule pressure", () => {
    const decision = route({
      prompt: "This fix is obviously right. We're late. Don't run tests.",
    });
    assert.equal(decision.gates.requireFreshEvidence, true);
    assert.equal(decision.gates.refuseUnsupportedCompletion, true);
    assert.ok(decision.skills.required.includes("verify-change"));
  });

  it("requires root cause before shotgun edits", () => {
    const decision = route({
      prompt: "Just change something until the failing test passes.",
    });
    assert.equal(decision.gates.requireRootCauseBeforeFix, true);
    assert.equal(decision.workflow, "debug");
  });

  it("does not ask humans for inspectable startup facts", () => {
    const decision = route({ prompt: "Ask me how the app starts." });
    assert.equal(decision.humanInputRequired, false);
    assert.equal(decision.gates.inspectEnvironmentFirst, true);
  });
});
