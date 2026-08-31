Implemented password-reset mail by enqueueing a `password-reset` template with the recipient and event vars, matching the existing welcome-mail queue path.

Verification: `npm test` passed with 2 tests.
