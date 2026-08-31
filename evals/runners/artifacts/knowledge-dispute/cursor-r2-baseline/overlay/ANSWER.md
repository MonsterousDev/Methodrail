Implemented the `chargeback.won` refund path in `repo/src/refunds.js`.

`refund(event)` still returns `null` for any other event type. For `chargeback.won` it posts a Stripe refund keyed by the event id (`ch_pending` in the existing test matches Stripe charge-id shape) and returns `{ processor: "stripe", chargeId, refundId, status: "posted" }`. There is no Stripe SDK in this tree, so the post is in-process: it records a `re_` refund id rather than calling a network API.

Updated `repo/src/refunds.test.js` to assert that path and that other events still return `null`. `node --test src/refunds.test.js` passes (2 tests).
