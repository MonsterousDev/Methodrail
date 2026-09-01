Added `ticket.closed` customer mail in `repo/src/mailer.js`.

Stored knowledge still holds for keying: dispatch is keyed on provider `event.id`, so a second `handle` for the same id returns the existing outbox row and does not enqueue a duplicate. That half was reused.

The stored retry claim does not hold. Knowledge said a failed send is retried immediately; current source already uses `backoffMs()` of 5000, and the retry-closed feature says failed `ticket.closed` mail stays in the outbox and waits. Failed sends now stay in the outbox, `retryAt` is set from backoff, and `retry` will not resend until that time.

A `ticket.closed` event composes customer mail (`kind: "customer"`, subject/body for the closed ticket). Knowledge in `.methodrail/knowledge/mail.md` was updated so the retry policy matches source.

Checked in this run: same event id is not double-queued; after `failSend` the row remains; a retry before backoff is a no-op; a retry after 5000ms proceeds.
