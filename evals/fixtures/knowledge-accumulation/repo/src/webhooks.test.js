const assert = require("node:assert/strict");
const test = require("node:test");
const { handle, balanceOf } = require("./webhooks");

test("charge.succeeded duplicate delivery does not double the wallet", () => {
  const event = {
    id: "evt_charge_1",
    type: "charge.succeeded",
    data: { walletId: "w_charge", cents: 500 },
  };
  handle(event);
  handle(event);
  assert.equal(balanceOf("w_charge"), 500);
});

test("invoice.paid is not routed yet", () => {
  const event = {
    id: "evt_inv_pending",
    type: "invoice.paid",
    data: { walletId: "w_invoice", cents: 900 },
  };
  assert.equal(handle(event), null);
  assert.equal(balanceOf("w_invoice"), 0);
});
