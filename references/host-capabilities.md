# Host capabilities

Imported skills should degrade when a host lacks an optional facility. Do not pretend an unavailable capability exists.

## Portable

Methodology that needs only read/write, search, and command execution. Usable in Cursor, Claude Code, Codex, and other Agent Skills hosts.

## Optional facilities

When a skill mentions parallel work, independent review, or live driving, use what the host actually provides:

| Facility | If available | If missing |
|---|---|---|
| Subagents / Task | Partition independent slices; keep the parent as synthesizer | Do the slices sequentially in this context |
| Multi-model | Prefer diverse model families for arena, interrogate, and critique | Use independent agent contexts if possible; otherwise state the limitation |
| Cloud / remote workers | Use for swarm coverage that does not need the local checkout | Use local subagents or sequential slices |
| Browser / CDP | Drive UI paths and capture rendered evidence | Use API/CLI/headless harnesses the repo already has; record the gap |
| Runtime tools | Instrument, profile, and observe live processes | Stay at source + tests; do not invent runtime evidence |
| MCP servers | Query the mapped evidence category | Document the category as unsearched; do not invent findings |
| Issue tracker CLI | Publish specs/tickets when the project already uses that tracker | Fall back to project-local markdown |

Do not hard-require Cursor model slugs such as `claude-fable-5-thinking-max` or a `~/.cursor/rules/pstack-models.mdc` file. Those are host-local defaults from pstack setup, not Methodrail runtime. If the host lets you choose a model per subagent, pick diverse families. Otherwise omit `model` and use the host default.

## Control planes

Methodrail's control plane is the native host plus Methodrail workflow entry skills. Do not load `poteto-mode`, `ask-matt`, `using-superpowers`, or other global routers.
