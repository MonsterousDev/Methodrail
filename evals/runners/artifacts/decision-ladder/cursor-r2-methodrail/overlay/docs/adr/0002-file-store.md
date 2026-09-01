# ADR-0002 File-backed order store

Status: accepted

## Context

The shop needs durable order persistence now. Two file-backed options were on the table: a JSON file and SQLite. Once orders accumulate, changing stores means a data migration. A later reader would not know why one was picked without a durable record.

## Decision

Store orders in a JSON file at `data/orders.json`, keyed by `order.id`. Writes replace the whole file.

## Why not SQLite

SQLite is stronger for concurrent writers, ad-hoc queries, and crash-safe transactions. This shop has no database dependency, a single-process `persist` API, and no query surface. Adding SQLite would pull in a native driver for a capability we do not use yet.

## Consequences

- Concurrent writers can clobber; this process is the only writer.
- The on-disk shape is a JSON object map. Changing it later is a migration.
- No extra npm packages.

Approved after classifying this choice as hard to reverse, surprising without context, and a real trade-off.
