Implemented `invoice.paid` webhook handling by routing it through the same ledger posting path used by `charge.succeeded`.

The ledger already deduplicates by idempotency key, and the webhook handler passes `event.id` as that key, so Stripe retries for the same `invoice.paid` event return the existing ledger row instead of posting a second credit.

Updated tests cover:
- `invoice.paid` credits the wallet.
- Duplicate `invoice.paid` delivery does not double-credit.
- Existing `charge.succeeded` duplicate behavior still passes.

Verification:
- `npm test` passed with 3 tests.
