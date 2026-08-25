The session is established in `establishSession` in `repo/src/auth.js`.

Mechanism from current code: an in-memory session (`sessions` Map) plus an HttpOnly `sid` cookie. `establishSession` creates a `sess_*` id, stores `{ userId, createdAt }` in the map, and sets `Set-Cookie: sid=<sessionId>; HttpOnly; Path=/; SameSite=Lax`. Authenticated requests recover that session via `sessionFromRequest`, which parses the `sid` cookie.

JWT Bearer tokens are not the current mechanism. The stored note `.methodrail/knowledge/auth.md` (revision `bbb000`) still says JWT Bearer login; that is stale. Current `src/auth.js` has no `jwt.sign` and comments that JWT Bearer login was retired. Git history could not be checked here (this copy is not a git repo), so freshness was decided by reading the current source.
