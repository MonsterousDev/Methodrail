Added `ticket.closed` customer mail in `repo/src/mailer.js`.

Reuse that still holds: customer mail is keyed on the provider event id (`event.id`). Duplicate events with the same id return the existing outbox row and do not enqueue a second send.

Reuse that does not hold: stored knowledge claimed a failed send is retried immediately. Current source uses `backoffMs()` = 5000, and the verify-mail `retry-closed` feature says failed `ticket.closed` mail stays in the outbox and waits. I left that policy in place: `failSend` marks the row failed without removing it; `retry` is a no-op until `retryAt`.

What changed: `handle({ type: "ticket.closed", ... })` now attaches `channel: "customer"` and a customer mail payload (`to`, subject, `ticket.closed` template). Other event types still go through the same event-id outbox path but do not get customer mail.

Verified with a node script: event-id keying, dedupe, customer template, failed row stays in outbox, 5000ms backoff, retry waits.
