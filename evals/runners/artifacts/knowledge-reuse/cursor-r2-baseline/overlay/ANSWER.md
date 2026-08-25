# Answer

## What changed

`repo/src/notify.js` now routes `shipment.delayed` the same way as `shipment.created`: `handle()` calls `dispatchOnce(event.id, event.type, event.data)` so delayed mail goes through the outbox keyed by the provider event ID.

`repo/src/notify.test.js` no longer asserts that delayed events are ignored. It checks that a delayed event is delivered once and that a duplicate with the same event ID does not send a second notification.

## Why

Created notifications already used `dispatchOnce` so retries of the same provider event do not double-email. Delayed notifications are the same kind of customer-visible shipment mail, so they reuse that path instead of `sendDirect` (which has no event-id key and would duplicate).
