# Project harness

The objective is the highest-leverage project-specific AI harness with the least permanent-context cost and maintenance burden.

A tiny project may need only:

```text
.methodrail/PROJECT.md
```

A mature service may need:

```text
.methodrail/
├── PROJECT.md
├── knowledge/
│   ├── domain.md
│   ├── architecture.md
│   ├── behavior.md
│   ├── operations.md
│   └── decisions/
└── control/
    ├── CONTROL.md
    └── scenarios/
```

Do not generate files merely to satisfy a template. Create richer artifacts when they materially improve future agent performance.

## PROJECT.md is an index

Keep it short. Point to canonical source, docs, ADRs, knowledge notes, and control procedures. It is not the entire knowledge base.

```text
small index
↓
precise pointers
↓
on-demand deeper knowledge
```

## Information ROI

```text
                     future agent benefit
information ROI = ──────────────────────────────
                  context + staleness + upkeep
```

High-value: important domain invariants, unexpected ownership boundaries, non-obvious runtime behavior, deployment traps, known failure modes, consequential architectural rationale.

Low-value: copied package.json, obvious directory listings, stale API inventories, generic framework documentation.

## Lazy crystallization

```text
initial high-value knowledge
↓
real work
↓
investigation/prototype/debugging
↓
validated discoveries
↓
knowledge proposals
↓
durable project knowledge
```

Do not fully document a repository during init. Grow the harness around actual engineering work.

## Existing instructions outrank Methodrail

Inspect `AGENTS.md`, `CLAUDE.md`, `.cursor/rules/`, `.cursor/skills/`, `.agents/skills/`, `.claude/`, and `.codex/`. Never overwrite them. Prefer an existing source of truth plus a thin Methodrail pointer. Detect contradictions; repository-specific instructions win.

## Host surfaces

- Cursor: plugin `skills/` and `rules/`
- Claude Code: `.claude/skills/` and `CLAUDE.md`
- Codex: `.agents/skills/` and `AGENTS.md`

Reference canonical Methodrail skills instead of copying their bodies.

When the project has a meaningful executable surface, init should generate a project-local verification skill via `create-verification-skill` rather than copying global operators into the repo.

See also [agent-friendly codebases](agent-friendly-codebase.md) and [structural enforcement](structural-enforcement.md).
