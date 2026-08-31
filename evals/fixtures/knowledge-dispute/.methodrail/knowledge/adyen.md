---
kind: invariant
status: verified
validated_at: bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
lifecycle: disputed
conflicts_with:
  - knowledge/stripe.md
relevant_paths:
  - repo/src/refunds.js
scope:
  include_paths:
    - repo/src/refunds.js
---

# Adyen refunds

## Claim

Every refund, including chargeback.won, must go through the Adyen `/refunds` endpoint.

## Evidence

- Historical refunds in this service used Adyen PSP references as the processor key.

## Reuse guidance

When adding a refund path, call Adyen and store the PSP reference.

## Refresh triggers

- A refund processor other than Adyen is introduced.
- `repo/src/refunds.js` gains a second processor.

## Dispute

This note and `knowledge/stripe.md` both claim exclusive ownership of the refund processor for `repo/src/refunds.js`.
