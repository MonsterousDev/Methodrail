# Answer

Implemented support for `ticket.resolved` customer emails.

## Changed

- Updated `repo/src/mailer.js` so `ticket.resolved` routes through `dispatchOnce(event.id, event.type, event.data)`, matching the existing idempotent `ticket.opened` path.
- Updated `repo/src/mailer.test.js` by replacing the old unsupported `ticket.resolved` test with a duplicate-delivery test that confirms only one resolved email is counted for repeated handling of the same provider event ID.

## Verification

- Ran `node --test src/mailer.test.js` in `repo/`.
- Result: 3 passing tests.

## Project Knowledge

Used `.methodrail/PROJECT.md` and the relevant pointer `.methodrail/knowledge/mail.md`.

Freshness check:

- No Git repository was available at the workspace root or `repo/`, so I could not inspect git history for the note's `validated_at` SHA or `relevant_paths`.
- I checked the note against current source instead.

Still-valid note claim:

- Customer ticket emails should be keyed on the provider event ID. Current `repo/src/mailer.js` and `repo/src/outbox.js` support this through `dispatchOnce(event.id, ...)`.

Stale note claim:

- The note says failed sends delete the outbox row so the next attempt is a clean insert.
- Current `repo/src/outbox.js` contradicts that: `markFailed` keeps the row and changes `status` to `"failed"`.
- Current `repo/src/mailer.test.js` also confirms failed sends keep the outbox row.

Proposed note update:

- Update `.methodrail/knowledge/mail.md` to keep the event-ID key invariant, but replace the failure-handling guidance with: failed sends keep the keyed outbox row and mark it `failed`; retries should update that row back to `sent`.
