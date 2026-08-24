import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { classifyTerritory, readyQuestions } from "./frontier.js";
import type { Decision } from "./types.js";

describe("classifyTerritory", () => {
  it("puts a question on the frontier only when prerequisites are known", () => {
    const nodes: Decision[] = [
      {
        id: "d1",
        question: "What is the current invite path?",
        type: "implementation",
        status: "known",
        resolution_method: "source",
      },
      {
        id: "d2",
        question: "Should invites be idempotent?",
        type: "runtime",
        status: "frontier",
        depends_on: ["d1"],
        resolution_method: "observe",
      },
      {
        id: "d3",
        question: "What UX copy do we want on conflict?",
        type: "human-preference",
        status: "fog",
        depends_on: ["d2"],
        resolution_method: "human",
      },
    ];
    const territory = classifyTerritory(nodes);
    assert.deepEqual(territory.known, ["d1"]);
    assert.deepEqual(territory.frontier, ["d2"]);
    assert.deepEqual(territory.fog, ["d3"]);
    assert.deepEqual(
      readyQuestions(nodes).map((n) => n.id),
      ["d2"],
    );
  });
});
