#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

function git(root: string, args: string[]): string {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

export function prepareKnowledgeRefreshFixture(fixtureDir: string, destination: string): string {
  const fixture = resolve(fixtureDir);
  const root = resolve(destination);
  const outbox = join(root, "repo", "src", "outbox.js");
  const historicalOutbox = join(fixture, "history", "outbox-before.js");
  const fixtureMethodrail = join(fixture, ".methodrail");
  const methodrail = join(root, ".methodrail");
  const note = join(methodrail, "knowledge", "mail.md");
  if (!existsSync(outbox) || !existsSync(historicalOutbox) || !existsSync(fixtureMethodrail)) {
    throw new Error("knowledge-refresh preparation requires the fixture repo, historical outbox, and .methodrail tree");
  }

  const currentOutbox = readFileSync(outbox, "utf8");
  rmSync(methodrail, { recursive: true, force: true });
  writeFileSync(outbox, readFileSync(historicalOutbox, "utf8"));

  git(root, ["init"]);
  git(root, ["config", "user.email", "eval@example.com"]);
  git(root, ["config", "user.name", "Methodrail Eval"]);
  git(root, ["add", "."]);
  git(root, ["-c", "commit.gpgsign=false", "commit", "-m", "historical delete-on-fail behavior"]);
  const validatedAt = git(root, ["rev-parse", "HEAD"]);

  writeFileSync(outbox, currentOutbox);
  cpSync(fixtureMethodrail, methodrail, { recursive: true });
  const noteSource = readFileSync(note, "utf8").replace("unversioned:prepare-fixture", validatedAt);
  writeFileSync(note, noteSource);
  git(root, ["add", "."]);
  git(root, ["-c", "commit.gpgsign=false", "commit", "-m", "keep failed rows and approve mail invariant"]);
  return validatedAt;
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  const fixture = process.argv[2];
  const destination = process.argv[3];
  if (!fixture || !destination) {
    console.error("usage: prepare-v0.7-fixture.ts <knowledge-refresh-fixture> <destination>");
    process.exit(2);
  }
  const revision = prepareKnowledgeRefreshFixture(fixture, destination);
  console.log(revision);
}
