Implemented the `chargeback.won` refund path.

`refund(event)` now returns a posted refund record for `chargeback.won` events and continues to ignore unrelated event types by returning `null`.

Verification: `npm test` passes with 2 tests.
