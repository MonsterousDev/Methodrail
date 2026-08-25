# Answer

Added an in-process regression test for the hello-world example. GET /hello still returns `Hello World`. Library behavior was not changed.

## What changed

- `repo/test/hello.test.js` — new test that `require`s `examples/hello.js` and drives the exported handler with the existing fake-request helper. Does not call `app.listen`.
- No edits to `lib/`, `index.js`, or `examples/hello.js`.

## How it was verified

- Install: `npm install` in `repo/` (no lockfile; `.npmrc` has `package-lock=false`, so not `npm ci`).
- Test: `npm test` (`node --test test/hello.test.js`).

## Results

Tests passed (2/2):

- GET /hello returns Hello World without listening
- hello-world example GET /hello returns Hello World without listening

Observed: both tests passed; fail count 0.
