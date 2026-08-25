# invoice.paid webhooks

Routed `invoice.paid` through the same ledger `post` path as `charge.succeeded`, keyed by Stripe `event.id`. Duplicate deliveries (retries) hit the existing row and do not add cents again.

## Files changed

- `repo/src/webhooks.js` — handle `invoice.paid` by posting `event.data.cents` to `event.data.walletId` with idempotency key `event.id`
- `repo/src/webhooks.test.js` — credit + retry tests for `invoice.paid` (replaced the previous “not routed yet” assertion)

## Tests

`npm test` in `repo/` — 3 passed, 0 failed, exit 0.
