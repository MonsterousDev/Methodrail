The current code shows that Adyen charges a one-time invoice payment, while Stripe creates the monthly subscription.

Freshness check: I found stored Methodrail payment knowledge in `.methodrail/knowledge/payments.md`, recorded at revision `ccc111` for `src/payments.js`, claiming all customer payments go through Stripe. This workspace does not include `.git` history, so I could not compare changes since `ccc111`. I treated the stored note as stale/reduced-confidence and answered from the current source instead.

Current-code evidence:

- `repo/src/payments.js` imports `createSubscription` from `./stripe.js` and `submitPayment` from `./adyen.js`.
- `subscribe(customer, plan)` returns `createSubscription(customer, plan)`, and `repo/src/stripe.js` returns an object with `provider: "stripe"` and `object: "subscription"`.
- `chargeInvoice(invoice)` returns `submitPayment(invoice)`, and `repo/src/adyen.js` returns an Adyen-style payment response with `pspReference: adyen_<invoice.id>`.

Conclusion: one-time invoice payment = Adyen; monthly subscription = Stripe.
