---
name: review
description: Review specification fit, correctness, architecture, tests, complexity, and blast radius. Use a prepared ReviewPacket so reviewers do not rediscover deterministic context.
---

> Harness: generic. Authoritative metadata is Methodrail `skill.yaml`. This file is a projection.

# Review

## Problem

Open-ended review loops, or reviewers spending tokens rediscovering the diff and test commands.

## Observed failure

Endless churn on nits, or a 'LGTM' with no evidence.

## When to activate

Activate when asked to review a change, or as a develop/refactor workflow gate at sufficient rigor.

## When not to activate

Do not activate instead of verification. Do not interrogate by default (use interrogate for high-risk independent review).

## Required context

A ReviewPacket: task, spec slice, acceptance, base/head revisions, diff references, implementation summary, verification evidence, known deviations, risk, rubric.

## Method

Axes:
- specification/acceptance compliance
- correctness
- architecture
- maintainability
- tests/evidence
- unnecessary complexity
- regressions/blast radius

Severity:
- critical → must fix
- important → must fix or explicitly adjudicate
- minor → record, does not automatically block

Repeated disagreement escalates to arbitration rather than looping forever.

## Permitted evidence

The packet, the diff, verification evidence. Do not re-run deterministic context assembly if the controller already did.

## Side effects

Read-only regarding product code unless applying agreed fixes under the parent workflow.

## Completion

Findings are classified. Blocking items are explicit. Minors do not block by default.

## Artifacts

Review findings attached to the packet.

## What survives

Adjudicated decisions and blocking issues. Discard style bikesheds.

## Evaluation

Positive: 'review this payment change'. Negative: 'how does auth work'.
