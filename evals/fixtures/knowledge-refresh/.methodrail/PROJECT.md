# Project

Pointer index for agents working in **inkwell**.

## Purpose

Tiny support mailer. Provider events dispatch customer ticket emails through an outbox. See [mail](knowledge/mail.md).

## Knowledge index

- [mail](knowledge/mail.md) — customer ticket mail keys and failure handling

## Architecture pointers

- Entry: [index.js](../repo/index.js) → [src/mailer.js](../repo/src/mailer.js)
- Outbox: [src/outbox.js](../repo/src/outbox.js)
- Tests: [src/mailer.test.js](../repo/src/mailer.test.js)
