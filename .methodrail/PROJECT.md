# Project

Pointer index for Methodrail maintainers. Canonical product docs stay in the repository root and `references/`.

## Purpose

Methodrail is a Cursor plugin and portable Agent Skills family. It is methodology plus a project harness, not an agent runtime.

## Canonical commands

- Install: `npm install`
- Test: `npm test`
- Typecheck and validate: `npm run check`
- Validate only: `npm run validate`
- Eval fixtures and recorded examples: `npm run eval`
- Upstream drift: `npm run check-upstreams`
- Refresh host projections: `npm run project-hosts`

## Verification

`npm run check` is the maintainer gate: typecheck, tests, and repository validation. `npm run eval` scores recorded composition examples; it does not launch an agent.

## Architecture pointers

- [README.md](../README.md)
- [CONTRIBUTING.md](../CONTRIBUTING.md)
- [capability map](../references/capability-map.md)
- [family invariant](../references/methodrail-family-invariant.md)
- [project harness](../references/project-harness.md)
- [eval runner](../evals/README.md)

## Existing AI guidance

- Cursor plugin rule: [rules/methodrail.mdc](../rules/methodrail.mdc)
- Claude adapter: [adapters/claude/CLAUDE.md](../adapters/claude/CLAUDE.md)
- Codex adapter: [adapters/codex/AGENTS.md](../adapters/codex/AGENTS.md)
