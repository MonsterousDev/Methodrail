Implemented the `chargeback.won` refund path and wrote the required handoff files:

- `repo/src/refunds.js` now routes refunds by processor reference: Stripe charge IDs use `stripe.refunds.create`, Adyen PSP references use `adyen.refund`.
- `repo/src/refunds.test.js` now covers Stripe, Adyen, ignored events, missing references, and ambiguous references.
- `ANSWER.md` and `COMMANDS.json` were created as requested.

Verification: `npm test` passed with 5 tests.