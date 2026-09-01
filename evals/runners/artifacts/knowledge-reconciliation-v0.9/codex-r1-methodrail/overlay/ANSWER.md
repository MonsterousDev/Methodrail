Implemented `ticket.closed` customer mail in `repo/src/mailer.js`.

The mailer now adds customer-facing mail metadata for `ticket.closed` rows: `audience`, `template`, `subject`, and `to` when a customer email is present. It preserves the stored event-id de-duplication behavior and the current source's retry backoff behavior.

Verified with:

- `node repo/src/mailer.js`
- A focused `node -e` API check for nested customer email, template assignment, de-duplication, and failed-send marking.
