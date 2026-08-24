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

## Choice rules

- Prefer an existing instruction surface over introducing a new one.
- If several exist, choose the one the user actively uses or the repository identifies as primary.
- Do not edit every surface.
- Do not overwrite or reorder existing instructions.
- If no supported integration is appropriate, ask before creating one.
