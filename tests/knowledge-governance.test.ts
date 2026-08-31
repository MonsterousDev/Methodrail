import assert from "node:assert/strict";
import test from "node:test";
import { evaluateKnowledgeEligibility } from "../src/knowledge/eligibility.js";
import { evaluateScope, InvalidTaskPathError } from "../src/knowledge/scope.js";
import { pathIsPrefixOf } from "../src/knowledge/paths.js";
import type { FreshnessResult, KnowledgeNote, NoteScope } from "../src/knowledge/types.js";

const SHA = "a".repeat(40);
const FRESH: FreshnessResult = { state: "fresh", evidence: "No relevant_paths changes" };

function note(overrides: {
  classification?: KnowledgeNote["classification"];
  scope?: NoteScope;
  lifecycle?: "active" | "disputed" | "retired";
  status?: "verified" | "provisional";
}): KnowledgeNote {
  const classification = overrides.classification ?? "typed";
  const frontmatter =
    classification === "typed"
      ? {
          kind: "invariant" as const,
          status: overrides.status ?? "verified",
          validated_at: SHA,
          relevant_paths: ["src/notifications"],
          lifecycle: overrides.lifecycle ?? "active",
          ...(overrides.scope ? { scope: overrides.scope } : {}),
        }
      : undefined;
  return {
    absolutePath: "/tmp/.methodrail/knowledge/n.md",
    relativePath: ".methodrail/knowledge/n.md",
    classification,
    title: "n",
    ...(frontmatter ? { frontmatter } : {}),
    claim: "Notifications key on provider event id.",
    evidence: "The handler passes event.id to the keyed write.",
    reuseGuidance: "Preserve the event-id key.",
    refreshTriggers: "The notification handler changes.",
    source: "",
  };
}

test("segment matching does not confuse src/mail with src/mailer.ts", () => {
  assert.equal(pathIsPrefixOf("src/mail", "src/mail/send.ts"), true);
  assert.equal(pathIsPrefixOf("src/mail", "src/mailer.ts"), false);
  assert.equal(pathIsPrefixOf("src/mail", "src/mail"), true);
});

test("scope evaluation covers unbounded, applicable, partial, not-applicable, and unknown", () => {
  const scoped = note({
    scope: {
      include_paths: ["src/notifications"],
      exclude_paths: ["src/notifications/legacy"],
    },
  });
  assert.equal(evaluateScope(scoped, []).state, "unknown");
  assert.equal(evaluateScope(note({}), ["src/notifications/send.ts"]).state, "unbounded");
  assert.equal(evaluateScope(scoped, ["src/notifications/send.ts"]).state, "applicable");
  const partial = evaluateScope(scoped, ["src/notifications/send.ts", "src/notifications/legacy/old.ts"]);
  assert.equal(partial.state, "partial");
  assert.deepEqual(partial.matched, ["src/notifications/send.ts"]);
  assert.deepEqual(partial.excluded, ["src/notifications/legacy/old.ts"]);
  assert.equal(evaluateScope(scoped, ["src/notifications/legacy/old.ts"]).state, "not-applicable");
  assert.equal(evaluateScope(scoped, ["src/other.ts"]).state, "not-applicable");
});

test("exclusion wins and Windows separators canonicalize", () => {
  const scoped = note({
    scope: { include_paths: ["src/notifications"], exclude_paths: ["src/notifications/legacy"] },
  });
  const result = evaluateScope(scoped, ["src\\notifications\\legacy\\old.ts"]);
  assert.equal(result.state, "not-applicable");
  assert.deepEqual(result.excluded, ["src/notifications/legacy/old.ts"]);
});

test("invalid task paths are rejected rather than normalized into the repository", () => {
  assert.throws(() => evaluateScope(note({}), ["../secret"]), InvalidTaskPathError);
  assert.throws(() => evaluateScope(note({}), ["/etc/passwd"]), InvalidTaskPathError);
});

