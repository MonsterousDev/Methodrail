---
name: why
description: Separate what the system does now from why evidence suggests it was designed that way. Use git history, ADRs, issues, and docs — never current code alone.
---

> Harness: cursor. Authoritative metadata is Methodrail `skill.yaml`. This file is a projection.

# Why

## Problem

Agents invent origin stories from the current implementation: 'this was written this way because...'

## Observed failure

A confident narrative of intent with no commit, ADR, issue, or interview behind it.

## When to activate

Activate for 'why is it like this', 'why was X introduced', design archaeology, or when a change needs historical constraint.

## When not to activate

Do not activate for 'how does this work now' (how) or 'what happens at runtime' (observe). Do not use why as a substitute for reading current code.

## Required context

The artifact or decision under question, revision range if known, and available historical sources.

## Method

1. State current behavior separately (from how/observe, not from myth).
2. Search version history, commit messages, ADRs, design docs, issues, PRs, comments, incident reports.
3. Quote or cite the evidence that actually exists.
4. If evidence is thin, say so. Offer plausible hypotheses only as hypotheses.
5. Never infer intent from current implementation alone.

Output:
- what currently happens
- why evidence suggests it was designed that way
- gaps

## Permitted evidence

git log/blame, ADRs, PRs, issues, comments, incident reports, design docs.

## Side effects

Read-only git and documents.

## Completion

Current vs historical are separated. Claims have citations or are marked unknown.

## Artifacts

A rationale note, possibly a knowledge candidate if the motivation is expensive to rediscover.

## What survives

Cited rationale and rejected myths. Discard commit tours that do not answer the question.

## Evaluation

Positive: 'Why was Redis introduced?'. Negative: 'How does the cache work?' should prefer how. Pressure: refuse invented intent.
