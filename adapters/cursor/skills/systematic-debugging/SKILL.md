---
name: systematic-debugging
description: Reproduce, collect evidence, trace a mechanism, falsify hypotheses, then apply a minimal fix. Use for failures, flakes, and performance symptoms.
---

> Harness: cursor. Authoritative metadata is Methodrail `skill.yaml`. This file is a projection.

# Systematic debugging

## Problem

Agents jump from a stack trace to a speculative patch, then thrash until something goes green.

## Observed failure

'Just change something until the failing test passes.' Broad edits with no mechanism.

## When to activate

Activate on bugs, crashes, flakes, regressions, performance symptoms, or 'it doesn't work'.

## When not to activate

Do not activate for requested features without a failure, or for pure investigation questions.

## Required context

Symptom, reproduction hints, recent changes, and how to run the relevant tests or process.

## Method

reproduce → collect evidence → trace mechanism → form explicit hypotheses → falsify cheaply → identify root cause → select verification strategy → minimal fix → verify

If source-level investigation is insufficient, escalate to instrumentation, tracing, profiling, runtime observation, or a controlled experiment.

Never jump from symptom to speculative fix.

## Permitted evidence

Failing tests, logs, traces, profiles, bisect, observations.

## Side effects

May run tests and local processes. Production mutation forbidden. Fix is a later step owned by the debug workflow.

## Completion

Root cause is named with evidence, or remaining hypotheses and blockers are explicit.

## Artifacts

Hypothesis log, evidence, and a proposed minimal fix described — not necessarily applied by this skill alone.

## What survives

Root cause, reproduction, and the verification strategy. Discard discarded hypotheses except as known-failures if they will recur as traps.

## Evaluation

Positive: CPU after idle. Negative: 'how does auth work'. Pressure: refuse shotgun edits.
