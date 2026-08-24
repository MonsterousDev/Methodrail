import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import type { Registry } from "../registry/index.js";
import { loadRegistry } from "../registry/index.js";
import { methodrailRoot, pathsFor } from "../paths.js";

export const ADAPTER_TARGETS = ["cursor", "claude-code", "codex", "generic"] as const;
export type AdapterTarget = (typeof ADAPTER_TARGETS)[number];

export interface GenerateAdapterOptions {
  root?: string;
  outDir?: string;
  target: AdapterTarget | "all";
}

export function generateAdapters(options: GenerateAdapterOptions): string[] {
  const root = options.root ?? methodrailRoot();
  const registry = loadRegistry(root);
  const targets =
    options.target === "all" ? [...ADAPTER_TARGETS] : [options.target];
  const written: string[] = [];
  for (const target of targets) {
    const out = options.outDir
      ? join(options.outDir, target)
      : join(pathsFor(root).adapters, target);
    written.push(...writeAdapter(target, registry, out));
  }
  return written;
}

function writeAdapter(target: AdapterTarget, registry: Registry, outDir: string): string[] {
  mkdirSync(outDir, { recursive: true });
  const written: string[] = [];
  const write = (rel: string, contents: string) => {
    const full = join(outDir, rel);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, contents);
    written.push(full);
  };

  write("README.md", adapterReadme(target, registry));
  write("LIMITATIONS.md", limitations(target));

  if (target === "cursor") {
    write("rules/methodrail.mdc", cursorRouterRule());
    write("METHODRAIL.md", progressiveIndex(registry));
    for (const skill of registry.skills) {
      write(`skills/${skill.id}/SKILL.md`, wrapSkill(skill.id, skill.skillMd, "cursor"));
    }
  } else if (target === "claude-code") {
    write("CLAUDE.md", claudePointer(registry));
    for (const skill of registry.skills) {
      write(`skills/${skill.id}/SKILL.md`, wrapSkill(skill.id, skill.skillMd, "claude-code"));
    }
  } else if (target === "codex") {
    write("AGENTS.md", codexAgents(registry));
    for (const skill of registry.skills) {
      write(`skills/${skill.id}/SKILL.md`, wrapSkill(skill.id, skill.skillMd, "codex"));
    }
  } else {
    write("AGENTS.md", genericAgents(registry));
    for (const skill of registry.skills) {
      write(`skills/${skill.id}/SKILL.md`, wrapSkill(skill.id, skill.skillMd, "generic"));
    }
  }

  return written;
}

function adapterReadme(target: AdapterTarget, registry: Registry): string {
  return `# Methodrail adapter: ${target}

This directory is generated from Methodrail's internal representation.

- Skills projected: ${registry.skills.map((s) => s.id).join(", ") || "(none yet)"}
- Workflows: ${registry.workflows.map((w) => w.id).join(", ") || "(none yet)"}

The Methodrail package is the source of truth. Do not edit generated files by hand.

See LIMITATIONS.md for harness-specific gaps.
`;
}

function limitations(target: AdapterTarget): string {
  const shared = `Methodrail does not claim feature-equivalence across harnesses.

- One orchestration control plane: the Methodrail router. Skills must not replace the global workflow.
- Progressive disclosure: do not paste the entire methodology into permanent context.
- Evidence, knowledge, and result packets are Methodrail protocols. A harness that cannot carry structured packets should still follow the same semantics in prose.
`;
  if (target === "cursor") {
    return `${shared}
Cursor-specific:
- Thin always-available rule in \`rules/methodrail.mdc\`.
- Skills are requestable SKILL.md directories.
- Cursor has no native workflow engine; phase transitions live in Methodrail workflow YAML and the router.
`;
  }
  if (target === "claude-code") {
    return `${shared}
Claude Code-specific:
- CLAUDE.md is a pointer, not the methodology.
- Skills map onto \`.claude/skills\` when installed into a project.
`;
  }
  if (target === "codex") {
    return `${shared}
Codex-specific:
- AGENTS.md is the entrypoint.
- Skill directories are best-effort; Codex may treat them as ordinary docs.
`;
  }
  return `${shared}
Generic Agent Skills:
- SKILL.md frontmatter (\`name\`, \`description\`) is the portable contract.
- \`skill.yaml\` remains Methodrail-specific and may be ignored by other loaders.
`;
}

function cursorRouterRule(): string {
  return `---
description: Methodrail control plane — route work, keep context small, require evidence.
alwaysApply: true
---

You are operating with Methodrail as the single orchestration control plane.

Do not invent a second router. Do not load every Methodrail skill. Open a skill only when the current task requires it.

Default loop: understand → evidence → decide → plan → execute → observe → verify → blast radius → complete → retain only validated knowledge.

Non-negotiable:
- Explore before changing nontrivial existing systems.
- Observe runtime behavior instead of inferring it when observation is cheap.
- Never call work working/fixed/complete without fresh evidence.
- Prefer the environment (source, git, tests, CLI, config) over duplicated docs.
- Unknown is a valid answer. Do not fabricate rationale.
- Ask humans only for preference/intent the environment cannot resolve.

Rigor is independent of task type. Mechanical work stays mechanical. High-risk work (billing, permissions, migrations, concurrency) raises evidence requirements.

When unsure which skill to open, inspect Methodrail workflows and skill summaries rather than guessing.
`;
}

function progressiveIndex(registry: Registry): string {
  const skills = registry.skills
    .map((s) => `- \`${s.id}\` (${s.metadata.kind}, rigor ≥ ${s.metadata.rigor.minimum}): ${s.metadata.summary}`)
    .join("\n");
  const workflows = registry.workflows
    .map((w) => `- \`${w.id}\`: ${w.summary}`)
    .join("\n");
  return `# Methodrail (progressive index)

Load this file when you need the catalog. Do not keep the full skill texts in context.

## Workflows

${workflows || "_none_"}

## Skills

${skills || "_none_"}

## Principles

See \`principles/\` in the Methodrail package. Open one principle at a time.
`;
}

function claudePointer(registry: Registry): string {
  return `# Methodrail

Use Methodrail as the only methodology router for this project.

Workflows: ${registry.workflows.map((w) => w.id).join(", ") || "investigate, develop, debug, refactor, review"}

Open skills from \`.claude/skills\` (or the Methodrail package \`skills/\`) only when needed. Do not paste the full methodology into every turn.

Require evidence before completion claims. Inspect the environment before asking the human.
`;
}

function codexAgents(registry: Registry): string {
  return `# Methodrail for Codex

You follow Methodrail. There is one control plane.

${progressiveIndex(registry)}
`;
}

function genericAgents(registry: Registry): string {
  return `# Methodrail (generic Agent Skills)

This adapter projects Methodrail skills into the common SKILL.md layout.

${progressiveIndex(registry)}
`;
}

function wrapSkill(id: string, body: string, target: AdapterTarget): string {
  const note = `> Harness: ${target}. Authoritative metadata is Methodrail \`skill.yaml\`. This file is a projection.\n\n`;
  if (body.startsWith("---")) {
    const end = body.indexOf("\n---", 3);
    if (end !== -1) {
      return `${body.slice(0, end + 4)}\n\n${note}${body.slice(end + 4).trimStart()}`;
    }
  }
  return `---\nname: ${id}\ndescription: Methodrail skill ${id}\n---\n\n${note}${body}`;
}

export function adapterExists(target: AdapterTarget, root = methodrailRoot()): boolean {
  return existsSync(join(pathsFor(root).adapters, target));
}
