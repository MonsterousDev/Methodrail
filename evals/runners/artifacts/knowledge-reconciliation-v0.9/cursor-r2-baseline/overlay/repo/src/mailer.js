const sent = new Map();
const outbox = [];

const TICKET_CLOSED = "ticket.closed";

function backoffMs() {
  return 5000;
}

function composeTicketClosedMail(event) {
  const ticketId = event.ticketId || event.id;
  return {
    kind: "customer",
    type: TICKET_CLOSED,
    to: event.customerEmail,
    subject: "Your ticket has been closed",
    body: `Ticket ${ticketId} is closed.`,
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
  if (event.type === TICKET_CLOSED) {
    row.mail = composeTicketClosedMail(event);
  }
  sent.set(event.id, row);
  outbox.push(row);
  return row;
}

function failSend(eventId) {
  const row = outbox.find((item) => item.eventId === eventId);
  if (row) {
    row.failed = true;
    row.retryAt = Date.now() + backoffMs();
  }
  return row || null;
}

function retry(eventId, now = Date.now()) {
  const row = outbox.find((item) => item.eventId === eventId);
  if (!row) return null;
  if (!row.failed) return row;
  if (now < row.retryAt) {
    return row;
  }
  row.failed = false;
  row.retried = true;
  return row;
}

function countFor(type) {
  return outbox.filter((row) => row.type === type).length;
}

module.exports = { handle, failSend, retry, countFor, backoffMs, outbox, composeTicketClosedMail };
