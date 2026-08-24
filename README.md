# Methodrail

Evidence-driven software engineering methodology and skill system for AI coding agents.

Methodrail helps an agent **understand before changing**, **observe rather than assume**, **separate fact from inference**, and **refuse unsupported completion claims**.

## Why Methodrail

AI coding agents fail in recurring, structural ways: they invent runtime behavior from source, skip verification under pressure, ask humans questions the repository can answer, and keep “remembering” advice that should have become a test or a type.

Methodrail is not a pile of pep talks. It is a **single control plane** (router + workflows) with **skills**, **evidence protocols**, **knowledge promotion rules**, **evals**, and **harness adapters**.

## The method

```text
UNDERSTAND
    ↓
ESTABLISH EVIDENCE
    ↓
IDENTIFY KNOWLEDGE / DECISION GAPS
    ↓
DECIDE
    ↓
PLAN
    ↓
EXECUTE
    ↓
OBSERVE
    ↓
VERIFY
    ↓
ASSESS BLAST RADIUS
    ↓
COMPLETE
    ↓
RETAIN VALIDATED KNOWLEDGE
```

Shorter: **Understand → Evidence → Decide → Execute → Verify**.

## Core ideas

- Explore before changing nontrivial existing systems.
- Observe runtime behavior; do not label inference as observation.
- Evidence before claims of working, fixed, passing, or complete.
- The environment is the source of truth; persist only knowledge that is expensive, historical, or ambiguous.
- Context is a budget: packets, indexes, and isolation beat giant permanent prompts.
- Skills are reusable procedures. Workflows own phase transitions. One router.
- Recurring failures should be promoted into tests, lints, types, CI, or architecture.

## Skills vs workflows

A **skill** is a bounded procedure (`how`, `observe`, `verify-change`, …).

A **workflow** (`investigate`, `develop`, `debug`, `refactor`, `review`) owns the state machine. Skills must not secretly replace the global workflow.

## Quick start

```bash
npm install
npm test
npx tsx src/cli/index.ts validate
npx tsx src/cli/index.ts list skills
npx tsx src/cli/index.ts show skill how
npx tsx src/cli/index.ts route "How does authentication work?"
npx tsx src/cli/index.ts eval routing
npx tsx src/cli/index.ts init
npx tsx src/cli/index.ts generate-adapter cursor
```

`methodrail init` creates a project-local `.ai/` skeleton and will not overwrite existing files.

## Example: investigating a codebase

Prompt: `How does authentication work?`

Expected route: workflow `investigate`, skill `how`, no code modification. The agent traces entrypoints and flow, cites evidence, and lists unknowns. It does not emit a repository tour.

## Example: developing a feature

Prompt: `Design organization-level billing`

Expected route: `develop` at high rigor. Frontier questions are classified (human preference vs source vs runtime vs experiment). Architecture and domain modeling activate because the decision is consequential. Completion still requires fresh verification evidence.

## Example: debugging a runtime failure

Prompt: `CPU spikes after the app is idle for twenty minutes`

Expected route: `debug`, with `systematic-debugging`, `how`, and `observe`. Runtime escalation is in play. Symptom-to-patch guessing is forbidden.

## Knowledge and evidence

Evidence is not a conclusion. Knowledge is not a cache of `ls`. See `docs/evidence.md` and `docs/knowledge.md`.

Consuming projects store knowledge under `.ai/knowledge/`. Methodrail stores schemas and promotion rules.

## Evals

Routing and pressure fixtures run **without an LLM**. Behavioral LLM evals are skipped until a provider is configured.

```bash
npx tsx src/cli/index.ts eval
npx tsx src/cli/index.ts eval routing
npx tsx src/cli/index.ts eval skill how
```

## Harness support

Adapters project Methodrail into Cursor, Claude Code, Codex, and generic Agent Skills. Internal YAML/Markdown is authoritative. Limitations are documented per adapter rather than pretended away.

Cursor gets a thin always-on router rule plus requestable skills — not the entire methodology in permanent context.

## Philosophy

See `docs/philosophy.md` and `principles/`.

## Status

v0.1.0 — local-first methodology, schemas, skills, workflows, validation, deterministic routing, eval fixtures, CLI, and adapter generation. Not an autonomous runtime, model marketplace, or cloud control plane.
