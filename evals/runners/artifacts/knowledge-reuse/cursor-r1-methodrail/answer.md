# Answer

## Change

`shipment.delayed` is now a customer-visible shipment event in `repo/src/notify.js`. `handle` routes it through `dispatchOnce(event.id, event.type, event.data)` the same way as `shipment.created`. Unknown types still return `null`.

The placeholder test that expected delayed events to be ignored was replaced with an idempotency test: a second delivery of the same delayed event ID does not add a second mail.

Observed via `node --test` in `repo/`: both tests pass.

## Project knowledge

Used `.methodrail/PROJECT.md` → `knowledge/notifications.md`.

The note is a typed invariant (`status: verified`). `validated_at` is a 40-character SHA, but this worktree has no git history, so the revision could not be resolved. Freshness is **unknown**. Confidence was reduced and the claim was checked against current source:

- `shipment.created` already calls `dispatchOnce` with `event.id` (observed in `repo/src/notify.js`).
- `dispatchOnce` returns the existing row for a repeat event ID (observed in `repo/src/outbox.js`).
- The created-event test still asserts no double-notify (observed in `repo/src/notify.test.js`).

The claim still holds. Implementation followed reuse guidance: do not use `sendDirect`.

## Proposed note update

Do not rewrite the note in this run. After this change, evidence and tests should mention `shipment.delayed` as well as `shipment.created`. Refresh trigger “A new customer-visible shipment event is added” has fired; re-validate the invariant and set `validated_at` once git history exists.
