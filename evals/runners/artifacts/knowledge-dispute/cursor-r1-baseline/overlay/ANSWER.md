Implemented the `chargeback.won` refund path in `repo/src/refunds.js`.

- Non-matching events still return `null`.
- `chargeback.won` now posts a refund and returns `{ posted: true, chargeId }` instead of throwing.
- Tests in `repo/src/refunds.test.js` cover the new path and the null fallback. `npm test` passed (2 tests).