test("scope evaluation is byte-stable across reruns", () => {
  const scoped = note({
    scope: { include_paths: ["src/b", "src/a"], exclude_paths: ["src/a/skip"] },
  });
  const first = evaluateScope(scoped, ["src/b/x.ts", "src/a/keep.ts", "src/a/skip/n.ts"]);
  const second = evaluateScope(scoped, ["src/a/skip/n.ts", "src/b/x.ts", "src/a/keep.ts"]);
  assert.deepEqual(first, second);
  assert.deepEqual(first.matched, ["src/a/keep.ts", "src/b/x.ts"]);
  assert.deepEqual(first.excluded, ["src/a/skip/n.ts"]);
});

const MATRIX: {
  name: string;
  note: KnowledgeNote;
  freshness: FreshnessResult;
  taskPaths: string[];
  expected: string;
}[] = [
  {
    name: "verified fresh applicable",
    note: note({ scope: { include_paths: ["src/notifications"] } }),
    freshness: FRESH,
    taskPaths: ["src/notifications/send.ts"],
    expected: "eligible",
  },
  {
    name: "verified fresh unbounded",
    note: note({}),
    freshness: FRESH,
    taskPaths: ["src/notifications/send.ts"],
    expected: "eligible",
  },
  {
    name: "verified fresh partial",
    note: note({ scope: { include_paths: ["src/notifications"] } }),
    freshness: FRESH,
    taskPaths: ["src/notifications/send.ts", "src/other.ts"],
    expected: "reconcile-required",
  },
  {
    name: "verified fresh not-applicable",
    note: note({ scope: { include_paths: ["src/notifications"] } }),
    freshness: FRESH,
    taskPaths: ["src/other.ts"],
    expected: "not-applicable",
  },
  {
    name: "provisional fresh applicable",
    note: note({ status: "provisional", scope: { include_paths: ["src/notifications"] } }),
    freshness: FRESH,
    taskPaths: ["src/notifications/send.ts"],
    expected: "reconcile-required",
  },
  {
    name: "verified review-required applicable",
    note: note({ scope: { include_paths: ["src/notifications"] } }),
    freshness: { state: "review-required", evidence: "changed" },
    taskPaths: ["src/notifications/send.ts"],
    expected: "reconcile-required",
  },
  {
    name: "verified unknown applicable",
    note: note({ scope: { include_paths: ["src/notifications"] } }),
    freshness: { state: "unknown", evidence: "unversioned" },
    taskPaths: ["src/notifications/send.ts"],
    expected: "reconcile-required",
  },
  {
    name: "disputed verified fresh applicable",
    note: note({ lifecycle: "disputed", scope: { include_paths: ["src/notifications"] } }),
    freshness: FRESH,
    taskPaths: ["src/notifications/send.ts"],
    expected: "blocked-disputed",
  },
  {
    name: "retired verified fresh applicable",
    note: note({ lifecycle: "retired", scope: { include_paths: ["src/notifications"] } }),
    freshness: FRESH,
    taskPaths: ["src/notifications/send.ts"],
    expected: "blocked-retired",
  },
  {
    name: "legacy",
    note: note({ classification: "legacy" }),
    freshness: { state: "unknown", evidence: "legacy" },
    taskPaths: ["src/notifications/send.ts"],
    expected: "unknown",
  },
];

test("eligibility fails closed when governanceErrors are present even if the note looks typed", () => {
  const malformed = note({ scope: { include_paths: ["src/notifications"] } });
  malformed.governanceErrors = ["lifecycle must be active, disputed, or retired"];
  assert.equal(
    evaluateKnowledgeEligibility(malformed, ["src/notifications/send.ts"], FRESH).disposition,
    "unknown",
  );
});

for (const row of MATRIX) {
  test(`eligibility matrix: ${row.name}`, () => {
    assert.equal(
      evaluateKnowledgeEligibility(row.note, row.taskPaths, row.freshness).disposition,
      row.expected,
    );
  });
}
