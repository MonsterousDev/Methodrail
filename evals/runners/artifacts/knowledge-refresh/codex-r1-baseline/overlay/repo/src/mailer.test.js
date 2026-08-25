const assert = require("node:assert/strict");
const test = require("node:test");
const { handle, countFor, failSend, deliveries } = require("./mailer");

test("ticket.opened duplicate delivery does not double-mail", () => {
  const event = {
    id: "evt_open_1",
    type: "ticket.opened",
    data: { ticketId: "t_open", to: "user@inkwell.test" },
  };
  handle(event);
  handle(event);
  assert.equal(countFor("ticket.opened"), 1);
});

test("failed send keeps the outbox row", () => {
  const event = {
    id: "evt_open_fail",
    type: "ticket.opened",
    data: { ticketId: "t_fail", to: "user@inkwell.test" },
  };
  handle(event);
  failSend(event.id);
  const row = deliveries().find((item) => item.eventId === event.id);
  assert.ok(row);
  assert.equal(row.status, "failed");
});

test("ticket.resolved duplicate delivery does not double-mail", () => {
  const event = {
    id: "evt_res_pending",
    type: "ticket.resolved",
    data: { ticketId: "t_res", to: "user@inkwell.test" },
  };
  const first = handle(event);
  const second = handle(event);
  assert.equal(first, second);
  assert.equal(first.channel, "ticket.resolved");
  assert.deepEqual(first.body, event.data);
  assert.equal(countFor("ticket.resolved"), 1);
});
