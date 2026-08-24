# Contributing

Do not create a skill because advice sounds good. Create a skill because a **recurring agent failure** has been observed and the skill **measurably** improves behavior.

## Skill changes

1. **Failure observed** — what the agent actually did wrong, repeatedly.
2. **Skill hypothesis** — how a bounded procedure prevents that failure.
3. **Activation rule** — when a native agent or workflow entry skill should load it.
4. **Non-activation rule** — when it must stay dark (especially expensive skills).
5. **Evals** — at least positive routing, negative routing, behavioral (or structural stand-in), and a pressure case.

Reject skills that are generic advice, long reference manuals, personality text, duplicate methodology, or work a compiler/linter/test should enforce.

Each skill directory requires `SKILL.md` with standard Agent Skills frontmatter. Use `disable-model-invocation: true` for explicit workflow skills and expensive procedures. Put detailed material in directly linked `references/` files.

Do not add Methodrail-specific metadata when native skill metadata expresses the same intent.

## Architecture boundary

Methodrail defines good engineering behavior. Cursor, Claude Code, Codex, and other Agent Skills-compatible harnesses own context, tool execution, planning, task state, and subagents.

Do not add a router, workflow engine, agent protocol, daemon, database, mandatory CLI, or generated copies of canonical skills. Host-specific adapters must remain thin projections.

Shared methodology belongs in `references/`. Skills should stay short and link to it. Project harness artifacts use `.methodrail/PROJECT.md` as a concise index and must preserve existing AI instructions.

## Evals

Maintainer evals live in `evals/routing/`, `evals/behavioral/`, `evals/pressure/`, and `skills/<name>/evals/`. They are not required in consuming projects. Prefer mixed-intent prompts over textbook phrases. Behavioral evals compare a baseline agent with the Methodrail skill loaded; recorded/manual runs are acceptable.

## Repo commands

```bash
npm install
npm test
npm run validate
```

Before submitting, inspect the diff for obsolete runtime concepts, duplicated instructions, broken references, invalid plugin metadata, and excessive permanent context.
