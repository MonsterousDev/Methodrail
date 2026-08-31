---
kind: invariant
status: verified
validated_at: bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
relevant_paths:
  - repo/src/notifications/dispatch.js
  - repo/src/outbox.js
scope:
  include_paths:
    - repo/src/notifications
  exclude_paths:
    - repo/src/notifications/legacy
---

# Notice event keys

## Claim

Every customer-visible notice must go through `dispatchOnce` using the provider event ID as the outbox key.

## Evidence

- `notice.created` passes `event.id` into `dispatchOnce`.
- The outbox returns the existing row when the same event ID is seen again.

## Reuse guidance

When adding another customer-visible notice, route it through `dispatchOnce(event.id, event.type, event.data)` rather than `sendDirect`.

## Refresh triggers

- A new customer-visible notice is added.
- `dispatchOnce` keying or `sendDirect` usage changes.
