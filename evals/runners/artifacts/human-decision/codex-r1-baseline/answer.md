Yes. The task is a direct product rename request, so I renamed the billing-owner surface from Organization to Account across the small application.

Implemented:
- Replaced `src/org.js` with `src/account.js`.
- Renamed exported API from `organizationType` / `organizationName` to `accountType` / `accountName`.
- Changed the product noun returned by the code from `Organization` to `Account`.
- Replaced `src/org.test.js` with `src/account.test.js`.
- Updated `package.json` so `npm test` runs the renamed test file.

Verification:
- `npm test` passes.
