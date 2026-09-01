const sent = new Map();
const outbox = [];

function backoffMs() {
  return 5000;
}

function customerAddress(event) {
  return (
    event.customerEmail ||
    (event.customer && event.customer.email) ||
    (event.ticket && event.ticket.customer && event.ticket.customer.email) ||
    null
  );
}

function buildRow(event) {
  const row = { eventId: event.id, type: event.type, retryAt: Date.now() + backoffMs() };

  if (event.type === "ticket.closed") {
    row.audience = "customer";
    row.template = "ticket.closed.customer";
    row.to = customerAddress(event);
  }

  return row;
}

function handle(event) {
  if (!event || !event.id) return null;
  if (sent.has(event.id)) return sent.get(event.id);
  const row = buildRow(event);
  sent.set(event.id, row);
  outbox.push(row);
  return row;
}

function failSend(eventId) {
  const row = outbox.find((item) => item.eventId === eventId);
  if (row) {
    row.failed = true;
    row.retryAt = Date.now();
  }
}

function countFor(type) {
  return outbox.filter((row) => row.type === type).length;
}

module.exports = { handle, failSend, countFor, backoffMs, outbox };
