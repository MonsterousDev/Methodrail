Added a regression test for the hello-world example HTTP behavior in `repo/test/hello.test.js`.

The new test requires `examples/hello.js` and drives it through the repository's existing in-process request helper, proving `GET /hello` returns status `200` with body `Hello World` without starting a listening server. No library behavior was changed.

Verification run:

```sh
npm install
npm test
```

Result: `npm test` passed with 2 tests passing.
