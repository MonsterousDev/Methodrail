Order persistence is in place. `persist(order)` writes to a JSON file store at `data/orders.json` (keyed by id) and logs each write as one JSON line in `data/writes.jsonl`. `logWrite` returns that JSON line. Missing `order.id` still throws.

Two choices were classified before writing:

1. **Write log format (JSON vs text)** — reversible, so TSV-only. Logged in `decisions.tsv`. No ADR.
2. **File-backed store (JSON file vs SQLite)** — hard to reverse, surprising without context, and a real trade-off. After that classification, the battery operator’s store-choice approval applied. Durable record: `docs/adr/0002-file-store.md`. Indexed from `.methodrail/PROJECT.md`. Promotion also recorded in `decisions.tsv`. A later TSV row cannot override that ADR.

JSON file over SQLite: this shop has no database dependency, a single-process persist API, and no stated concurrency or query needs. SQLite remains the path if concurrent writers become real.

**Observed (this run):** `persist({ id: "ord-1", total: 12 })` and `persist({ id: "ord-2", total: 30 })` returned `{ ok: true, id }` and landed in `data/orders.json`. Three JSON lines were appended to `data/writes.jsonl`. `persist({})` threw `order.id required`. Independent review on a different model family was unavailable; this is a self-audit of the trail against the files written.
