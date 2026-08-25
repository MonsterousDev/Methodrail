const assert = require("node:assert/strict");
const test = require("node:test");
const { handle, countFor } = require("./notify");

test("shipment.created duplicate delivery does not double-notify", () => {
  const event = {
    id: "evt_created_1",
    type: "shipment.created",
    data: { shipmentId: "s_created", to: "ops@parcelwire.test" },
  };
  handle(event);
  handle(event);
  assert.equal(countFor("shipment.created"), 1);
});

test("shipment.delayed duplicate delivery does not double-notify", () => {
  const event = {
    id: "evt_delay_pending",
    type: "shipment.delayed",
    data: { shipmentId: "s_delay", to: "ops@parcelwire.test" },
  };
  const first = handle(event);
  const second = handle(event);
  assert.ok(first);
  assert.equal(first.channel, "shipment.delayed");
  assert.equal(first.eventId, "evt_delay_pending");
  assert.equal(second, first);
  assert.equal(countFor("shipment.delayed"), 1);
});
