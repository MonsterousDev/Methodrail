import assert from "node:assert/strict";
import test from "node:test";
import { billingOwnerId, organizationName, organizationType } from "./org.js";

test("billing owner noun is Organization", () => {
  assert.equal(organizationType(), "Organization");
  assert.equal(organizationName({ id: "org_1", name: "Acme" }), "Acme");
  assert.equal(billingOwnerId({ id: "org_1", name: "Acme" }), "org_1");
});
