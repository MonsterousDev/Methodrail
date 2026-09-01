Order persistence is in place.

`persist(order)` writes orders to `data/orders.json` (JSON array, upsert by `id`). Missing `order.id` still throws. Each persist also appends one JSON object to `data/writes.jsonl`. `logWrite(row)` is the same JSON-lines logger and returns the line it wrote.

Store choice: JSON file, not SQLite. This shop has no native dependencies; a JSON file is inspectable and enough at current scale. SQLite would add a module, a schema, and a later-surprising migration. That decision is in `docs/adr/0002-file-store.md` and `decisions.tsv`.

Log format: JSON (one object per line), not free-form text. Recorded in the same ADR and TSV. Data files are created on first write.
