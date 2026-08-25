# Init-value: hello-world example regression test

Added an in-process regression test for the hello-world example. Library behavior (`lib/app.js`, `index.js`, `examples/hello.js`) is unchanged.

## What changed

- `repo/test/hello-example.test.js` (new): `require`s `examples/hello.js` and drives GET `/hello` with the same fake request helper as `test/hello.test.js`. Does not call `app.listen`.
- `repo/package.json`: `npm test` now runs both `test/hello.test.js` and `test/hello-example.test.js`.

## Install and verification

CI in this repo uses `npm install` (`.npmrc` has `package-lock=false`; there is no lockfile). Observed:

- `npm install` in `repo/` → exit 0
- `npm test` in `repo/` → exit 0

Test-confirmed: 2 passed, 0 failed.

- Existing library test: GET `/hello` via `createApp()` returns `Hello World` without listening
- New example test: GET `/hello` via the exported hello-world example handler returns `Hello World` without listening
