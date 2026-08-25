# Answer

The session for an authenticated API request is established in `repo/src/auth.js` by `establishSession`.

**Mechanism:** an in-memory session plus an HttpOnly `sid` cookie.

On login, `establishSession` generates a `sess_*` id, stores `{ userId, createdAt }` in a module-level `Map`, and sets `Set-Cookie: sid=<sessionId>; HttpOnly; Path=/; SameSite=Lax`. Later requests are recovered by `sessionFromRequest`, which parses the `sid` cookie and looks it up in that `Map`.

JWT Bearer (`jwt.sign` / `Authorization: Bearer`) is not used. A leftover comment in `auth.js` says that flow was retired.
