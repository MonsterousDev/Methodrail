# Answer

## Change

Routed `ticket.resolved` the same way as `ticket.opened`: `handle` now calls `dispatchOnce(event.id, event.type, event.data)` for both event types. Updated `repo/src/mailer.test.js` so resolved mail is asserted as a one-shot keyed send, and a failed send still keeps the outbox row.

Files:
- `repo/src/mailer.js`
- `repo/src/mailer.test.js`

Verification: `node --test` in `repo/` — 4 passed.

## Project knowledge

Used `.methodrail/PROJECT.md` → `.methodrail/knowledge/mail.md` (kind: invariant, status: verified).

There is no git history in this worktree, so `validated_at` (`cccccccccccccccccccccccccccccccccccccccc`) could not be resolved. Freshness is **unknown**; the claim was checked against current `repo/src/mailer.js` and `repo/src/outbox.js`.

**Still valid:** customer ticket emails are keyed on the provider event ID (`dispatchOnce(event.id, …)`). Used this for `ticket.resolved`.

**Stale:** “a failed send deletes the outbox row so the next attempt is a clean insert.” Current `markFailed` keeps the keyed row and sets `status: "failed"`. Tests already require that. Did **not** follow the note’s delete-on-fail reuse guidance. Did **not** rewrite the note.

## Proposed note update

Keep the event-id key claim. Replace the failure-handling claim and reuse guidance:

- Claim: Customer ticket emails are keyed on the provider event ID. A failed send keeps the keyed outbox row and marks it `failed` (retry updates in place; it is not a delete-then-insert).
- Evidence: `ticket.opened` / `ticket.resolved` pass `event.id` into `dispatchOnce`. `markFailed` updates the existing Map entry; it does not delete it.
- Reuse: when adding another customer ticket email, keep the event-id key. Do not delete the outbox row on provider failure.
- Refresh: still fire when outbox failure handling changes or a new ticket email type is added. Re-validate after git is available.
