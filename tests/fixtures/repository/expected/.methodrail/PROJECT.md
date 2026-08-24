# Project

<!-- methodrail:generated repository interview -->

## Purpose

A small JavaScript CLI used as a realistic Methodrail initialization fixture.

## Important boundaries

- `src/index.js` is the runtime entrypoint.
- Existing `AGENTS.md`, `CLAUDE.md`, and Cursor rules remain authoritative.

## Canonical commands

- Install: no install step is required.
- Build/syntax: `npm run build`
- Test: `npm test`
- Full check: `npm run check`
- Run: `npm start -- [name]`

## Verification

Use the [verify-project skill](../.agents/skills/verify-project/SKILL.md). For runtime behavior, execute the CLI and capture stdout.

## Runtime and control

See [CONTROL.md](control/CONTROL.md).

## Knowledge index

No separate knowledge notes were justified during initialization.
