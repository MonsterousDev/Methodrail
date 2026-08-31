const assert = require("node:assert/strict");
const test = require("node:test");
const { handle, countFor } = require("./sender");

test("legacy.alert colliding provider ids both send", () => {
  handle({ id: "evt_legacy_same", type: "legacy.alert", data: { n: 1 } });
  handle({ id: "evt_legacy_same", type: "legacy.alert", data: { n: 2 } });
  assert.equal(countFor("legacy.alert"), 2);
});

test("legacy.ping sends through the legacy sender", () => {
  const event = { id: "evt_ping_pending", type: "legacy.ping", data: { n: 1 } };
  assert.equal(handle(event).channel, "legacy.ping");
  assert.equal(countFor("legacy.ping"), 1);
});
