Added a focused regression test in `repo/test/hello.test.js` for the hello-world example HTTP behavior.

The new test imports `repo/examples/hello.js` and drives it through the repository's existing in-memory HTTP request helper, proving `GET /hello` returns status `200` with body `Hello World`. No library behavior was changed.

Dependencies were installed from `repo/` with `npm install`, matching this fixture's npm setup with `.npmrc` disabling package-lock generation.

Verification:

```text
npm test
tests 2
pass 2
fail 0
```
