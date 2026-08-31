Implemented password-reset mail.

Changed `repo/src/mail.js` so `handlePasswordReset` enqueues a `password-reset` template email using the same queue path as welcome mail, preserving `event.to` and defaulting `vars` to `{}`.

Updated `repo/src/mail.test.js` to assert password-reset mail is queued and does not use the legacy v1 sender.

Verification: `npm test` passes with 2 tests.
