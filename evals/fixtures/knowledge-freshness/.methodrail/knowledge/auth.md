# Auth

Recorded revision: `bbb000`
Relevant paths: `src/auth.js`

Authenticated API requests use JWT Bearer tokens. Login calls `jwt.sign` and clients send `Authorization: Bearer <token>`. Session cookies are not used.
