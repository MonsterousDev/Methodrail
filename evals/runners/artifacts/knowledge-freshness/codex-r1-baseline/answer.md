The authenticated API request session is established in `repo/src/auth.js` by `establishSession(user, headers)`.

Mechanism from current code:

- A session ID is generated with `Math.random()` and prefixed as `sess_`.
- The session is stored in an in-memory `Map` named `sessions`.
- The response headers get a `set-cookie` value: `sid=<sessionId>; HttpOnly; Path=/; SameSite=Lax`.
- Later authenticated requests are resolved by `sessionFromRequest(request)`, which reads `request.headers.cookie`, extracts the `sid` cookie, and looks it up in the same `sessions` Map`.

So the mechanism is an HTTP-only `sid` cookie backed by an in-memory server-side session `Map`, not JWT bearer auth.
