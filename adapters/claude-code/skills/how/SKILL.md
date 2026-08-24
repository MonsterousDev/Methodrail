---
name: how
description: "Map current implementation: entrypoints, control flow, data flow, and boundaries. Use before changing nontrivial existing code or when asked how something works."
---

> Harness: claude-code. Authoritative metadata is Methodrail `skill.yaml`. This file is a projection.

# How

## Problem

Agents propose changes, architecture, or 'obvious' fixes without knowing how the live implementation actually behaves. Filename folklore replaces traced flow.

## Observed failure

The agent summarizes the repository from layout, infers architecture from folder names, and then edits the wrong module. Or it dumps a giant repo tour nobody asked for.

## When to activate

Activate when the question is about current structure or behavior of existing code, or before a nontrivial change to an existing subsystem. Typical prompts: 'How does X work?', 'Where is Y handled?', 'What happens when Z is submitted?'

## When not to activate

Do not activate for mechanical edits, greenfield files with no existing behavior, or questions that are purely historical (use why), purely runtime (use observe), or purely empirical (use prototype).

## Required context

The user question, repository revision, and any already-validated project knowledge that is still fresh. Do not load unrelated subsystems.

## Method

1. Start from the user's question, not from repository layout.
2. Identify relevant entrypoints (HTTP handlers, CLI commands, jobs, exported APIs, UI actions).
3. Follow callers and callees. Trace control flow and data flow.
4. Inspect types and important state transitions. Distinguish authoritative state from derived or cached state.
5. Name boundaries and side effects (IO, network, persistence, auth).
6. For complex questions, partition exploration into non-overlapping slices and synthesize.
7. Cite evidence. Record unknowns explicitly.

Do not infer architecture from filenames alone.
Do not produce giant repository summaries unless specifically requested.

Preferred output:
- question
- short answer
- entrypoints
- flow
- state
- boundaries
- side effects
- important invariants
- unknowns
- evidence

## Permitted evidence

Source code, types, tests as characterization of intended structure, generated schemas, configuration. Runtime evidence is out of scope unless you escalate to observe.

## Side effects

Filesystem read, git read. No runtime mutation. No network writes. No production code changes.

## Completion

The question has a direct answer or an explicit unresolved status. Important claims are linked to evidence. Inference is labeled. Unknowns are listed.

## Artifacts

A result packet plus, when useful, a subsystem model suitable as a knowledge candidate — not a dump of the tree.

## What survives

Entrypoints, traced flows, invariants, and unknowns. Discard file lists, dead ends, and speculative architecture.

## Evaluation

Routing: how-questions activate this skill. Negative: mechanical rename does not. Behavioral: answers cite entrypoints and evidence. Pressure: refuses to invent architecture from folder names.
