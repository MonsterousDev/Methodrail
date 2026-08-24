import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const FILES: Record<string, string> = {
  "README.md": `# Project-local Methodrail

This \`.ai/\` tree is owned by **this repository**, not by the Methodrail package.

Methodrail supplies schemas, skills, workflows, and promotion rules.
This tree stores validated project knowledge, control adapters, and artifacts.

Do not cache inspectable source layout here. Persist terminology, rationale,
invariants, expensive discoveries, and observed behavioral contracts.
`,
  "knowledge/README.md": `# Knowledge

Promotion path:

observation → candidate → evidence validation → classification → promotion

Status values: candidate | validated | rejected | stale | superseded

Code-derived claims should name a repository revision or source fingerprint.
`,
  "knowledge/domain/.gitkeep": "",
  "knowledge/behavior/.gitkeep": "",
  "knowledge/architecture/.gitkeep": "",
  "knowledge/rationale/.gitkeep": "",
  "knowledge/operations/.gitkeep": "",
  "state/README.md": `# State

Working decision maps, context packets, and in-progress result packets live here.
This directory is ephemeral. Do not treat it as the knowledge base.
`,
  "control/CONTROL.md": `# Control adapter

Not yet generated.

Run the Methodrail \`create-control-adapter\` skill against this repository.
Prefer wrapping existing project commands over inventing new infrastructure.

Target interface:

- start
- doctor
- drive
- inspect
- capture
- reset
- stop
`,
  "control/scenarios/.gitkeep": "",
  "artifacts/README.md": `# Artifacts

Observation captures, traces, screenshots, prototype outputs, and eval traces.
Reference these from evidence objects. Do not paste large blobs into chat.
`,
};

export interface InitResult {
  created: string[];
  skipped: string[];
}

export function initProject(targetDir: string): InitResult {
  const created: string[] = [];
  const skipped: string[] = [];
  const root = join(targetDir, ".ai");

  for (const [rel, contents] of Object.entries(FILES)) {
    const full = join(root, rel);
    if (existsSync(full)) {
      skipped.push(full);
      continue;
    }
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, contents);
    created.push(full);
  }

  return { created, skipped };
}
