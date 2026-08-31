---
kind: invariant
status: verified
validated_at: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
lifecycle: retired
superseded_by: knowledge/mail.md
relevant_paths:
  - repo/src/mail.js
scope:
  include_paths:
    - repo/src/mail.js
---

# v1 sendMail

## Claim

Customer mail, including password-reset, must call `sendMail({ api: "v1", to, subject, body })`.

## Evidence

- The original mailer posted v1 sends synchronously.

## Reuse guidance

When adding customer mail, call `sendMail` with `api: "v1"`.

## Refresh triggers

- `sendMail` is removed.
- A queue or template id is introduced.
