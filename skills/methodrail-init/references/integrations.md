# Supported project integrations

Install one integration, chosen from existing repository conventions.

## Cursor

Preferred when `.cursor/` already exists or the user is working in Cursor. Add a small project rule such as `.cursor/rules/methodrail.mdc` that points to `.methodrail/PROJECT.md` and the installed Methodrail skills. Preserve all existing rules.

## AGENTS.md

Preferred for tool-neutral repositories that already use `AGENTS.md`. Add only a Methodrail-owned pointer block. If no `AGENTS.md` exists, create one only when this is the clearest convention for the repository.

## CLAUDE.md

Use when `CLAUDE.md` is the established instruction surface. Add only the pointer block; do not duplicate `.methodrail/PROJECT.md`.

## GitHub Copilot instructions

Use when `.github/copilot-instructions.md` is already authoritative. Add only a concise pointer if that client can follow repository-local links in the intended environment.

Inspect existing AI instruction surfaces before adding a pointer:

- `AGENTS.md`
- `CLAUDE.md`
- `.cursor/rules/`
- `.cursor/skills/`
- `.agents/skills/`
- `.claude/`
- `.codex/`
- `.github/copilot-instructions.md`

Never overwrite them. Prefer the existing source of truth plus a thin Methodrail pointer. Detect contradictions; repository-specific instructions outrank generic Methodrail assumptions.
