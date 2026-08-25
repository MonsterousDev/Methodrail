import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { evaluateFreshness } from "../src/knowledge/freshness.js";
import { loadKnowledgeNotes, parseNote } from "../src/knowledge/load.js";
import { evaluateProjectKnowledge } from "../src/knowledge/report.js";
import { validateNote } from "../src/knowledge/validate.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const templatePath = join(root, "templates/project/knowledge/note.md");

function tempProject(): string {
  const dir = mkdtempSync(join(tmpdir(), "methodrail-knowledge-"));
  mkdirSync(join(dir, ".methodrail", "knowledge"), { recursive: true });
  mkdirSync(join(dir, "src"), { recursive: true });
  writeFileSync(join(dir, "src", "webhooks.js"), "module.exports = {}\n");
  return dir;
}

const TYPED = `---
kind: invariant
status: verified
validated_at: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
relevant_paths:
  - src/webhooks.js
---

# Webhook credit idempotency

## Claim

Every webhook path that can produce a ledger credit must use the provider event ID as its idempotency key.

## Evidence

- The direct provider handler passes the event ID to the keyed ledger write.
- Replaying the same provider event produces one credit in the regression test.

## Reuse guidance

When adding another credit-producing webhook, trace the handler to the ledger boundary and preserve this key.

## Refresh triggers

- A credit-producing webhook path changes.
- The ledger idempotency boundary changes.
`;

function writeNote(dir: string, name: string, source: string, indexTitle = "webhook credit"): void {
  writeFileSync(join(dir, ".methodrail", "knowledge", name), source);
  writeFileSync(
    join(dir, ".methodrail", "PROJECT.md"),
    `# Project\n\n## Knowledge index\n\n- [${indexTitle}](knowledge/${name}) — durable invariant\n`,
  );
}

test("the canonical template parses as a typed note", () => {
  const source = readFileSync(templatePath, "utf8");
  const note = parseNote(templatePath, source, dirname(templatePath));
  assert.equal(note.classification, "typed");
  assert.equal(note.frontmatter?.kind, "invariant");
  assert.equal(note.frontmatter?.status, "verified");
  assert.match(note.claim, /later agent/i);
  assert.ok(note.evidence.length > 0);
});

