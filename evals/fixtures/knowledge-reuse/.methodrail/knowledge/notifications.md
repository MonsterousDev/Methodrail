---
kind: invariant
status: verified
validated_at: bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
relevant_paths:
  - repo/src/notify.js
  - repo/src/outbox.js
---

# Shipment notification event keys

## Claim

Every customer-visible shipment notification must go through `dispatchOnce` using the provider event ID as the outbox key.

## Evidence

- `shipment.created` passes `event.id` into `dispatchOnce`.
- The outbox returns the existing row when the same event ID is seen again.
- `notify.test.js` asserts a second `shipment.created` delivery does not add a second mail.

## Reuse guidance

When adding another customer-visible shipment event, route it through `dispatchOnce(event.id, event.type, event.data)` rather than `sendDirect`.

## Refresh triggers

- A new customer-visible shipment event is added.
- `dispatchOnce` keying or `sendDirect` usage changes.
