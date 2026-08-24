---
name: blast-radius
description: Inspect callers, contracts, data, tests, and runtime assumptions. Use before or after cross-boundary changes.
---

# Blast radius

## Problem

A 'local' change breaks a consumer, a schema, or a deploy assumption nobody traced.

## Observed failure

The agent edits a function and ignores callers, persisted data, or public contracts.

## When to activate

Activate for cross-boundary work, public APIs, schemas, migrations, or when asked what a change could affect.

## When not to activate

Do not activate for purely local mechanical edits with no shared contract.

## Required context

The proposed or completed diff, public surfaces, and test map.

## Method

Inspect:
- callers
- downstream consumers
- persisted data
- schemas/contracts
- APIs
- tests
- integration boundaries
- deployment/runtime assumptions
- feature dependencies

Use static and behavioral evidence where appropriate.

## Permitted evidence

Call graphs, tests, schema diffs, docs of contracts, runtime if behavior is in question.

## Side effects

Read-only unless combined with observe.

## Completion

Likely impacts and unknowns are listed. Silent 'nothing else is affected' is forbidden without evidence.

## Artifacts

An impact note.

## What survives

Non-obvious consumers and contract risks.

## Evaluation

Positive: 'what could this affect?'. Negative: comment-only change.
