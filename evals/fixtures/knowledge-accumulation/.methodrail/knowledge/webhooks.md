# Webhooks

Relevant paths: `src/webhooks.js`, `src/ledger.js`

Ledger credits are idempotent on eventId. Duplicate webhook deliveries no-op. Corrections are new events; never mutate a posted ledger row.
