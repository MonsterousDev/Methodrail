Implemented TASK.md and wrote the required outputs:

- `ANSWER.md`
- `COMMANDS.json`

Key changes are in `src/store.js`, `package.json`, `docs/adr/0002-order-store-json.md`, and `decisions.tsv`.

Verification passed with `node --check src/store.js` and an isolated `/tmp` runtime persistence/logging check.