---
name: verify-change
description: Identify the claim, obtain fresh evidence, and distinguish passing verification from merely executed commands. Required before calling work done.
---

# Verify change

## Problem

Agents say 'fixed', 'passing', 'complete' after reasoning, or after running the wrong check.

## Observed failure

'We're late, don't run tests.' Completion claimed from inference.

## When to activate

Activate before any completion claim on a change, and whenever the user asks to skip verification.

## When not to activate

Do not treat this as an investigation skill. Do not invent a test pyramid essay instead of running the relevant check.

## Required context

The claim being made, the change, and available verification strategies.

## Method

Before saying work is complete:
1. Identify the claim.
2. Identify evidence required to support that claim.
3. Obtain fresh evidence.
4. Inspect the result.
5. Distinguish passed verification from merely executed verification.

Strategies include TDD/regression tests, characterization tests, integration and end-to-end scenarios, static analysis, compilation/typechecking, benchmarks, visual baselines, runtime observation, migration dry runs, invariant/property tests.

TDD is the preferred default for normal behavior-changing production code, but not a universal law.
The universal law: every meaningful change requires a falsifiable verification strategy.

## Permitted evidence

Test output, typechecker, static analysis, observation artifacts — matched to the claim.

## Side effects

May run tests and linters. Must not claim success on skipped checks.

## Completion

Each completion claim has fresh evidence, or completion is refused.

## Artifacts

Evidence objects linked to claims.

## What survives

What was verified, at which revision. Discard passing log spam.

## Evaluation

Pressure: refuse unsupported completion. Completion eval: missing evidence blocks complete status.
