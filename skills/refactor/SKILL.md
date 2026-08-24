---
name: refactor
description: Improve internal structure while preserving relevant observable behavior. Run only when explicitly requested. Do not use for feature work or mechanical edits.
disable-model-invocation: true
---

# Refactor

Improve internal structure while preserving relevant observable behavior. This is not feature development.

## Workflow

```text
identify friction
↓
understand current structure
↓
establish behavioral baseline
↓
decide whether refactor value justifies cost
↓
characterization/verification
↓
incremental structural change
↓
continuous verification
↓
blast-radius
↓
review
```

1. Name the friction. Prefer refactors that support current work, reduce repeated mistakes, improve high-churn areas, clarify ownership, remove recurring agent/human confusion, or improve testability and observability.
2. Read `.methodrail/PROJECT.md` if present. Use `how` to understand current structure and ownership.
3. Establish a behavioral baseline with existing tests or `observe` when behavior is not already characterized.
4. Stop if the code is quiet, unused, or unrelated to current work. Avoid speculative cleanup of untouched code merely because it could be nicer.
5. Add characterization coverage when the existing checks would not catch an accidental behavior change.
6. Change structure in small increments. Preserve public contracts unless the request explicitly includes a contract change.
7. Re-run the baseline after each increment. Use `verify-change` before claiming success.
8. Use `blast-radius` for shared contracts or cross-boundary moves, then `review` when rigor or scope justifies it.

## Constraints

- Do not mix feature work into a refactor unless the user explicitly asked for both.
- Do not use `architect` or `prototype` for local mechanical restructuring.
- Do not claim behavior preservation from inspection alone.
- Consult [rigor](../../references/rigor.md) before escalating ceremony.

## Completion

The friction is reduced, relevant observable behavior is preserved with fresh evidence, and any intentional behavior change is explicit.
