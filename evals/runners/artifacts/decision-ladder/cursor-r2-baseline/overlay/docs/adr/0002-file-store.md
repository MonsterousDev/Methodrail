# ADR-0002 JSON file store for orders

We persist orders in `data/orders.json` rather than SQLite.

A JSON file is enough for this shop: there is no query load, no concurrent writers, and no extra native dependency. SQLite would be the better default once we need transactions, secondary indexes, or multiple processes writing at once. Switching later is a migration, so this choice is recorded now.

Write logs are JSON lines in `data/writes.jsonl` (one JSON object per write). That is a local logging format, not a store format.
