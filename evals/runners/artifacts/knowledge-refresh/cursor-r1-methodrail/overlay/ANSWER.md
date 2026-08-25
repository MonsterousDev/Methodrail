# Answer

## What changed

`ticket.resolved` customer emails now route the same way as `ticket.opened`: `handle` passes `event.id` into `dispatchOnce` so delivery is keyed on the provider event ID.

- `repo/src/mailer.js` — route `ticket.resolved` through `dispatchOnce`.
- `repo/src/mailer.test.js` — replaced the pending “not routed yet” check with duplicate-delivery and failed-send tests.

`node --test` in `repo/`: 4 pass, 0 fail.

## Project knowledge

Used `.methodrail/PROJECT.md` → [mail](.methodrail/knowledge/mail.md). Followed [reuse](references/knowledge/reuse.md): read kind/status/evidence/`validated_at`, then checked against current source.

There is no git repository here, so SHA `cccccccccccccccccccccccccccccccccccccccc` could not be resolved. Freshness is **unknown**. Current source was the source of truth.

**Still valid:** customer ticket emails are keyed on the provider event ID (`ticket.opened` already passed `event.id` into `dispatchOnce`; `byKey` is keyed by that id).

**Stale:** “a failed send deletes the outbox row so the next attempt is a clean insert.” Current `markFailed` keeps the row and sets `status: "failed"`. Tests assert that. `retryFailed` retries in place. Reuse guidance that said to delete-on-fail was not followed.

The new `ticket.resolved` path uses the still-valid event-id key and keeps the failed outbox row, matching current source and tests. The stored note was not rewritten.

## Proposed note update

Keep the event-id key claim. Replace the delete-on-fail claim and reuse guidance with current behavior:

- Failed send: keep the keyed outbox row and mark it `failed` (`markFailed`); do not delete for a clean insert.
- Retry is in-place via `retryFailed`, not a second insert.
- Evidence should cite `markFailed` / the “failed send keeps the outbox row” test, not older delete-on-5xx outbox code.
- `ticket.resolved` is now a routed customer ticket email (same keying as `ticket.opened`).
- After git exists, set `validated_at` to the SHA that contains this source; until then provenance stays unknown.
