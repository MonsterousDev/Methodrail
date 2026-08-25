---
kind: invariant
status: verified
validated_at: unversioned:prepare-fixture
relevant_paths:
  - repo/src/mailer.js
  - repo/src/outbox.js
---

# Ticket mail dispatch

## Claim

Customer ticket emails are keyed on the provider event ID, and a failed send deletes the outbox row so the next attempt is a clean insert.

## Evidence

- `ticket.opened` passes `event.id` into `dispatchOnce`.
- Older outbox code removed the keyed row after a provider 5xx so a later insert would not collide.

## Reuse guidance

When adding another customer ticket email, keep the event-id key and delete the outbox row if the provider send fails.

## Refresh triggers

- Outbox failure handling changes.
- A new customer ticket email type is added.
