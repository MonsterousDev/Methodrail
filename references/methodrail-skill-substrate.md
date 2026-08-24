# Methodrail skill substrate

Every Methodrail skill inherits this operating environment. Origin remains provenance. The family is the runtime contract.

This is methodology, not a custom engine. Do not implement a skill graph, scheduler, or context packet runtime.

Share infrastructure aggressively. Compose procedures conservatively. Complexity must earn its keep.

```text
                     uncertainty reduced
                   + meaningful risk reduced
                   + reusable value created

expected value = --------------------------------

                 tokens + latency + context load
                 + human attention + maintenance
```

Do not calculate this numerically. Use it as a decision model.

## Project context

Before rediscovering project-specific information, look for `.methodrail/PROJECT.md`. Treat it as an index. Follow pointers only when relevant. Do not load every file under `.methodrail/`.

Canonical project sources remain authoritative: source, package manifests, `AGENTS.md`, `CLAUDE.md`, ADRs, architecture docs, runbooks, CI, tests, configuration. Methodrail knowledge supplements those sources. It does not replace them.

Skip the lookup when the project has no harness.

## Knowledge reuse

```text
check relevant durable knowledge
↓
consider freshness
↓
reuse if trustworthy
↓
selectively refresh if stale
↓
explore only what is missing
```

Do not blindly trust old code-derived summaries. Do not blindly rediscover known information either.

## Freshness

When durable knowledge depends on source or runtime behavior, consider recorded revision, relevant paths, changes since observation, and current runtime/configuration. Reuse when still applicable. Refresh only the affected slice when possible.

See [freshness](knowledge/freshness.md).

## Evidence

Use one vocabulary:

```text
inferred
test-confirmed
observed
traced
historically-confirmed
unknown
```

Do not describe source inference as runtime observation. Do not describe plausible historical motivation as historically confirmed. Do not call a test passed unless it was actually run successfully in the relevant environment.

Unknown is a valid result. Do not manufacture certainty to complete a skill procedure.

See [evidence](evidence.md) and [observation record](protocols/observation-record.md).

## Deterministic facts

Prefer deterministic tools for deterministic questions.

```text
Did this file change?              → git
Does this compile?                 → compiler
What package version is installed? → manifest/package manager
Which symbols reference X?         → source/static tools
Did the tests pass?                → test runner
```

Do not spend an expensive reasoning or multi-agent step answering something a deterministic tool can answer exactly.

## Uncertainty resolution

Classify before escalating. Use the cheapest reliable method.

```text
current implementation             → source / how
actual runtime behavior            → observe
historical motivation              → why
external/reference fact            → research
empirical technical uncertainty    → prototype
domain ambiguity                   → domain-modeling
large unresolved decision network  → wayfinder
consequential architecture choice  → architect
product/taste/preference decision  → human
deterministic fact                 → deterministic tool
```

See [decision frontier](decision-frontier.md).

## Rigor and verification

Match investigation, design, review, and verification effort to uncertainty, risk, scope, reversibility, cost of failure, and available evidence. See [rigor](rigor.md).

When a project-local verification skill exists, reuse it. Do not rediscover launch/drive/reset behavior unnecessarily. Generic Methodrail verification combines with project-specific verification knowledge.

No claim of fixed, working, passing, or complete without fresh evidence appropriate to that claim. The evidence method should be proportional.

## Context economics

More context is not automatically better context. Load the active skill. Load detailed references only when the current branch needs them. See [context economics](context-economics.md).

## Structural learning

When a skill discovers something valuable, consider whether it should become nothing, ephemeral task context, durable project knowledge, a decision record, a project skill, a deterministic helper, a test, a lint/static check, a type/API constraint, a CI gate, or architecture.

Do not automatically persist everything. Promote only when information ROI is positive. See [knowledge lifecycle](knowledge/lifecycle.md) and [structural enforcement](structural-enforcement.md).

## Composition

Skills communicate through artifacts, not process nesting. Invoke or suggest another skill only when that procedure materially reduces uncertainty, reduces risk, provides missing evidence, or creates reusable value.

One workflow owner at a time. Leaf skills are bounded operators. They must not restart another full lifecycle.

See [skill composition](skill-composition.md).

## Host degradation

Use the strongest available native mechanism. Degrade gracefully. Do not pretend an unavailable capability exists. See [host capabilities](host-capabilities.md).
