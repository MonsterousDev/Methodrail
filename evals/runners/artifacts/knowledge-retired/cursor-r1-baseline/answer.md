Password-reset mail is now wired the same way as welcome: `handlePasswordReset` enqueues a `password-reset` template via `enqueueMail` (to, vars) instead of returning null.

Tests: `npm test` — 2 passed (welcome + password-reset).
