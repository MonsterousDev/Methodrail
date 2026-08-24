# Optional artifacts

Create optional files only when their expected reuse exceeds their maintenance cost. See [information ROI](information-roi.md) and [project harness](../../../references/project-harness.md).

Skeletons live in `templates/project/`. Fill them from repository evidence; omit empty sections and unneeded files.

## Knowledge

`.methodrail/PROJECT.md` remains a concise index. It may point to:

```text
knowledge/domain.md
knowledge/architecture.md
knowledge/behavior.md
knowledge/operations.md
knowledge/decisions/
```

Create those only when useful. Prefer a single focused note over a tree of stubs.

Cite source paths or decisions, record a relevant revision when the claim is code-derived, and label uncertain claims. See [knowledge lifecycle](../../../references/knowledge/lifecycle.md).

Do not mirror the README, issue tracker, or source tree.

## Project control guidance

Use `.methodrail/control/CONTROL.md` when starting, checking readiness, exercising, inspecting, capturing evidence from, resetting, or stopping the project requires non-obvious coordination. See [control investigation](control-investigation.md).

## Project-local skills

`methodrail-init` may create project-local skills such as:

```text
verify-project
run-integration-environment
inspect-database
release-project
migrate-database
```

only when:

- the procedure is nontrivial;
- repeated use is likely;
- mistakes are expensive;
- project-specific knowledge is required.

Do not create a skill for every command.

Place a new skill in the repository's established native skill location (`.agents/skills/`, `.cursor/skills/`, or `.claude/skills/`). Preserve an existing skill with the same name unless the user approves a merge.

## verify-project

Create `.agents/skills/verify-project/SKILL.md` (or the established native skill location) only when project verification requires a reusable decision tree that agents cannot infer cheaply.

Required frontmatter:

```yaml
---
name: verify-project
description: Verify changes in this project using its established checks. Use before claiming project changes complete.
---
```

The body should map change types to the smallest relevant existing checks, then describe broader checks for cross-boundary changes. Keep commands sourced from the repository.
