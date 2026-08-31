---
kind: invariant
status: verified
validated_at: bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
relevant_paths:
  - repo/src/mail.js
scope:
  include_paths:
    - repo/src/mail.js
---

# Queue customer mail

## Claim

Every customer-visible email must go through `enqueueMail` with a template id.

## Evidence

- Welcome mail calls `enqueueMail({ template: "welcome", to, vars })`.
- `sendMail` remains in the module for the retired v1 path and is not used by welcome.

## Reuse guidance

When adding another customer email, call `enqueueMail` with a template id rather than `sendMail`.

## Refresh triggers

- A new customer email is added.
- `enqueueMail` or `sendMail` usage changes.
