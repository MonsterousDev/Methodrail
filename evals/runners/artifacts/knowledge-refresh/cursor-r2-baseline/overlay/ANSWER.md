# Answer

## What changed

`ticket.resolved` customer emails now go through the same outbox path as `ticket.opened`.

- `repo/src/mailer.js`: `handle()` dispatches `ticket.resolved` with `dispatchOnce(event.id, event.type, event.data)`, so the event is mailed once per id and counted on the `ticket.resolved` channel.
- `repo/src/mailer.test.js`: replaced the pending “not routed yet” assertion with a routing + idempotency test (handle twice, one delivery).

## Why

The mailer already treated provider events as outbox rows keyed by event id. `ticket.resolved` was the missing event type: `handle()` returned `null` and sent nothing. Routing it through `dispatchOnce` reuses duplicate protection and failure handling (`failSend` / `markFailed`) without a second send path.

## Tests

`node --test` in `repo/` — 3 passed.
