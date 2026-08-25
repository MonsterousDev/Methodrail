import assert from "node:assert/strict";
import test from "node:test";
import { accountName, accountType, billingOwnerId } from "./account.js";

test("billing owner noun is Account", () => {
  assert.equal(accountType(), "Account");
  assert.equal(accountName({ id: "acct_1", name: "Acme" }), "Acme");
  assert.equal(billingOwnerId({ id: "acct_1", name: "Acme" }), "acct_1");
});
