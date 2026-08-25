# Answer

## Change

Routed `shipment.delayed` through `dispatchOnce(event.id, event.type, event.data)` in `repo/src/notify.js`, matching `shipment.created`. Updated `repo/src/notify.test.js` so a duplicate delayed event does not enqueue a second mail. `node --test` passed (2 tests).

## Project knowledge

Used `.methodrail/PROJECT.md` → `.methodrail/knowledge/notifications.md`.

The note claims every customer-visible shipment notification must use the provider event ID as the outbox key, and reuse guidance says new events should call `dispatchOnce` rather than `sendDirect`.

`validated_at` is SHA `bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb`, but this worktree is not a git repository, so that revision could not be resolved. Confidence was reduced and the claim was checked against current source instead:

- Observed: `handle` already called `dispatchOnce(event.id, event.type, event.data)` for `shipment.created`.
- Observed: `dispatchOnce` in `outbox.js` returns the existing row when the same event ID is seen again; `sendDirect` exists but is unused by `notify.js`.
- Test-confirmed: existing `shipment.created` duplicate test; after the change, the delayed duplicate test also passes.

The claim still applies. Implementation followed the note’s reuse guidance.

## Proposed note update (not applied)

Do not rewrite the note in place. After this change, evidence should mention `shipment.delayed` as well as `shipment.created`, and the test line should cite the delayed duplicate assertion. `validated_at` cannot stay a git SHA until this tree is versioned; mark it `unversioned:` or re-stamp after commit. The invariant claim itself does not need to change.
