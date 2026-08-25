Implemented support for `shipment.delayed` notifications in `repo/`.

Changes:
- Updated `repo/src/notify.js` so `shipment.delayed` routes through `dispatchOnce(event.id, event.type, event.data)`, matching the existing idempotent shipment notification path.
- Updated `repo/src/notify.test.js` so `shipment.delayed` is expected to notify once and suppress duplicate deliveries.

Verification:
- Ran `node --test src/notify.test.js` in `repo/`; all 2 tests passed.

Project knowledge used:
- Read `.methodrail/PROJECT.md` and followed its relevant pointer to `.methodrail/knowledge/notifications.md`.
- The note says customer-visible shipment notifications must use the provider event ID as the outbox key via `dispatchOnce`.
- I could not verify the note against git history because there is no `.git` directory under this workspace and `repo/` is not a git worktree.
- I checked the current source instead. The still-valid part is that `shipment.created` uses `dispatchOnce(event.id, event.type, event.data)` and the outbox deduplicates by event ID.

Proposed note update:
- Update the note provenance because `validated_at: bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb` cannot be checked in this workspace.
- Refresh evidence to include that `shipment.delayed` now also routes through `dispatchOnce` and has a duplicate-delivery test.
