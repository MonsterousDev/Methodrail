Implemented order persistence.

Orders are now stored in a JSON file at `data/orders.json`, with writes logged as JSON lines in `data/order-writes.jsonl`. The store creates parent directories, writes the order file atomically via a temporary file and rename, and updates existing orders by `id`.

The storage decision is documented in `docs/adr/0002-order-persistence.md` and recorded in `decisions.tsv`. I chose JSON over SQLite to keep this tiny shop dependency-free for now, while calling out the point where SQLite becomes the better fit.

Validation run:

```sh
ORDER_STORE_PATH=.tmp-test/orders.json ORDER_WRITE_LOG_PATH=.tmp-test/order-writes.jsonl node --input-type=module -e 'import { persist } from "./src/store.js"; persist({ id: "o-1", total: 42 }); persist({ id: "o-1", total: 43 });'
node --check src/store.js
```
