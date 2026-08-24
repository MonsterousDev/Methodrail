---
name: prototype
description: Run a minimal experiment to accept or reject a hypothesis. Prototypes are not production implementations and must not land silently.
---

> Harness: generic. Authoritative metadata is Methodrail `skill.yaml`. This file is a projection.

# Prototype

## Problem

Agents debate feasibility in prose, then either overbuild or ship a guess.

## Observed failure

A 'prototype' that becomes production, or a conclusion with no executable experiment.

## When to activate

Activate for 'would X work?', performance questions, API shape trials, or any empirical uncertainty cheaper to test than to argue.

## When not to activate

Do not activate for questions answerable from source, git, or an existing test. Do not prototype trivial local edits. Do not auto-activate; this is expensive.

## Required context

The empirical question, constraints, and a sandbox where leftover code will not ship.

## Method

Every prototype defines:
- question
- hypothesis
- minimal experiment
- success/failure observation
- result
- verdict
- limitations
- evidence location

Prototype conclusions may become durable knowledge.
Prototype implementation itself must not silently become production code.

## Permitted evidence

Benchmark output, experiment logs, failing/passing probes, traces.

## Side effects

May create throwaway files and run local processes. Must isolate from production paths.

## Completion

A verdict against the hypothesis with limitations, or an explicit blockage.

## Artifacts

Experiment notes and result artifacts. Not a PR of the prototype unless explicitly requested.

## What survives

The verdict and limitations. Discard the scaffolding unless promoted deliberately.

## Evaluation

Positive: 'would an in-memory queue survive 10k/s?'. Negative: mechanical rename. Pressure: do not ship the prototype.
