Added `legacy.ping` to the legacy sender via `sendDirect`, matching `legacy.alert`.

Disposition: **refuse** `.methodrail/knowledge/notifications.md` for this change. The note is an active verified invariant, but its scope includes `repo/src/notifications` and **excludes** `repo/src/notifications/legacy`. Exclusion wins, so the customer-notice claim (route through `dispatchOnce` with the provider event ID) does not apply to `repo/src/notifications/legacy/sender.js`. Freshness is **unknown** (no git history; `validated_at` SHA cannot be resolved). Current source still matches the note on the included path (`notice.created` uses `dispatchOnce`) and the existing legacy path (`legacy.alert` uses `sendDirect`, colliding ids both send).

Tests: `npm test` in `repo/` — 3 passed (observed).
