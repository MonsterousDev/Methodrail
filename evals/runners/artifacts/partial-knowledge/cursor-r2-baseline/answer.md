# Answer

**Stripe** charges the monthly subscription. **Adyen** charges the one-time invoice payment.

## Freshness check

Project knowledge (`.methodrail/knowledge/payments.md`) records revision `ccc111` and claims all customer payments go through Stripe, including subscriptions, invoices, and one-time charges.

This tree has no git history, so that revision could not be verified. Comparing the knowledge to current source shows it is stale.

## Current code

`repo/src/payments.js`:

- `subscribe(customer, plan)` calls `createSubscription` from `stripe.js`. That path returns a Stripe subscription (`provider: "stripe"`, `collection_method: "charge_automatically"`).
- `chargeInvoice(invoice)` calls `submitPayment` from `adyen.js`. That path returns an Adyen payment (`pspReference`, `merchantAccount`, `resultCode: "Authorised"`) for `invoice.cents`.

Knowledge was not used for the answer because it disagrees with current code.
