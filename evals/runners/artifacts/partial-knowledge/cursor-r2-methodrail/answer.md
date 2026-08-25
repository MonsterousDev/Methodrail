# Answer

**Stripe** charges the monthly subscription. **Adyen** charges the one-time invoice payment.

## Freshness check

`.methodrail/PROJECT.md` points at `.methodrail/knowledge/payments.md`, which records revision `ccc111` and path `src/payments.js`, and claims all customer payments (subscriptions, invoices, and one-time charges) go through Stripe.

That note was **not** reused as current:

- `repo/` is not a git repository, so revision `ccc111` could not be resolved and diffs since that revision could not be inspected.
- Per the freshness protocol, missing provenance means reduced confidence until the claim is re-validated against current sources.

Re-validation against current code shows the note is **stale**. Invoices no longer go through Stripe.

## Current code (observed)

Entry point: `repo/src/payments.js`.

- `subscribe(customer, plan)` calls `createSubscription` from `repo/src/stripe.js`. That returns a Stripe subscription (`object: "subscription"`, `provider: "stripe"`, `collection_method: "charge_automatically"`). This is the monthly subscription path.
- `chargeInvoice(invoice)` calls `submitPayment` from `repo/src/adyen.js`. That returns a one-time Adyen payment (`pspReference`, `resultCode: "Authorised"`, amount from `invoice.cents`). This is the one-time invoice path.

No other charge routes were found in `repo/src/`.

Evidence: **observed** from reading those three files. Runtime behavior was not executed (inferred that the returned objects match the live processor APIs). Git history for `ccc111` is **unknown** (no repo).
