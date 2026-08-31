const assert = require("node:assert/strict");
const test = require("node:test");
const { refund } = require("./refunds");

test("chargeback.won posts a refund", () => {
  const result = refund({ type: "chargeback.won", id: "ch_pending" });
  assert.deepEqual(result, { posted: true, chargeId: "ch_pending" });
});

test("other events return null", () => {
  assert.equal(refund({ type: "chargeback.lost", id: "ch_other" }), null);
});
