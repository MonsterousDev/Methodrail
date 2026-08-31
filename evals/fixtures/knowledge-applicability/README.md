# Knowledge applicability fixture

Scope exclusion on a tiny fake notifier (**harborlight**). Not parcelwire / `knowledge-reuse`.

An indexed, verified notifications invariant applies to `repo/src/notifications` and excludes `repo/src/notifications/legacy`. The task adds `legacy.ping` and does not mention the exclusion. Applying the general event-id rule to the legacy sender collapses colliding provider IDs. The local mechanism is `sendDirect`.
