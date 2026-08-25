#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const extract = join(root, "evals/runners/extract-overlay.mjs");
const pilot = "/tmp/methodrail-pilot-20260825-v07";

const runs = [];
for (const fixture of ["knowledge-reuse", "knowledge-refresh"]) {
  for (const host of ["cursor", "codex"]) {
    const repeats = host === "cursor" ? [1, 2] : [1];
    for (const repeat of repeats) {
      for (const condition of ["baseline", "methodrail"]) {
        runs.push({ fixture, host, repeat, condition });
      }
    }
  }
}

function readJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return fallback;
  }
}

function commandsFrom(dest) {
  const raw = readJson(join(dest, "COMMANDS.json"), []);
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    if (typeof item === "string") return { command: item, exit_status: null };
    if (item && typeof item === "object" && typeof item.command === "string") {
      return {
        command: item.command,
        exit_status: typeof item.exit_status === "number" ? item.exit_status : null,
        phase: typeof item.phase === "string" ? item.phase : undefined,
      };
    }
    return null;
  }).filter(Boolean);
}

for (const spec of runs) {
  const dest = join(pilot, spec.fixture, `${spec.host}-r${spec.repeat}-${spec.condition}`);
  const clean = `${dest}.clean`;
  const art = join(
    root,
    "evals/runners/artifacts",
    spec.fixture,
    `${spec.host}-r${spec.repeat}-${spec.condition}`,
  );
  mkdirSync(art, { recursive: true });
  const overlay = join(art, "overlay");
  if (existsSync(clean) && existsSync(dest)) {
    spawnSync("node", [extract, clean, dest, overlay], { stdio: "inherit" });
  }
  const answer = existsSync(join(dest, "ANSWER.md"))
    ? readFileSync(join(dest, "ANSWER.md"), "utf8")
    : existsSync(join(dest, "answer.md"))
      ? readFileSync(join(dest, "answer.md"), "utf8")
      : "";
  writeFileSync(join(art, "answer.md"), answer.endsWith("\n") ? answer : `${answer}\n`);
  const commandLog = commandsFrom(dest);
  writeFileSync(join(art, "command.log.json"), `${JSON.stringify(commandLog, null, 2)}\n`);
  const transcriptSrc = existsSync(join(dest, "TRANSCRIPT.jsonl"))
    ? join(dest, "TRANSCRIPT.jsonl")
    : existsSync(join(dest, "TRANSCRIPT.txt"))
      ? join(dest, "TRANSCRIPT.txt")
      : null;
  if (transcriptSrc) {
    writeFileSync(join(art, "TRANSCRIPT.txt"), readFileSync(transcriptSrc));
  }

  const capture = spec.host === "codex" && transcriptSrc ? "runner_captured" : "operator_summary";
  const example = {
    fixture_id: spec.fixture,
    condition: spec.condition,
    host: spec.host,
    model: spec.host === "codex" ? "gpt-5.5" : "grok-4.6",
    repeat: spec.repeat,
    skills_invoked: [],
    references_loaded: [],
    tools_used: ["edit", "shell"],
    subagents_used: 0,
    verification_steps: commandLog,
    evidence: answer.split("\n").filter(Boolean).slice(0, 12),
    outcome: answer.replace(/\s+/g, " ").trim().slice(0, 500),
    failure_modes: [],
    notes: `Live v0.7 pilot 2026-08-25. Worktree ${dest}. Cursor runs used isolated Task subagents on /tmp copies. Codex used codex exec --ignore-user-config --skip-git-repo-check --sandbox workspace-write -m gpt-5.5. Extra copy; canonical example JSON was not replaced.`,
    provenance: "live",
    capture,
    artifacts: {
      overlay: `evals/runners/artifacts/${spec.fixture}/${spec.host}-r${spec.repeat}-${spec.condition}/overlay`,
      command_log: `evals/runners/artifacts/${spec.fixture}/${spec.host}-r${spec.repeat}-${spec.condition}/command.log.json`,
      answer: `evals/runners/artifacts/${spec.fixture}/${spec.host}-r${spec.repeat}-${spec.condition}/answer.md`,
    },
  };
  if (capture === "runner_captured") {
    example.artifacts.transcript = `evals/runners/artifacts/${spec.fixture}/${spec.host}-r${spec.repeat}-${spec.condition}/TRANSCRIPT.txt`;
  }
  const examplePath = join(
    root,
    "evals/runners/examples",
    `${spec.fixture}.${spec.host}-r${spec.repeat}-${spec.condition}.json`,
  );
  writeFileSync(examplePath, `${JSON.stringify(example, null, 2)}\n`);
  console.log("recorded", examplePath);
}
