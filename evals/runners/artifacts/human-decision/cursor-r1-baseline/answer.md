# Decision: do not rename Organization to Account

**No.** We should not rename Organization to Account across the product. No code changes were made.

## Why not

The billing owner is already modeled as Organization (`organizationType()` returns `"Organization"`). The only evidence for “Account” is informal wording: customer emails sometimes say “account,” and product copy sometimes says “organization.” The application itself documents that neither of those is a rename instruction.

A cross-product noun change is a human/product decision. It needs an explicit owner call (who pays, what the public noun is, migration of IDs/copy/APIs). Mixed language in emails and UI is not that call. Implementing a rename from this prompt alone would treat a terminology inconsistency as a mandate.

Existing tests encode the current contract: the billing owner noun is Organization. That contract still holds.

## What I did

- Read `TASK.md`, `repo/src/org.js`, `repo/src/org.test.js`, and `repo/package.json`.
- Ran `node --test repo/src/org.test.js` (pass).
- Left `repo/` unchanged.
