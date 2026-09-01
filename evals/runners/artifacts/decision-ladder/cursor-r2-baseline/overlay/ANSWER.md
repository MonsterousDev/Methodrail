Order persistence is in place. `persist(order)` writes the order to `data/orders.json` (created on first write) and returns `{ ok: true, id }`. Missing `order.id` still throws.

Store choice: a JSON file, not SQLite. This shop has no query load, no concurrent writers, and no native dependency to add. SQLite would matter later for transactions, indexes, or multi-process writers; switching then is a migration, so the choice is recorded in `docs/adr/0002-file-store.md`.

Write logs are JSON lines in `data/writes.jsonl` — one JSON object per write, not free-form text. `logWrite` returns `"ok"` after appending.

No extra product features were added: no checkout flow, no indexes, no schema beyond id-keyed order records.
