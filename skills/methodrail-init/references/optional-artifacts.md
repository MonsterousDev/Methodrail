# Optional artifacts

Create optional files only when their expected reuse exceeds their maintenance cost.

## Knowledge

Use `.methodrail/knowledge/` for stable facts that are expensive to rediscover: domain vocabulary, architectural boundaries, or verified operational constraints. Prefer a single focused note. Cite source paths or decisions and label uncertain claims.

Do not mirror the README, issue tracker, or source tree.

## Project control guidance

Use `.methodrail/control/CONTROL.md` only when starting, checking readiness, exercising, inspecting, capturing evidence from, resetting, or stopping the project requires non-obvious coordination. Document only capabilities the repository actually provides. Do not create wrappers merely to rename package scripts.

Where relevant, answer:

- How is the system started and stopped?
- What proves readiness?
- How is a representative path exercised?
- How can state and evidence be inspected?
- How is an isolated environment reset?

## Project-local verify-project skill

Create `.agents/skills/verify-project/SKILL.md` (or the repository's established native skill location) only when project verification requires a reusable decision tree that agents cannot infer cheaply.

Required frontmatter:

```yaml
---
name: verify-project
description: Verify changes in this project using its established checks. Use before claiming project changes complete.
---
```

The body should map change types to the smallest relevant existing checks, then describe broader checks for cross-boundary changes. Keep commands sourced from the repository. Preserve an existing skill with the same name unless the user approves a merge.
