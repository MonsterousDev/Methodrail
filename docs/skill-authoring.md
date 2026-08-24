# Skill authoring

A Methodrail skill is a bounded reusable procedure with machine-readable metadata (`skill.yaml`) and Agent Skills–compatible instructions (`SKILL.md`).

## Required headings

See `REQUIRED_SKILL_HEADINGS` in `src/validation/skill-workflow.ts`.

## Invocation

- `implicit` — router may auto-activate (conservative; never for high-cost/high-rigor skills)
- `explicit` — human request
- `workflow-only` — only an active Methodrail workflow
- `internal` — not independently exposed

## Rejection criteria

Generic advice, reference dumps, personality, duplicate methodology, or work that belongs in a compiler, test, or lint.

## Evals

Every skill ships routing-positive, routing-negative, and at least one pressure or completion fixture. LLM behavioral evals are optional behind a provider interface.
