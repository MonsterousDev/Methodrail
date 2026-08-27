import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { inspectHarnessBinding } from "../src/harness.js";
import { evaluateFreshness } from "../src/knowledge/freshness.js";
import { loadKnowledgeNotes, loadProjectMd } from "../src/knowledge/load.js";
import { evaluateProjectKnowledge } from "../src/knowledge/report.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const script = join(root, "skills/methodrail-init/scripts/linked-harness.mjs");

function git(repository: string, args: string[]): string {
  return execFileSync("git", args, { cwd: repository, encoding: "utf8" }).trim();
}

function fixture(): { base: string; repository: string; storage: string; revision: string } {
  const base = mkdtempSync(join(tmpdir(), "methodrail-linked-harness-"));
  const repository = join(base, "my-app");
  const storage = join(base, "my-app-methodrail");
  mkdirSync(join(repository, "src"), { recursive: true });
  writeFileSync(join(repository, "src", "app.js"), "module.exports = { version: 1 };\n");
  git(repository, ["init"]);
  git(repository, ["config", "user.email", "eval@example.com"]);
  git(repository, ["config", "user.name", "Methodrail Eval"]);
  git(repository, ["add", "."]);
  git(repository, ["-c", "commit.gpgsign=false", "commit", "-m", "base"]);
  return { base, repository, storage, revision: git(repository, ["rev-parse", "HEAD"]) };
}

function create(repository: string, storage: string): Record<string, string> {
  return JSON.parse(
    execFileSync("node", [script, "create", "--repo", repository, "--storage", storage], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }),
  ) as Record<string, string>;
}

function typedNote(revision: string): string {
  return `---
kind: invariant
status: verified
validated_at: ${revision}
relevant_paths:
  - src/app.js
---

# Application version boundary

## Claim

Application version behavior is owned by the exported source module.

## Evidence

- The committed source module exports the current application version.

## Reuse guidance

Read this before changing application version behavior.

## Refresh triggers

- The application source module changes.
`;
}

test("linked external harness remains repository-addressable and out of Git status", (t) => {
  const item = fixture();
  t.after(() => rmSync(item.base, { recursive: true, force: true }));

  const created = create(item.repository, item.storage);
  assert.equal(lstatSync(join(item.repository, ".methodrail")).isSymbolicLink(), true);
  assert.match(readFileSync(created.manifestPath!, "utf8"), /placement: linked-external/);
  assert.match(readFileSync(created.exclude!, "utf8"), /^\/\.methodrail$/m);
  assert.equal(git(item.repository, ["status", "--short"]), "");

  const binding = inspectHarnessBinding(item.repository);
  assert.deepEqual(binding.diagnostics, []);
  assert.equal(binding.binding?.placement, "linked-external");
  assert.equal(binding.binding?.storageHarnessRoot, created.storageHarnessRoot);

  mkdirSync(join(item.repository, ".methodrail", "knowledge"), { recursive: true });
  writeFileSync(
    join(item.repository, ".methodrail", "PROJECT.md"),
    "# Project\n\n## Knowledge index\n\n- [application version](knowledge/app.md) — source ownership\n",
  );
  writeFileSync(join(item.repository, ".methodrail", "knowledge", "app.md"), typedNote(item.revision));
  assert.match(loadProjectMd(item.repository) ?? "", /Knowledge index/);
  const report = evaluateProjectKnowledge(item.repository);
  assert.equal(report.errors.length, 0, report.errors.map((entry) => entry.message).join("\n"));
  const note = loadKnowledgeNotes(item.repository)[0];
  assert.ok(note);
  assert.equal(evaluateFreshness(note, item.repository).state, "fresh");

  const manifestBefore = readFileSync(created.manifestPath!, "utf8");
  const excludeBefore = readFileSync(created.exclude!, "utf8");
  execFileSync("node", [script, "create", "--repo", item.repository], { encoding: "utf8" });
  assert.equal(readFileSync(created.manifestPath!, "utf8"), manifestBefore);
  assert.equal(readFileSync(created.exclude!, "utf8"), excludeBefore);

  writeFileSync(join(item.repository, "src", "app.js"), "module.exports = { version: 2 };\n");
  assert.equal(evaluateFreshness(note, item.repository).state, "review-required");
  assert.doesNotMatch(git(item.repository, ["status", "--short"]), /\.methodrail/);
});

test("linked harness validation fails when the local Git exclusion is removed", (t) => {
  const item = fixture();
  t.after(() => rmSync(item.base, { recursive: true, force: true }));
  const created = create(item.repository, item.storage);
  writeFileSync(created.exclude!, "");
  const binding = inspectHarnessBinding(item.repository);
  assert.equal(binding.binding, undefined);
  assert.ok(binding.diagnostics.some((entry) => /local exclude/i.test(entry.message)));
});

test("linked harness fails closed when its manifest names another repository", (t) => {
  const item = fixture();
  t.after(() => rmSync(item.base, { recursive: true, force: true }));
  const created = create(item.repository, item.storage);
  const other = join(item.base, "other-app");
  mkdirSync(other);
  writeFileSync(
    created.manifestPath!,
    "schema_version: 1\nplacement: linked-external\nrepository:\n  path: \"../../other-app\"\n",
  );
  const binding = inspectHarnessBinding(item.repository);
  assert.equal(binding.binding, undefined);
  assert.ok(binding.diagnostics.some((entry) => /different repository/i.test(entry.message)));
  const report = evaluateProjectKnowledge(item.repository);
  assert.ok(report.errors.some((entry) => /different repository/i.test(entry.message)));
});

test("an unrelated sibling harness is never discovered without the repository link", (t) => {
  const item = fixture();
  t.after(() => rmSync(item.base, { recursive: true, force: true }));
  mkdirSync(join(item.storage, ".methodrail"), { recursive: true });
  writeFileSync(join(item.storage, ".methodrail", "PROJECT.md"), "# Wrong project\n");
  assert.equal(loadProjectMd(item.repository), null);
  assert.equal(inspectHarnessBinding(item.repository).binding, undefined);
});

test("linked external creation refuses storage inside the repository", (t) => {
  const item = fixture();
  t.after(() => rmSync(item.base, { recursive: true, force: true }));
  assert.throws(
    () => create(item.repository, join(item.repository, "private-methodrail")),
    /outside the repository/i,
  );
});
