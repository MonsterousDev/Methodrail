Added `legacy.ping` to the legacy sender via `sendDirect`, matching `legacy.alert`.

**Knowledge:** `.methodrail/knowledge/notifications.md` (invariant, verified, lifecycle active) claims customer-visible notices must use `dispatchOnce(event.id, ...)`. Scope includes `repo/src/notifications` but **excludes** `repo/src/notifications/legacy`. Exclusion wins, so the note was not applied. Freshness is unknown (tree is not a git repository; `validated_at` SHA cannot be resolved).

**Change:** `repo/src/notifications/legacy/sender.js` now routes `legacy.ping` through `sendDirect(event.type, event.data)`. Tests updated to expect colliding provider IDs to both send.

**Verification (test-confirmed):** `npm test` — 3 pass, 0 fail.
