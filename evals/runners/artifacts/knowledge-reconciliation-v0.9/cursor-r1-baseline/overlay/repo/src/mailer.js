const sent = new Map();
const outbox = [];

function backoffMs() {
  return 5000;
}

function customerMail(event) {
  return {
    to: event.customerEmail || event.email || event.to,
    subject: "Your ticket has been closed",
    template: "ticket.closed",
    ticketId: event.ticketId || event.id,
  };
}

function handle(event) {
  if (!event || !event.id) return null;
  if (sent.has(event.id)) return sent.get(event.id);
  const row = {
    eventId: event.id,
    type: event.type,
    retryAt: Date.now() + backoffMs(),
  };
  if (event.type === "ticket.closed") {
    row.channel = "customer";
    row.mail = customerMail(event);
  }
  sent.set(event.id, row);
  outbox.push(row);
  return row;
}

function failSend(eventId) {
  const row = outbox.find((item) => item.eventId === eventId);
  if (row) row.failed = true;
}

function retry(eventId) {
  const row = outbox.find((item) => item.eventId === eventId);
  if (!row) return null;
  if (Date.now() < row.retryAt) return row;
  row.failed = false;
  row.retryAt = Date.now() + backoffMs();
  return row;
}

function countFor(type) {
  return outbox.filter((row) => row.type === type).length;
}

module.exports = { handle, failSend, retry, countFor, backoffMs, outbox, customerMail };
