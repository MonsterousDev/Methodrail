# Knowledge accumulation fixture

Two-task learning loop on a tiny fake wallet (**tillbox**). Not the same as `knowledge-freshness` (stale JWT vs sessions).

- **Task A** (`task-a.md`): debug duplicate `invoice.paid` credits; discover eventId idempotency; propose a knowledge *candidate* (do not auto-apply).
- **Task B** (`task.md`, scored): add `invoice.paid` the same way. Baseline has no knowledge file in `references_loaded`. Methodrail loads the promoted `.methodrail/knowledge/webhooks.md`.

Repo state is post-Task-A: `charge.succeeded` already goes through append-only `post()` keyed in a Map. `invoice.paid` is not routed yet.
