# Retry closed

Failed ticket.closed mail stays in the outbox and uses backoff.

## Sub-features

- `retry-backoff` waits instead of sending immediately.
