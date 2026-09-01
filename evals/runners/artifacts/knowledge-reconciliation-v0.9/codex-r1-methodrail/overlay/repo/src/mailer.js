const sent = new Map();
const outbox = [];
const CUSTOMER_MAIL_TYPES = {
  "ticket.closed": {
    audience: "customer",
    template: "ticket.closed.customer",
    subject: "Your ticket has been closed",
  },
};

function backoffMs() {
  return 5000;
}

function customerEmail(event) {
  return (
    event.customerEmail ||
    (event.customer && event.customer.email) ||
    (event.ticket && event.ticket.customerEmail) ||
    (event.ticket && event.ticket.customer && event.ticket.customer.email) ||
    null
  );
}

function customerMailFor(event) {
  const mail = CUSTOMER_MAIL_TYPES[event.type];
  if (!mail) return {};
  return { ...mail, to: customerEmail(event) };
}

function handle(event) {
  if (!event || !event.id) return null;
  if (sent.has(event.id)) return sent.get(event.id);
  const row = {
    eventId: event.id,
    type: event.type,
    retryAt: Date.now() + backoffMs(),
    ...customerMailFor(event),
  };
  sent.set(event.id, row);
  outbox.push(row);
  return row;
}

function failSend(eventId) {
  const row = outbox.find((item) => item.eventId === eventId);
  if (row) row.failed = true;
}

function countFor(type) {
  return outbox.filter((row) => row.type === type).length;
}

if (require.main === module) {
  const assert = require("assert");
  const startedAt = Date.now();
  const row = handle({
    id: "evt_ticket_closed_1",
    type: "ticket.closed",
    customer: { email: "customer@example.com" },
  });

  assert.strictEqual(row.audience, "customer");
  assert.strictEqual(row.template, "ticket.closed.customer");
  assert.strictEqual(row.to, "customer@example.com");
  assert.strictEqual(handle({ id: "evt_ticket_closed_1", type: "ticket.closed" }), row);
  failSend("evt_ticket_closed_1");
  assert.strictEqual(row.failed, true);
  assert.strictEqual(countFor("ticket.closed"), 1);
  assert(row.retryAt >= startedAt + backoffMs());
}

module.exports = { handle, failSend, countFor, backoffMs, outbox };
