# invoice.paid webhook handling

Routed `invoice.paid` through the same ledger credit path as `charge.succeeded`. Credits key on `event.id`, so Stripe retries with the same event id no-op instead of double-posting.

Observed in `src/ledger.js`: `post()` returns the existing row when `key` is already in `byKey`. Test-confirmed: duplicate `invoice.paid` deliveries leave wallet balance unchanged.

## Files changed

- `repo/src/webhooks.js` — handle `invoice.paid` via `post(walletId, cents, event.id)`
- `repo/src/webhooks.test.js` — replaced the “not routed yet” case with a duplicate-delivery balance check

## Test results

```
npm test  (cwd: repo/)  exit 0

✔ charge.succeeded duplicate delivery does not double the wallet
✔ invoice.paid duplicate delivery does not double the wallet
ℹ tests 2
ℹ pass 2
ℹ fail 0
```
