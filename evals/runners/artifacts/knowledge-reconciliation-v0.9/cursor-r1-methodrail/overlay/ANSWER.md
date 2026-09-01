# ticket.closed customer mail

Added customer mail for `ticket.closed` in `repo/src/mailer.js`. `handle` queues a row only for that event type, keys it on the provider `event.id` (duplicate ids return the same row), and sets `retryAt` from the current 5000ms backoff. `failSend` marks the row failed and leaves it in the outbox; it does not send again immediately.

## Knowledge disposition

Note: `.methodrail/knowledge/mail.md` (`kind: invariant`, `status: verified`). Freshness: **unknown** (`validated_at: unversioned:fixture`). Checked against current `repo/src/mailer.js` and the linked `retry-closed` feature.

- **event-id keying — supported, reused.** Mail is still keyed on `event.id`.
- **immediate retry — contradicted, not reused.** Current source uses `backoffMs()` (5000) and `retryAt`; verify-mail `retry-closed` requires failed `ticket.closed` mail to stay in the outbox and wait. The note’s own reuse guidance said to keep the event-id half and re-check retry policy.

The typed note was not rewritten (no approval). Work continued from current source and the verification feature.

## Verification (observed)

`node repo/src/mailer.js` (verify-mail launch) printed `retry-closed ok` (exit 0). That run queued `ticket.closed` mail, deduped by event id, rejected a non-customer type, and confirmed a failed send stayed in the outbox with backoff rather than an immediate retry.
