---
name: verify-project
description: Verify this project with its existing checks and report fresh evidence.
---

# Verify project

Read the [project profile](../../../.methodrail/PROJECT.md).

- Source-only change: run `npm run build`.
- Behavior change: run `npm test`, then exercise `npm start -- Ada` and confirm `Hello, Ada!`.
- Cross-cutting change: run `npm run check`.

Report commands, exit status, observed stdout when relevant, and limitations. Do not claim success from stale output.
