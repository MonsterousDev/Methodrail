import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { findMethodrailDirs, walkFiles } from "../src/fs-walk.js";

test("walkFiles skips outbound and cyclic directory symlinks", () => {
  const root = mkdtempSync(join(tmpdir(), "methodrail-walk-"));
  const outside = mkdtempSync(join(tmpdir(), "methodrail-walk-outside-"));
  try {
    mkdirSync(join(root, "keep"), { recursive: true });
    writeFileSync(join(root, "keep", "inside.md"), "ok\n");
    writeFileSync(join(outside, "secret.md"), "nope\n");
    symlinkSync(outside, join(root, "escape"));
    mkdirSync(join(root, "loop"));
    symlinkSync(root, join(root, "loop", "back"));
    const files = walkFiles(root, (path) => path.endsWith(".md"));
    assert.equal(files.length, 1);
    assert.ok(files[0]?.endsWith(join("keep", "inside.md")));
  } finally {
    rmSync(root, { recursive: true, force: true });
    rmSync(outside, { recursive: true, force: true });
  }
});

test("findMethodrailDirs records a linked .methodrail without following other outbound links", () => {
  const root = mkdtempSync(join(tmpdir(), "methodrail-find-"));
  const outside = mkdtempSync(join(tmpdir(), "methodrail-find-outside-"));
  try {
    mkdirSync(join(root, ".methodrail"));
    writeFileSync(join(root, ".methodrail", "PROJECT.md"), "# Project\n");
    mkdirSync(join(outside, ".methodrail"));
    writeFileSync(join(outside, ".methodrail", "PROJECT.md"), "# Outside\n");
    symlinkSync(outside, join(root, "vendor"));
    const found = findMethodrailDirs(root);
    assert.equal(found.length, 1);
    assert.ok(found[0]?.endsWith(".methodrail"));
    assert.equal(found.some((path) => path.includes("vendor")), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
    rmSync(outside, { recursive: true, force: true });
  }
});

test("findMethodrailDirs records a .methodrail symlink that points outside the repository", () => {
  const repo = mkdtempSync(join(tmpdir(), "methodrail-find-link-"));
  const storage = mkdtempSync(join(tmpdir(), "methodrail-find-storage-"));
  try {
    mkdirSync(join(storage, ".methodrail"));
    writeFileSync(join(storage, ".methodrail", "PROJECT.md"), "# Linked\n");
    symlinkSync(join(storage, ".methodrail"), join(repo, ".methodrail"));
    const found = findMethodrailDirs(repo);
    assert.equal(found.length, 1);
    assert.ok(found[0]?.endsWith(".methodrail"));
  } finally {
    rmSync(repo, { recursive: true, force: true });
    rmSync(storage, { recursive: true, force: true });
  }
});
