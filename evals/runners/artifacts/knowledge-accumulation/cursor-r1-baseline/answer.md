# Answer

## What I did

Routed `invoice.paid` through the same ledger path as `charge.succeeded`. `handle()` now posts cents for both event types using `event.id` as the ledger key.

The ledger already treats `key` as idempotent (`post` returns the existing row if the key was seen). Stripe retries that replay the same event id therefore do not double-credit the wallet.

Updated the placeholder test (`invoice.paid is not routed yet`) to assert that a paid invoice credits once and a second delivery of the same event leaves the balance unchanged.

## Files changed

- `repo/src/webhooks.js` — accept `invoice.paid` and credit via `post(..., event.id)`
- `repo/src/webhooks.test.js` — duplicate-delivery coverage for `invoice.paid`

## Test results

Ran `npm test` in `repo/` (exit_status 0).

```
✔ charge.succeeded duplicate delivery does not double the wallet
✔ invoice.paid duplicate delivery does not double the wallet
tests 2, pass 2, fail 0
```

`git status` in `repo/` failed (exit_status 128): not a git repository.
