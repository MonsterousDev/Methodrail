#!/usr/bin/env node
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { parse } from "yaml";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const upstreamsDir = join(root, "upstreams");

function recordFiles() {
  return readdirSync(upstreamsDir)
    .filter((name) => name.endsWith(".yaml"))
    .map((name) => join(upstreamsDir, name));
}

function gitLsRemote(repository) {
  try {
    const out = execFileSync("git", ["ls-remote", repository, "HEAD"], {
      encoding: "utf8",
      timeout: 20000,
    });
    return out.trim().split(/\s+/, 1)[0] ?? "";
  } catch {
    return "";
  }
}

function skillRecords() {
  const skillsRoot = join(root, "skills");
  const rows = [];
  for (const name of readdirSync(skillsRoot)) {
    const path = join(skillsRoot, name, "UPSTREAM.md");
    if (!existsSync(path)) continue;
    const source = readFileSync(path, "utf8");
    const origin = /Origin:\s*(.+)/.exec(source)?.[1]?.trim() ?? name;
    const sha = /Upstream revision:\s*([0-9a-f]{7,40})/i.exec(source)?.[1] ?? "";
    rows.push({ name, origin, sha });
  }
  return rows;
}

const records = recordFiles().map((path) => {
  const value = parse(readFileSync(path, "utf8"));
  return {
    file: path,
    name: String(value.name ?? ""),
    repository: String(value.repository ?? ""),
    imported: String(value.last_reviewed_commit ?? ""),
  };
});

for (const record of records) {
  const head = record.repository ? gitLsRemote(record.repository) : "";
  const status = !head ? "unreachable" : head === record.imported ? "current" : "changed";
  console.log(`${record.name}:`);
  console.log(`  imported: ${record.imported || "(missing)"}`);
  console.log(`  upstream: ${head || "(network unavailable)"}`);
  console.log(`  status: ${status}`);
  console.log("");
}

console.log("Tracked skills:");
for (const skill of skillRecords()) {
  console.log(`  ${skill.name}: ${skill.origin} @ ${skill.sha || "(unrecorded)"}`);
}
