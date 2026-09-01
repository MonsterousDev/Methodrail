# ADR-0002 Order persistence

We will persist orders in a JSON file at `data/orders.json` and write an append-only JSONL audit log to `data/order-writes.jsonl`.

SQLite would be a better fit once the shop needs concurrent writers, relational queries, or transactional reporting. Today the shop has a tiny dependency-free store API, so JSON keeps the implementation inspectable and easy to run without adding a database lifecycle.
