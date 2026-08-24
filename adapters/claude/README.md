# Claude Code adapter

The root `skills/` directory is Methodrail's source of truth. A consuming
project can expose selected skills through Claude Code's native
`.claude/skills/` location and place the short guidance from `CLAUDE.md` in its
project instructions.

Do not copy skill bodies into this adapter. Link or install the canonical skill
directories so updates remain centralized.
