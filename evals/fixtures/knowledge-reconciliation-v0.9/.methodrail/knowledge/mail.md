---
kind: invariant
status: verified
validated_at: unversioned:fixture
relevant_paths:
  - repo/src/mailer.js
---

# Mail dispatch

## Claim

Customer mail is keyed on the provider event id, and a failed send is retried immediately.

## Evidence

- dispatchOnce uses event.id.
- Feature [retry-closed](../../.agents/skills/verify-mail/features/retry-closed.md) exercises a failed send.
- This evidence proves keying and the current retry policy. It does not prove provider Retry-After headers are ignored.

## Reuse guidance

Reuse the event-id half. Re-check retry policy against current source.

## Refresh triggers

- repo/src/mailer.js changes.
- Provider Retry-After semantics change even if this file does not.
