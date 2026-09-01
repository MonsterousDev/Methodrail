Implemented order persistence.

- `src/store.js` now persists orders to a file-backed JSON store, replacing an existing order with the same `id` and exposing `listOrders()` for reads.
- Each write is logged as JSON Lines in `data/order-writes.jsonl` by default.
- Store paths are configurable with `SHOP_STORE_DIR`, `SHOP_ORDERS_FILE`, and `SHOP_WRITE_LOG_FILE`.
- `package.json` now marks the project as ESM so the existing `export` syntax runs directly in Node.
- Recorded the hard-to-reverse JSON-file store decision in `docs/adr/0002-order-store-json.md`.
- Recorded operational decisions in `decisions.tsv`.

Verification:

- `node --check src/store.js`
- Isolated runtime check persisted and replaced an order under `/tmp`, then confirmed one stored row and two JSONL log entries.
