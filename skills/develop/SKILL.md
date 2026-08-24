---
name: develop
description: Implement a requested feature or refactor from repository evidence through focused verification. Run only when explicitly requested.
disable-model-invocation: true
---

# Develop

Deliver the requested change with the smallest justified scope.

## Workflow

1. Read project guidance, the request, relevant code, tests, and current git state.
2. Establish acceptance criteria and constraints. Ask only when a missing choice materially changes behavior or compatibility.
3. Trace the current implementation with `how`. Add `domain-modeling`, `architect`, `prototype`, or `blast-radius` only when the change warrants them.
4. Choose a verification strategy before editing. Prefer a regression or behavior test for behavior-changing code.
5. Implement in focused increments, following established project patterns. Avoid drive-by cleanup.
6. Inspect the resulting diff for accidental scope, compatibility risks, generated files, and secrets.
7. Use `verify-change` to run fresh checks matched to the claims. Use the `review` entry skill only when the user requests a separate review.
8. Summarize changed behavior, files, verification evidence, and any residual risk.

## Constraints

- Preserve unrelated user changes.
- Do not broaden a local request into an architectural rewrite.
- Do not claim completion from code inspection alone.
- Do not commit, push, deploy, or mutate production unless explicitly requested.

## Completion

Acceptance criteria are met, the diff is scoped, and each completion claim has fresh relevant evidence or a clearly reported verification gap.
