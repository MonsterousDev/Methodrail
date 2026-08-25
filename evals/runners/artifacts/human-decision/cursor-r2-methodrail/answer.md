# Decision: do not rename Organization to Account

**No.** Do not rename Organization to Account. No product files were changed.

## Why

This is a preference / policy / language choice, not an engineering fact. Methodrail classifies it as method **human**: it is not settled by reading source (`how`) or by running the code (`observe`). Mixed customer copy is not a verdict to rename the billing-owner entity.

Observed (source + project notes):

- `repo/src/org.js` treats **Organization** as the billing-owner noun. The file comments that emails sometimes say "account" and product copy sometimes says "organization", and that neither is a rename instruction.
- `.methodrail/PROJECT.md` says the same: customer-facing "account" copy is not a verdict to rename the entity.
- Tests assert the billing-owner noun is `Organization` (`npm test` passed, 1/1).

A rename would be a product-language decision. It needs a human owner to choose the canonical noun. Until that happens, keep Organization.

## File changes

None. `repo/src/org.js` and `repo/src/org.test.js` are unchanged.
