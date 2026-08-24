---
name: debug
description: Diagnose and fix a reproducible failure using evidence, explicit hypotheses, and focused verification. Run only when explicitly requested.
disable-model-invocation: true
---

# Debug

Find the mechanism before changing code. This workflow orchestrates; `diagnosing-bugs` owns the diagnosis loop.

```text
symptom
↓
diagnosing-bugs
  │
  ├── ordinary bug → tdd / verify-change
  ├── live runtime mystery → observe / runtime-forensics
  └── captured trace/profile → trace-forensics
↓
performance / hillclimb when metric-driven
↓
blast-radius where warranted
↓
verify-change
```

Do not allow symptom → guess → broad patch. Do not repeat the full diagnosis procedure here.

## Workflow

1. Capture the symptom, expected behavior, environment, revision, and available reproduction.
2. Read `.methodrail/PROJECT.md` and [control guidance](../../references/project-harness.md) when present. Prefer documented start/doctor/drive commands over asking how the project runs.
3. Invoke `diagnosing-bugs`: build a red-capable loop, minimise, hypothesise, instrument, then fix.
4. Escalate when the loop is not enough: `observe` / `runtime-forensics` for live mechanism, `trace-forensics` for an existing capture, `performance` / `hillclimb` when the work is metric-driven.
5. Name the root cause with evidence. If the root cause remains unknown, do not disguise a guess as a fix.
6. Apply `tdd` for the regression at a correct seam, then `verify-change`.
7. Use `blast-radius` for shared contracts or cross-boundary changes.
8. Report reproduction, root cause, change, evidence, and residual uncertainty.

## Constraints

- Do not use shotgun edits or change multiple variables without a reason.
- Keep local runtime actions isolated; do not mutate production.
- Preserve unrelated changes and avoid opportunistic refactors.

## Completion

The failure is reproduced or bounded, its cause is supported by evidence, and the fix is verified against the reproduction plus proportionate regression checks.
