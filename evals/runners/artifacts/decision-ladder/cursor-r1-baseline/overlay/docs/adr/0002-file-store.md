# ADR-0002 File-backed order store

## Status

Accepted

## Context

Orders need a durable file-backed store. SQLite versus a JSON file is a one-way door: the on-disk shape, tooling, and failure modes are different enough that switching later would surprise a later reader.

## Decision

Persist orders as a JSON array in `data/orders.json`. Do not use SQLite.

Log each write as one JSON object per line in `data/writes.jsonl` (not free-form text).

## Why

This shop has no native dependencies. A JSON file is inspectable with ordinary tools, needs no extra package, and matches current scale. SQLite would add a native module, a schema, and a migration surface we do not have a reason to take on yet.

JSON lines for the write log keep each persist event structured and append-only without a second storage engine.

## Consequences

Concurrent writers can clobber `orders.json`. If we need transactions, concurrent writes, or queryable history, migrate to SQLite as a later ADR — that change is a store replacement, not a tweak.
