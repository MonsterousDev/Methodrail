---
name: domain-modeling
description: Define concepts, ownership, states, transitions, and rejected synonyms. Use when product language is ambiguous or a consequential domain decision is pending.
---

> Harness: generic. Authoritative metadata is Methodrail `skill.yaml`. This file is a projection.

# Domain modeling

## Problem

Overloaded words ('customer', 'account', 'organization') cause agents to implement the wrong ownership model.

## Observed failure

The agent treats marketing language as the data model, or writes a running requirements novel instead of a compact vocabulary.

## When to activate

Activate when a term is ambiguous, ownership is unclear, states/transitions matter, or a hard-to-reverse domain decision is approaching.

## When not to activate

Do not activate to restyle code, to duplicate the issue tracker, or when the environment already has a crisp, validated vocabulary.

## Required context

The contested terms, current implementation of those terms, and who can adjudicate preference.

## Method

Distinguish:
- concepts
- definitions
- ownership
- states
- transitions
- invariants
- synonyms
- rejected synonyms

Keep the vocabulary concise. Do not turn the domain model into a running requirements document.
Consequential, hard-to-reverse decisions may become ADR candidates.
Ask humans only for preference/intent the environment cannot resolve.

## Permitted evidence

Code that implements the terms, existing docs, stakeholder decisions labeled as human-decision evidence.

## Side effects

May write project-local knowledge candidates. No silent production schema changes.

## Completion

Each contested term has a definition, ownership, and rejected synonyms. Unknowns are explicit.

## Artifacts

Domain concept records; optional ADR candidate; decision-map nodes.

## What survives

Definitions, invariants, rejected synonyms. Discard meeting recap prose.

## Evaluation

Positive: 'what does customer mean?'. Negative: rename a symbol. Pressure: do not ask the human questions git can answer.
