# Answer

**Adyen charges the one-time invoice. Stripe charges the monthly subscription.**

Observed in current source. The project knowledge note is stale and was not reused.

## Freshness check

`.methodrail/PROJECT.md` points at `.methodrail/knowledge/payments.md`. That note records revision `ccc111` and path `src/payments.js`, and claims all customer payments (subscriptions, invoices, one-time charges) go through Stripe.

This worktree has no git history, so revision `ccc111` could not be compared. Per the freshness procedure, provenance could not be confirmed and the note was treated as reduced-confidence until re-validated against current files.

Current `repo/src/payments.js` contradicts the note:

- `subscribe(customer, plan)` calls Stripe `createSubscription`
- `chargeInvoice(invoice)` calls Adyen `submitPayment`

The Stripe-only claim is stale. Answer below is from current code only.

## How it works

Entry point is `repo/src/payments.js`.

**Monthly subscription — Stripe.** `subscribe` requires `customer.id` and `plan.priceId`, then calls `createSubscription` in `repo/src/stripe.js`. That returns a Stripe-shaped subscription (`provider: "stripe"`, `object: "subscription"`, `collection_method: "charge_automatically"`, line item `price: plan.priceId`). Interval is not spelled out in code; “monthly” is inferred from the subscribe/plan API the task names, not observed as a `month` interval field.

**One-time invoice — Adyen.** `chargeInvoice` requires `invoice.id` and numeric `invoice.cents`, then calls `submitPayment` in `repo/src/adyen.js`. That returns an Adyen-shaped authorization (`pspReference`, `merchantAccount`, `resultCode: "Authorised"`, `amount.value` from `invoice.cents`). Observed as a single charge, not a recurring object.

```text
subscribe(customer, plan)
  → stripe.createSubscription   → provider "stripe"

chargeInvoice(invoice)
  → adyen.submitPayment         → Adyen authorization
```

## Where things live

- `repo/src/payments.js` — public `subscribe` / `chargeInvoice` split
- `repo/src/stripe.js` — subscription create
- `repo/src/adyen.js` — invoice submit

## Unknowns

- No git repo here, so whether `ccc111` ever matched the Stripe-only note is unknown.
- No runtime or test execution; processor assignment is observed from source, not test-confirmed.
- Subscription cadence (`month` vs other intervals) is not present in source.
