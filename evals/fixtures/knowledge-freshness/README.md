# Knowledge freshness fixture

`.methodrail/knowledge/auth.md` still says authenticated APIs use JWT Bearer tokens. Current code in `repo/src/auth.js` establishes a server-side session via an HttpOnly `sid` cookie. A leftover comment may mention JWT; it is not the mechanism.

Not the same composition as `runtime-contradiction` (comment vs runtime landing path) or `fresh-knowledge` (reuse still-valid tax notes).
