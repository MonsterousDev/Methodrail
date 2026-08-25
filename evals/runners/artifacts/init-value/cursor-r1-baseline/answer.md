# Init-value baseline

## What I did

Added a regression test for the hello-world example HTTP behavior without changing library code.

- `repo/test/hello-example.test.js` requires `examples/hello.js` and drives GET `/hello` with the same in-process mock `req`/`res` helper this repo already uses in `test/hello.test.js` (no listen). Asserts status 200 and body `Hello World`.
- `repo/package.json` test script now runs both `test/hello.test.js` and `test/hello-example.test.js`.
- Installed from `repo/` with `npm install` (no lockfile; `.npmrc` has `package-lock=false`).
- Ran `npm test` from `repo/`. Both tests passed (2 pass, 0 fail).

Library files (`lib/app.js`, `index.js`, `examples/hello.js`) were not changed.
