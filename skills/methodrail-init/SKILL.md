---
name: methodrail-init
description: Initialize or refresh Methodrail guidance in a repository after inspecting its code, tooling, and existing AI instructions. Run only when explicitly requested, including requests to refresh control knowledge.
disable-model-invocation: true
---

# Methodrail init

Create the highest-leverage project-specific AI harness with the least permanent-context cost and maintenance burden. Inspect first, preserve existing guidance, and make repeated runs safe.

Init is a multiplier for every later skill. Optimize for future skill leverage per unit of permanent context and maintenance. Write all agent-facing harness files with [writing-for-agents](../writing-for-agents/SKILL.md).

Ask internally:

```text
What will many skills repeatedly need?
What project behavior is expensive to rediscover?
What control/verification would improve multiple workflows?
What terminology prevents repeated misunderstanding?
What existing docs should agents be pointed to?
What should NOT be copied because the environment already answers it?
```

A tiny project may need only `.methodrail/PROJECT.md`. A mature service may need knowledge notes, control procedures, and a project-local verification skill. Do not generate files merely to satisfy a template.

Do not copy global Methodrail skills (`how`, `tdd`, `wayfinder`, …) into the project. Global skills stay globally installed. Generate only project-specific material.

## Workflow

```text
inspect repository
↓
resolve harness placement (directory vs linked external storage)
↓
establish high-value project knowledge
↓
determine whether the project has a meaningful executable surface
        │
        ├── no  → document appropriate static verification
        └── yes → create-verification-skill
                 → project-local verify skill / feature map
```

1. Interview the repository before asking the user. Load [repository interview](references/repository-interview.md). Inspect the canonical `.methodrail` path at the git root, including whether it is a linked external harness.
2. If a harness already exists, refresh it through that canonical path rather than recreate or move it. Load [control maintenance](references/control-maintenance.md).
3. If none exists, resolve [harness location](references/harness-location.md) before writing files. Ask whether Methodrail knowledge should live in the repository or in repository-bound external storage. Honor a preference already stated in the request. This choice decides git/PR visibility.
4. Resolve only remaining choices the repository cannot answer. Ask a focused question only when the answer materially changes the generated files.
5. Plan proportionally using [information ROI](references/information-roi.md) and [optional artifacts](references/optional-artifacts.md):
   - always consider `.methodrail/PROJECT.md` as a short index pointing at canonical sources (`AGENTS.md`, ADRs, runbooks) rather than copying them;
   - add knowledge, control, or a project-local skill only when it removes real recurring uncertainty;
   - in a monorepo, document shared conventions once and add package-specific detail only where commands or constraints differ.
6. Investigate control/verification explicitly when the project has a runnable surface. Load [control investigation](references/control-investigation.md). For an in-repository harness, invoke `create-verification-skill` when the surface warrants it. For a linked external harness, record the verified procedure under `.methodrail/control/` instead; do not claim a host-native skill outside the host's discovery root. If the surface is not meaningful, document static verification and do not invent runtime infrastructure.
7. Preview conflicts. Never overwrite existing instructions or curated prose.
8. Generate or merge files through the git root's canonical `.methodrail/` path using [merge semantics](references/merge-semantics.md). Prefer templates in `templates/project/` as skeletons to fill from evidence, not as files to copy blindly. The link routes external writes to sibling storage.
9. Install exactly one thin, supported integration described in [integrations](references/integrations.md). A linked external harness relies on the globally installed Methodrail integration plus the canonical repository-root link; do not edit tracked instruction files merely to advertise it. If a supported integration already exists, update only the Methodrail-owned pointer or leave it intact.
10. Validate paths, commands, frontmatter, links, and idempotency. A second run with unchanged inputs must produce no diff.
11. Report the harness location, what was created, preserved, skipped, refreshed, and still needs a human decision.

## Output constraints

- `.methodrail/PROJECT.md` is a concise index, not the entire knowledge base.
- Keep PROJECT.md pointer-oriented: links, durable facts, and paths. Do not clone the README or generate a giant summary.
- For linked external placement, use the bundled deterministic script from [harness location](references/harness-location.md). The only repository entry is the locally ignored `.methodrail` link; all harness contents live outside the repository, and `HARNESS.yaml` owns the binding.
- Recognize typed notes and legacy untyped notes. Validate that typed notes are indexed. Report potentially stale notes. Do not rewrite them automatically. Do not create typed notes during init.
- Record commands the repository already supports; do not invent infrastructure.
- Preserve existing `AGENTS.md`, `CLAUDE.md`, Cursor rules, copilot instructions, and local skills. Repository-specific instructions outrank generic Methodrail assumptions.
- Do not copy generic Methodrail doctrine into the project.
- Do not create a skill for every command.
- Do not install multiple integrations “for compatibility.”
- Distinguish documentation/control drift from actual product regression.
- Write generated `AGENTS.md`, `CLAUDE.md`, Cursor rules, project verification skills, and `.methodrail/PROJECT.md` as indexes and pointers. Do not copy canonical docs into them.

## Progressive disclosure

Load only the reference needed for the current phase:

- [repository interview](references/repository-interview.md)
- [harness location](references/harness-location.md)
- [information ROI](references/information-roi.md)
- [PROJECT.md template](references/project-template.md)
- [optional artifacts](references/optional-artifacts.md)
- [control investigation](references/control-investigation.md)
- [control maintenance](references/control-maintenance.md)
- [merge semantics](references/merge-semantics.md)
- [integrations](references/integrations.md)
- [completion checklist](references/completion-checklist.md)

## Neighbors

```text
Runnable surface              → create-verification-skill
Agent-facing prose            → writing-for-agents
Later harness upkeep          → maintain-verification-skill
```

Do not copy global Methodrail operators into the project.

## Completion

Initialization or refresh is complete when harness location is resolved, generated guidance reflects observed repository facts, existing instructions remain intact, control procedures were investigated when applicable, verification is discoverable in the supported location for that placement, one supported integration exposes Methodrail without tracked changes when external storage was chosen, binding validation passes, and another unchanged run would be a no-op.
