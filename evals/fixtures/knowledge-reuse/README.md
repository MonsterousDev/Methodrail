# Knowledge reuse fixture

Fresh-session reuse on a tiny fake notifier (**parcelwire**). Not tillbox / `knowledge-accumulation` (ledger credits, prompt leaked retries).

- **Task A** (`task-a.md`): debug duplicate `shipment.created` mail; propose a typed knowledge *candidate* (do not auto-apply). Not the composition pair.
- **Task B** (`task.md`, scored): add `shipment.delayed`. The prompt does not mention retries, duplicates, or idempotency. Baseline has no typed note. Methodrail loads the promoted `.methodrail/knowledge/notifications.md`.

Repo state is post-Task-A: `shipment.created` already goes through `dispatchOnce(event.id)`. `shipment.delayed` is not routed yet. `sendDirect` exists and will double-send if used.
