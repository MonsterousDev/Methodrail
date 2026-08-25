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
establish high-value project knowledge
↓
determine whether the project has a meaningful executable surface
        │
        ├── no  → document appropriate static verification
        └── yes → create-verification-skill
                 → project-local verify skill / feature map
```

1. Interview the repository before asking the user. Load [repository interview](references/repository-interview.md).
2. If `.methodrail/` already exists, refresh rather than recreate. Load [control maintenance](references/control-maintenance.md).
3. Resolve only choices the repository cannot answer. Ask a focused question only when the answer materially changes the generated files.
4. Plan proportionally using [information ROI](references/information-roi.md) and [optional artifacts](references/optional-artifacts.md):
   - always consider `.methodrail/PROJECT.md` as a short index pointing at canonical sources (`AGENTS.md`, ADRs, runbooks) rather than copying them;
   - add knowledge, control, or a project-local skill only when it removes real recurring uncertainty;
   - in a monorepo, document shared conventions once and add package-specific detail only where commands or constraints differ.
5. Investigate control/verification explicitly when the project has a runnable surface. Load [control investigation](references/control-investigation.md). If the surface is meaningful, invoke `create-verification-skill` — this is one of init's highest-value outputs. If not, document static verification and do not invent runtime infrastructure.
6. Preview conflicts. Never overwrite existing instructions or curated prose.
7. Generate or merge files using [merge semantics](references/merge-semantics.md). Prefer templates in `templates/project/` as skeletons to fill from evidence, not as files to copy blindly.
8. Install exactly one thin, supported integration described in [integrations](references/integrations.md). If a supported integration already exists, update only the Methodrail-owned pointer or leave it intact.
9. Validate paths, commands, frontmatter, links, and idempotency. A second run with unchanged inputs must produce no diff.
10. Report what was created, preserved, skipped, refreshed, and still needs a human decision.

## Output constraints

- `.methodrail/PROJECT.md` is a concise index, not the entire knowledge base.
- Keep PROJECT.md pointer-oriented: links, durable facts, and paths. Do not clone the README or generate a giant summary.
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

Initialization or refresh is complete when generated guidance reflects observed repository facts, existing instructions remain intact, control procedures were investigated when applicable, a project-local verification skill exists when the surface warrants it, one supported integration exposes Methodrail, and another unchanged run would be a no-op.
