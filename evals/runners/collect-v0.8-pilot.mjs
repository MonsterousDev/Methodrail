#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const extract = join(root, "evals/runners/extract-overlay.mjs");
const pilot = process.env.METHODRAIL_PILOT_DIR ?? "/tmp/methodrail-pilot-20260831-v08";
const freeze = existsSync(join(pilot, "METHODRAIL_HEAD"))
  ? readFileSync(join(pilot, "METHODRAIL_HEAD"), "utf8").trim()
  : "unknown";

const runs = [];
for (const fixture of ["knowledge-applicability", "knowledge-dispute", "knowledge-retired"]) {
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

function commandsFromTranscript(dest) {
  const path = join(dest, "TRANSCRIPT.jsonl");
  if (!existsSync(path)) return [];
  const out = [];
  for (const line of readFileSync(path, "utf8").split("\n")) {
    if (!line.trim()) continue;
    try {
      const event = JSON.parse(line);
      const item = event.item;
      if (item?.type === "command_execution" && event.type === "item.completed") {
        out.push({
          command: typeof item.command === "string" ? item.command : String(item.command ?? ""),
          exit_status: typeof item.exit_code === "number" ? item.exit_code : null,
        });
      }
    } catch {
      // keep going; a truncated line must not drop the rest of a launched run
    }
  }
  return out;
}

function commandsFrom(dest) {
  const raw = readJson(join(dest, "COMMANDS.json"), null);
  if (Array.isArray(raw) && raw.length > 0) {
    return raw
      .map((item) => {
        if (typeof item === "string") return { command: item, exit_status: null };
        if (item && typeof item === "object" && typeof item.command === "string") {
          return {
            command: item.command,
            exit_status: typeof item.exit_status === "number" ? item.exit_status : null,
            phase: typeof item.phase === "string" ? item.phase : undefined,
          };
        }
        return null;
      })
      .filter(Boolean);
  }
  return commandsFromTranscript(dest);
}

function answerFrom(dest) {
  for (const name of ["ANSWER.md", "answer.md", "CODEX_LAST_MESSAGE.md"]) {
    const path = join(dest, name);
    if (existsSync(path)) return readFileSync(path, "utf8");
  }
  return "";
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
  } else {
    mkdirSync(overlay, { recursive: true });
    writeFileSync(join(overlay, ".methodrail-overlay.json"), `${JSON.stringify({ deletions: [], missing_worktree: true }, null, 2)}\n`);
  }
  const answer = answerFrom(dest);
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
    notes: `Live v0.8 knowledge-governance pilot 2026-08-31. Freeze ${freeze}. Worktree ${dest}. Cursor runs used isolated Task subagents on /tmp copies. Codex used codex exec --ignore-user-config --skip-git-repo-check --sandbox workspace-write -m gpt-5.5. Extra copy; canonical example JSON was not replaced.`,
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
