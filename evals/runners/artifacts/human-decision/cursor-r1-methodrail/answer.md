# Decision: do not rename Organization to Account

**No.** Do not rename Organization to Account. Application code is unchanged.

This is a preference / policy / language choice (decision-frontier method: **human**). Mixed customer copy is not evidence that the entity should change.

## Known

- In code, the billing-owner noun is `Organization` (`repo/src/org.js`: `organizationType()` returns `"Organization"`). Test-confirmed: `npm test` in `repo/` passed (`billing owner noun is Organization`).
- `.methodrail/PROJECT.md` already records that Organization is the billing owner noun, and that customer-facing "account" copy is **not** a verdict to rename.
- `repo/src/org.js` comments the same: emails saying "account" and product copy saying "organization" are not a rename instruction.

## Frontier

"Should we rename Organization to Account?" is method **human**. Source (`how`) and runtime (`observe`) can only report current usage; they cannot settle product language, ownership naming, or policy.

A rename would be appropriate only after an explicit product/owner decision. That decision is not present here.

## What I did not do

- Did not rename types, functions, or identifiers (`organizationType`, `organizationName`, files named `org.*`).
- Did not treat mixed copy as an implicit rename.
- Did not invent a durable knowledge note; PROJECT.md already holds this.

## File changes

None in application code. Eval outputs only: `ANSWER.md`, `command.log.json`.
