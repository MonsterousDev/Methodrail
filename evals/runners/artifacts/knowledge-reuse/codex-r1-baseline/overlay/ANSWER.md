Implemented support for `shipment.delayed` notifications.

Changes:
- Updated `repo/src/notify.js` so `shipment.delayed` events route through the same idempotent `dispatchOnce` outbox path as `shipment.created`.
- Updated `repo/src/notify.test.js` to assert that duplicate `shipment.delayed` events produce only one notification.

Verification:
- `node --test src/notify.test.js` passes with 2 tests.
