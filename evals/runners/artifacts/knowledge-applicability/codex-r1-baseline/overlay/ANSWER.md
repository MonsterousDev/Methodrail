Implemented support for `legacy.ping` in the legacy notification sender.

Changed `repo/src/notifications/legacy/sender.js` so `legacy.ping` uses the same direct-send path as `legacy.alert`, and updated `repo/src/notifications/legacy/sender.test.js` to assert the ping delivery is sent with the expected channel and body.

Verification: `npm test` passes with 3 tests.
