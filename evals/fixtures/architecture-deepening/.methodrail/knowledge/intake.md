---
kind: fact
status: verified
validated_at: unversioned:fixture
relevant_paths:
  - src/orderIntake.js
---

# Order intake leakage

## Claim

Order intake callers pass pricing internals across the seam.

## Evidence

- src/orderIntake.js returns priceCents and taxCode to three callers.

## Reuse guidance

Do not treat intake as a deep module.

## Refresh triggers

- src/orderIntake.js changes.
