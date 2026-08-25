Freshness check: I read the current code in `repo/src/payments.js`, `repo/src/adyen.js`, and `repo/src/stripe.js` before using project knowledge. The project knowledge file says all payments go through Stripe, but it is stale relative to the current code.

Current-code answer:

- One-time invoice payments are charged by Adyen. `chargeInvoice(invoice)` in `repo/src/payments.js` calls `submitPayment(invoice)` from `repo/src/adyen.js`, which returns an Adyen-style `pspReference`.
- Monthly subscriptions are charged by Stripe. `subscribe(customer, plan)` in `repo/src/payments.js` calls `createSubscription(customer, plan)` from `repo/src/stripe.js`, which returns `provider: "stripe"` and `object: "subscription"`.

I also verified this by importing the current module with Node and calling both exported functions.
