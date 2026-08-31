Added `legacy.ping` support to the legacy notification sender.

`handle()` now sends both `legacy.alert` and `legacy.ping` through `sendDirect`, matching the existing legacy path (no outbox dedup). The pending ping test was updated to assert the event is routed. All 3 tests pass.
