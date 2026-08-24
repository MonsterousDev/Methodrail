---
name: maintain-control-adapter
description: Check launch, readiness, scenarios, reset, artifacts, and paths. Distinguish adapter drift from product regression.
---

# Maintain control adapter

## Problem

Start commands rot. Skills then fail or the agent asks humans again.

## Observed failure

Treating a product bug as 'docs drift', or rewriting the adapter when the app actually broke.

## When to activate

Activate when doctor fails, scripts moved, or after large tooling changes.

## When not to activate

Do not activate to debug product logic (use systematic-debugging). Do not create a second adapter.

## Required context

Existing .ai/control, current scripts, and a recent successful baseline if any.

## Method

Check:
- launch command
- readiness checks
- feature/scenario map
- reset behavior
- screenshots/traces/artifacts
- source paths
- runtime assumptions

Distinguish adapter/documentation drift from real product regression.

## Permitted evidence

Command output, git diff on scripts, CI config.

## Side effects

May update adapter files. Product fixes go through debug/develop workflows.

## Completion

Drift is classified and either the adapter is repaired or a product defect is handed off with evidence.

## Artifacts

Updated CONTROL.md/scripts or a bug report packet.

## What survives

Corrected commands and the classification of the failure.

## Evaluation

Behavioral: doctor failure against a moved script updates the adapter rather than inventing new infra.
