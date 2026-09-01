---
kind: invariant
status: verified
validated_at: unversioned:fixture
relevant_paths:
  - repo/src/mailer.js
---

# Mail dispatch

## Claim

Customer mail is keyed on the provider event id. A failed send stays in the outbox and retries only after backoff (currently 5000ms), not immediately.

## Evidence

- `handle` keys on `event.id` via the `sent` map.
- `ticket.closed` customer mail is composed in `composeTicketClosedMail`.
- `failSend` keeps the row in the outbox and sets `retryAt` from `backoffMs()`.
- `retry` does not resend until `now >= retryAt`.
- Feature [retry-closed](../../.agents/skills/verify-mail/features/retry-closed.md) exercises a failed send with backoff.

## Reuse guidance

Reuse the event-id half. Retry policy is backoff, not immediate.

## Refresh triggers

- repo/src/mailer.js changes.
- Provider Retry-After semantics change even if this file does not.
