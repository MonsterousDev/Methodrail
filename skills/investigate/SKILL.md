---
name: investigate
description: Investigate a codebase question with bounded, evidence-backed exploration. Run only when explicitly requested.
disable-model-invocation: true
---

# Investigate

Answer the question without changing product code.

## Workflow

1. Restate the question and define what evidence would answer it.
2. Read `.methodrail/PROJECT.md` if present. Check whether relevant project knowledge is still [fresh](../../references/knowledge/freshness.md) before relying on it.
3. Choose the cheapest reliable evidence source, then the matching leaf skill:

```text
how          = current implementation
why          = historical motivation
observe      = live behavior
research     = external/reference sources
prototype    = empirical experiment
blast-radius = what else a change could affect
```

4. Gather primary evidence. Label every important claim as one of:

```text
Observed
Source-supported
Historically supported
Inferred
Unknown
```

5. Stop when the question is answered at the requested confidence. Do not produce an unrelated repository tour.
6. Report the answer first, then evidence, limits, and any useful next step. Propose knowledge updates when a discovery is expensive to rediscover; do not persist them without evidence.

## Constraints

- Read-only unless the user explicitly authorizes a disposable prototype.
- Ask only for information unavailable from the repository or environment.
- Do not turn an investigation into implementation.
- Use [observation confidence labels](../../references/protocols/observation-record.md) consistently.

## Completion

The original question has a direct evidence-backed answer, or the blocker and remaining uncertainty are explicit.
