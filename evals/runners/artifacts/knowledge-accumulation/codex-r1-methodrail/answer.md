Implemented `invoice.paid` webhook handling.

What changed:
- `repo/src/webhooks.js` now routes `invoice.paid` events to the ledger posting path.
- `repo/src/webhooks.test.js` now verifies that duplicate `invoice.paid` deliveries only credit the wallet once.

Why Stripe retries do not double-credit:
- The webhook handler posts ledger entries with `event.id` as the idempotency key.
- `repo/src/ledger.js` already de-duplicates posts by key, so retrying the same Stripe event returns the existing row instead of appending another credit.

Verification:
- Ran `npm test` in `repo/`.
- Result: 2 tests passed, 0 failed.
