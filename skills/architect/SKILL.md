---
name: architect
description: Use only when a design choice is consequential. Ground in current implementation, domain, and constraints; compare options on ownership, reversibility, and operational cost.
---

# Architect

## Problem

Agents invent a new architecture for a local change, or pick a shape with no comparison.

## Observed failure

A rewrite proposal for a rename. Or a single 'best practice' architecture with no alternatives.

## When to activate

Activate when multiple plausible designs exist and the decision is hard to reverse: ownership boundaries, billing, permissions, migrations, new subsystems.

## When not to activate

Do not activate for trivial local changes, rigor 0–1 work, or when the existing shape is adequate and the change fits it.

## Required context

Current implementation (how), domain terms, constraints, and relevant evidence. Do not architect in a vacuum.

## Method

Require prior grounding in existing implementation, domain, constraints, and evidence.

When multiple designs exist, compare:
- ownership boundaries
- reversibility
- operational complexity
- migration cost
- observability and testability
- risks

Recommend, or record that the human must choose.

## Permitted evidence

Current code, ADRs, operational constraints, prototypes if empirical.

## Side effects

Read-only unless producing an ADR candidate. No drive-by refactors.

## Completion

Options are compared on the axes above. A recommendation is evidence-backed or explicitly deferred.

## Artifacts

A comparison note; optional ADR candidate.

## What survives

The comparison and chosen constraints. Discard aesthetic lectures.

## Evaluation

Positive: organization-level billing. Negative: mechanical rename must exclude this skill.
