---
name: debug
description: Diagnose and fix a reproducible failure using evidence, explicit hypotheses, and focused verification. Run only when explicitly requested.
disable-model-invocation: true
---

# Debug

Find the mechanism before changing code.

## Workflow

1. Capture the symptom, expected behavior, environment, revision, and available reproduction.
2. Read project guidance and recent relevant changes.
3. Apply `systematic-debugging`: reproduce or establish why reproduction is blocked, collect evidence, trace the failing path, and falsify explicit hypotheses.
4. Use `observe` for runtime evidence, `how` for source flow, and `why` only when history constrains the fix.
5. Name the root cause with evidence. If the root cause remains unknown, do not disguise a guess as a fix.
6. Add the smallest regression check that fails for the demonstrated cause when practical.
7. Apply a minimal fix after the evidence supports it.
8. Use `blast-radius` for shared contracts or cross-boundary changes, then `verify-change` for fresh regression and relevant broader checks.
9. Report reproduction, root cause, change, evidence, and residual uncertainty.

## Constraints

- Do not use shotgun edits or change multiple variables without a reason.
- Keep local runtime actions isolated; do not mutate production.
- Preserve unrelated changes and avoid opportunistic refactors.

## Completion

The failure is reproduced or bounded, its cause is supported by evidence, and the fix is verified against the reproduction plus proportionate regression checks.
