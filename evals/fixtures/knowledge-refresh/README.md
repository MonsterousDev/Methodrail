# Knowledge refresh fixture

Mixed typed note on a tiny fake support mailer (**inkwell**). Not `knowledge-freshness` (wholly stale JWT Q&A) and not `partial-knowledge` (Stripe/Adyen Q&A).

The promoted note has two claims: event-id keying is still true; delete-on-fail is stale. Current `markFailed` keeps the row and a sweeper retries. The checked-in template uses `unversioned:prepare-fixture`; `prepare-v0.7-fixture.ts` creates real Git history and replaces it with the resolvable pre-change SHA before an agent run.

`task.md` asks for `ticket.resolved` mail. It does not explain the stale half. The grader fails blind trust of delete-on-fail and discard of the event-id key. Proposing a note update is required; rewriting the note is not allowed.
