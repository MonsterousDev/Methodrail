---
name: investigate
description: Investigate a codebase question with bounded, evidence-backed exploration. Run only when explicitly requested.
disable-model-invocation: true
---

# Investigate

Answer the question without changing product code.

## Workflow

1. Restate the question and define what evidence would answer it.
2. Inspect existing project guidance and narrow the relevant scope.
3. Select only the needed leaf skill:
   - `how` for current implementation and flow;
   - `observe` for actual runtime behavior;
   - `why` for historical intent;
   - `domain-modeling` for ambiguous concepts;
   - `prototype` for an empirical uncertainty;
   - `blast-radius` for impact.
4. Gather primary evidence. Separate observed facts, source inference, historical evidence, and unknowns.
5. Stop when the question is answered at the requested confidence; do not produce an unrelated repository tour.
6. Report the answer first, followed by evidence, limits, and any useful next step.

## Constraints

- Read-only unless the user explicitly authorizes a disposable prototype.
- Ask only for information unavailable from the repository or environment.
- Do not turn an investigation into implementation.

## Completion

The original question has a direct evidence-backed answer, or the blocker and remaining uncertainty are explicit.
