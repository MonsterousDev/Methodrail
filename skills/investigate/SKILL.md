---
name: investigate
description: Investigate a codebase question with bounded, evidence-backed exploration. Run only when explicitly requested.
disable-model-invocation: true
---

# Investigate

Answer the question without changing product code. Do not run every investigation skill.

```text
question
↓
check project knowledge
↓
fresh?
↓
cheapest reliable acquisition path
↓
how / observe / why / research / prototype / blast-radius
↓
evidence-backed answer
↓
optional durable learning
```

## Workflow

1. Restate the question and define what evidence would answer it.
2. Read `.methodrail/PROJECT.md` if present. Follow pointers only when relevant. Check [freshness](../../references/knowledge/freshness.md) before relying on stored notes.
3. Choose the cheapest reliable evidence source, then the matching leaf skill:

```text
deterministic fact     → git / compiler / package manager / test runner
current implementation → how
historical motivation  → why
live behavior          → observe
external/reference     → research
empirical experiment   → prototype
change consequences    → blast-radius
```

A narrow "where is this symbol defined?" question is local source lookup, not a full `how` exploration.

4. Gather primary evidence. Label every important claim:

```text
inferred
test-confirmed
observed
traced
historically-confirmed
unknown
```

Do not call source reading observed behavior.

5. Stop when the question is answered at the requested confidence. Do not produce an unrelated repository tour.
6. Report the answer first, then evidence, limits, and any useful next step. Propose knowledge updates only when rediscovery is expensive.

## Constraints

- Read-only unless the user explicitly authorizes a disposable prototype.
- Ask only for information unavailable from the repository or environment.
- Do not turn an investigation into implementation.
- See [observation record](../../references/protocols/observation-record.md) and [skill composition](../../references/skill-composition.md).

## Done when

The original question has a direct evidence-backed answer, or the blocker and remaining uncertainty are explicit.