test("valid verified invariant and provisional hypothesis load", () => {
  const dir = tempProject();
  try {
    writeNote(dir, "webhooks.md", TYPED);
    writeFileSync(
      join(dir, ".methodrail", "knowledge", "retry.md"),
      `---
kind: hypothesis
status: provisional
validated_at: unversioned:no-git
relevant_paths:
  - src/webhooks.js
---

# Retry hypothesis

## Claim

Four retries may explain duplicate charges until we observe production.

## Evidence

- Chat speculation only; not yet confirmed against logs.

## Reuse guidance

Treat as uncertainty, not an invariant.

## Refresh triggers

- Runtime observation of retry counts.
`,
    );
    writeFileSync(
      join(dir, ".methodrail", "PROJECT.md"),
      `# Project\n\n- [webhook credit](knowledge/webhooks.md)\n- [retry hypothesis](knowledge/retry.md)\n`,
    );
    const report = evaluateProjectKnowledge(dir);
    const kinds = report.notes.map((note) => `${note.frontmatter?.kind}:${note.frontmatter?.status}`);
    assert.ok(kinds.includes("invariant:verified"));
    assert.ok(kinds.includes("hypothesis:provisional"));
    assert.equal(report.errors.length, 0, report.errors.map((item) => item.message).join("\n"));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("verified note without evidence fails", () => {
  const dir = tempProject();
  try {
    writeNote(
      dir,
      "empty.md",
      TYPED.replace(/## Evidence[\s\S]*?## Reuse/, "## Evidence\n\n## Reuse"),
      "empty",
    );
    const report = evaluateProjectKnowledge(dir);
    assert.ok(report.errors.some((item) => /meaningful evidence/i.test(item.message)));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("verified hypothesis fails", () => {
  const dir = tempProject();
  try {
    writeNote(
      dir,
      "bad.md",
      TYPED.replace("kind: invariant", "kind: hypothesis"),
      "bad",
    );
    const report = evaluateProjectKnowledge(dir);
    assert.ok(report.errors.some((item) => /hypothesis/i.test(item.message)));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("typed frontmatter missing kind is invalid rather than legacy", () => {
  const dir = tempProject();
  try {
    writeNote(dir, "missing-kind.md", TYPED.replace("kind: invariant\n", ""), "missing kind");
    const report = evaluateProjectKnowledge(dir);
    assert.equal(report.notes[0]?.classification, "invalid-typed");
    assert.ok(report.errors.some((item) => /requires kind/i.test(item.message)));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("unknown kind and status are invalid", () => {
  const dir = tempProject();
  try {
    writeNote(
      dir,
      "unknown.md",
      TYPED.replace("kind: invariant", "kind: rumor").replace("status: verified", "status: trusted"),
      "unknown",
    );
    const report = evaluateProjectKnowledge(dir);
    assert.equal(report.notes[0]?.classification, "invalid-typed");
    assert.ok(report.errors.some((item) => /requires kind/i.test(item.message)));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("missing project index entry fails", () => {
  const dir = tempProject();
  try {
    writeFileSync(join(dir, ".methodrail", "knowledge", "webhooks.md"), TYPED);
    writeFileSync(join(dir, ".methodrail", "PROJECT.md"), "# Project\n\nNo knowledge pointers.\n");
    const report = evaluateProjectKnowledge(dir);
    assert.ok(report.errors.some((item) => /not indexed/i.test(item.message)));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a dangling project knowledge pointer fails", () => {
  const dir = tempProject();
  try {
    writeFileSync(
      join(dir, ".methodrail", "PROJECT.md"),
      "# Project\n\n- [missing knowledge](knowledge/missing.md)\n",
    );
    const report = evaluateProjectKnowledge(dir);
    assert.ok(report.errors.some((item) => /target does not exist/i.test(item.message)));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a project knowledge pointer cannot escape .methodrail", () => {
  const dir = tempProject();
  try {
    writeFileSync(
      join(dir, ".methodrail", "PROJECT.md"),
      "# Project\n\n- [outside knowledge](../outside/knowledge/escape.md)\n",
    );
    const report = evaluateProjectKnowledge(dir);
    assert.ok(report.errors.some((item) => /escapes \.methodrail/i.test(item.message)));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("legacy note remains compatible with a warning", () => {
  const dir = tempProject();
  try {
    writeFileSync(
      join(dir, ".methodrail", "knowledge", "webhooks.md"),
      "# Webhooks\n\nLedger credits are idempotent on eventId.\n",
    );
    writeFileSync(join(dir, ".methodrail", "PROJECT.md"), "# Project\n");
    const report = evaluateProjectKnowledge(dir);
    assert.equal(report.notes[0]?.classification, "legacy");
    assert.equal(report.errors.length, 0);
    assert.ok(report.warnings.some((item) => /legacy/i.test(item.message)));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("git-less unversioned fallback is accepted with reduced confidence", () => {
  const dir = tempProject();
  try {
    writeNote(dir, "webhooks.md", TYPED.replace("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "unversioned:no-git"));
    const report = evaluateProjectKnowledge(dir);
    assert.equal(report.errors.length, 0, report.errors.map((item) => item.message).join("\n"));
    assert.ok(report.warnings.some((item) => /reduced confidence|unversioned/i.test(item.message)));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("path traversal is rejected", () => {
  const dir = tempProject();
  try {
    writeNote(dir, "webhooks.md", TYPED.replace("- src/webhooks.js", "- ../secret"));
    const report = evaluateProjectKnowledge(dir);
    assert.ok(report.errors.some((item) => /escapes/i.test(item.message)));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a temporarily missing relevant path does not invalidate the repository", () => {
  const dir = tempProject();
  try {
    writeNote(dir, "webhooks.md", TYPED.replace("- src/webhooks.js", "- src/missing.js"));
    const report = evaluateProjectKnowledge(dir);
    assert.equal(report.errors.length, 0, report.errors.map((item) => item.message).join("\n"));
    assert.ok(report.warnings.some((item) => /missing/i.test(item.message)));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("duplicate typed titles are rejected", () => {
  const dir = tempProject();
  try {
    writeNote(dir, "one.md", TYPED, "one");
    writeFileSync(join(dir, ".methodrail", "knowledge", "two.md"), TYPED.replace("webhooks.md", "two.md"));
    writeFileSync(
      join(dir, ".methodrail", "PROJECT.md"),
      `# Project\n\n- [one](knowledge/one.md)\n- [two](knowledge/two.md)\n`,
    );
    const report = evaluateProjectKnowledge(dir);
    assert.ok(report.errors.some((item) => /duplicate typed note title/i.test(item.message)));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a second validation run is deterministic", () => {
  const dir = tempProject();
  try {
    writeNote(dir, "webhooks.md", TYPED);
    const first = evaluateProjectKnowledge(dir);
    const second = evaluateProjectKnowledge(dir);
    assert.deepEqual(
      first.errors.map((item) => item.message),
      second.errors.map((item) => item.message),
    );
    assert.deepEqual(
      first.warnings.map((item) => item.message),
      second.warnings.map((item) => item.message),
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("relevant-path changes produce a freshness warning", () => {
  const dir = tempProject();
  try {
    execFileSync("git", ["init"], { cwd: dir, stdio: "ignore" });
    execFileSync("git", ["config", "user.email", "eval@example.com"], { cwd: dir, stdio: "ignore" });
    execFileSync("git", ["config", "user.name", "Eval"], { cwd: dir, stdio: "ignore" });
    writeFileSync(join(dir, "src", "webhooks.js"), "module.exports = { v: 1 }\n");
    execFileSync("git", ["add", "."], { cwd: dir, stdio: "ignore" });
    execFileSync("git", ["-c", "commit.gpgsign=false", "commit", "-m", "base"], { cwd: dir, stdio: "ignore" });
    const sha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: dir, encoding: "utf8" }).trim();
    writeNote(dir, "webhooks.md", TYPED.replace("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", sha));
    execFileSync("git", ["add", "."], { cwd: dir, stdio: "ignore" });
    execFileSync("git", ["-c", "commit.gpgsign=false", "commit", "-m", "note"], { cwd: dir, stdio: "ignore" });
    const note = loadKnowledgeNotes(dir)[0];
    assert.ok(note);
    const fresh = evaluateFreshness(note, dir);
    assert.equal(fresh.state, "fresh");
    writeFileSync(join(dir, "src", "webhooks.js"), "module.exports = { v: 2 }\n");
    const unstaged = evaluateFreshness(note, dir);
    assert.equal(unstaged.state, "review-required");
    execFileSync("git", ["add", "."], { cwd: dir, stdio: "ignore" });
    const staged = evaluateFreshness(note, dir);
    assert.equal(staged.state, "review-required");
    execFileSync("git", ["-c", "commit.gpgsign=false", "commit", "-m", "change"], { cwd: dir, stdio: "ignore" });
    const stale = evaluateFreshness(note, dir);
    assert.equal(stale.state, "review-required");
    const report = evaluateProjectKnowledge(dir);
    assert.equal(report.errors.length, 0);
    assert.ok(report.warnings.some((item) => /review-required/i.test(item.message)));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("an untracked relevant path requires freshness review", () => {
  const dir = tempProject();
  try {
    execFileSync("git", ["init"], { cwd: dir, stdio: "ignore" });
    execFileSync("git", ["config", "user.email", "eval@example.com"], { cwd: dir, stdio: "ignore" });
    execFileSync("git", ["config", "user.name", "Eval"], { cwd: dir, stdio: "ignore" });
    execFileSync("git", ["add", "."], { cwd: dir, stdio: "ignore" });
    execFileSync("git", ["-c", "commit.gpgsign=false", "commit", "-m", "base"], { cwd: dir, stdio: "ignore" });
    const sha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: dir, encoding: "utf8" }).trim();
    writeNote(
      dir,
      "webhooks.md",
      TYPED.replace("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", sha).replace("src/webhooks.js", "src/new-webhook.js"),
    );
    execFileSync("git", ["add", ".methodrail"], { cwd: dir, stdio: "ignore" });
    execFileSync("git", ["-c", "commit.gpgsign=false", "commit", "-m", "note"], { cwd: dir, stdio: "ignore" });
    const note = loadKnowledgeNotes(dir)[0];
    assert.ok(note);
    assert.equal(evaluateFreshness(note, dir).state, "fresh");
    writeFileSync(join(dir, "src", "new-webhook.js"), "module.exports = { routed: true }\n");
    assert.equal(evaluateFreshness(note, dir).state, "review-required");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("decision records are not typed-note errors", () => {
  const dir = tempProject();
  try {
    mkdirSync(join(dir, ".methodrail", "knowledge", "decisions"), { recursive: true });
    writeFileSync(
      join(dir, ".methodrail", "knowledge", "decisions", "0001.md"),
      "# Decision\n\nQuestion: who owns sessions?\n",
    );
    writeFileSync(join(dir, ".methodrail", "PROJECT.md"), "# Project\n");
    const report = evaluateProjectKnowledge(dir);
    assert.equal(report.notes[0]?.classification, "decision");
    assert.equal(report.errors.length, 0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("validateNote reports no errors for a well-formed typed note", () => {
  const dir = tempProject();
  try {
    writeNote(dir, "webhooks.md", TYPED);
    const notes = loadKnowledgeNotes(dir);
    const projectMd = readFileSync(join(dir, ".methodrail", "PROJECT.md"), "utf8");
    const diagnostics = validateNote(notes[0]!, dir, projectMd, notes);
    assert.equal(
      diagnostics.filter((item) => item.level === "error").length,
      0,
      diagnostics.map((item) => item.message).join("\n"),
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
