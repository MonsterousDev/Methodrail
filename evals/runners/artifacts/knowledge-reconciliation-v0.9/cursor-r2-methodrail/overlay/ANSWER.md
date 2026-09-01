Added `ticket.closed` customer mail in `repo/src/mailer.js`.

**Knowledge.** `.methodrail/knowledge/mail.md` (invariant, verified, `unversioned:fixture`). Freshness **unknown** (git-less tree; unversioned provenance never counts as fresh). Disposition **narrowed**:

- Event-id keying is **supported** (observed in current `handle`; test-confirmed: same `event.id` reuses one outbox row).
- Immediate retry is **contradicted** (observed: `backoffMs()` is 5000 and rows get `retryAt`; linked feature `retry-closed` requires backoff). Reuse guidance already said to keep the event-id half and re-check retry.

Did not rewrite the note (no approval). Candidate for later `reflect`: narrow the claim to event-id keying and record backoff as the retry policy.

**Behavior.** `handle` accepts only `ticket.closed`, keys on provider `event.id`, and enqueues with backoff. `failSend` leaves the row in the outbox. `retry` waits while `retryAt` is in the future (`retry-backoff`); after backoff it sends and refreshes `retryAt`.

**Verification (this turn).** `node repo/src/mailer.js` exited 0. A probe of `retry-closed` passed: one keyed row, failed mail stayed in the outbox, early retry returned `wait`, elapsed backoff returned `sent`.
