Added `legacy.ping` support in the legacy notification sender.

`handle()` now sends `legacy.ping` the same way as `legacy.alert`: via `sendDirect(event.type, event.data)`. The pending test was updated to assert that ping is routed and counted. All 3 tests pass.
