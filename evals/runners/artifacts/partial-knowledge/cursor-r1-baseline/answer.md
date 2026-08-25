**Adyen** charges a one-time invoice payment. **Stripe** charges a monthly subscription.

Freshness check: project knowledge (`knowledge/payments.md`, recorded revision `ccc111`) claims all customer payments go through Stripe. That is stale. Current `src/payments.js` routes `chargeInvoice` to Adyen (`submitPayment`) and `subscribe` to Stripe (`createSubscription`). No git history is present to confirm `ccc111`, so the recorded note was discarded in favor of the live code.

- One-time invoice: `chargeInvoice` → Adyen `submitPayment` (amount in cents, `resultCode: "Authorised"`).
- Monthly subscription: `subscribe` → Stripe `createSubscription` (`object: "subscription"`, `collection_method: "charge_automatically"`).
