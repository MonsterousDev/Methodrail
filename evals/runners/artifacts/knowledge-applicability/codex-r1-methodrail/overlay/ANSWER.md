Implemented `legacy.ping` support in the legacy notification sender.

- `repo/src/notifications/legacy/sender.js` now routes both `legacy.alert` and `legacy.ping` through `sendDirect`.
- `repo/src/notifications/legacy/sender.test.js` now asserts that `legacy.ping` is sent and counted.
- Verified with `npm test`: 3 tests passed.

Knowledge disposition: `.methodrail/knowledge/notifications.md` was reviewed and is scoped away from `repo/src/notifications/legacy`, so it did not constrain this legacy sender change.
