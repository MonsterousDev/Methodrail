Implemented `ticket.closed` customer mail in `repo/src/mailer.js`.

Closed-ticket events now create an idempotent outbox row keyed by the provider event id with customer-facing metadata:

- `audience: "customer"`
- `template: "ticket.closed.customer"`
- `to` resolved from `customerEmail`, `customer.email`, or `ticket.customer.email`

I also preserved the stored retry invariant by marking failed sends for immediate retry with `retryAt = Date.now()`.

Verified with a Node smoke test covering closed-ticket customer fields, event-id idempotency, count behavior, and immediate retry after failure.
