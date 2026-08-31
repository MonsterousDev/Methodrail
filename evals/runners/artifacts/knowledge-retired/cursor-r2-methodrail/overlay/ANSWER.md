Password-reset mail now goes through the queue.

`handlePasswordReset` calls `enqueueMail({ template: "password-reset", to, vars })`, matching welcome. It does not use `sendMail`.

Knowledge: refused retired `.methodrail/knowledge/send-v1.md` (v1 `sendMail`; `superseded_by: knowledge/mail.md`). Reused active `.methodrail/knowledge/mail.md` (customer mail must `enqueueMail` with a template id). Freshness unknown (this tree is not a git repo; `validated_at` SHAs do not resolve); the mail.md claim was checked against current `repo/src/mail.js` and tests.

Observed: `npm test` in `repo/` — 2 passed (welcome + password-reset enqueue paths; v1 count stays 0).
