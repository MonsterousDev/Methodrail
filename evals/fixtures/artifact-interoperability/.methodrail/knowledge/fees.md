---
kind: invariant
status: verified
validated_at: unversioned:fixture
relevant_paths:
  - src/fees.js
---

# Checkout fees

## Claim

Checkout fees stay in billing.

## Evidence

- src/fees.js computes the fee.

## Reuse guidance

Keep fees in billing.

## Refresh triggers

- Fee formula changes.
- Provider fee schedule changes even if src/fees.js does not.
