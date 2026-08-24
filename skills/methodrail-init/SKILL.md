---
name: methodrail-init
description: Initialize or refresh Methodrail guidance in a repository after inspecting its code, tooling, and existing AI instructions. Run only when explicitly requested.
disable-model-invocation: true
---

# Methodrail init

Create the smallest useful project-local Methodrail setup. Inspect first, preserve existing guidance, and make repeated runs safe.

## Workflow

1. Interview the repository before asking the user:
   - read top-level docs, manifests, lockfiles, build/test configuration, CI, and representative source;
   - inspect existing agent instructions and skill directories;
   - inspect current `.methodrail/` content and git state;
   - infer project type, languages, package boundaries, and established commands.
2. Resolve only choices the repository cannot answer. Ask a focused question only when the answer materially changes the generated files.
3. Plan proportionally:
   - always consider `.methodrail/PROJECT.md`;
   - add knowledge, project control guidance, or a project-local `verify-project` skill only when they remove real recurring uncertainty;
   - in a monorepo, document shared conventions once and add package-specific detail only where commands or constraints differ.
4. Preview conflicts. Never overwrite existing instructions or curated prose.
5. Generate or merge files using the semantics in [merge semantics](references/merge-semantics.md).
6. Install exactly one thin, supported integration described in [integrations](references/integrations.md). If a supported integration already exists, update only the Methodrail-owned pointer or leave it intact.
7. Validate paths, commands, frontmatter, links, and idempotency. Re-run the merge mentally or with a dry comparison; a second run with unchanged inputs must produce no diff.
8. Report what was created, preserved, skipped, and still needs a human decision.

## Output constraints

- Prefer one concise `.methodrail/PROJECT.md` over a documentation tree.
- Record commands the repository already supports; do not invent infrastructure.
- Preserve existing `AGENTS.md`, `CLAUDE.md`, Cursor rules, copilot instructions, and local skills.
- Do not copy generic Methodrail doctrine into the project.
- Do not create scripts unless a deterministic repeated operation clearly justifies one.
- Do not install multiple integrations “for compatibility.”

## Progressive disclosure

Load only the reference needed for the current phase:

- [repository interview](references/repository-interview.md)
- [PROJECT.md template](references/project-template.md)
- [optional artifacts](references/optional-artifacts.md)
- [merge semantics](references/merge-semantics.md)
- [integrations](references/integrations.md)
- [completion checklist](references/completion-checklist.md)

## Completion

Initialization is complete when generated guidance reflects observed repository facts, existing instructions remain intact, one supported integration exposes Methodrail, and another unchanged run would be a no-op.
