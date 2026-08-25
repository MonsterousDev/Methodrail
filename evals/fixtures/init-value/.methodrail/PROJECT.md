# Project

Pointer index for agents working in **helloframe**. This is a Node HTTP **library**, not a packaged long-running service. Consumer-facing usage stays in [README.md](../repo/README.md).

## Purpose

[`createApp()`](../repo/lib/app.js) returns a `(req, res)` handler. Consumers build servers; this repo publishes the helper. [`examples/hello.js`](../repo/examples/hello.js) is a demo, not the product.

## Important boundaries

- Published npm surface is only `index.js` and `lib/` ([package.json `files`](../repo/package.json)). `examples/` and `test/` are not shipped.
- [`.npmrc`](../repo/.npmrc) sets `package-lock=false`. There is no lockfile: use `npm install`, not `npm ci`.
- Node `>= 18` ([engines](../repo/package.json)).

## Canonical commands

Copied from [package.json](../repo/package.json). There is no build, start, or typecheck script.

- Install: `npm install`
- Test: `npm test` (`node --test test/hello.test.js`)
- Example server (optional demo only): `node examples/hello.js` listens on port 3000 when not required as a module

Do not invent `npm start` or `npm ci`.

## Verification

This repository has no user-facing app to launch. Representative HTTP behavior is already driven in-process by a fake supertest-style helper ([test/hello.test.js](../repo/test/hello.test.js)). Skip `create-verification-skill`: a verify-localhost skill would invent a long-running server the tests do not need.

- Library / `lib/` change: `npm test`
- Example change: require the example and drive the handler in-process; do not call `app.listen` in tests
- Manual demo (not a proof gate): `node examples/hello.js`

No CONTROL.md: start/doctor/drive/stop collapse to the scripts above.

## Domain vocabulary

- **app**: function returned by `createApp()`; a request handler, not a listening process
- **hello-world example**: [examples/hello.js](../repo/examples/hello.js) binds port 3000 only when `!module.parent`

## Architecture pointers

- Entry: [index.js](../repo/index.js) → [lib/app.js](../repo/lib/app.js) (`createApp`)
- In-process drive: [test/hello.test.js](../repo/test/hello.test.js)
- Demo listen: [examples/hello.js](../repo/examples/hello.js)

## Runtime and control

Examples listen only when not required. Tests must not call `app.listen`; they pass the app function to the in-process helper. Do not generate CONTROL.md unless a future workflow needs coordinated multi-process setup (none observed).

## Important constraints

- Source is CommonJS (`require` / `module.exports`).
- Published files are `index.js` and `lib/` only. Do not add runtime to `examples/` and expect it to ship.
