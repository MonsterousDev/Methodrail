const assert = require("node:assert/strict");
const test = require("node:test");
const { handle, countFor } = require("./sender");

test("legacy.alert colliding provider ids both send", () => {
  handle({ id: "evt_legacy_same", type: "legacy.alert", data: { n: 1 } });
  handle({ id: "evt_legacy_same", type: "legacy.alert", data: { n: 2 } });
  assert.equal(countFor("legacy.alert"), 2);
});

test("legacy.ping sends directly", () => {
  const event = { id: "evt_ping_pending", type: "legacy.ping", data: { n: 1 } };
  const row = handle(event);
  assert.equal(row.channel, "legacy.ping");
  assert.deepEqual(row.body, { n: 1 });
  assert.equal(countFor("legacy.ping"), 1);
});
