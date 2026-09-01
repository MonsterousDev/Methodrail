# ADR-0002 Order store

We will persist shop orders in a local JSON file managed by `src/store.js`.

## Context

The shop needs file-backed order persistence now. The meaningful alternatives are a SQLite database and a JSON file. This choice is hard to reverse later because production data shape, operational tooling, backup habits, and migration paths will start to depend on it.

## Decision

Use `data/orders.json` as the order store and `data/order-writes.jsonl` as the write log by default. Both paths can be overridden with `SHOP_ORDERS_FILE`, `SHOP_WRITE_LOG_FILE`, and `SHOP_STORE_DIR`.

## Consequences

JSON keeps this small shop dependency-free and easy to inspect. The trade-off is weaker query support and concurrency behavior than SQLite. If order volume, multi-process writes, or relational queries become real requirements, migrate deliberately to SQLite with a data migration.
