# invoice.paid webhook handling

Routed `invoice.paid` through the same ledger `post` path as `charge.succeeded`, keyed by Stripe `event.id`. Duplicate deliveries (retries) reuse the existing row and do not add cents again.

## Files changed

- `repo/src/webhooks.js` — handle `invoice.paid` via `post(walletId, cents, event.id)`
- `repo/src/webhooks.test.js` — replaced the “not routed yet” placeholder with a duplicate-delivery assertion

Unchanged: `repo/src/ledger.js` already no-ops on a repeated key (observed).

## Test results

`npm test` in `repo/` — exit 0 (test-confirmed)

```
✔ charge.succeeded duplicate delivery does not double the wallet
✔ invoice.paid duplicate delivery does not double the wallet
ℹ tests 2
ℹ pass 2
ℹ fail 0
```
