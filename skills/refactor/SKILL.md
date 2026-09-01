---
name: refactor
description: Improve internal structure while preserving relevant observable behavior. Run only when explicitly requested. Do not use for feature work or mechanical edits.
disable-model-invocation: true
---

# Refactor

Improve internal structure while preserving relevant observable behavior. This is not feature development. No speculative refactor ceremony.

```text
friction
↓
understand current structure
↓
behavior baseline
↓
codebase-design
↓
improve architecture only when value exists
↓
incremental changes
↓
verification
↓
blast-radius/review proportional to risk
```

## Workflow

1. Name the friction. Prefer refactors that support current work, reduce repeated mistakes, improve high-churn areas, clarify ownership, remove recurring agent/human confusion, or improve testability.
2. Read `.methodrail/PROJECT.md` if present. If a knowledge pointer is relevant, follow [knowledge reuse](../../references/knowledge/reuse.md). Use `how` to understand current structure and `codebase-design` for depth/seam vocabulary.
3. Establish a behavioral baseline with existing tests or `observe` when behavior is not already characterized.
4. Stop if the code is quiet, unused, or unrelated to current work. Use `improve-codebase-architecture` only when the user wants a structured hunt across hot spots. Behavior-preserving work stays in this workflow; do not implement survey candidates from the hunt itself.
5. Add characterization coverage when existing checks would not catch an accidental behavior change.
6. Change structure in small increments. Preserve public contracts unless the request explicitly includes a contract change.
7. Re-run the baseline after each increment. Use `verify-change` before claiming success.
8. Use `blast-radius` for shared contracts or cross-boundary moves, then `code-review` when rigor or scope justifies it.

## Constraints

- Do not mix feature work into a refactor unless the user explicitly asked for both.
- Do not use `architect` or `prototype` for local mechanical restructuring.
- Do not claim behavior preservation from inspection alone.
- Consult [rigor](../../references/rigor.md) before escalating ceremony.

## Done when

The friction is reduced, relevant observable behavior is preserved with fresh evidence, and any intentional behavior change is explicit.

## Neighbors

```text
Usually follows:              develop or a named structural problem
Often produces:               structural change; verify-change
Escalate to:                  how, codebase-design, blast-radius, code-review
Avoid combining automatically with: architect, prototype, develop-as-feature
```
