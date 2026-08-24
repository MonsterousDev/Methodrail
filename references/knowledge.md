# Knowledge

Treat source code, configuration, tests, version history, and observed behavior as the primary record.

Persist knowledge when it is costly to rediscover or cannot be recovered from the current tree, such as:

- product intent and constraints;
- architectural decisions and rejected alternatives;
- operational hazards and known failure modes;
- stable project-specific commands or boundaries.

Record the source and confidence of important claims. Update or remove notes when the project disproves them. Do not duplicate facts that are already obvious and searchable.

For a durable behavioral claim, record:

```text
Claim: <concise behavior or invariant>
Confidence: observed | test-confirmed | historically supported | inferred
Evidence: <commands, artifacts, tests, source, or history>
Relevant revision: <commit when useful>
```

Future investigations may propose focused `.methodrail/knowledge/` updates. Do not persist every conversational insight.
