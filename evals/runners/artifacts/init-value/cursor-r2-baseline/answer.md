# Answer

Added a regression test for the hello-world example without changing library behavior.

`examples/hello.js` already exports the `createApp()` handler and only listens when run as the main module. The existing suite drives HTTP with an in-process mock `req`/`res` (no `listen`). The new test requires the example and uses that same pattern to prove `GET /hello` still returns status 200 and body `Hello World`.

Dependencies were installed with `npm install` in `repo/` (no lockfile; `.npmrc` sets `package-lock=false`). `package.json` `test` now runs both test files so CI-style `npm test` covers the example.

Library files (`lib/app.js`, `index.js`, `examples/hello.js`) were not modified.

## Results

- `npm install` — exit 0
- `npm test` — exit 0 (2 passed, 0 failed)
