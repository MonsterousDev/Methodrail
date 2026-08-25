# Answer

## What changed

`handle()` in `repo/src/mailer.js` now routes `ticket.resolved` the same way as `ticket.opened`: through `dispatchOnce` with the event id as the idempotency key, the event type as the channel, and `event.data` as the body.

The pending-route test in `repo/src/mailer.test.js` was replaced with a duplicate-delivery check so `ticket.resolved` is asserted as a first-class mail path.

## Why

The mailer already had an outbox that dedupes by event id and records channel/body/status. Resolved-ticket customer emails only needed that same dispatch path; they do not need a separate send API. Using `dispatchOnce` keeps retries and failure marking (`failSend` / `markFailed`) working for resolved events without extra state.
