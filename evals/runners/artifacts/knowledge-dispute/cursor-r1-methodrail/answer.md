# chargeback.won refund path — not implemented

**Disposition: refuse.** Two typed notes both claim exclusive ownership of the refund processor for `repo/src/refunds.js`. Per knowledge reuse, disputed notes are presented with current evidence; a winner is not selected and neither note is edited.

## Competing claims

- `.methodrail/knowledge/stripe.md` (kind: invariant, status: verified, lifecycle: disputed) — every refund, including `chargeback.won`, must go through the Stripe Refunds API; store the Stripe refund id.
- `.methodrail/knowledge/adyen.md` (kind: invariant, status: verified, lifecycle: disputed) — every refund, including `chargeback.won`, must go through the Adyen `/refunds` endpoint; store the PSP reference.

They `conflicts_with` each other. Both include `repo/src/refunds.js` in scope.

## Eligibility and freshness

Both notes are **typed** and **in scope** for this task path. They are **not eligible to apply**: `lifecycle: disputed`.

`validated_at` is `bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb`. This tree is not a git repository, so the SHA cannot be resolved. Freshness is **unknown**; confidence is reduced. Claims were checked against current source instead.

## Current evidence

Observed in `repo/src/refunds.js`: `chargeback.won` still throws `chargeback.won refund path is not implemented`. No Stripe or Adyen client, charge id, or PSP reference appears in the refunds module.

Test-confirmed: `node --test src/refunds.test.js` passes (exit 0); the existing test expects that throw.

No current source or test selects a processor. Historical evidence in the notes (Stripe charge IDs vs Adyen PSP references) is contradictory and unverifiable here.

## Decision

`repo/src/refunds.js` is unchanged. Implementing the path would require choosing Stripe or Adyen, which would silently pick a winner in an unresolved dispute.

Resolve the dispute (retire or supersede one note) before implementing. Do not edit either note until then.
