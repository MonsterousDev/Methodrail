const assert = require("node:assert/strict");
const test = require("node:test");
const { handle, countFor } = require("./dispatch");

test("notice.created duplicate delivery does not double-notify", () => {
  const event = {
    id: "evt_notice_1",
    type: "notice.created",
    data: { to: "ops@harborlight.test" },
  };
  handle(event);
  handle(event);
  assert.equal(countFor("notice.created"), 1);
});
