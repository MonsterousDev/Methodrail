const assert = require("node:assert/strict");
const test = require("node:test");
const { refund } = require("./refunds");

test("chargeback.won posts a refund", () => {
  assert.deepEqual(refund({ type: "chargeback.won", id: "ch_pending" }), {
    type: "refund.posted",
    chargebackId: "ch_pending",
  });
});

test("other events are ignored", () => {
  assert.equal(refund({ type: "chargeback.lost", id: "ch_lost" }), null);
});
