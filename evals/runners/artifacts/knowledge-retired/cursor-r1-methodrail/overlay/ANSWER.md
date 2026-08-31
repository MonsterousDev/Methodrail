Password-reset mail now goes through `enqueueMail` with template id `password-reset`, matching welcome.

**Knowledge:** refused retired `.methodrail/knowledge/send-v1.md` (`superseded_by: knowledge/mail.md`). Reused active `.methodrail/knowledge/mail.md` (customer mail uses `enqueueMail` + template id). Freshness was **unknown** (no git history; `validated_at` SHAs do not resolve); claim was reconciled against current `repo/src/mail.js` (welcome already queues; `sendMail` unused by customer paths).

**Change:** `handlePasswordReset` calls `enqueueMail({ template: "password-reset", to, vars })` instead of returning `null`. Tests updated and passing (`npm test`: 2 pass).
