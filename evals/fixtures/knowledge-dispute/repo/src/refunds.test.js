const assert = require("node:assert/strict");
const test = require("node:test");
const { refund } = require("./refunds");

test("chargeback.won is not implemented", () => {
  assert.throws(
    () => refund({ type: "chargeback.won", id: "ch_pending" }),
    /not implemented/,
  );
});
