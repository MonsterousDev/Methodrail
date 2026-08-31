---
kind: invariant
status: verified
validated_at: bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
lifecycle: disputed
conflicts_with:
  - knowledge/adyen.md
relevant_paths:
  - repo/src/refunds.js
scope:
  include_paths:
    - repo/src/refunds.js
---

# Stripe refunds

## Claim

Every refund, including chargeback.won, must go through the Stripe Refunds API.

## Evidence

- Historical refunds in this service used Stripe charge IDs as the processor key.

## Reuse guidance

When adding a refund path, call Stripe and store the Stripe refund id.

## Refresh triggers

- A refund processor other than Stripe is introduced.
- `repo/src/refunds.js` gains a second processor.

## Dispute

This note and `knowledge/adyen.md` both claim exclusive ownership of the refund processor for `repo/src/refunds.js`.
