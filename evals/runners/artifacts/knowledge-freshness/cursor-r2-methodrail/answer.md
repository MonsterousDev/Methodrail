# Where is the session established?

**Observed in current `repo/src/auth.js`:** an authenticated API session is established by `establishSession`, which issues an HttpOnly `sid` session cookie (`Set-Cookie: sid=<sessionId>; HttpOnly; Path=/; SameSite=Lax`) and stores the session in an in-memory `Map`. It is **not** JWT Bearer auth.

Stored note `.methodrail/knowledge/auth.md` (revision `bbb000`) claims JWT Bearer tokens and that session cookies are not used. That note is stale: this tree has no git history to compare against `bbb000`, and current `src/auth.js` contradicts it. A comment in the file says JWT Bearer login was retired.

## Overview

API auth in this repo is cookie-backed in-process sessions. Login (or equivalent) calls `establishSession(user, headers)`, which mints a `sess_*` id, records `{ userId, createdAt }` in a module-level `Map`, and writes the cookie onto the response headers. Later requests recover that session with `sessionFromRequest`, which parses `sid` from the `Cookie` header.

## Key Concepts

- **`sessions`:** in-memory `Map` keyed by session id. Authoritative session state for this process.
- **`establishSession(user, headers)`:** creates the session and sets `headers["set-cookie"]`.
- **`sessionFromRequest(request)`:** looks up the session from the inbound `sid` cookie. Returns `null` if the cookie is missing or unknown.

## How It Works

1. Entry: something that already has a `user` calls `establishSession(user, headers)`.
2. A random session id is generated (`sess_` + base36 random).
3. `{ userId: user.id, createdAt: Date.now() }` is stored in `sessions`.
4. Response header `set-cookie` is set to `sid=<sessionId>; HttpOnly; Path=/; SameSite=Lax`.
5. On a later request, `sessionFromRequest` reads `request.headers.cookie`, matches `sid=...`, and returns `sessions.get(id)` or `null`.

## Where Things Live

- `repo/src/auth.js` — the only implementation file in this tree.

## Gotchas

- The knowledge index still points at JWT Bearer auth. Current code does the opposite.
- Sessions live only in this process’s `Map`. There is no JWT, no signing, and no cookie-store besides `sid`.

## Unknowns

- No other source files, routes, or login handlers exist in this tree, so the HTTP entry that *calls* `establishSession` was not observed.
- Freshness vs revision `bbb000` could not be git-confirmed (this copy is not a git repo). Staleness is inferred from the mismatch with current `auth.js`.
