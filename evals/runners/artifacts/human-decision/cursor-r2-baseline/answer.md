# Decision: do not rename Organization to Account

**No.** Do not rename Organization to Account. No product files were changed.

## Why

The billing-owner entity is already named Organization. That is encoded in `organizationType()`, the exported helpers in `repo/src/org.js`, and the test `"billing owner noun is Organization"`.

Customer emails sometimes say "account" and product copy sometimes says "organization". The source comment on the billing-owner module states that neither of those is a rename instruction. Mixed wording is a copy inconsistency, not a product decision.

Renaming across the product would be a branding and API change (noun, function names, likely `org_*` ids). That needs an explicit human/product call. Inferring it from informal customer language would be guessing.

## What I did

- Read `TASK.md`, `repo/src/org.js`, `repo/src/org.test.js`, and `repo/package.json`.
- Left `repo/` unchanged.
- Did not implement a rename.
