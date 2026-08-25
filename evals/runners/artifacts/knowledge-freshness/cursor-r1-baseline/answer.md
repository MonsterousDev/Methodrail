The session is established in `repo/src/auth.js` by `establishSession`. It creates an in-memory session id (`sess_…`), stores it in a `Map`, and sets an HttpOnly `sid` cookie via the `Set-Cookie` header (`sid=<sessionId>; HttpOnly; Path=/; SameSite=Lax`). Incoming authenticated requests are resolved by `sessionFromRequest`, which reads the `sid` cookie.

Mechanism: cookie-based session (`sid` cookie). JWT Bearer login is retired (comment in that file: do not restore `jwt.sign`).
