# Project harness

A project may add `.methodrail/PROJECT.md` for durable local guidance. Keep it short and include only details that materially improve work:

- purpose, boundaries, and non-goals;
- important architecture and domain constraints;
- canonical setup, test, lint, and build commands;
- risk areas and required validation;
- links to authoritative project documentation.

Harness-native locations:

- Cursor: plugin `skills/` and `rules/`;
- Claude Code: `.claude/skills/` and `CLAUDE.md`;
- Codex: `.agents/skills/` and `AGENTS.md`.

Reference the package's canonical skills instead of copying their bodies into adapter directories.
