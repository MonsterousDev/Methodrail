Added `shipment.delayed` routing in `repo/src/notify.js` so those events dispatch through the same outbox path as `shipment.created`.

`handle()` now accepts both event types and calls `dispatchOnce(event.id, event.type, event.data)`. Using the provider event ID as the outbox key keeps duplicate deliveries from sending a second notification.

Updated `repo/src/notify.test.js` so the delayed case asserts that a repeated event still counts as one delivery, matching the created-event behavior. `node --test` in `repo/` passes (2 tests).
