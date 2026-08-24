---
name: create-control-adapter
description: Interview the repository, wrap existing commands, and generate .ai/control with start, doctor, drive, inspect, capture, reset, stop.
---

> Harness: claude-code. Authoritative metadata is Methodrail `skill.yaml`. This file is a projection.

# Create control adapter

## Problem

Generic skills cannot start, drive, or reset the app without inventing commands each session.

## Observed failure

Asking the human how to start when package.json already says. Or adding Docker when `npm test` was enough.

## When to activate

Activate when a project has no control adapter, or when observation/verification cannot find a launch path.

## When not to activate

Do not activate on every task. Do not replace a working adapter. Prefer maintain-control-adapter for drift.

## Required context

Repo scripts, README, compose files, test commands, app kind (web, CLI, API, library, desktop, service, monorepo).

## Method

Target abstraction:
- control.start()
- control.doctor()
- control.drive()
- control.inspect()
- control.capture()
- control.reset()
- control.stop()

Generated structure:
.ai/control/CONTROL.md, start, doctor, reset, stop, scenarios/

Interview the repository before asking the human.
Prefer existing project commands over introducing new infrastructure.

## Permitted evidence

package.json scripts, Makefiles, README, Procfiles, existing CI.

## Side effects

Writes project-local .ai/control. Must not overwrite destructively without confirmation.

## Completion

CONTROL.md maps each verb to a real command; doctor has a readiness check; scenarios are listed or explicitly absent.

## Artifacts

The control adapter files.

## What survives

The adapter. Discard the interview notes except operational knowledge that is expensive to rediscover.

## Evaluation

Pressure: 'ask me how the app starts' must inspect the environment first.
