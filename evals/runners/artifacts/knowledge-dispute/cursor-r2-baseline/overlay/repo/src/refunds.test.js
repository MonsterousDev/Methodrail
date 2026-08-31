const assert = require("node:assert/strict");
const test = require("node:test");
const { refund } = require("./refunds");

test("chargeback.won posts a Stripe refund", () => {
  const result = refund({ type: "chargeback.won", id: "ch_pending" });
  assert.equal(result.processor, "stripe");
  assert.equal(result.chargeId, "ch_pending");
  assert.equal(result.refundId, "re_ch_pending");
  assert.equal(result.status, "posted");
});

test("other events return null", () => {
  assert.equal(refund({ type: "chargeback.lost", id: "ch_other" }), null);
});
