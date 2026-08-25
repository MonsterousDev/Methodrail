# Project

Pointer index for agents working in **tillbox**.

## Purpose

Tiny wallet. Processor webhook deliveries post cents onto an append-only ledger. See [webhooks](knowledge/webhooks.md).

## Knowledge index

- [webhooks](knowledge/webhooks.md) — ledger credits idempotent on eventId; retries no-op

## Architecture pointers

- Entry: [index.js](../repo/index.js) → [src/webhooks.js](../repo/src/webhooks.js)
- Ledger: [src/ledger.js](../repo/src/ledger.js)
- Tests: [src/webhooks.test.js](../repo/src/webhooks.test.js)
