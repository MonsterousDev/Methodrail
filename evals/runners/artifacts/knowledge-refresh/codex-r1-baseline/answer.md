Implemented support for `ticket.resolved` customer emails.

Changes made:
- Updated `repo/src/mailer.js` so `ticket.resolved` events dispatch through the same idempotent outbox path as `ticket.opened`.
- Updated `repo/src/mailer.test.js` to assert that `ticket.resolved` sends exactly one customer email on duplicate delivery and preserves the event payload in the outbox row.

Verification:
- Ran `node --test` in `repo/`; all 3 tests passed.
