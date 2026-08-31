# chargeback.won refund path — blocked on disputed knowledge

**Disposition:** escalate. Did not implement a processor-specific refund. Did not edit either note.

**Notes:** `.methodrail/knowledge/stripe.md` and `.methodrail/knowledge/adyen.md` (both `lifecycle: disputed`, reciprocal `conflicts_with`).

## Competing claims

- **Stripe** (`knowledge/stripe.md`): every refund, including `chargeback.won`, must go through the Stripe Refunds API; store a Stripe refund id. Evidence in the note: historical refunds used Stripe charge IDs as the processor key.
- **Adyen** (`knowledge/adyen.md`): every refund, including `chargeback.won`, must go through the Adyen `/refunds` endpoint; store a PSP reference. Evidence in the note: historical refunds used Adyen PSP references as the processor key.

Both notes claim exclusive ownership of the refund processor for `repo/src/refunds.js`. Implementing either path would select a winner.

## Current evidence (observed)

- `repo/src/refunds.js` returns `null` for other event types and throws `chargeback.won refund path is not implemented` for `chargeback.won`. It does not call Stripe or Adyen.
- `repo/src/refunds.test.js` asserts that throw. `node --test src/refunds.test.js` in `repo/` passed (1/1).
- Freshness is **unknown**: `validated_at` is SHA `bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb`, but this tree is not a git repository, so the revision cannot be resolved.

## Decision

No refund implementation was added. The processor cannot be chosen until the dispute is resolved. Existing notes were left unchanged.
