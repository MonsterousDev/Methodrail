Implemented `TASK.md`.

Order persistence now uses a JSON file-backed store with JSONL write logging:
- `src/store.js`
- `docs/adr/0002-order-persistence.md`
- `decisions.tsv`
- `package.json`

I also wrote the required final artifacts:
- `ANSWER.md`
- `COMMANDS.json`

Validation passed with `node --check src/store.js` and a smoke test that persisted and updated an order using temporary store/log paths. Note: `git status` could not run because this directory is not a Git repository.