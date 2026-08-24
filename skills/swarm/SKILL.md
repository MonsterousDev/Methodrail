---
name: swarm
description: "Fan out parallel workers over different independent slices and return one report. Use for /swarm, parallel coverage, races, or exploration. Do not use to compete on the same artifact; that is arena."
disable-model-invocation: true
---

# Swarm

Fan out N parallel workers. They may cover separate slices, race the same brief, or mix both. The parent waits, aggregates, and returns one report.

```text
swarm        = partition work
arena        = compete on same work
interrogate  = independent adversarial review
```

## Start

Phases: Frame, Fan out, Aggregate, Report.

## Phase A: Frame

1. State the done predicate and the artifact or report the swarm must return.
2. Choose the shape: partition into slices, race N workers on identical briefs, or mix. For a race, declare `first pass`, `rank all`, or `best-of` before spawning.
3. Set N from the user or derive it from the shape.
4. Pick worker models if the host allows; otherwise use the host default. See [host capabilities](../../references/host-capabilities.md).
5. Give each worker its own writable output when it writes.

## Phase B: Fan out

Spawn all N in one message when parallel subagents exist. Prefer local workers unless the work truly needs an isolated remote checkout. Cloud/remote workers are optional.

Every brief stands alone: goal, scope, exact slice or race arm, how to verify, what to report. Reports use `PASS`, `ISSUES`, or `BLOCKED` with evidence.

If a worker drops out, proceed with N-1 and note it. If the host cannot parallelize, run slices sequentially and say so.

## Phase C: Aggregate

Every required slice needs a result. For a race, apply the selection rule declared up front. Do not paste raw worker dumps. Keep a compact result table, one-line evidenced issues, and explicit gaps.

## Phase D: Report

One consolidated in-chat report: table, issue one-liners, gaps or dropouts, and the race rule when used.
