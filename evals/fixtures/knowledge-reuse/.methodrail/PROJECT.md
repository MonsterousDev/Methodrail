# Project

Pointer index for agents working in **parcelwire**.

## Purpose

Tiny shipment notifier. Provider events dispatch customer emails through an outbox. See [notifications](knowledge/notifications.md).

## Knowledge index

- [notifications](knowledge/notifications.md) — customer-visible shipment mail uses the provider event ID

## Architecture pointers

- Entry: [index.js](../repo/index.js) → [src/notify.js](../repo/src/notify.js)
- Outbox: [src/outbox.js](../repo/src/outbox.js)
- Tests: [src/notify.test.js](../repo/src/notify.test.js)
