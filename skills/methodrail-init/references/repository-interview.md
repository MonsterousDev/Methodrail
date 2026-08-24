# Repository interview

Inspect evidence in this order, stopping when the project is understood well enough:

1. Existing AI guidance: `AGENTS.md`, `CLAUDE.md`, `.cursor/`, `.claude/`, `.codex/`, `.agents/skills/`, `.github/copilot-instructions.md`, other local skills, and `.methodrail/`.
2. Project identity: README, contribution guide, manifests, lockfiles, workspace definitions, and directory shape.
3. Supported operations: package scripts, Makefiles, task runners, CI jobs, container configuration, and test configuration.
4. Representative implementation: runtime entrypoints, one core module, one test, deployment/configuration surfaces, and architecture docs or ADRs when relevant.
5. Repository history or user input only for material unknowns.

Record evidence, not guesses:

- project type and primary languages;
- package or service boundaries;
- install, build, test, lint, typecheck, format, and run commands that actually exist;
- generated/vendor directories to avoid;
- architectural boundaries and project-specific safety constraints;
- existing instruction precedence and conflicts;
- whether runtime verification is practical.

For monorepos, sample each distinct package kind. Do not inspect every package when conventions are shared.

Ask the user only about unresolved intent, credentials, unavailable environments, or mutually exclusive integration choices.
