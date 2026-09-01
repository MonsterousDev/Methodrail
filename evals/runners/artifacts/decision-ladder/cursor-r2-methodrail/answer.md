# Order persistence

Orders now persist to a JSON file. `persist(order)` writes `data/orders.json` keyed by `order.id` and appends one JSON line per write to `data/writes.log`. `logWrite` returns `"json"`. Missing `order.id` still throws.

## Decisions

**Store (ADR-0002).** JSON file, not SQLite. Hard to reverse once orders accumulate, surprising without a record, and a real trade-off: SQLite would be better for concurrent writers and queries, but this shop has no database dependency and no query API. Operator approval was granted after that classification. Canonical record: `docs/adr/0002-file-store.md`. Indexed from `.methodrail/PROJECT.md`.

**Write log (operational only).** JSON lines, not plain text. Reversible format pick — logged in `decisions.tsv`, not promoted to an ADR.

## Verification (observed this run)

Imported `./src/store.js` with Node ESM. `persist({})` threw `order.id required`. Two orders (`ord-1` total 12, `ord-2` total 40) round-tripped through `data/orders.json`. Three JSON log lines parsed. Independent review was unavailable; self-audit of `decisions.tsv` matches this work.
