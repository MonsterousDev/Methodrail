Password-reset mail is wired.

`handlePasswordReset` now enqueues a `password-reset` template through `enqueueMail` (same path as welcome), instead of returning null. Tests in `repo/src/mail.test.js` cover that the message is queued and that the v1 sender is not used. `npm test` passed (2/2).
