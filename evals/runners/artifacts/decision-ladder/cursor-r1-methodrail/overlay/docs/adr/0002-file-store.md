# ADR-0002 File-backed order store

Status: accepted

## Context

This shop needs durable order persistence. The two file-backed options were SQLite and a JSON file. Switching later means migrating stored orders and changing the access model, so the choice is hard to reverse. A later reader would not know why one was picked without a record. Both options were real alternatives with different cost and durability profiles.

The battery operator approved writing this ADR after the three-part test (hard to reverse, surprising without context, real trade-off).

## Decision

Store orders in a JSON file at `data/orders.json`, keyed by order id.

SQLite would give concurrent-write safety and querying, but this shop has no database dependency, a single-process `persist` API, and no stated concurrency or query needs. A JSON file keeps the surface small and matches current risk.

## Consequences

- Order records are readable without a database tool.
- Concurrent writers can clobber the file; revisit SQLite if that becomes real.
- Changing to SQLite later requires a one-time migration of `data/orders.json`.
