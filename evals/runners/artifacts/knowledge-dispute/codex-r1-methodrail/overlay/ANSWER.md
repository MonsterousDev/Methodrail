Implemented the `chargeback.won` refund path in `repo/src/refunds.js`.

The Methodrail provider notes were both relevant but disputed: `.methodrail/knowledge/stripe.md` and `.methodrail/knowledge/adyen.md` each claimed exclusive processor ownership. I resolved that against current source by supporting both provider paths based on the processor reference present on the event: Stripe charge IDs call `stripe.refunds.create`, Adyen PSP references call `adyen.refund`, and ambiguous or missing references fail clearly.

Updated `repo/src/refunds.test.js` to cover ignored non-chargeback events, Stripe refunds, Adyen refunds, missing processor references, and conflicting processor references.

Verification: `npm test` passed with 5 tests.
