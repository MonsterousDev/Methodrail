---
name: develop
description: Implement a requested feature from repository evidence through focused verification. Run only when explicitly requested. Do not use for behavior-preserving structural work; use refactor for that.
disable-model-invocation: true
---

# Develop

Deliver the requested change with the smallest justified scope. This workflow orchestrates leaf skills; it does not duplicate them.

```text
task
↓
understand current system          → how
↓
grill-with-docs                    when intent is unclear
↓
domain-modeling                    when language/model is unclear
↓
wayfinder                          when the work remains foggy/huge
↓
architect                          when an architecture choice exists
↓
prototype                          when empirical uncertainty exists
↓
tdd                                for appropriate implementation
↓
code-review
↓
verify-change
↓
blast-radius                       proportional to risk
```

Matt's `implement` skill is not a public Methodrail skill. `/develop` owns the lifecycle. Implementation disciplines (seams, vertical slices, review, verification) are reused via `tdd`, `code-review`, and `verify-change`.

## Workflow

1. Read `.methodrail/PROJECT.md` if present, the request, relevant code, tests, and current git state. Check knowledge freshness before relying on stored notes.
2. Classify uncertainty with the [decision frontier](../../references/decision-frontier.md). Resolve only currently actionable questions. Leave fog questions unanswered — use `wayfinder` rather than a premature full plan when the work is too large.
3. Define observable success and a verification strategy before editing. Ask only when a missing choice materially changes behavior or compatibility.
4. Trace current implementation with `how`. Add `grill-with-docs`, `domain-modeling`, `architect`, `prototype`, or `blast-radius` only when [rigor](../../references/rigor.md) justifies them. `to-spec` / `to-tickets` may crystallize resolved intent; they do not replace this workflow.
5. Implement in focused increments with `tdd` at agreed seams. Follow established project patterns. Avoid drive-by cleanup. Use `refactor` when the request is structural rather than a feature.
6. Inspect the resulting diff for accidental scope, compatibility risks, generated files, and secrets.
7. Use `observe` when the claim is behavioral, then `verify-change` for fresh evidence. Use `code-review` on the diff. Use `/review` only when the user requests a separate review or rigor requires it.
8. Summarize changed behavior, files, verification evidence, residual risk, and any durable knowledge worth proposing.

## Constraints

- Preserve unrelated user changes.
- Do not broaden a local request into an architectural rewrite.
- Do not claim completion from code inspection alone.
- Do not commit, push, deploy, or mutate production unless explicitly requested.
- Do not auto-invoke `wayfinder`, `architect`, `arena`, `swarm`, or `interrogate` for routine work.
- Prefer [isolate or handoff](../../references/context-management.md) over stuffing an oversized conversation.

## Completion

Acceptance criteria are met, the diff is scoped, and each completion claim has fresh relevant evidence or a clearly reported verification gap.
