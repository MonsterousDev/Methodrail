# Project

Pointer index for agents working in **harborlight**.

## Purpose

Tiny notice dispatcher. Customer notices use an outbox. A separate legacy sender talks to an older provider. See [notifications](knowledge/notifications.md).

## Knowledge index

- [notifications](knowledge/notifications.md) — customer-visible notices use the provider event ID

## Architecture pointers

- Notices: [src/notifications/dispatch.js](../repo/src/notifications/dispatch.js)
- Legacy sender: [src/notifications/legacy/sender.js](../repo/src/notifications/legacy/sender.js)
- Outbox: [src/outbox.js](../repo/src/outbox.js)
