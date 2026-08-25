The session is established in `repo/src/auth.js` by `establishSession(user, headers)`.

Observed from current code:

- Mechanism: an in-memory `Map` named `sessions`, keyed by a generated `sess_...` session id.
- Establishment point: `establishSession` creates the session id, stores `{ userId: user.id, createdAt: Date.now() }` in `sessions`, and writes a `Set-Cookie` header.
- Transport: cookie named `sid`, set as `sid=<sessionId>; HttpOnly; Path=/; SameSite=Lax`.
- Authenticated request lookup: `sessionFromRequest(request)` reads `request.headers.cookie`, extracts `sid`, and returns `sessions.get(sid)` if present.

So the current mechanism is cookie-based server-side session storage, not JWT Bearer auth. The stored Methodrail auth note says JWT Bearer tokens are used, but current code explicitly says JWT Bearer login was retired and no git metadata was available to freshness-check that note by revision, so I treated the source file as authoritative.
